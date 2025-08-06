'use server';

import { revalidatePath } from 'next/cache';
import { AddressSchema, DeleteSchema, UpdateWorkerSchema, WorkerSchema } from '@/app/lib/schemas';
import { prisma } from '../prisma';


// ****************** Worker Actions ******************

// Worker State
export type WorkerState = {
    errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        position?: string[];
        dailyRate?: string[];
        startDate?: string[];
        isActive?: string[];
        address?: {
            street?: string;
            postalCode?: string;
            city?: string;
        };
    };
    success?: boolean;
    message?: string | null;
};

// Create Worker
export async function createWorker(prevState: WorkerState, formData: FormData): Promise<WorkerState> {

    // Gather address input
    const addressInput = {
        street: formData.get('street')?.toString().trim() || '',
        postalCode: formData.get('postalCode')?.toString().trim() || '',
        city: formData.get('city')?.toString().trim() || '',
    };

    // Validate address input
    const addressValidation = AddressSchema.safeParse(addressInput);

    // Prepare fake addressId for customer validation if address is invalid
    let addressId: string | undefined = undefined;

    // If address is valid, insert it and get ID
    if (addressValidation.success) {
        try {
            const createdAddress = await prisma.address.create({
                data: addressValidation.data,
            });
            addressId = createdAddress.id;
        } catch (err) {
            console.error("Address creation failed:", err);
            return {
                errors: {
                    address: {
                        street: "Could not save address to database.",
                    },
                },
                success: false,
                message: "Database error while creating address.",
            };
        }
    }

    const dateString = formData.get('startDate')?.toString() || new Date().toISOString();

    const validatedFields = WorkerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'), // Optional phone number
        position: formData.get('position'),
        dailyRate: Number(formData.get('dailyRate')),
        startDate: dateString,
        isActive: formData.get('isActive') !== null,
    });
    // Collect all validation errors (if any)
    const errors: WorkerState['errors'] = {};
    if (!addressValidation.success) {
        const addressFieldErrors = addressValidation.error.flatten().fieldErrors;
        errors.address = {
            street: addressFieldErrors.street?.[0],
            postalCode: addressFieldErrors.postalCode?.[0],
            city: addressFieldErrors.city?.[0],
        };
    }

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        errors.name = fieldErrors.name;
        errors.email = fieldErrors.email;
        errors.phone = fieldErrors.phone; 
        errors.position = fieldErrors.position;
        errors.dailyRate = fieldErrors.dailyRate;
        errors.startDate = fieldErrors.startDate;
        errors.isActive = fieldErrors.isActive;

    }
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false,
            message: 'Validation failed. Please fix the errors and try again.',
        };
    }
    if (validatedFields.success) {
        const validatedWorker = {
            ...validatedFields.data,
            addressId, // injected addressId
            dailyRate: Math.round(validatedFields.data.dailyRate * 100),
            startDate: new Date(validatedFields.data.startDate),
        };
        try {
            await prisma.worker.create({
                data: validatedWorker,
            });
            revalidatePath('/dashboard/workers');
            return {
                message: 'Worker created successfully!',
                success: true,
                errors: {},
            };
        } catch (error) {
            console.error("Customer creation failed:", error);
            return {
                errors: {
                    name: ["Could not save customer to database."],
                },
                success: false,
                message: "Database error while creating customer.",
            };
        }
    }
    return {
        errors,
        success: false,
        message: 'Unknown error occurred.',
    };
}

