import Form from '@/app/ui/workers/edit-form';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchWorkerById } from '@/app/lib/data';
 
export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;    
    const id = params.id;
    const [worker] = await Promise.all([
        fetchWorkerById(id),        
    ]);
    
    if (!worker) {
        return notFound();
    }
    
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Workers', href: '/dashboard/workers' },
          {
            label: 'Edit Worker',
            href: `/dashboard/workers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form worker={worker} />
    </main>
  );
}