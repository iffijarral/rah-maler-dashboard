'use server';

import {
  ProjectSchema,
  UpdateProjectSchema,
  AddressSchema,
  ProjectAssignmentSchema,
  ParsedProjectService,
  DeleteSchema,
} from '../schemas';
import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
// import { redirect } from 'next/navigation';

export type ProjectState = {
  errors?: {
    name?: string[];
    customerId?: string[];
    startDate?: string[];
    endDate?: string[];
    status?: string[];
    workerIds?: string[];
    address?: {
      street?: string[];
      postalCode?: string[];
      city?: string[];
    };
    services?: string[]; // Add this line to support service errors
  };
  success?: boolean;
  message?: string | null;
};

export async function createProject(
  prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const workerIds = formData.getAll('workerIds') as string[];

    // --- Parse dynamic services ---
    const rawServices: ParsedProjectService[] = [];
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^services\[(\d+)\]\.(\w+)$/);
      if (!match) continue;

      const [, index, field] = match;
      const i = parseInt(index);

      if (!rawServices[i]) {
        rawServices[i] = { quantity: 0, amount: 0 } as ParsedProjectService;
      }

      // Skip files (not expected here)
      if (typeof value !== 'string') continue;

      if (field === 'quantity' || field === 'amount') {
        rawServices[i][field] = Number(value);
      } else if (field === 'serviceId' || field === 'serviceName') {
        rawServices[i][field] = value;
      }
    }

    // --- Validate schemas ---
    const projectParse = ProjectSchema.safeParse(raw);
    const addressParse = AddressSchema.safeParse(raw);

    if (!projectParse.success || !addressParse.success) {
      return {
        message: 'Please fix validation errors.',
        errors: {
          ...(projectParse.success ? {} : projectParse.error.flatten().fieldErrors),
          ...(addressParse.success
            ? {}
            : {
              address: addressParse.error.flatten().fieldErrors,
            }),
        },
      };
    }

    const {
      name,
      customerId,
      status,
      startDate,
      endDate,
    } = projectParse.data;

    const { street, postalCode, city } = addressParse.data;

    await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: { street, postalCode, city },
      });

      const resolvedServices = await Promise.all(
        rawServices.map(async (s) => {
          let serviceId = s.serviceId;

          if (!serviceId && s.serviceName) {
            const existingService = await prisma.service.findUnique({
              where: { name: s.serviceName },
            });

            if (existingService) {
              serviceId = existingService.id;
            } else {
              const newService = await prisma.service.create({
                data: { name: s.serviceName },
              });
              serviceId = newService.id;
            }
          }

          if (!serviceId) {
            throw new Error('Service ID is missing and no service name provided.');
          }

          return {
            serviceId,
            unitPrice: s.amount,
            quantity: s.quantity,
          };
        })
      );

      const plannedPrice = resolvedServices.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0) * 100;

      const project = await tx.project.create({
        data: {
          name,
          customerId,
          status,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          addressId: address.id,
          plannedPrice,
        },
      });

      if (resolvedServices.length > 0) {
        await tx.projectService.createMany({
          data: resolvedServices.map((s) => ({
            ...s,
            projectId: project.id,
          })),
        });
      }

      if (workerIds.length > 0) {
        await tx.projectAssignment.createMany({
          data: workerIds.map((workerId) => ({
            projectId: project.id,
            workerId,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: null,
          })),
        });
      }
    });

    revalidatePath('/dashboard/projects');

    return {
      message: null,
      success: true,
    };
  } catch (error) {
    console.error('[CREATE_PROJECT_ERROR]', error);
    return {
      message: 'An unexpected error occurred while creating the project.',
      success: false,
    };
  }
}




