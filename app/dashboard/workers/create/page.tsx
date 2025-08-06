import WorkerForm from '@/app/ui/workers/create-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
 
export default async function Page() {
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Emails', href: '/dashboard/workers' },
          {
            label: 'Create Worker',
            href: '/dashboard/workers/create',
            active: true,
          },
        ]}
      />
      <WorkerForm />
    </main>
  );
}