'use server';

// import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';
// import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
// import { AuthError } from 'next-auth';
// import { Resend } from 'resend';
// import { InvoiceFormSchema, EmailFormSchema, CreateCustomerSchema, EditCustomerSchema, DeleteSchema, WorkerSchema } from '@/app/lib/schemas';
// import WelcomeEmail from '@/app/dashboard/emails/templates/WelcomeEmail';
// import { Address, EmailParams, Invoice, InvoiceService } from '../definitions';
// import DOMPurify from 'dompurify';
// import { JSDOM } from 'jsdom';
// import { prisma } from '../prisma';
// import { errorToJSON } from 'next/dist/server/render';
// import { FakturaEmail } from '@/app/dashboard/emails/templates/FakturaEmail';
// import Faktura from '../generate-pdf';


// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// // ****************** Invoice Actions ******************

// const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

// export type State = {
//     errors?: {
//         customerId?: string[];
//         status?: string[];
//         services?: string[];
//     };
//     success?: boolean;
//     message?: string | null;
// };

// export async function createInvoice(prevState: State | undefined, formData: FormData) {

//     const services = [];

//     for (let i = 0; ; i++) {
//         const amountRaw = formData.get(`services[${i}][amount]`);
//         if (amountRaw === null) break; // stop if no more entries

//         services.push({
//             serviceId: formData.get(`services[${i}][serviceId]`)?.toString() ?? '',
//             serviceName: formData.get(`services[${i}][serviceName]`)?.toString() ?? '',
//             quantity: Number(formData.get(`services[${i}][quantity]`) ?? 1),
//             amount: Number(amountRaw),
//         });
//     }

//     const validatedFields = CreateInvoice.safeParse({
//         customerId: formData.get('customerId'),
//         status: formData.get('status'),
//         services,
//     });

//     if (!validatedFields.success) {
//         console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
//         return {
//             errors: validatedFields.error.flatten().fieldErrors,
//             success: false,
//             message: 'Missing or invalid fields.',
//         };
//     }

//     const { customerId, status, services: validServices } = validatedFields.data;
//     const date = new Date().toISOString();

//     try {
//         const invoice = await prisma.invoice.create({
//             data: {
//                 customerId,
//                 status,
//                 date,
//             },
//         });

//         for (const s of validServices) {
//             let finalServiceId = s.serviceId;

//             // If no existing serviceId, create the new service
//             if (!finalServiceId && s.serviceName) {
//                 const newService = await prisma.service.create({
//                     data: { name: s.serviceName },
//                 });
//                 finalServiceId = newService.id;
//             }

//             if (!finalServiceId) {
//                 throw new Error('Missing serviceId for invoice item.');
//             }

//             await prisma.invoiceService.create({
//                 data: {
//                     invoiceId: invoice.id,
//                     serviceId: finalServiceId,
//                     quantity: s.quantity,
//                     amount: Math.round(s.amount * 100),
//                 },
//             });
//         }

//         revalidatePath('/dashboard/invoices');
//         // redirect('/dashboard/invoices');
//         return {
//             message: 'Invoice created successfully!',
//             success: true,
//             errors: {},
//         };
//     } catch (err) {
//         console.error(err);
//         return {
//             message: 'Database error. Failed to create invoice.',
//         };
//     }
// }



// // Use Zod to update the expected types
// const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

// // ...

// export async function updateInvoice(id: string, prevState: State | undefined, formData: FormData) {

//     // prevState = prevState ?? { errors: {}, message: null };
//     const services = [];

//     for (let i = 0; ; i++) {
//         const amountRaw = formData.get(`services[${i}][amount]`);
//         if (amountRaw === null) break; // stop if no more entries

//         services.push({
//             serviceId: formData.get(`services[${i}][serviceId]`)?.toString() ?? '',
//             serviceName: formData.get(`services[${i}][serviceName]`)?.toString() ?? '',
//             quantity: Number(formData.get(`services[${i}][quantity]`) ?? 1),
//             amount: Number(amountRaw),
//         });
//     }

