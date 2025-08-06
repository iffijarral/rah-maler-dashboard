'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ProjectShort, ServiceTableRow, UpdateInvoiceInput } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { reloadInvoices, State, updateInvoice } from '@/app/lib/actions/invoiceActions';
import { useActionState } from 'react';
import { Toast } from '../common/toast';

export default function EditInvoiceForm({
  invoice,
  projects,
  services,
  selectedProjectId
}: {
  invoice: UpdateInvoiceInput;
  projects: ProjectShort[];
  services: ServiceTableRow[];
  selectedProjectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id!);
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState);

  const [serviceRows, setServiceRows] = useState(
    Array.isArray(invoice.services) && invoice.services.length > 0
      ? invoice.services.map((s) => ({
        serviceId: s.service.id ?? '', // instead of s.id
        serviceName: s.service?.name ?? '',
        quantity: s.quantity.toString(),
        amount: (s.amount / 100).toString(),
      }))
      : [{ serviceId: '', serviceName: '', quantity: '', amount: '' }]
  );

  const addServiceRow = () =>
    setServiceRows([...serviceRows, { serviceId: '', serviceName: '', quantity: '', amount: '' }]);

  const removeServiceRow = (index: number) =>
    setServiceRows(serviceRows.filter((_, i) => i !== index));

  const handleChange = (
    index: number,
    field: 'serviceId' | 'serviceName' | 'quantity' | 'amount',
    value: string
  ) => {
    const updated = [...serviceRows];
    updated[index][field] = value;
    setServiceRows(updated);
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('projectId', projectId);
    router.replace(`/dashboard/invoices/${invoice.id}/edit?${params.toString()}`);
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Project Name */}
        <div className="mb-4">
          <label htmlFor="project" className="mb-2 block text-sm font-medium">
            Choose project
          </label>
          <div className="relative">
            <select
              id="project"
              name="projectId"
              defaultValue={selectedProjectId}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={handleProjectChange}
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Services */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Services</h3>
          {serviceRows.map((row, index) => (
            <div key={index} className="mb-4 border p-4 rounded-md bg-white">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Existing service dropdown */}
                <select
                  name={`services[${index}][serviceId]`}
                  value={row.serviceId}
                  onChange={(e) => handleChange(index, 'serviceId', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="">Select service</option>
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* New service name input */}
                <input
                  type="text"
                  name={`services[${index}][serviceName]`}
                  value={row.serviceName}
                  onChange={(e) => handleChange(index, 'serviceName', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Or enter new service"
                  disabled={!!row.serviceId}
                />
                {/* Quantity input */}
                <input
                  type="number"
                  name={`services[${index}][quantity]`}
                  value={row.quantity}
                  onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Quantity"
                />
                {/* Amount input */}
                <input
                  type="number"
                  name={`services[${index}][amount]`}
                  value={row.amount}
                  onChange={(e) => handleChange(index, 'amount', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Amount"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeServiceRow(index)}
                  className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                >
                  <TrashIcon className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          ))}

          {/* Add Service button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={addServiceRow}
              className="flex items-center text-sm text-blue-600 hover:underline"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Service
            </button>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset className="mb-6">
          <legend className="mb-2 block text-sm font-medium">Status</legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={invoice.status === 'pending'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  defaultChecked={invoice.status === 'paid'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Invoice</Button>
      </div>
      {/* Show the toast notification */}
      {state.message && (
        <Toast
          message={state.message}
          type={state.success ? "success" : "error"}
          onClose={async () => {
            await reloadInvoices(); // ✅ Revalidate AFTER toast closes
          }}
        />
      )}
    </form>
  );
}
