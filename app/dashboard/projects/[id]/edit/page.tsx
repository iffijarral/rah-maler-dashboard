
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchProjectById, loadCustomers, loadWorkers } from '@/app/lib/data';
import EditProjectForm from '@/app/ui/projects/edit-form';
import { ProjectWithExtras } from '@/app/lib/definitions';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const project: ProjectWithExtras | null = await fetchProjectById(id);
    const customers = await loadCustomers();
    const workers = await loadWorkers(); 

    if (!project) {
        return notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Projects', href: '/dashboard/projects' },
                    {
                        label: 'Edit Worker',
                        href: `/dashboard/projects/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <EditProjectForm customers={customers} workers={workers} project={project} />
        </main>
    );
}