'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import { AddressSchema, CustomerSchema, DeleteSchema } from '../schemas';
import type { Prisma } from '@prisma/client';

export type CustomerState = {
    errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        type?: string[];
        cvrNumber?: string[];
        address?: {
            street?: string;
            postalCode?: string;
            city?: string;
        };
    };
    message?: string | null;
};

export async function createCustomer(prevState: CustomerState, formData: FormData): Promise<CustomerState> {
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
                message: "Database error while creating address.",
            };
        }
    }

    // Gather customer input
    const customerInput = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')?.toString().trim() || '',
        type: formData.get('type'),
        cvrNumber: formData.get('cvr_number') || undefined,
    };

    // Validate customer input
    const customerValidation = CustomerSchema.safeParse(customerInput);

    // Collect all validation errors (if any)
    const errors: CustomerState['errors'] = {};

    if (!addressValidation.success) {
        const addressFieldErrors = addressValidation.error.flatten().fieldErrors;
        errors.address = {
            street: addressFieldErrors.street?.[0],
            postalCode: addressFieldErrors.postalCode?.[0],
            city: addressFieldErrors.city?.[0],
        };
    }

    if (!customerValidation.success) {
        const fieldErrors = customerValidation.error.flatten().fieldErrors;
        errors.name = fieldErrors.name;
        errors.email = fieldErrors.email;
        errors.phone = fieldErrors.phone;
        errors.type = fieldErrors.type;
        errors.cvrNumber = fieldErrors.cvrNumber;
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors,
            message: 'Validation failed. Please fix the errors and try again.',
        };
    }
    
    // Save customer to DB
    if (customerValidation.success) {
        const validatedCustomer = {
            ...customerValidation.data,
            addressId // injected addressId
        };
        try {
            await prisma.customer.create({
                data: validatedCustomer,
            });
        } catch (error) {
            console.error("Customer creation failed:", error);
            return {
                errors: {
                    name: ["Could not save customer to database."],
                },
                message: "Database error while creating customer.",
            };
        }
    }


    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}



export async function updateCustomer(
    id: string,
    prevState: CustomerState,
    formData: FormData
): Promise<CustomerState> {
    const addressInput = {
        street: formData.get("street")?.toString().trim() || "",
        postalCode: formData.get("postalCode")?.toString().trim() || "",
        city: formData.get("city")?.toString().trim() || "",
    };

    const addressValidation = AddressSchema.safeParse(addressInput);

    const customerInput = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone")?.toString().trim() || "",
        type: formData.get("type"),
        cvrNumber: formData.get("cvr_number") || undefined,
        //   addressId: undefined,
    };

    const customerValidation = CustomerSchema.safeParse(customerInput);

    const errors: CustomerState["errors"] = {};

    if (!addressValidation.success) {
        const addressFieldErrors = addressValidation.error.flatten().fieldErrors;
        console.log("addressFieldErrors", addressFieldErrors);
        errors.address = {
            street: addressFieldErrors.street?.[0],
            postalCode: addressFieldErrors.postalCode?.[0],
            city: addressFieldErrors.city?.[0],
        };
    }

    if (!customerValidation.success) {
        const fieldErrors = customerValidation.error.flatten().fieldErrors;
        console.log("fieldErrors", fieldErrors);
        errors.name = fieldErrors.name;
        errors.email = fieldErrors.email;
        errors.phone = fieldErrors.phone;
        errors.type = fieldErrors.type;
        errors.cvrNumber = fieldErrors.cvrNumber;

        //   if (fieldErrors.addressId) {
        //     errors.address = {
        //       ...(errors.address ?? {}),
        //       street: fieldErrors.addressId[0],
        //     };
        //   }
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors,
            message: "Validation failed. Please fix the errors and try again.",
        };
    }

    if (customerValidation.success && addressValidation.success) {
        const validatedCustomer = customerValidation.data;
        const validatedAddress = addressValidation.data;

        try {
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Update customer basic info
                await tx.customer.update({
                    where: { id },
                    data: {
                        name: validatedCustomer.name,
                        email: validatedCustomer.email,
                        phone: validatedCustomer.phone,
                        type: validatedCustomer.type,
                        cvrNumber:
                            validatedCustomer.type === "company"
                                ? validatedCustomer.cvrNumber ?? null
                                : null,
                    },
                });

                // Fetch current customer including address
                const existingCustomer = await tx.customer.findUnique({
                    where: { id },
                    include: { address: true },
                });

                if (existingCustomer?.address) {
                    // Update existing address
                    await tx.address.update({
                        where: { id: existingCustomer.address.id },
                        data: validatedAddress,
                    });
                } else {
                    // Create new address and connect it to the customer
                    const newAddress = await tx.address.create({
                        data: {
                            ...validatedAddress,
                            customer: {
                                connect: { id },
                            },
                        },
                    });

                    // Set the addressId on the customer (if not done via relation)
                    await tx.customer.update({
                        where: { id },
                        data: {
                            addressId: newAddress.id,
                        },
                    });
                }
            });
        } catch (error) {
            console.error("Database error during update:", error);
            return {
                message: "Database error while updating customer.",
            };
        }

        revalidatePath("/dashboard/customers");
        redirect("/dashboard/customers");
    }

    return {
        message: "Unexpected error occurred.",
    };
}




export async function deleteCustomer(id: string) {
    try {
        const validatedFields = DeleteSchema.safeParse({ id });

        if (!validatedFields.success) {
            console.error("Validation failed for deleteCustomer ID:", validatedFields.error.format());
            return {
                error: validatedFields.error.flatten().fieldErrors,
                message: 'Invalid Customer ID format. Failed to Delete Customer.',
                success: false
            };
        }

        const customerId = validatedFields.data.id;

        const existingCustomer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: { id: true }
        });

        if (!existingCustomer) {
            return {
                error: { id: ["Customer not found."] },
                message: 'Customer not found. Failed to Delete Customer.',
                success: false
            };
        }

        await prisma.$transaction(async (tx) => {
            // Soft-delete the Customer
            await tx.customer.update({
                where: { id: customerId },
                data: {
                    isDeleted: true,
                },
            });

            // Soft-delete and update the status of associated Projects
            await tx.project.updateMany({
                where: { customerId: customerId },
                data: {
                    isDeleted: true,
                    status: 'cancelled', // <-- Use the imported enum here
                },
            });

            console.log(`Customer ${customerId} and its projects soft-deleted and marked as cancelled successfully.`);
        });        

        return {
            error: {},
            success: true,
            message: 'Customer and associated projects successfully marked as deleted.',
        };
    } catch (error) {
        console.error("Error soft-deleting customer and projects:", error);
        const errorMessage = 'Failed to Delete the Customer.';
        return {
            error: {},
            success: false,
            message: errorMessage,
        };
    }
    // No need for prisma.$disconnect() here because you're using a singleton pattern
    // where the client is managed globally.
}

export async function reload() {
    revalidatePath("/dashboard/customers");
} 