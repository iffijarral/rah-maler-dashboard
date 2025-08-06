import Form from '@/app/ui/customers/edit-form';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchCustomerById } from '@/app/lib/data';
 
export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;    
    const id = params.id;
    const [customer] = await Promise.all([
        fetchCustomerById(id),        
    ]);
    
    if (!customer) {
        return notFound();
    }
    
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}