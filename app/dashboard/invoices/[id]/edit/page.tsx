import Form from '@/app/ui/invoices/edit-form';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import {
  loadProjects,
  fetchServicesByProject,
  fetchInvoiceById,
} from '@/app/lib/data';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [invoice, projects] = await Promise.all([
    fetchInvoiceById(id),
    loadProjects(),
  ]);

  if (!invoice) {
    return notFound();
  }

  const selectedProjectId = invoice.projectId;
  const services = await fetchServicesByProject(selectedProjectId);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form
        invoice={invoice}
        projects={projects}
        services={services}
        selectedProjectId={selectedProjectId}
      />
    </main>
  );
}