// Update Project
export async function updateProject(
  id: string,
  prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  try {
    const raw = {
      ...Object.fromEntries(formData.entries()),
      id, // ✅ add bound ID here
    };
    const workerIds = formData.getAll('workerIds') as string[];
    // --- Parse dynamic services ---
    const rawServices: ParsedProjectService[] = [];
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^services\[(\d+)\]\.(\w+)$/);
      if (!match) continue;

      const [, index, field] = match;
      const i = parseInt(index);

      if (!rawServices[i]) {
        rawServices[i] = { quantity: 0, amount: 0 } as ParsedProjectService;
      }

      // Skip files (not expected here)
      if (typeof value !== 'string') continue;

      if (field === 'quantity' || field === 'amount') {
        rawServices[i][field] = Number(value);
      } else if (field === 'serviceId' || field === 'serviceName') {
        rawServices[i][field] = value;
      }
    }

    // --- Validate schemas ---
    const projectParse = UpdateProjectSchema.safeParse(raw);
    const addressParse = AddressSchema.safeParse(raw);

    if (!projectParse.success || !addressParse.success) {
      console.error('Validation errors:', {
        project: !projectParse.success ? projectParse.error.flatten().fieldErrors : {},
        address: !addressParse.success ? addressParse.error.flatten().fieldErrors : {},
      });
      return {
        message: 'Please fix validation errors.',
        errors: {
          ...(projectParse.success ? {} : projectParse.error.flatten().fieldErrors),
          ...(addressParse.success
            ? {}
            : {
              address: addressParse.error.flatten().fieldErrors,
            }),
        },
      };
    }

    const {
      name,
      customerId,
      status,
      startDate,
      endDate,
    } = projectParse.data;
    const { street, postalCode, city } = addressParse.data;

    // --- Resolve service IDs (create if missing) ---
    const resolvedServices = await Promise.all(
      rawServices.map(async (s) => {
        let serviceId = s.serviceId;

        if (!serviceId && s.serviceName) {
          const existingService = await prisma.service.findUnique({
            where: { name: s.serviceName },
          });

          if (existingService) {
            serviceId = existingService.id;
          } else {
            const newService = await prisma.service.create({
              data: { name: s.serviceName },
            });
            serviceId = newService.id;
          }
        }

        if (!serviceId) {
          throw new Error('Service ID is missing and no service name provided.');
        }

        return {
          projectId: id,
          serviceId,
          unitPrice: s.amount,
          quantity: s.quantity,
        };
      })
    );

    const plannedPrice = resolvedServices.reduce(
      (sum, s) => sum + s.unitPrice * s.quantity,
      0
    );

    // --- Transactional update ---
    await prisma.$transaction(async (tx) => {
      // Update or create address
      const existingProject = await tx.project.findUnique({
        where: { id },
        include: { address: true },
      });

      let addressId: string;

      if (existingProject?.address) {
        await tx.address.update({
          where: { id: existingProject.address.id },
          data: { street, postalCode, city },
        });
        addressId = existingProject.address.id;
      } else {
        const newAddress = await tx.address.create({
          data: { street, postalCode, city },
        });
        addressId = newAddress.id;
      }

      // Update project
      await tx.project.update({
        where: { id },
        data: {
          name,
          customerId,
          status,
          startDate: (startDate ? new Date(startDate) : new Date()).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          addressId,
          plannedPrice,
        },
      });

      // Replace project services
      await tx.projectService.deleteMany({ where: { projectId: id } });

      if (resolvedServices.length > 0) {
        await tx.projectService.createMany({
          data: resolvedServices,
        });
      }

      // Replace worker assignments
      await tx.projectAssignment.deleteMany({ where: { projectId: id } });

      if (workerIds.length > 0) {
        const assignments = workerIds.map((workerId) => ({
          projectId: id,
          workerId,
          startDate: (startDate ? new Date(startDate) : new Date()).toISOString(),
          endDate: endDate && endDate !== '' ? new Date(endDate).toISOString() : undefined,
        }));

        for (const assignment of assignments) {
          const result = ProjectAssignmentSchema.safeParse(assignment);
          if (!result.success) {
            console.log('Invalid assignment:', result.error);
            throw new Error('Invalid worker assignment');
          }
        }

        await tx.projectAssignment.createMany({ data: assignments });
      }
    });

    revalidatePath('/dashboard/projects');

    return {
      message: 'Project updated successfully!',
      success: true,
    };
  } catch (error) {
    console.error('[UPDATE_PROJECT_ERROR]', error);
    return {
      message: 'An unexpected error occurred while updating the project.',
      success: false,
      errors: {
        name: ['Could not update project in database.'],
      },
    };
  }
}


// ****************** Delete Project ******************

export async function deleteProject(id: string) {
  // Validate if ID is a valid UUID (assuming your DB uses UUIDs for invoice IDs)
  const validatedFields = DeleteSchema.safeParse({
    id
  });

  if (!validatedFields.success) {
    console.error("Validation failed", validatedFields.error.format());
    return {
      error: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Delete Invoice.',
      success: false
    };
  }
  try {
    const myProject = await prisma.project.findUnique({ where: { id } });

    if (!myProject) {
      throw new Error("invoice not found.");
    }

    await prisma.project.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    return {
      error: {},
      success: true,
      message: 'Project Deleted Successfully.',
    };

  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      error: {},
      success: false,
      message: 'Failed to Delete the Project.',
    };
  }
}
export async function reloadProjects() {
  revalidatePath("/dashboard/projects");
}