//     const validatedFields = UpdateInvoice.safeParse({
//         customerId: formData.get('customerId'),
//         status: formData.get('status'),
//         services,
//     });

//     if (!validatedFields.success) {
//         return {
//             errors: validatedFields.error.flatten().fieldErrors,
//             success: false,
//             message: 'Missing or invalid fields. Failed to update invoice.',
//         };
//     }

//     const { customerId, status, services: validServices } = validatedFields.data;

//     try {
//         // 1. Update main invoice info
//         await prisma.invoice.update({
//             where: { id },
//             data: {
//                 customerId,
//                 status,
//             },
//         });
//         console.log('main invoice info updated');
//         // 2. Remove all existing service entries for this invoice
//         await prisma.invoiceService.deleteMany({
//             where: { invoiceId: id },
//         });

//         // 3. Re-add updated services
//         for (const s of validServices) {
//             let finalServiceId = s.serviceId;

//             // If no serviceId, create new service
//             if (!finalServiceId && s.serviceName) {
//                 const newService = await prisma.service.create({
//                     data: { name: s.serviceName },
//                 });
//                 finalServiceId = newService.id;
//             }

//             if (!finalServiceId) {
//                 throw new Error('Missing serviceId for updated invoice item.');
//             }

//             await prisma.invoiceService.create({
//                 data: {
//                     invoiceId: id,
//                     serviceId: finalServiceId,
//                     quantity: s.quantity,
//                     amount: Math.round(s.amount * 100),
//                 },
//             });
//         }

//         // revalidatePath('/dashboard/invoices');

//         return {
//             message: 'Invoice updated successfully!',
//             success: true,
//             errors: {},
//         };

//     } catch (error) {
//         console.error('Database Error (updateInvoice):', error);
//         return {
//             errors: {},
//             success: false,
//             message: 'Database error. Failed to update invoice.',
//         };
//     }
//     // redirect('/dashboard/invoices');
// }




export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// // ****************** Email Actions ******************

// // Send Invoice email using the Resend library
// export async function sendInvoice(invoice: Invoice) {

//     const resend = new Resend(process.env.RESEND_API_KEY);
//     const pdfBytes = await Faktura(invoice);
//     const base64Pdf = Buffer.from(pdfBytes).toString('base64');

//     try {
//         const { data, error } = await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: 'iffidk@gmail.com',
//             // to: invoice.customer.email,
//             subject: `Faktura fra RAH Maler`,
//             react: FakturaEmail({ name: invoice.customer.name }),
//             attachments: [
//                 {
//                     filename: `faktura-${invoice.id}.pdf`,
//                     content: base64Pdf, // must be base64
//                 },
//             ],
//         });

//         if (error) {
//             console.error('Email Error:', error);
//             return {
//                 errors: {
//                     message: ['Failed to send email.'],
//                 },
//                 success: false,
//             };
//         }

//     } catch (error) {
//         console.error('Email Error:', error);
//         return {
//             errors: {
//                 message: ['Failed to send email.'],
//             },
//             success: false,
//         };
//     }

//     return {
//         errors: {},
//         success: true,
//     };
// }

// // Send an email using the Resend library
// export async function sendWelcomeEmail(prevState: EmailParams, formData: FormData) {
//     const window = new JSDOM('').window;
//     const purify = DOMPurify(window);

//     // Sanitize form data
//     const sanitizedReceiver = purify.sanitize(formData.get('receiver') as string);
//     const sanitizedSubject = purify.sanitize(formData.get('subject') as string);
//     const sanitizedMessage = purify.sanitize(formData.get('message') as string);

//     // Convert files to base64 before sending as attachment
//     const files = formData.getAll('files') as File[];
//     const attachments = await Promise.all(files.map(async (file) => ({
//         filename: file.name,
//         content: Buffer.from(await file.arrayBuffer()).toString('base64'),
//     })));

//     // Validate form using Zod
//     const validatedFields = EmailFormSchema.safeParse({
//         receiver: sanitizedReceiver,
//         subject: sanitizedSubject,
//         message: sanitizedMessage,
//     });

