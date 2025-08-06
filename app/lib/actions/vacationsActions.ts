'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import { VacationSchema } from '../schemas';

export type VacationState = {
    errors?: {
        workerId?: string[];
        startDate?: string[];
        endDate?: string[];
        approved?: string[];
        reason?: string[];        
    };
    message?: string | null;
    success?: boolean;
};

export async function saveVacations(
    prevState: VacationState,
    formData: FormData
): Promise<VacationState> {
    const vacationId = formData.get('vacationId')?.toString() || null;

    const input = {
        workerId: formData.get('workerId')?.toString() || '',
        startDate: formData.get('startDate')?.toString() || '',
        endDate: formData.get('endDate')?.toString() || '',
        approved: formData.get('approved') === 'on',
        reason: formData.get('reason')?.toString() || undefined,
    };

    const result = VacationSchema.safeParse(input);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        console.error('Validation errors:', fieldErrors);        
        return {
            errors: {
                workerId: fieldErrors.workerId,
                startDate: fieldErrors.startDate,
                endDate: fieldErrors.endDate,
                reason: fieldErrors.reason,
                approved: fieldErrors.approved,
            },
            message: 'Validation failed. Please correct the errors.',
            success: false,
        };
    }

    const { workerId, startDate, endDate, reason, approved } = result.data;

    try {
        if (vacationId) {
            // Update existing payment
            const updated = await prisma.vacation.update({
                where: { id: vacationId },
                data: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    reason,
                    approved,                    
                },
            });

            if (!updated?.id) {
                throw new Error('Vacation update failed.');
            }

            revalidatePath(`/dashboard/workers/${workerId}/logs`);

            return {
                errors: {},
                message: 'Vacation updated successfully.',
                success: true,
            };
        } else {
            // Create new payment
            const created = await prisma.vacation.create({
                data: {
                    workerId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    reason,
                    approved,
                },
            });

            if (!created?.id) {
                throw new Error('Vacations creation failed.');
            }

            revalidatePath(`/dashboard/workers/${workerId}`);

            return {
                errors: {},
                message: 'Vacations created successfully.',
                success: true,
            };
        }
    } catch (error) {
        console.error('Error saving payment:', error);
        return {
            errors: {
                workerId: ['Failed to save vacation.'],
                startDate: ['Failed to save vacation.'],
                endDate: ['Failed to save vacation.'],
                reason: ['Failed to save vacation.'],
                approved: ['Failed to save vacation.'],
            },
            message: 'Database error while saving payment.',
            success: false,
        };
    }
}
export async function deleteVacation(vacationId: string, workerId: string) {
  try {
    await prisma.vacation.delete({
      where: { id: vacationId },
    });

    revalidatePath(`/dashboard/workers/${workerId}`);
    
    return { success: true, message: 'Vacation deleted successfully.' };
  } catch (error) {
    console.error('Error deleting vacation:', error);
    return { success: false, message: 'Failed to delete vacation.' };
  }
}