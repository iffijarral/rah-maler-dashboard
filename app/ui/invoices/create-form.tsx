'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { ProjectService, ProjectShort } from '@/app/lib/definitions';
import { createInvoice, State } from '@/app/lib/actions/invoiceActions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  BuildingOfficeIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function Form({
  projects,
  services,
  selectedProjectId,
}: {
  projects: ProjectShort[];
  services: ProjectService[];
  selectedProjectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);
  
  const [serviceRows, setServiceRows] = useState([
    { serviceId: '', serviceName: '', quantity: '', amount: '' },
  ]);

  // Load services when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    const related = services.filter((s) => s.projectId === selectedProjectId);
    const formatted = related.map((s) => ({
      serviceId: s.id,
      serviceName: '',
      quantity: s.quantity?.toString() || '',
      amount: s.unitPrice?.toString() || '',
    }));
    setServiceRows(formatted.length > 0 ? formatted : [
      { serviceId: '', serviceName: '', quantity: '', amount: '' },
    ]);
  }, [selectedProjectId, services]);

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
    router.replace(`/dashboard/invoices/create?${params.toString()}`);
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Project Dropdown */}
        <div className="mb-4">
          <label htmlFor="project" className="mb-2 block text-sm font-medium">
            Choose project
          </label>
          <div className="relative">
            <select
              id="project"
              name="projectId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              value={selectedProjectId}
              onChange={handleProjectChange}
              aria-describedby="project-error"
              required
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <BuildingOfficeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="project-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.projectId &&
              state.errors.projectId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Services</h3>
          {serviceRows.map((row, index) => (
            <div key={index} className="mb-4 border p-4 rounded-md bg-white">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <select
                  name={`services[${index}][serviceId]`}
                  value={row.serviceId}
                  onChange={(e) => handleChange(index, 'serviceId', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name={`services[${index}][serviceName]`}
                  value={row.serviceName}
                  onChange={(e) => handleChange(index, 'serviceName', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Or enter new service"
                />

                <input
                  type="number"
                  name={`services[${index}][quantity]`}
                  value={row.quantity}
                  onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  name={`services[${index}][amount]`}
                  value={row.amount}
                  onChange={(e) => handleChange(index, 'amount', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Amount"
                />

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

        {/* Status Radio */}
        <fieldset className="mb-6">
          <legend className="mb-2 block text-sm font-medium">Status</legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              {['pending', 'paid'].map((status) => (
                <div className="flex items-center" key={status}>
                  <input
                    id={status}
                    name="status"
                    type="radio"
                    value={status}
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                    aria-describedby="status-error"
                  />
                  <label
                    htmlFor={status}
                    className={`ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      status === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {status === 'paid' ? 'Paid' : 'Pending'}{' '}
                    {status === 'paid' ? <CheckIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>

        {/* Global error */}
        <div id="error-message" aria-live="polite" aria-atomic="true">
          {state?.message && (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
