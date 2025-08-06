'use client';

import React, { useEffect, useState } from 'react';
import { FullWorkEntry } from '@/app/lib/definitions';
import { format } from 'date-fns';
import ReasonModal from './reason-model';

interface WorkDetailsModalProps {
    workerId: string;
    year: number;
    month: number; // 1-based (Jan = 1, Dec = 12)
    onClose: () => void;
}

export default function WorkDetailsModal({
    workerId,
    year,
    month,
    onClose,
}: WorkDetailsModalProps) {
    const [workEntries, setWorkEntries] = useState<FullWorkEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWorkEntries() {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/workDetailsMonthWise?workerId=${workerId}&year=${year}&month=${month}`
                );
                if (!res.ok) throw new Error('Failed to fetch work entries');
                const data = await res.json();
                setWorkEntries(data);
            } catch (err) {
                console.error(err);
                setWorkEntries([]);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkEntries();
    }, [workerId, year, month]);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Work Details - {format(new Date(year, month - 1), 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-center text-sm">Loading...</p>
                    ) : workEntries.length === 0 ? (
                        <p className="text-center text-sm text-gray-500">No work entries found.</p>
                    ) : (
                        <table className="min-w-full table-auto text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-3 py-2 text-left">Date</th>
                                    <th className="px-3 py-2 text-left">Type</th>
                                    <th className="px-3 py-2 text-left">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b">
                                        <td className="px-3 py-2">
                                            {format(new Date(entry.date), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-3 py-2">
                                            {entry.isFullDay ? 'Full Day' : 'Half Day'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {entry.notes ? (
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => setSelectedNote(entry.notes!)}
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedNote && (
                <ReasonModal
                    reason={selectedNote}
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </>
    );
}
