export const dynamic = 'force-dynamic';

import { loadCustomers, loadWorkers, fetchServices } from '@/app/lib/data';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import ProjectForm from '@/app/ui/projects/create-form';
 
export default async function Page() {
  const customers = await loadCustomers();  
  const workers = await loadWorkers();
  const services = await fetchServices();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Emails', href: '/dashboard/projects' },
          {
            label: 'Create Project',
            href: '/dashboard/projects/create',
            active: true,
          },
        ]}
      />
      <ProjectForm customers={customers} workers={workers} services={services} />
    </main>
  );
}