// Update Worker
export async function updateWorker(id: string, prevState: WorkerState, formData: FormData): Promise<WorkerState> {

    const addressInput = {
        street: formData.get("street")?.toString().trim() || "",
        postalCode: formData.get("postalCode")?.toString().trim() || "",
        city: formData.get("city")?.toString().trim() || "",
    };

    const addressValidation = AddressSchema.safeParse(addressInput);
    const errors: WorkerState["errors"] = {};
    const dateString = formData.get('startDate')?.toString() || new Date().toISOString();

    const validatedFields = UpdateWorkerSchema.safeParse({
        id,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'), 
        position: formData.get('position'),
        dailyRate: Number(formData.get('dailyRate')),
        startDate: dateString,
        isActive: formData.get('isActive') !== null,
    });

    if (!addressValidation.success) {
        const addressFieldErrors = addressValidation.error.flatten().fieldErrors;
        console.log("addressFieldErrors", addressFieldErrors);
        errors.address = {
            street: addressFieldErrors.street?.[0],
            postalCode: addressFieldErrors.postalCode?.[0],
            city: addressFieldErrors.city?.[0],
        };
    }

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        errors.name = fieldErrors.name;
        errors.email = fieldErrors.email;
        errors.phone = fieldErrors.phone; 
        errors.position = fieldErrors.position;
        errors.dailyRate = fieldErrors.dailyRate;
        errors.startDate = fieldErrors.startDate;
        errors.isActive = fieldErrors.isActive;

    }
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false,
            message: 'Validation failed. Please fix the errors and try again.',
        };
    }
    if (validatedFields.success && addressValidation.success) {
        const validatedWorker = validatedFields.data;
        const validatedAddress = addressValidation.data;

        try {
            await prisma.$transaction(async (tx) => {
                // Update customer basic info
                await tx.worker.update({
                    where: { id },
                    data: {
                        name: validatedWorker.name,
                        email: validatedWorker.email,   
                        phone: validatedWorker.phone,                      
                        position: validatedWorker.position,
                        dailyRate: Math.round(validatedWorker.dailyRate * 100),
                        startDate: new Date(validatedWorker.startDate),
                        isActive: validatedWorker.isActive,
                    },
                });

                // Fetch current customer including address
                const existingWorker = await tx.worker.findUnique({
                    where: { id },
                    include: { address: true },
                });

                if (existingWorker?.address) {
                    // Update existing address
                    await tx.address.update({
                        where: { id: existingWorker.address.id },
                        data: validatedAddress,
                    });
                } else {
                    // Create new address and connect it to the customer
                    const newAddress = await tx.address.create({
                        data: {
                            ...validatedAddress,
                            worker: {
                                connect: { id },
                            },
                        },
                    });

                    // Set the addressId on the customer (if not done via relation)
                    await tx.worker.update({
                        where: { id },
                        data: {
                            addressId: newAddress.id,
                        },
                    });
                }
            });
            revalidatePath('/dashboard/workers');
            return {
                message: 'Worker updated successfully!',
                success: true,
                errors: {},
            };
        } catch (error) {
            console.error("Database error during update:", error);
            return {
                errors: {
                    name: ["Could not save worker to database."],
                },
                success: false,
                message: "Database error while updating worker.",
            };
        }              
    }
    return {
        errors,
        success: false,
        message: 'Unknown error occurred.',
    };
}
// Delete Worker
export async function deleteWorker(id: string) {
    try {
        // Validate if ID is a valid UUID (assuming your DB uses UUIDs for customer IDs)
        const validatedFields = DeleteSchema.safeParse({
            id
        });

        if (!validatedFields.success) {
            console.error("Validation failed", validatedFields.error.format());
            return {
                error: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Delete Worker.',
                success: false
            };
        }

        const worker = await prisma.worker.findUnique({ where: { id } });

        if (!worker) {
            throw new Error("Worker not found.");
        }

        await prisma.worker.update({
            where: { id },
            data: {
                isDeleted: true,
            },
            select: {
                id: true,
            },
        });
        revalidatePath('/dashboard/workers');
        return {
            error: {},
            success: true,
            message: 'Worker Deleted Successfully.',
        };
    } catch (error) {
        console.error("Error deleting worker:", error);
        return {
            error: {},
            success: false,
            message: 'Failed to Delete the Worker.',
        };
    }
}