//     // If form validation fails, return errors early. Otherwise, continue.
//     if (!validatedFields.success) {
//         return {
//             errors: validatedFields.error.flatten().fieldErrors,
//             receiver: prevState.receiver,
//             subject: prevState.subject,
//             message: prevState.message,
//             files: prevState.files,
//             success: prevState.success,
//         };
//     }

//     const { receiver, subject, message } = validatedFields.data;

//     const resend = new Resend(process.env.RESEND_API_KEY);

//     try {
//         const { data, error } = await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: receiver,
//             subject: subject,
//             react: WelcomeEmail(message),
//             attachments
//         });

//         if (error) {
//             console.error('Email Error:', error);
//             return {
//                 errors: {
//                     message: ['Failed to send email.'],
//                 },
//                 receiver,
//                 subject,
//                 message,
//                 files: prevState.files,
//                 success: false,
//             };
//         }
//         console.log('Email Sent:', data);
//     } catch (error) {
//         console.error('Email Error:', error);
//         return {
//             errors: {
//                 message: ['Failed to send email.'],
//             },
//             receiver,
//             subject,
//             message,
//             files: prevState.files,
//             success: false,
//         };
//     }

//     return {
//         errors: {},
//         receiver,
//         subject,
//         message,
//         files: prevState.files,
//         success: true,
//     };
// }

// // Fetch inbox emails using the Resend library
// export async function fetchInboxEmails() {
//     // const resend = new Resend(process.env.RESEND_API_KEY);

//     try {
//         const res = await fetch("https://api.resend.com/emails", {
//             headers: {
//                 Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//             },
//         });

//         if (!res.ok) throw new Error("Failed to fetch emails");

//         const data = await res.json();

//         const latestEmails = data.slice(0, 20);

//         return latestEmails;
//     } catch (error) {
//         console.log('Email Error:', error);
//         return [];
//     }
// }


// // ****************** Customers Actions ******************

// // Customer State
// export type CustomerState = {
//     errors?: {
//         name?: string[];
//         email?: string[];
//         type?: string[];
//         cvr_number?: string[];
//         addresses?: {
//             street?: string;  // Change this to a string instead of string[]
//             postalCode?: string;  // Same here
//             city?: string;  // Same here
//             isPrimary?: string;  // Same here
//         }[];  // Keep this as an array of objects
//     };
//     message?: string | null;
// };


// export async function createCustomer(prevState: CustomerState, formData: FormData) {


//     // Extract addresses
//     const formAddresses: Address[] = [];
//     let index = 0;
//     while (formData.has(`street_${index}`)) {
//         const street = formData.get(`street_${index}`)?.toString().trim() || '';
//         const postalCode = formData.get(`postalCode_${index}`)?.toString().trim() || '';
//         const city = formData.get(`city_${index}`)?.toString().trim() || '';
//         const isPrimary = formData.get(`isPrimary_${index}`) === 'true';

//         // Only push if at least one field is non-empty
//         if (street || postalCode || city) {
//             formAddresses.push({
//                 street,
//                 postalCode,
//                 city,
//                 isPrimary,
//             });
//         }

//         index++;
//     }
//     console.log("Form Addresses:", formAddresses);
//     // Validate form using Zod
//     const validatedFields = CreateCustomerSchema.safeParse({
//         name: formData.get('name'),
//         email: formData.get('email'),
//         type: formData.get('type'),
//         cvr_number: formData.get("cvr_number") || "",
//         addresses: formAddresses
//     });

//     // If form validation fails, return errors early. Otherwise, continue.
//     if (!validatedFields.success) {
//         const fieldErrors = validatedFields.error.flatten().fieldErrors;
//         console.error("Validation failed", fieldErrors);
//         return {
//             errors: {
//                 name: fieldErrors.name,
//                 email: fieldErrors.email,
//                 type: fieldErrors.type,
//                 cvr_number: fieldErrors.cvr_number,
//                 addresses: fieldErrors.addresses?.map((addrErrors) => ({
//                     street: addrErrors?.[0] ?? "",
//                     postalCode: addrErrors?.[1] ?? "",
//                     city: addrErrors?.[2] ?? "",
//                     isPrimary: addrErrors?.[3] ?? "",
//                 })) || [],
//             },
//             message: 'Missing Fields. Failed to Create Customer.',
//         };
//     }


