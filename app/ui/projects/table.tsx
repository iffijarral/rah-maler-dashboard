import { fetchFilteredProjects } from '@/app/lib/data';
import { Update } from '../buttons/update';
import { Delete } from '../buttons/action-buttons';
import { format } from 'date-fns';
import { ProjectTableRow } from '@/app/lib/definitions';

export default async function ProjectsTable({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {
    const projects = await fetchFilteredProjects(query, currentPage);
    console.log('ProjectsTable projects:', projects);
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    {/* Mobile View */}
                    <div className="md:hidden">
                        {projects?.map((project: ProjectTableRow) => (
                            <div
                                key={project.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                            >
                                <div className="border-b pb-4">
                                    <div>
                                        <p className="text-base font-semibold">{project.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Customer: {project.customer.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-sm">
                                            Start: {project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : 'N/A'}
                                        </p>
                                        <p className="text-sm">
                                            End:{' '}
                                            {project.endDate
                                                ? format(new Date(project.endDate), 'yyyy-MM-dd')
                                                : 'Ongoing'}
                                        </p>
                                        
                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                            Status: {project.status}
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Update id={project.id} route="projects" />
                                        <Delete id={project.id} route="project" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th className="px-4 py-5 font-medium sm:pl-6">Project</th>
                                <th className="px-3 py-5 font-medium">Customer</th>
                                <th className="px-3 py-5 font-medium">Start Date</th>
                                <th className="px-3 py-5 font-medium">End Date</th>                            
                                <th className="px-3 py-5 font-medium">Total Pending</th>
                                <th className="px-3 py-5 font-medium">Total Paid</th>
                                <th className="px-3 py-5 font-medium">Project Price</th>
                                <th className="py-3 pl-6 pr-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {projects?.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">
                                        No project found.
                                    </td>
                                </tr>
                            )}
                            {projects?.map((project: ProjectTableRow) => (
                                <tr
                                    key={project.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        {project.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.customer.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : 'N/A'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.endDate
                                            ? format(new Date(project.endDate), 'yyyy-MM-dd')
                                            : 'Ongoing'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.totalPending}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.totalPaid}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.plannedPrice ? project.plannedPrice : 'N/A'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {project.status}
                                    </td>
                                    
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <Update id={project.id} route="projects" />
                                            <Delete id={project.id} route="project" />
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
