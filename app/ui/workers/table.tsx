import { fetchFilteredWorkers } from '@/app/lib/data'; // Your fetch function for workers
import { Update } from '../buttons/update';
import { Delete } from '../buttons/action-buttons';
import { WorkerTableRow } from '@/app/lib/definitions';

import Link from 'next/link';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default async function WorkersTable({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {
    const workers = await fetchFilteredWorkers(query, currentPage);

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    {/* Mobile view */}
                    <div className="md:hidden">
                        {workers?.length === 0 && (
                            <div className="flex w-full items-center justify-center rounded-md bg-white p-4 text-lg font-medium">
                                No workers found
                            </div>
                        )}
                        {
                            workers?.map((worker: WorkerTableRow) => (
                                <div
                                    key={worker.id}
                                    className="mb-2 w-full rounded-md bg-white p-4"
                                >
                                    <div className="border-b pb-4">
                                        <p className="font-medium">{worker.name}</p>
                                        <p className="text-sm text-gray-500">{worker.email}</p>
                                        <p className="text-sm text-gray-500">{worker.phone}</p>
                                    </div>
                                    <div className="flex w-full items-center justify-between pt-4">
                                        <div>
                                            <p className="text-sm">Position: {worker.position}</p>
                                            <p className="text-sm text-gray-600">
                                                Rate: {worker.dailyRate / 100} DKK/hr
                                            </p>                                            
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Update id={worker.id} route="workers" />
                                            <Delete id={worker.id} route="worker" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Desktop/table view */}
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Name</th>
                                <th scope="col" className="px-3 py-5 font-medium">Email</th>
                                <th scope="col" className="px-3 py-5 font-medium">Phone</th>
                                <th scope="col" className="px-3 py-5 font-medium">Position</th>
                                <th scope="col" className="px-3 py-5 font-medium">Daily Rate</th>                                
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {workers?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-5">
                                        No workers found
                                    </td>
                                </tr>
                            )}

                            {workers?.map((worker) => (
                                <tr
                                    key={worker.id}
                                    className="border-b py-3 text-sm last-of-type:border-none 
                    [&:first-child>td:first-child]:rounded-tl-lg 
                    [&:first-child>td:last-child]:rounded-tr-lg 
                    [&:last-child>td:first-child]:rounded-bl-lg 
                    [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">{worker.name}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{worker.email}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{worker.phone}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{worker.position}</td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {worker.dailyRate / 100} DKK/day
                                    </td>
                                    
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <div className="relative group">
                                                {/* <WorkerTabs id={worker.id} route='workers' /> */}
                                                <Link
                                                    href={`/dashboard/workers/${worker.id}/`}
                                                    className="rounded-md inline-block border p-2 hover:bg-gray-100"
                                                >
                                                    <ClipboardDocumentListIcon className="w-5" />
                                                </Link>
                                                <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                    Worker Log
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <Update id={worker.id} route='workers' />
                                                <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                    Edit Worker
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <Delete id={worker.id} route="worker" />
                                                <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                                                    Delete Worker
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
