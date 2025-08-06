import { ParsedProjectService, ProjectServicesArraySchema } from './schemas';
export async function parseServicesFromForm(formData: FormData): Promise<{
  success: boolean;
  data?: ParsedProjectService[];
  error?: string;
}> {
  try {
    const servicesRaw = formData.get('services');
    if (!servicesRaw) {
      return { success: true, data: [] }; // No services submitted
    }

    const parsed = JSON.parse(servicesRaw.toString());
    const validation = ProjectServicesArraySchema.safeParse(parsed);

    if (!validation.success) {
      const errorMessages = validation.error.issues.map((e) => e.message).join(', ');
      return { success: false, error: `Validation error: ${errorMessages}` };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    console.error("Failed to parse services from form:", error);
    return { success: false, error: 'Invalid services format. Please retry.' };
  }
}