//     // Prepare data for insertion into the database
//     const { name, email, type, addresses } = validatedFields.data;
//     const cvr_number = "cvr_number" in validatedFields.data ? validatedFields.data.cvr_number ?? null : null;

//     // Insert data into the database
//     try {
//         await prisma.$transaction(async (tx) => {
//             // Insert Customer
//             const customer = await tx.customer.create({
//                 data: {
//                     name,
//                     email,
//                     type,
//                     cvrNumber: cvr_number, // Prisma uses camelCase, maps to DB field
//                 },
//             });

//             // Insert Addresses
//             for (const addr of addresses) {
//                 await tx.address.create({
//                     data: {
//                         customerId: customer.id,
//                         street: addr.street,
//                         postalCode: addr.postalCode,
//                         city: addr.city,
//                         isPrimary: addr.isPrimary, // again, Prisma uses camelCase
//                     },
//                 });
//             }
//         });

//     } catch (error) {
//         console.error('Database Error:', error);
//         return {
//             message: 'Database Error: Failed to Create Customer.',
//         };
//     }

//     // Revalidate the cache for the customers page and redirect the user.
//     revalidatePath('/dashboard/customers');
//     redirect('/dashboard/customers');
// }

// export async function updateCustomer(
//     id: string,
//     prevState: CustomerState,
//     formData: FormData
// ) {
//     const addresses: {
//         id?: string;
//         street: string;
//         postalCode: string;
//         city: string;
//         isPrimary: boolean;
//     }[] = [];

//     for (const [key, value] of formData.entries()) {
//         const match = key.match(/^addresses\[(\d+)\]\[(.+)\]$/);
//         if (match) {
//             const index = parseInt(match[1], 10);
//             const field = match[2] as keyof typeof addresses[0];

//             if (!addresses[index]) {
//                 addresses[index] = { street: "", postalCode: "", city: "", isPrimary: false };
//             }

//             if (field === "isPrimary") {
//                 addresses[index][field] = value === "true";
//             } else {
//                 addresses[index][field] = value as any;
//             }
//         }
//     }

//     const validatedFields = EditCustomerSchema.safeParse({
//         id,
//         name: formData.get("name"),
//         email: formData.get("email"),
//         type: formData.get("type"),
//         cvr_number: formData.get("cvr_number") || undefined,
//         addresses,
//     });

//     if (!validatedFields.success) {
//         const fieldErrors = validatedFields.error.flatten().fieldErrors;
//         return {
//             errors: {
//                 name: fieldErrors.name,
//                 email: fieldErrors.email,
//                 type: fieldErrors.type,
//                 cvr_number: fieldErrors.cvr_number,
//                 addresses: fieldErrors.addresses?.map((addrErrors) => ({
//                     street: addrErrors?.[0] ?? "",
//                     postalCode: addrErrors?.[1] ?? "",
//                     city: addrErrors?.[2] ?? "",
//                     isPrimary: addrErrors?.[3] ?? "",
//                 })) || [],
//             },
//             message: 'Missing Fields. Failed to Update Customer.',
//         };
//     }

//     const { name, email, type, addresses: validAddresses } = validatedFields.data;
//     const cvr_number = type === "company" ? validatedFields.data.cvr_number ?? null : null;

//     try {
//         await prisma.$transaction(async (tx) => {
//             // Update Customer
//             await tx.customer.update({
//                 where: { id },
//                 data: { name, email, type, cvrNumber: cvr_number },
//             });

//             // Get current address IDs from DB
//             const existingAddresses = await tx.address.findMany({
//                 where: { customerId: id },
//             });

