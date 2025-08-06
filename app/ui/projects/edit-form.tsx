'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  TrashIcon,
  PlusIcon,
  ClipboardIcon,
  MapPinIcon,
  TagIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { updateProject, ProjectState } from '@/app/lib/actions/projectActions';
import { ProjectWithExtras, WorkerShort, ServiceRow } from '@/app/lib/definitions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { Toast } from '../common/toast';

type EditProjectFormProps = {
  project: ProjectWithExtras & {

    services: {
      id: string;
      name: string;
      unitPrice: number;
      quantity: number;
    }[];
    workers: WorkerShort[];
  };
  customers: { id: string; name: string }[];
  services: {
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
  }[];
  workers: WorkerShort[];
};

export default function EditProjectForm({
  project,
  customers,
  services,
  workers,
}: EditProjectFormProps) {
  const initialState: ProjectState = { message: '', errors: {} };
  const updateWithId = updateProject.bind(null, project.id);
  const [state, formAction] = useActionState(updateWithId, initialState);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [assignedWorkers, setAssignedWorkers] = useState<string[]>(
    project.workers.map((w) => w.id)
  );
  const [assignAll, setAssignAll] = useState(false);

  useEffect(() => {
    if (state.message) {
      const type =
        state.errors && Object.keys(state.errors).length > 0
          ? 'error'
          : 'success';
      setToast({ message: state.message, type });
    }
  }, [state.message, state.errors]);

  const toggleWorker = (id: string) => {
    setAssignedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleAssignAll = () => {
    setAssignAll(!assignAll);
    setAssignedWorkers(!assignAll ? workers.map((w) => w.id) : []);
  };

  const [serviceRows, setServiceRows] = useState<ServiceRow[]>(
    project.services.map((s) => ({
      serviceId: s.id,
      serviceName: s.name,
      quantity: s.quantity,
      amount: s.unitPrice,
    }))
  );

  const handleServiceChange = <
    K extends keyof ServiceRow
  >(
    index: number,
    field: K,
    value: ServiceRow[K]
  ) => {
    const updated = [...serviceRows];
    updated[index][field] = value;
    setServiceRows(updated);
  };

  const addServiceRow = () =>
    setServiceRows([...serviceRows, { serviceId: '', quantity: 1, amount: 0, serviceName: '' }]);

  const removeServiceRow = (index: number) =>
    setServiceRows(serviceRows.filter((_, i) => i !== index));
  
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer */}
        <div className="mb-4">
          <label htmlFor="customerId" className="block text-sm font-medium">Customer</label>
          <select
            id="customerId"
            name="customerId"
            defaultValue={project.customer.id || ''}
            className="block w-full rounded-md border border-gray-200 py-2 text-sm"
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
        {/* Project Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">Project Name</label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={project.name}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm"
            />
            <ClipboardIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.name && (
            <p className="mt-2 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Address</label>
          <div className="relative mb-2">
            <input
              name="street"
              defaultValue={project.address.street}
              type="text"
              placeholder="Street"
              className="block w-full pl-10 h-10 rounded-md border border-gray-300 text-sm"
            />
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          {state.errors?.address?.street && (
            <p className="text-sm text-red-500">{state.errors.address.street}</p>
          )}
          <div className="flex gap-4">
            <div className="relative w-full">
              <input
                name="postalCode"
                defaultValue={project.address.postalCode}
                type="text"
                placeholder="Postal Code"
                className="pl-10 w-full h-10 rounded-md border border-gray-300 text-sm"
              />
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <div className="relative w-full">
              <input
                name="city"
                defaultValue={project.address.city}
                type="text"
                placeholder="City"
                className="pl-10 w-full h-10 rounded-md border border-gray-300 text-sm"
              />
              <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-4 mb-4">
          <div className="w-full">
            <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={project.startDate?.slice(0, 10) || ''}
              className="block w-full rounded-md border border-gray-200 py-2 text-sm"
            />
          </div>
          <div className="w-full">
            <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={project.endDate?.slice(0, 10) || ''}
              className="block w-full rounded-md border border-gray-200 py-2 text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={project.status}
            className="block w-full rounded-md border border-gray-200 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="stalled">Stalled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Services</h3>
          {serviceRows.map((row, index) => (
            <div key={index} className="mb-4 border p-4 rounded-md bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <select
                  name={`services[${index}].serviceId`}
                  value={row.serviceId}
                  onChange={(e) =>
                    handleServiceChange(index, 'serviceId', e.target.value)
                  }
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="">Select service</option>
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name={`services[${index}].serviceName`}
                  value={row.serviceName}
                  onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Or enter new service"
                />
                <input
                  type="number"
                  name={`services[${index}].quantity`}
                  value={row.quantity}
                  onChange={(e) =>
                    handleServiceChange(index, 'quantity', Number(e.target.value))
                  }
                  className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  name={`services[${index}].amount`}
                  value={row.amount}
                  onChange={(e) =>
                    handleServiceChange(index, 'amount', Number(e.target.value))
                  }
                  className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Amount"
                />
                <button
                  type="button"
                  onClick={() => removeServiceRow(index)}
                  className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                >
                  <TrashIcon className="h-4 w-4" />
                  Remove
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
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Service
            </button>
          </div>
        </div>

        {/* Workers */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Assign Workers</label>
          <div className="mb-2 flex items-center">
            <input
              type="checkbox"
              id="assignAll"
              checked={assignAll}
              onChange={handleAssignAll}
              className="mr-2"
            />
            <label htmlFor="assignAll" className="text-sm">Assign All</label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`worker-${worker.id}`}
                  name="workerIds"
                  value={worker.id}
                  checked={assignedWorkers.includes(worker.id)}
                  onChange={() => toggleWorker(worker.id)}
                  className="mr-2"
                />
                <label htmlFor={`worker-${worker.id}`} className="text-sm">{worker.name}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Inputs */}
        {assignedWorkers.map((id) => (
          <input key={id} type="hidden" name="workerIds" value={id} />
        ))}
      </div>

      {/* Toast */}
      <div id="error-message" aria-live="polite" aria-atomic="true">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link href="/dashboard/projects" className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600">
          Cancel
        </Link>
        <Button type="submit">Update Project</Button>
      </div>
    </form>
  );
}
