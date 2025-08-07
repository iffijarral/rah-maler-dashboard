import { lusitana } from '@/app/ui/fonts';
import { WorkLogTableSkeleton } from '@/app/ui/skeletons';
import { loadProjects, fetchWorkersAssignedToProject, fetchWorkEntries } from '@/app/lib/data';
import { Suspense } from 'react';
import { Metadata } from 'next';
import WorkLogGrid from '@/app/ui/workerLogs/grid'; // Confirm this path is correct
import { ProjectShortGrid } from '@/app/lib/definitions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Work Logs',
};

// Define a type that matches what fetchWorkEntries returns
type FetchedWorkEntry = {
  date: string; // ISO string
  isFullDay: boolean;
  notes: string; // The database field is 'notes'
};

type PageProps = {    
    searchParams?: Promise<{
        projectId?: string;
        workerId?: string;
    }>;
};

// Add searchParams as a prop to the Page component
export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const projects: ProjectShortGrid[] = await loadProjects();

  // Handle case where no projects are found
  if (!projects || projects.length === 0) {
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Work Logs</h1>
        </div>
        <p className="text-gray-500">No projects found. Please add a project to get started.</p>
      </div>
    );
  }

  // Determine the initially selected project based on URL or first project
  const initialProjectId = searchParams?.projectId || projects[0].id;
  const currentProject = projects.find(p => p.id === initialProjectId);

  // If the project from searchParams isn't found, default back to the first project
  const finalProjectId = currentProject ? initialProjectId : projects[0].id;
  const selectedProjectData = currentProject || projects[0]; // The actual project object

  // Fetch workers assigned to the selected project
  const workers = await fetchWorkersAssignedToProject(finalProjectId);

  // Handle case where no workers are found for the selected project
  if (!workers || workers.length === 0) {
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Work Logs</h1>
        </div>
        <p className="text-gray-500">No workers found for the selected project. Please assign workers to a project.</p>
      </div>
    );
  }

  // Determine the initially selected worker based on URL or first worker in the list
  const initialWorkerId = searchParams?.workerId || workers[0].id;
  const currentWorker = workers.find(w => w.id === initialWorkerId);

  // If the worker from searchParams isn't found for this project, default to the first worker for the project
  const finalWorkerId = currentWorker ? initialWorkerId : workers[0].id;

  // Determine the initial date range based on the selected project's dates
  const initialProjectStartDate = selectedProjectData.startDate instanceof Date
    ? selectedProjectData.startDate
    : new Date();

  let initialProjectEndDate: Date = selectedProjectData.endDate instanceof Date
    ? selectedProjectData.endDate
    : initialProjectStartDate;

  if (!(initialProjectEndDate instanceof Date)) {
    initialProjectEndDate = new Date();
  }

  // Fetch work entries for the selected project and worker
  const workEntries: FetchedWorkEntry[] = await fetchWorkEntries(
    finalWorkerId,
    finalProjectId,
    initialProjectStartDate,
    initialProjectEndDate
  );

  return (
    <div className="w-full"> 
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Work Logs</h1>
      </div>
      <Suspense fallback={<WorkLogTableSkeleton />}>
        <WorkLogGrid
          projects={projects}
          workers={workers}
          workEntries={workEntries}
          initialSelectedProject={finalProjectId} // Pass the final determined ID
          initialSelectedWorker={finalWorkerId}   // Pass the final determined ID
        />
      </Suspense>
    </div>
  );
}