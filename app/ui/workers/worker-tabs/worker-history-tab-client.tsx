'use client';
// import { lusitana } from '@/app/ui/fonts';
import { useState } from "react";
import WorkDetailsModal from "./models/WorkDetailsModal";

type PageProps = {
    workerId: string;
    workedDaysPerMonth: Record<number, number>;
    selectedYear: number; // Received as a prop    
};

export default function WorkHistoryTab({ workerId, workedDaysPerMonth, selectedYear }: PageProps) {

    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const closeModal = () => setSelectedMonth(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <table className="min-w-full text-gray-900 table-fixed">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th className="px-4 py-5 font-medium sm:pl-6">Month</th>
                                <th className="px-3 py-5 font-medium">Days Worked</th>
                                <th className="px-3 py-5 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white relative">
                            {Object.keys(workedDaysPerMonth).length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-5">
                                        No logs available
                                    </td>
                                </tr>
                            ) : (
                                monthNames.map((month, index) => (
                                    <tr key={index} className="border-b py-3 text-sm last-of-type:border-none">
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">{month}</td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {workedDaysPerMonth[index] || 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {workedDaysPerMonth[index] > 0 ? (
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => {
                                                        console.log("Opening modal for month:", month);
                                                        setSelectedMonth(index + 1); // ✅ month as number (1 = Jan, 12 = Dec)
                                                    }}
                                                >
                                                    Details
                                                </button>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Modal */}
                {selectedMonth && (
                    <WorkDetailsModal
                        workerId={workerId}
                        year={selectedYear}
                        month={selectedMonth}
                        onClose={closeModal}
                    />
                )}
            </div>
        </div>
    );

}