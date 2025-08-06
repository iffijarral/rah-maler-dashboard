'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import { WorkEntrySchema } from '@/app/lib/schemas';
import { parseISO } from 'date-fns';

export type WorkLogState = {
  errors?: {
    workerId?: string[];
    projectId?: string[];
    date?: string[];
  };
  success?: boolean;
  message?: string | null;
};

export async function createWorkLog(
  prevState: WorkLogState,
  formData: FormData
): Promise<WorkLogState> {
  const workerId = formData.get('workerId')?.toString();
  const projectId = formData.get('projectId')?.toString();
  let entries: Array<{ date: string; isFullDay: boolean; note?: string }> = [];

  const entriesRaw = formData.get('entries');
  if (entriesRaw) {
    try {
      entries = JSON.parse(entriesRaw.toString());
    } catch (e) {
      console.error('🔴 JSON parse error:', e);
      return {
        success: false,
        message: 'Invalid entry data format',
        errors: { date: ['Could not parse work entries.'] },
      };
    }
  }

  const errors: WorkLogState['errors'] = {};
  if (!workerId) errors.workerId = ['Worker is required.'];
  if (!projectId) errors.projectId = ['Project is required.'];
  if (entries.length === 0) errors.date = ['At least one entry must be selected.'];

  if (Object.keys(errors).length) {
    return { success: false, message: 'Validation failed. Please correct the form.', errors };
  }

  const parsedEntries = entries.map((e) => ({
    workerId: workerId!,
    projectId: projectId!,
    date: e.date,
    isFullDay: e.isFullDay,
    notes: e.note,
  }));

  for (const entry of parsedEntries) {
    const result = WorkEntrySchema.safeParse(entry);
    if (!result.success) {
      return {
        success: false,
        message: 'Entry validation failed.',
        errors: { date: ['One or more entries are invalid.'] },
      };
    }
  }

  try {
    const selectedDates = parsedEntries.map((e) => parseISO(e.date));

    await prisma.$transaction([
      // ✅ Delete all *except* selected dates
      prisma.workEntry.deleteMany({
        where: {
          workerId,
          projectId,
          NOT: {
            date: { in: selectedDates },
          },
        },
      }),

      // ✅ Create or overwrite selected entries
      ...parsedEntries.map((entry) =>
        prisma.workEntry.upsert({
          where: {
            workerId_projectId_date: {
              workerId: entry.workerId!,
              projectId: entry.projectId!,
              date: parseISO(entry.date),
            },
          },
          update: {
            isFullDay: entry.isFullDay,
            notes: entry.notes || null,
          },
          create: {
            workerId: entry.workerId!,
            projectId: entry.projectId!,
            date: parseISO(entry.date),
            isFullDay: entry.isFullDay,
            notes: entry.notes || null,
          },
        })
      ),
    ]);

    revalidatePath('/dashboard/workLogs');

    return {
      success: true,
      message: 'Work entries successfully saved!',
      errors: {},
    };
  } catch (error) {
    console.error('🔴 DB transaction error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while saving work entries.',
      errors: { date: ['Database error. Please try again.'] },
    };
  }
}
