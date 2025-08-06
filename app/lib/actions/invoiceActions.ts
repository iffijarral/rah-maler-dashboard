'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import { DeleteSchema, InvoiceSchema, UpdateInvoiceSchema } from "../schemas";

export type State = {
    errors?: {
        projectId?: string[];
        status?: string[];
        services?: string[];
    };
    success?: boolean;
    message?: string | null;
};

// ****************** Create Invoice ******************

export async function createInvoice(prevState: State | undefined, formData: FormData) {

    const services = [];

    for (let i = 0; ; i++) {
        const amountRaw = formData.get(`services[${i}][amount]`);
        if (amountRaw === null) break; // stop if no more entries

        services.push({
            serviceId: formData.get(`services[${i}][serviceId]`)?.toString() ?? '',
            serviceName: formData.get(`services[${i}][serviceName]`)?.toString() ?? '',
            quantity: Number(formData.get(`services[${i}][quantity]`) ?? 1),
            amount: Number(amountRaw),
        });
    }

    const validatedFields = InvoiceSchema.safeParse({
        projectId: formData.get('projectId'),
        status: formData.get('status'),
        services,
    });

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
            message: 'Missing or invalid fields.',
        };
    }

    const { projectId, status, services: validServices } = validatedFields.data;
    const date = new Date();

    let totalAmount = 0;
    for (const s of validServices) {
        // Assuming s.amount is the unit price and s.quantity is the quantity
        // And totalAmount in DB is stored as an integer (e.g., cents)
        totalAmount += Math.round(s.amount * s.quantity * 100); // Calculate total for this service, then convert to cents
    }

    try {
            await prisma.$transaction(async (tx) => { // Use transaction for atomicity

            const newInvoice = await tx.invoice.create({
                data: {
                    projectId,
                    status,
                    date,
                    totalAmount, // <--- ADDED totalAmount HERE
                },
            });

            for (const s of validServices) {
                let finalServiceId = s.serviceId;

                // If no existing serviceId, create the new service
                if (!finalServiceId && s.serviceName) {
                    const newService = await tx.service.create({ // Use tx for transaction
                        data: { name: s.serviceName },
                    });
                    finalServiceId = newService.id;
                }

                if (!finalServiceId) {
                    throw new Error('Missing serviceId for invoice item. Service name was also not provided.');
                }

                await tx.invoiceService.create({ // Use tx for transaction
                    data: {
                        invoiceId: newInvoice.id,
                        serviceId: finalServiceId,
                        quantity: s.quantity,
                        amount: Math.round(s.amount * 100), // Ensure InvoiceService amount is also in cents
                    },
                });
            }
            return newInvoice; // Return the created invoice
        });

        // revalidatePath('/dashboard/invoices'); // Revalidate after successful creation
        // redirect('/dashboard/invoices'); // Redirect after successful creation

        return { // This return will likely not be reached due to redirect
            message: 'Invoice created successfully!',
            success: true,
            errors: {},
        };
    } catch (err) {
        console.error(err);
        return {
            message: 'Database error. Failed to create invoice.',
            success: false, // Indicate failure
            errors: {},
        };
    }
}

// ****************** Update Invoice ******************

export async function updateInvoice(id: string, prevState: State | undefined, formData: FormData) {

    // prevState = prevState ?? { errors: {}, message: null };
    const services = [];

    for (let i = 0; ; i++) {
        const amountRaw = formData.get(`services[${i}][amount]`);
        if (amountRaw === null) break; // stop if no more entries

        services.push({
            serviceId: formData.get(`services[${i}][serviceId]`)?.toString() ?? '',
            serviceName: formData.get(`services[${i}][serviceName]`)?.toString() ?? '',
            quantity: Number(formData.get(`services[${i}][quantity]`) ?? 1),
            amount: Number(amountRaw),
        });
    }

    const validatedFields = UpdateInvoiceSchema.safeParse({
        id,
        projectId: formData.get('projectId'),
        status: formData.get('status'),
        services,
    });

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
            message: 'Missing or invalid fields. Failed to update invoice.',
        };
    }

    const { projectId, status, services: validServices } = validatedFields.data as {
        projectId: string;
        status: 'pending' | 'paid';
        services: {
            amount: number;
            quantity: number;
            serviceId?: string;
            serviceName?: string;
        }[];
    };

    let totalAmount = 0;
    for (const s of validServices) {
        // Assuming s.amount is the unit price and s.quantity is the quantity
        // And totalAmount in DB is stored as an integer (e.g., cents)
        totalAmount += Math.round(s.amount * s.quantity * 100); // Calculate total for this service, then convert to cents
    }    

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update main invoice info, including totalAmount
            await tx.invoice.update({
                where: { id },
                data: {
                    projectId,
                    status,
                    totalAmount, 
                },
            });

            // 2. Remove all existing service entries for this invoice
            await tx.invoiceService.deleteMany({
                where: { invoiceId: id },
            });

            // 3. Re-add updated services
            for (const s of validServices) {
                let finalServiceId = s.serviceId;

                // If no serviceId, create new service
                if (!finalServiceId && s.serviceName) {
                    const newService = await tx.service.create({ // Use tx for transaction
                        data: { name: s.serviceName },
                    });
                    finalServiceId = newService.id;
                }

                if (!finalServiceId) {
                    throw new Error('Missing serviceId for updated invoice item. Service name was also not provided.');
                }

                await tx.invoiceService.create({ // Use tx for transaction
                    data: {
                        invoiceId: id,
                        serviceId: finalServiceId,
                        quantity: s.quantity,
                        amount: Math.round(s.amount * 100), // Ensure InvoiceService amount is also in cents
                    },
                });
            }
        }); // End of transaction

        // revalidatePath('/dashboard/invoices');
        // redirect('/dashboard/invoices'); // Redirect after successful update

        return { // This return will likely not be reached due to redirect
            message: 'Invoice updated successfully!',
            success: true,
            errors: {},
        };

    } catch (error) {
        console.error('Database Error (updateInvoice):', error);
        return {
            errors: {},
            success: false,
            message: 'Database error. Failed to update invoice.',
        };
    }
    // redirect('/dashboard/invoices');
}

// ****************** Delete Invoice ******************

export async function deleteInvoice(id: string) {
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
        const myInvoice = await prisma.invoice.findUnique({ where: { id } });

        if (!myInvoice) {
            throw new Error("invoice not found.");
        }

        await prisma.invoice.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        return {
            error: {},
            success: true,
            message: 'Invoice Deleted Successfully.',
        };
        // revalidatePath('/dashboard/invoices');
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return {
            error: {},
            success: false,
            message: 'Failed to Delete the Invoice.',
        };
    }
}

export async function reloadInvoices() {
    revalidatePath("/dashboard/invoices");
}