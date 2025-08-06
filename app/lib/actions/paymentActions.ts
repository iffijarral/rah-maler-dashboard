'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import { PaymentSchema } from '../schemas';

export type PaymentState = {
    errors?: {
        workerId?: string[];
        amount?: string[];
        date?: string[];
        status?: string[];
        notes?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function savePayment(
    prevState: PaymentState,
    formData: FormData
): Promise<PaymentState> {
    const paymentId = formData.get('paymentId')?.toString() || null;

    const input = {
        workerId: formData.get('workerId')?.toString() || '',
        amount: Number(formData.get('amount')),
        date: formData.get('date')?.toString() || '',
        status: formData.get('status')?.toString() || '',
        notes: formData.get('notes')?.toString() || undefined,
    };

    const result = PaymentSchema.safeParse(input);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return {
            errors: {
                workerId: fieldErrors.workerId,
                amount: fieldErrors.amount,
                date: fieldErrors.date,
                status: fieldErrors.status,
                notes: fieldErrors.notes,
            },
            message: 'Validation failed. Please correct the errors.',
            success: false,
        };
    }

    const { workerId, amount, date, status, notes } = result.data;

    try {
        if (paymentId) {
            // Update existing payment
            const updated = await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    amount: Math.round(amount * 100),
                    date: new Date(date),
                    status,
                    notes,
                },
            });

            if (!updated?.id) {
                throw new Error('Payment update failed.');
            }

            revalidatePath(`/dashboard/workers/${workerId}/logs`);

            return {
                errors: {},
                message: 'Payment updated successfully.',
                success: true,
            };
        } else {
            // Create new payment
            const created = await prisma.payment.create({
                data: {
                    workerId,
                    amount: Math.round(amount * 100),
                    date: new Date(date),
                    status,
                    notes,
                },
            });

            if (!created?.id) {
                throw new Error('Payment creation failed.');
            }

            revalidatePath(`/dashboard/workers/${workerId}/logs`);

            return {
                errors: {},
                message: 'Payment created successfully.',
                success: true,
            };
        }
    } catch (error) {
        console.error('Error saving payment:', error);
        return {
            errors: {
                amount: ['Could not save payment to database.'],
            },
            message: 'Database error while saving payment.',
            success: false,
        };
    }
}
export async function deletePayment(paymentId: string, workerId: string) {
  try {
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    revalidatePath(`/dashboard/workers/${workerId}/logs`);
    console.log(`Payment ${paymentId} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { success: false, message: 'Failed to delete payment.' };
  }
}