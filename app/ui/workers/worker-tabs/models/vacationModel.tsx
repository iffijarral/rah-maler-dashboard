'use client';

import React, { useEffect, useState } from 'react';
import { Vacation } from '@/app/lib/definitions';
import { VacationState } from '@/app/lib/actions/vacationsActions';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';


type MyRange = {
    startDate: Date;
    endDate: Date;
    key: string;
};

interface VacationModalProps {
    onClose: () => void;
    formAction: (formData: FormData) => void;
    formState: VacationState;
    workerId: string;
    vacation: Vacation | null; // Optional payment data for editing
    onSuccess: () => void; // Callback for successful form submission
}

export default function CreateVacationModal({
    onClose,
    onSuccess,
    formAction,
    formState,
    workerId,
    vacation,

}: VacationModalProps) {

    // Initial range state setup:
    // We'll initialize it here to ensure it's always an array with one selection.
    // The useEffect below will handle setting the *correct* dates for edit/create.
    const [range, setRange] = useState<MyRange[]>([{
        startDate: new Date(vacation?.startDate ?? Date.now()),
        endDate: new Date(vacation?.endDate ?? Date.now()),
        key: 'selection',
    }]);

    useEffect(() => {
        if (vacation) {
            setRange([{
                startDate: new Date(vacation.startDate),
                endDate: new Date(vacation.endDate),
                key: 'selection',
            }]);
        }
    }, [vacation]);

    useEffect(() => {
        if (formState?.message === 'success') {
            onClose();         // Close the modal
            onSuccess();     // Optional callback
        }
    }, [formState?.message, onClose, onSuccess]);

    const handleCancel = () => {
        onClose();
        onSuccess();
        // Reset the date range picker to today's date when cancelling
        setRange([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        }]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-lg font-semibold mb-4">
                    {vacation ? 'Edit Vacation' : 'Create Vacation'}
                </h2>

                <form id="vacation-form" action={formAction}>
                    <input type="hidden" name="workerId" value={workerId} />
                    {vacation && <input type="hidden" name="vacationId" value={vacation.id} />}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Vacation Range</label>
                        <DateRange
                            editableDateInputs={true}
                            onChange={(item: { selection: MyRange }) => setRange([item.selection])} // Correctly update the state
                            moveRangeOnFirstSelection={false}
                            ranges={range} // Pass the state variable
                            rangeColors={['#2563eb']}
                        />
                        {formState?.errors?.startDate && <p className="text-red-500">{formState.errors.startDate[0]}</p>}
                        {formState?.errors?.endDate && <p className="text-red-500">{formState.errors.endDate[0]}</p>}
                    </div>

                    {/* Hidden inputs to pass the values to the form */}
                    {range[0] && ( // Ensure range[0] exists before accessing its properties
                        <>
                            <input type="hidden" name="startDate" value={format(range[0].startDate, 'yyyy-MM-dd')} />
                            <input type="hidden" name="endDate" value={format(range[0].endDate, 'yyyy-MM-dd')} />
                        </>
                    )}


                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason
                        </label>
                        <textarea
                            name="reason"
                            defaultValue={vacation?.reason ?? ''}
                            rows={3}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="Optional reason"
                        />
                        {formState?.errors?.reason && <p className="text-red-500">{formState.errors.reason[0]}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name="approved"
                                defaultChecked={vacation?.approved || false}
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Approved</span>
                        </label>
                        {formState?.errors?.approved && <p className="text-red-500">{formState.errors.approved[0]}</p>}
                    </div>

                    {formState?.message && formState.message !== 'success' && (
                        <p className="text-red-600 text-sm mb-3">{formState.message}</p>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border rounded bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            {vacation ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}