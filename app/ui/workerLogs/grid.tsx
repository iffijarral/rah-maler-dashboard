// app/ui/workers/work-log-grid.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect, useActionState, useTransition } from 'react';
import { addDays, format, parseISO, differenceInCalendarDays, startOfDay, endOfDay } from 'date-fns';
import { createWorkLog, WorkLogState } from '@/app/lib/actions/workLogActions';
import { Button } from '@/app/ui/button';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Toast } from '../common/toast';
import { ProjectShortGrid, WorkerShort } from '@/app/lib/definitions'; // Ensure these types are imported
import { useRouter, useSearchParams } from 'next/navigation';

// EntryCell represents the UI state for a single day in the grid
type EntryCell = {
  worked: boolean;
  isFullDay: boolean;
  note?: string;
  isExistingDbEntry?: boolean;
};

// Type for data returned directly from fetchWorkEntries (matches DB schema subset)
type FetchedWorkEntry = {
  date: string; // ISO string
  isFullDay: boolean;
  notes: string;
};

export default function WorkLogGrid({
  projects,
  workers, // Now this prop holds workers relevant to the *currently selected project*
  workEntries: initialFetchedWorkEntries, // Raw fetched data for the current project/worker
  initialSelectedProject,
  initialSelectedWorker,
}: {
  projects: ProjectShortGrid[];
  workers: WorkerShort[];
  workEntries: FetchedWorkEntry[];
  initialSelectedProject: string;
  initialSelectedWorker: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState: WorkLogState = { message: '', errors: {} };
  const [state, formAction] = useActionState(createWorkLog, initialState);
  const [isPending, startTransition] = useTransition(); // For showing loading states during navigation

  // States for dropdown selections - initialized from props
  const [selectedProject, setSelectedProject] = useState<string>(initialSelectedProject);
  const [selectedWorker, setSelectedWorker] = useState<string>(initialSelectedWorker);
  // availableWorkers state now comes directly from the 'workers' prop
  const [availableWorkers, setAvailableWorkers] = useState<WorkerShort[]>(workers);

  // --- Crucial: Sync internal states with incoming props on re-renders ---
  useEffect(() => {
    // If the initialSelectedProject prop changes (due to server re-render), update local state
    if (initialSelectedProject !== selectedProject) {
      setSelectedProject(initialSelectedProject);
    }
  }, [initialSelectedProject, selectedProject]);

  useEffect(() => {
    // If the initialSelectedWorker prop changes, update local state
    if (initialSelectedWorker !== selectedWorker) {
      setSelectedWorker(initialSelectedWorker);
    }
  }, [initialSelectedWorker, selectedWorker]);

  useEffect(() => {
    // If the 'workers' prop changes (meaning a new project was selected on server), update availableWorkers
    setAvailableWorkers(workers);
    // You might also want to re-evaluate selectedWorker here if the new `workers` list doesn't contain it
    if (!workers.some(w => w.id === selectedWorker) && workers.length > 0) {
        setSelectedWorker(workers[0].id); // Default to first if current worker is not in list
    } else if (workers.length === 0) {
        setSelectedWorker(''); // No workers for this project
    }
  }, [workers, selectedWorker]); // Depend on 'workers' prop and local 'selectedWorker' state

  // --- Initialize/Re-initialize Grid State from initialFetchedWorkEntries prop ---
  const createGridState = (entries: FetchedWorkEntry[]): Record<string, EntryCell> => {
    const newGridState: Record<string, EntryCell> = {};
    entries.forEach(entry => {
      const dateKey = entry.date.slice(0, 10); // Take YYYY-MM-DD part
      newGridState[dateKey] = {
        worked: true,
        isFullDay: entry.isFullDay,
        note: entry.notes || '',
        isExistingDbEntry: true,
      };
    });
    return newGridState;
  };

  const [grid, setGrid] = useState<Record<string, EntryCell>>(() =>
    createGridState(initialFetchedWorkEntries)
  );

  useEffect(() => {
    // This effect runs whenever initialFetchedWorkEntries changes (i.e., new data from server)
    setGrid(createGridState(initialFetchedWorkEntries));
  }, [initialFetchedWorkEntries]); // Crucial dependency: re-create grid when this prop changes

  // --- End grid initialization/re-initialization ---

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [noteModal, setNoteModal] = useState<{ open: boolean; dateKey: string | null }>({
    open: false,
    dateKey: null,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  // Derive current project and its dates based on selectedProject state
  const currentProject = projects.find(p => p.id === selectedProject);
  const projectStartDate = currentProject?.startDate ? startOfDay(parseISO(currentProject.startDate.toISOString())) : null;
  const projectFinishDate = currentProject?.endDate ? endOfDay(parseISO(currentProject.endDate.toISOString())) : null;

  // REMOVED: The old useEffect that fetched workers client-side. This is now handled by the server component.

  useEffect(() => {
    if (state.message) {
      const type = Object.keys(state.errors || {}).length > 0 ? 'error' : 'success';
      setToast({ message: state.message, type });
    }
  }, [state]);

  // Prepare calendar days for the selected project
  const allProjectDays: { key: string; label: string; isWithinRange: boolean }[] = [];
  if (projectStartDate && projectFinishDate && projectStartDate <= projectFinishDate) {
    const totalDays = differenceInCalendarDays(projectFinishDate, projectStartDate) + 1;
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(projectStartDate, i);
      allProjectDays.push({
          key: format(date, 'yyyy-MM-dd'),
          label: format(date, 'MMM d'),
          isWithinRange: true
      });
    }
  }

  // Group allProjectDays into weeks for display
  const weeks: { key: string; label: string; isWithinRange: boolean }[][] = [];
  if (allProjectDays.length > 0) {
    let currentWeek: { key: string; label: string; isWithinRange: boolean }[] = [];
    const firstDayDate = parseISO(allProjectDays[0].key);
    const dayOfWeek = firstDayDate.getDay();
    const normalizedDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Adjust for Monday-first week

    for (let i = 0; i < normalizedDayOfWeek; i++) {
        currentWeek.push({ key: `pad-start-${weeks.length}-${i}`, label: '', isWithinRange: false });
    }

    for (const day of allProjectDays) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
      }
    }
    while (currentWeek.length < 7) {
        currentWeek.push({ key: `pad-end-${weeks.length}-${currentWeek.length}`, label: '', isWithinRange: false });
    }
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }
  }

  // Toggle worked checkbox state
  const toggleWorked = (key: string) => {
    const dayData = allProjectDays.find(d => d.key === key);
    if (!dayData || !dayData.isWithinRange) return;

    setGrid((prev) => {
      const currentCell = prev[key];
      const newWorkedStatus = !currentCell?.worked;

      return {
        ...prev,
        [key]: {
          worked: newWorkedStatus,
          isFullDay: newWorkedStatus ? (currentCell?.isFullDay ?? true) : false,
          note: newWorkedStatus ? (currentCell?.note || '') : '',
          isExistingDbEntry: currentCell?.isExistingDbEntry || false,
        },
      };
    });
  };

  // Toggle full day checkbox state
  const toggleIsFullDay = (key: string) => {
    const dayData = allProjectDays.find(d => d.key === key);
    if (!dayData || !dayData.isWithinRange) return;

    setGrid((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isFullDay: !prev[key]?.isFullDay,
      },
    }));
  };

  // --- Handle project change: update URL and trigger server re-render ---
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('projectId', newProjectId);
    params.delete('workerId'); // Reset worker when project changes

    startTransition(() => { // Show pending state while navigation happens
      router.replace(`?${params.toString()}`);
    });
  };

  // --- Handle worker change: update URL and trigger server re-render ---
  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorkerId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('workerId', newWorkerId);

    startTransition(() => { // Show pending state while navigation happens
      router.replace(`?${params.toString()}`);
    });
  };

  const isSaveDisabled = isPending || !selectedProject || !selectedWorker || !currentProject || !projectStartDate || !projectFinishDate || projectStartDate > projectFinishDate;

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="projectId"
            className="block w-full rounded-md border border-gray-200 py-2 text-sm"
            value={selectedProject}
            onChange={handleProjectChange}
            disabled={isPending}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.startDate && p.endDate && ` (${format(parseISO(p.startDate.toISOString()), 'MMM d, yyyy')} - ${format(parseISO(p.endDate.toISOString()), 'MMM d, yyyy')})`}
                {!p.startDate && !p.endDate && ` (Dates not set)`}
                {p.startDate && !p.endDate && ` (Starts ${format(parseISO(p.startDate.toISOString()), 'MMM d, yyyy')})`}
                {!p.startDate && p.endDate && ` (Ends ${format(parseISO(p.endDate.toISOString()), 'MMM d, yyyy')})`}
              </option>
            ))}
          </select>

          <select
            name="workerId"
            className="block w-full rounded-md border border-gray-200 py-2 text-sm"
            value={selectedWorker}
            onChange={handleWorkerChange}
            disabled={isPending}
          >
            {availableWorkers.length > 0 ? (
                availableWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                        {w.name}
                    </option>
                ))
            ) : (
                <option value="">No workers available for this project</option>
            )}
          </select>
        </div>

        {isPending && (
          <div className="text-center py-4 text-gray-500">Loading work entries...</div>
        )}

        {!currentProject && !isPending && (
          <div className="text-center py-4 text-red-500">Please select a project.</div>
        )}
        {currentProject && (!projectStartDate || !projectFinishDate) && !isPending && (
            <div className="text-center py-4 text-red-500">Selected project needs both start and finish dates set.</div>
        )}
        {currentProject && projectStartDate && projectFinishDate && projectStartDate > projectFinishDate && !isPending && (
            <div className="text-center py-4 text-red-500">Project finish date must be after or on the start date.</div>
        )}


        {currentProject && projectStartDate && projectFinishDate && projectStartDate <= projectFinishDate && (
          <table className="w-full border text-center">
            <thead>
              <tr>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <th key={`${d}-${i}`}>{d}</th>
                ))}
                <th>Total Week</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i} className="border-b">
                  {week.map(({ key, label, isWithinRange }) => {
                    const cell = grid[key];
                    const isToday = key === today;
                    return (
                      <td
                        key={key}
                        className={`py-4 ${
                          isToday ? 'bg-yellow-100 border-2 border-blue-500 rounded-md' : ''
                        } ${!isWithinRange ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-semibold mb-2">{label}</div>
                          {isWithinRange && (
                            <>
                              <label className="text-xs flex items-center gap-2">
                                Worked
                                <input
                                  type="checkbox"
                                  checked={cell?.worked || false}
                                  onChange={() => toggleWorked(key)}
                                  disabled={isPending}
                                />
                              </label>
                              {cell?.worked && (
                                <div className="mt-2 flex flex-col items-center gap-2">
                                  <label className="text-xs flex items-center gap-2">
                                    Full Day
                                    <input
                                      type="checkbox"
                                      checked={cell.isFullDay}
                                      onChange={() => toggleIsFullDay(key)}
                                      disabled={isPending}
                                    />
                                  </label>
                                  <label className="text-xs flex items-center gap-2">
                                    Note
                                    <button
                                      type="button"
                                      onClick={() => setNoteModal({ open: true, dateKey: key })}
                                      disabled={isPending}
                                    >
                                      <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                  </label>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td>
                    {week.reduce((sum, { key, isWithinRange }) => {
                      if (!isWithinRange) return sum;
                      const c = grid[key];
                      if (!c?.worked) return sum;
                      return sum + (c.isFullDay ? 1 : 0.5);
                    }, 0)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={7} align="right">
                  Total Project Days Worked:
                </td>
                <td>
                  {Object.entries(grid).reduce((sum, [key, cell]) => {
                    const dayData = allProjectDays.find(d => d.key === key);
                    if (!dayData || !dayData.isWithinRange) return sum;

                    if (!cell.worked) return sum;
                    return sum + (cell.isFullDay ? 1 : 0.5);
                  }, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {noteModal.open && noteModal.dateKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-sm font-semibold mb-2">Note for {noteModal.dateKey}</h2>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={4}
              value={grid[noteModal.dateKey]?.note || ''}
              onChange={(e) =>
                setGrid((prev) => ({
                  ...prev,
                  [noteModal.dateKey!]: {
                    ...prev[noteModal.dateKey!],
                    note: e.target.value,
                  },
                }))
              }
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="text-gray-500 text-sm"
                onClick={() => setNoteModal({ open: false, dateKey: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={() => setNoteModal({ open: false, dateKey: null })}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="hidden"
        name="entries"
        value={JSON.stringify(
          Object.entries(grid)
            .filter(([dateKey]) => {
                const dayData = allProjectDays.find(d => d.key === dateKey);
                return dayData && dayData.isWithinRange;
            })
            .map(([date, value]) => ({
              date,
              isFullDay: value.isFullDay,
              note: value.note || '',
              worked: value.worked,
              isExistingDbEntry: value.isExistingDbEntry || false,
            }))
        )}
      />

      <div className="mt-6 flex justify-end gap-4">
        <Link href="/dashboard/projects" className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600">
          Cancel
        </Link>
        <Button type="submit" disabled={isSaveDisabled}>Save Log</Button>
      </div>
    </form>
  );
}