//             const incomingIds = validAddresses.map((a) => a.id).filter(Boolean);
//             const existingIds = existingAddresses.map((a) => a.id);

//             // DELETE addresses that are no longer in the form
//             const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
//             if (toDelete.length > 0) {
//                 await tx.address.deleteMany({
//                     where: {
//                         id: { in: toDelete },
//                     },
//                 });
//             }

//             // UPSERT each address
//             for (const addr of validAddresses) {
//                 if (addr.id) {
//                     // Update existing
//                     await tx.address.update({
//                         where: { id: addr.id },
//                         data: {
//                             street: addr.street,
//                             postalCode: addr.postalCode,
//                             city: addr.city,
//                             isPrimary: addr.isPrimary,
//                         },
//                     });
//                 } else {
//                     // Create new
//                     await tx.address.create({
//                         data: {
//                             customerId: id,
//                             street: addr.street,
//                             postalCode: addr.postalCode,
//                             city: addr.city,
//                             isPrimary: addr.isPrimary,
//                         },
//                     });
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Database Error:", error);
//         return {
//             message: "Database Error: Failed to update customer.",
//         };
//     }

//     revalidatePath("/dashboard/customers");
//     redirect("/dashboard/customers");
// }

// export async function deleteCustomer(id: string) {

//     try {
//         // Validate if ID is a valid UUID (assuming your DB uses UUIDs for customer IDs)
//         const validatedFields = DeleteSchema.safeParse({
//             id
//         });

//         if (!validatedFields.success) {
//             console.error("Validation failed", validatedFields.error.format());
//             return {
//                 error: validatedFields.error.flatten().fieldErrors,
//                 message: 'Missing Fields. Failed to Delete Customer.',
//                 success: false
//             };
//         }

//         const customer = await prisma.customer.findUnique({ where: { id } });

//         if (!customer) {
//             throw new Error("Customer not found.");
//         }

//         const result = await prisma.customer.update({
//             where: { id },
//             data: {
//                 isDeleted: true,
//             },
//             select: {
//                 id: true,
//             },
//         });

//         return {
//             error: {},
//             success: true,
//             message: 'Customer Deleted Successfully.',
//         };
//     } catch (error) {
//         console.error("Error deleting customer:", error);
//         return {
//             error: {},
//             success: false,
//             message: 'Failed to Delete the Customer.',
//         };
//     }
// }


// // ****************** Worker Actions ******************

// // Worker State
// export type WorkerState = {
//     errors?: {
//         name?: string[];
//         email?: string[];
//         position?: string[];
//         hourlyRate?: string[];
//         startDate?: string[];
//         isActive?: string[];
//     };
//     message?: string | null;
// };

// // Create Worker
// export async function createWorker(prevState: WorkerState, formData: FormData) {
    
//     const dateString = formData.get('startDate')?.toString() || new Date().toISOString();
//     const dateObject = new Date(dateString);
//     const validatedFields = WorkerSchema.safeParse({
//         name: formData.get('name'),
//         email: formData.get('email'),
//         position: formData.get('position'),
//         hourlyRate: Number(formData.get('hourlyRate')),
//         startDate: dateObject,
//         isActive: formData.get('isActive') !== null,
//     });

//     if (!validatedFields.success) {
//         const fieldErrors = validatedFields.error.flatten().fieldErrors;        
//         console.error("Validation failed", fieldErrors);
//         return {
//             errors: {
//                 name: fieldErrors.name,
//                 email: fieldErrors.email,
//                 position: fieldErrors.position,
//                 hourlyRate: fieldErrors.hourlyRate,
//                 startDate: fieldErrors.startDate,
//                 isActive: fieldErrors.isActive,
//             },
//             message: 'Missing Fields. Failed to Create Worker.',
//         };
//     }
//     const { name, email, position, hourlyRate, startDate, isActive } = validatedFields.data;
//     try {
//         await prisma.worker.create({
//             data: {
//                 name,
//                 email,
//                 position,
//                 hourlyRate: Math.round(hourlyRate * 100),
//                 startDate,
//                 isActive,
//             },
//         });     
//         revalidatePath('/dashboard/workers');   
//         return {
//             message: 'Worker created successfully!',
//             success: true,
//             errors: {},
//         };
//     } catch (error) {
//         console.error('Database Error:', error);
//         return {
//             message: 'Database Error: Failed to Create Worker.',
//             success: false,
//             errors: {
//                 name: ['Database error'],
//                 email: ['Database error'],
//                 position: ['Database error'],
//                 hourlyRate: ['Database error'],
//                 startDate: ['Database error'],
//                 isActive: ['Database error'],
//             },
//         };
//     }            
// }

