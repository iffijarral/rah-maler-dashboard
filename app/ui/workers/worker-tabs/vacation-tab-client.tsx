// ui/worker-tabs/vacation-tab-client.tsx
'use client';

import { startTransition, useActionState, useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import ReasonModal from './models/reason-model';
import { Vacation } from '@/app/lib/definitions';
import { deleteVacation, saveVacations } from "@/app/lib/actions/vacationsActions";
import CreateVacationModal from './models/vacationModel';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';


const initialState = { errors: {}, message: null, success: false };

interface VacationTabProps {
    workerId: string;
    vacations: Vacation[]; // Now received as a prop
    selectedYear: number; // Received as a prop
    triggerRefresh: () => void; // Callback from parent to refresh data
}

export default function VacationTab({ workerId, vacations, selectedYear, triggerRefresh }: VacationTabProps) {
    // We now manage `vacations` locally to allow filtering/sorting if needed,
    // but the source of truth for updates is `initialVacations` from the parent Server Component


    const [formState, formAction] = useActionState(saveVacations, initialState);
    const [localFormState, setLocalFormState] = useState(formState);
    const [editingVacation, setEditingVacation] = useState<Vacation | null | 'new'>(null); // 'new' indicates create mode
    const [modalReason, setModalReason] = useState<string | null>(null);
    const [showReasonModal, setShowReasonModal] = useState(false);

    useEffect(() => {
        setLocalFormState(formState);
    }, [formState]);

    async function handleDelete(vacationId: string) {
        const confirmed = window.confirm('Are you sure you want to delete this vacation record?');

        if (!confirmed) return;

        try {
            const result = await deleteVacation(vacationId, workerId); // Pass workerId if needed by your deleteVacation function

            if (!result.success) {
                alert(result.message || 'Failed to delete vacation');
                return;
            }

            triggerRefresh();
        } catch (e) {
            console.error('Failed to delete vacation', e);
        }
    }

    const handleOpenCreateModal = (vacation: Vacation | null) => {
        console.log('Opening vacation modal for:', vacation);
        setEditingVacation(vacation || 'new'); // use 'new' to represent create mode
    };

    const handleCloseCreateModal = () => {
        setEditingVacation(null); // Unmounts modal completely  
        setLocalFormState(initialState); // Reset form state          
    };

    return (
        <div>
            {/* Year dropdown removed, it's now in WorkerTabsClient */}
            <div className="flex justify-end"> {/* Adjust alignment as needed */}
                <button
                    onClick={() => handleOpenCreateModal(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
                >
                    Create Vacation
                </button>
            </div>

            {editingVacation !== null && (
                <CreateVacationModal
                    key={editingVacation === 'new' ? 'new-vacation' : editingVacation.id}
                    vacation={editingVacation === 'new' ? null : editingVacation}
                    onClose={handleCloseCreateModal}
                    onSuccess={() => {
                        handleCloseCreateModal();
                        startTransition(() => triggerRefresh());
                    }}
                    workerId={workerId}
                    formAction={formAction}
                    formState={localFormState} // Use local form state to avoid flickering
                />
            )}
            <h2 className="text-xl font-semibold mb-4">Vacation Summary for {selectedYear}</h2>
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {vacations.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                No vacation records found for {selectedYear}.
                            </td>
                        </tr>
                    ) : (
                        vacations.map(vac => (
                            <tr key={vac.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    {format(new Date(vac.startDate), 'dd-MM-yyyy')}
                                </td>
                                <td className="px-4 py-3">
                                    {format(new Date(vac.endDate), 'dd-MM-yyyy')}
                                </td>
                                <td className="px-4 py-3">
                                    {differenceInDays(new Date(vac.endDate), new Date(vac.startDate)) + 1}
                                </td>
                                <td className="px-4 py-3">
                                    {vac.reason ? (
                                        <button
                                            onClick={() => {
                                                setModalReason(vac.reason || null);
                                                setShowReasonModal(true);
                                            }}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            View Reason
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 italic">No reason</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {vac.approved ? (
                                        <span className="text-green-600 font-medium">Yes</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">No</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 items-center">
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleOpenCreateModal(vac)}
                                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                                aria-label="Edit Vacation"
                                            >
                                                <PencilIcon className="w-5 h-5 text-green-600" />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                Edit Vacation
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleDelete(vac.id)}
                                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                                aria-label="Delete Vacation"
                                            >
                                                <TrashIcon className="w-5 h-5 text-red-600" />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                Delete Vacation
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {showReasonModal && (
                <ReasonModal reason={modalReason} onClose={() => setShowReasonModal(false)} />
            )}
        </div>
    );
}