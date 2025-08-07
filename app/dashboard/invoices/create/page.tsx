import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { loadProjects, fetchServicesByProject } from '@/app/lib/data';

export const dynamic = 'force-dynamic';

type PageProps = {    
    searchParams?: Promise<{
        projectId?: string;
    }>;
};



export default async function Page(props: PageProps) {
  const projects = await loadProjects();
  const searchParams =  await props.searchParams;
  const selectedProjectId = searchParams?.projectId || projects[0]?.id || '';
  const services = await fetchServicesByProject(selectedProjectId);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          { label: 'Create Invoice', href: '/dashboard/invoices/create', active: true },
        ]}
      />
      <Form projects={projects} services={services} selectedProjectId={selectedProjectId} />
    </main>
  );
}