// // Update Worker
// export async function updateWorker(id: string, prevState: WorkerState, formData: FormData) {
//     const dateString = formData.get('startDate')?.toString() || new Date().toISOString();
//     const dateObject = new Date(dateString);
//     const validatedFields = WorkerSchema.safeParse({
//         id,
//         name: formData.get('name'),
//         email: formData.get('email'),
//         position: formData.get('position'),
//         hourlyRate: Number(formData.get('hourlyRate')),
//         startDate: dateObject,
//         isActive: formData.get('isActive') !== null,
//     });
//     if (!validatedFields.success) {
//         const fieldErrors = validatedFields.error.flatten().fieldErrors;
//         console.error("Validation failed", fieldErrors);
//         return {
//             errors: {
//                 name: fieldErrors.name,
//                 email: fieldErrors.email,
//                 position: fieldErrors.position,
//                 hourlyRate: fieldErrors.hourlyRate,
//                 startDate: fieldErrors.startDate,
//                 isActive: fieldErrors.isActive,
//             },
//             message: 'Missing Fields. Failed to Update Worker.',
//         };
//     }
//     const { name, email, position, hourlyRate, startDate, isActive } = validatedFields.data;
//     try {
//         await prisma.worker.update({
//             where: { id },
//             data: {
//                 name,
//                 email,
//                 position,
//                 hourlyRate: Math.round(hourlyRate * 100),
//                 startDate,
//                 isActive,
//             },
//         });
//         revalidatePath('/dashboard/workers');
//         return {
//             message: 'Worker updated successfully!',
//             success: true,
//             errors: {},
//         };
//     } catch (error) {
//         console.error('Database Error:', error);
//         return {
//             message: 'Database Error: Failed to Update Worker.',
//             success: false,
//             errors: {
//                 name: ['Database error'],
//                 email: ['Database error'],
//                 position: ['Database error'],
//                 hourlyRate: ['Database error'],
//                 startDate: ['Database error'],
//                 isActive: ['Database error'],
//             },
//         };
//     }
// }
// // Delete Worker
// export async function deleteWorker(id: string) {
//     try {
//         // Validate if ID is a valid UUID (assuming your DB uses UUIDs for customer IDs)
//         const validatedFields = DeleteSchema.safeParse({
//             id
//         });

//         if (!validatedFields.success) {
//             console.error("Validation failed", validatedFields.error.format());
//             return {
//                 error: validatedFields.error.flatten().fieldErrors,
//                 message: 'Missing Fields. Failed to Delete Worker.',
//                 success: false
//             };
//         }

//         const worker = await prisma.worker.findUnique({ where: { id } });

//         if (!worker) {
//             throw new Error("Worker not found.");
//         }

//         const result = await prisma.worker.update({
//             where: { id },
//             data: {
//                 isDeleted: true,
//             },
//             select: {
//                 id: true,
//             },
//         });
//         revalidatePath('/dashboard/workers');
//         return {
//             error: {},
//             success: true,
//             message: 'Worker Deleted Successfully.',
//         };
//     } catch (error) {
//         console.error("Error deleting worker:", error);
//         return {
//             error: {},
//             success: false,
//             message: 'Failed to Delete the Worker.',
//         };
//     }
// }

// // ****************** Common Actions ******************


// export async function reloadInvoices() {
//     revalidatePath("/dashboard/invoices");
// }