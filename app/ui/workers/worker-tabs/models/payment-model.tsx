'use client';

import React, { useEffect, useRef } from 'react';
import { SalaryPayment } from '@/app/lib/definitions';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formAction: (formData: FormData) => void;
  formState: {
    errors?: {
      amount?: string[];
      date?: string[];
      status?: string[];
      notes?: string[];
      workerId?: string[];
    };
    message?: string | null;
    success?: boolean;
  };
  workerId: string;
  payment: SalaryPayment | null; // Optional payment data for editing
  triggerRefresh: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  formAction,
  formState,
  workerId,
  payment,
  triggerRefresh
}: PaymentModalProps) {


  const hasHandledSuccess = useRef(false);

  // ✅ Reset success handler flag when modal opens
  useEffect(() => {
    if (isOpen) {
      hasHandledSuccess.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (formState?.success && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true; // Prevent multiple triggers
      triggerRefresh();
      onClose();

      const form = document.getElementById('payment-form') as HTMLFormElement;
      if (form) form.reset();
    }
  }, [formState.success, onClose, triggerRefresh]);

  // ✅ Early return below the hook
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {payment ? 'Edit Payment' : 'New Payment'}
        </h2>

        <form id="payment-form" action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="workerId" value={workerId} />
          {payment && <input type="hidden" name="paymentId" value={payment.id} />}

          <input name="date" type="date" defaultValue={payment?.date?.substring(0, 10) || ''} required className="border rounded px-3 py-2" />
          {formState?.errors?.date && <p className="text-red-500">{formState.errors.date[0]}</p>}

          <input name="amount" type="number" step="0.01" defaultValue={payment ? (payment.amount / 100).toFixed(2) : ''} required placeholder="Amount (DKK)" className="border rounded px-3 py-2" />
          {formState?.errors?.amount && <p className="text-red-500">{formState.errors.amount[0]}</p>}

          <select name="status" defaultValue={payment?.status || 'paid'} required className="border rounded px-3 py-2">
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
          {formState?.errors?.status && <p className="text-red-500">{formState.errors.status[0]}</p>}

          <input name="notes" defaultValue={payment?.note || ''} type="text" placeholder="Note (optional)" className="border rounded px-3 py-2" />
          {formState?.errors?.notes && <p className="text-red-500">{formState.errors.notes[0]}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>

          {/* {formState?.message && <p className="text-red-600 mt-2">{formState.message}</p>} */}
        </form>
      </div>
    </div>
  );
}
