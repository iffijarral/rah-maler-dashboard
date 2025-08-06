'use client';

import React, { useActionState, useState } from "react";
import { format, parseISO } from 'date-fns';
import { SalaryPayment, SalarySummary } from "@/app/lib/definitions";
import PaymentModal from "./models/payment-model";
import { deletePayment, savePayment } from "@/app/lib/actions/paymentActions";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";


const initialState = { errors: {}, message: null };
type PageProps = {
    workerId: string;
    salaryHistory: SalarySummary[]; // This is the initial salary history data
    selectedYear: number; // Received as a prop   
    triggerRefresh: () => void; 
};

export default function SalaryTab({ workerId, salaryHistory, selectedYear, triggerRefresh }: PageProps) {    
    const [isModalOpen, setIsModalOpen] = useState(false);    
    const [editingPayment, setEditingPayment] = useState<SalaryPayment | null>(null); // This state can be used to pre-fill the modal with existing payment data if needed
    const [formState, formAction] = useActionState(savePayment, initialState);
    const [localFormState, setLocalFormState] = useState(formState);    

    console.log('SalaryTab: salaryHistory', salaryHistory);        
    const currentMonth = format(new Date(), 'MMMM');

    async function handleDelete(paymentId: string) {
        const confirmed = window.confirm('Are you sure you want to delete this payment?');

        if (!confirmed) return;

        try {
            await deletePayment(paymentId, workerId);
            
        } catch (e) {
            console.error('Failed to delete payment', e);
        }
    }

    const handleOpenModal = (payment: SalaryPayment | null) => {
        setEditingPayment(payment);
        setLocalFormState(initialState); // Reset state here
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-end">                             
                <button
                    onClick={() => handleOpenModal(null)} // null triggers "new payment" form
                    className="bg-blue-600 text-white py-2 px-4 rounded"
                >
                    Create Payment
                </button>
            </div>


            <PaymentModal
                key={editingPayment?.id || 'new'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formAction={formAction}
                formState={localFormState}
                workerId={workerId}
                payment={editingPayment}
                triggerRefresh={() => triggerRefresh()} // Pass the refresh function
            />
            <h2 className="text-xl font-semibold mb-4">Salary Summary for {selectedYear}</h2>
            <table className="min-w-full divide-y divide-gray-200 border rounded-md">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Month</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Days Worked</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Payable (DKK)</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Paid (DKK)</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Outstanding (DKK)</th>
                        {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th> */}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {salaryHistory.map((summary) => (
                        <React.Fragment key={summary.month}>
                            <tr className={summary.month === currentMonth ? 'bg-yellow-100 font-semibold' : ''}>
                                <td className="px-4 py-2 text-sm text-gray-900">{summary.month}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{summary.daysWorked}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{(summary.payable / 100).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{(summary.totalPaid / 100).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm font-semibold">
                                    {summary.outstanding < 0 ? (
                                        <span className="text-green-600">
                                            Overpaid: {Math.abs(summary.outstanding / 100).toFixed(2)} DKK
                                        </span>
                                    ) : summary.outstanding > 0 ? (
                                        <span className="text-red-600">
                                            Outstanding: {(summary.outstanding / 100).toFixed(2)} DKK
                                        </span>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>
                                {/* <td className="px-4 py-2 text-sm">
                                    <button
                                        onClick={() => {
                                            setEditingPayment(null); // null triggers "new payment" form
                                            setIsModalOpen(true);
                                        }}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Add Payment
                                    </button>
                                </td> */}
                            </tr>

                            {summary.payments.length > 0 && (
                                <tr>
                                    <td colSpan={6} className="bg-gray-50 px-4 py-2">
                                        <table className="w-full text-sm border border-gray-200 rounded">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-2 py-1 text-left">Date</th>
                                                    <th className="px-2 py-1 text-left">Amount</th>
                                                    <th className="px-2 py-1 text-left">Status</th>
                                                    <th className="px-2 py-1 text-left">Note</th>
                                                    <th className="px-2 py-1 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.payments.map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="px-2 py-1">{format(parseISO(p.date), 'dd-MM-yyyy')}</td>
                                                        <td className="px-2 py-1">{(p.amount / 100).toFixed(2)} DKK</td>
                                                        <td className="px-2 py-1 capitalize">{p.status}</td>
                                                        <td className="px-2 py-1">{p.note || '-'}</td>
                                                        <td className="px-2 py-1">
                                                            <div className="flex gap-3">
                                                                <div className="relative group inline-block">
                                                                    <button
                                                                        onClick={() => handleOpenModal(p)}
                                                                    >
                                                                        <PencilIcon className="w-5 text-green-500" />
                                                                    </button>
                                                                    <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                                        Edit Payment
                                                                    </div>
                                                                </div>
                                                                <div className="relative group inline-block">
                                                                    <button
                                                                        onClick={() => handleDelete(p.id)}
                                                                    >
                                                                        <TrashIcon className="w-5 text-red-500" />
                                                                    </button>
                                                                    <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                                        Delete Payment
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
