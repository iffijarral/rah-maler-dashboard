// import { start } from 'repl';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
const allowedFileTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "text/plain", // .txt
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/zip",
    "application/x-rar-compressed",
];

const fileSchema = z
    .instanceof(File)
    .refine((file) => allowedFileTypes.includes(file.type), {
        message: "Invalid file type.",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
        message: "File must be smaller than 10MB.",
    });

const filesSchema = z.array(fileSchema).max(5, "You can upload a maximum of 5 files.");

// ****************** Email Schema ******************
export const EmailFormSchema = z.object({
    receiver: z.string().trim().nonempty("Receiver is required").email("Invalid email address"),
    subject: z.string({ invalid_type_error: 'Please enter a valid subject', })
        .trim()
        .nonempty("Subject is required")
        .regex(/[a-zA-Z]/, "Subject must contain at least one letter"),
    message: z.string({ invalid_type_error: 'Please enter a valid subject', })
        .trim()
        .nonempty("Message is required"),
    files: filesSchema.optional(),

});

export const DeleteSchema = z.object({
    id: z.string().uuid()
});

// ****************** Customer Schema ******************

export const CustomerSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(1, { message: "Phone number is required." }),
    type: z.enum(["private", "company"], { message: "Customer type must be either 'private' or 'company'." }),
    cvrNumber: z.string().optional(),
    // addressId: z.string().min(1, { message: "Address is required." }),
});

export const UpdateCustomerSchema = CustomerSchema.partial().extend({
    id: z.string(),
});

// ****************** Address Schema ******************

export const AddressSchema = z.object({
    street: z.string().min(1, { message: "Street is required." }),
    postalCode: z.string().min(1, { message: "Postal code is required." }),
    city: z.string().min(1, { message: "City is required." }),
});

export const UpdateAddressSchema = AddressSchema.partial().extend({
    id: z.string(),
});

// ****************** Worker Schema ******************

export const WorkerSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z.string().email({ message: "A valid email address is required." }),
    phone: z.string().min(1, { message: "Phone number is required." }),
    position: z.string().min(1, { message: "Position is required." }),
    dailyRate: z
        .number()
        .nonnegative({ message: "Daily rate cannot be negative." })
        .min(1, { message: "Daily rate is required." }),
    startDate: z.string().date(),
    isActive: z.boolean().optional(),
    // addressId: z.string({ required_error: "Address is required." }),
});

export const UpdateWorkerSchema = WorkerSchema.pick({
    name: true,
    email: true,
    phone: true,
    position: true,
    startDate: true,
    isActive: true,
}).partial().extend({
    id: z.string(),
    dailyRate: WorkerSchema.shape.dailyRate, // required again
    startDate: WorkerSchema.shape.startDate, // required again
});

// ****************** Project Schema ******************

export const ProjectSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    customerId: z.string(),
    startDate: z.string({ required_error: "Start date is required." }), // ISO date
    endDate: z.string().optional(),
    status: z.nativeEnum(ProjectStatus, {
        errorMap: (issue) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
                // Custom error message for invalid enum value
                return { message: `Invalid status. Must be one of: ${Object.keys(ProjectStatus).join(', ')}.` };
            }
            // Default error message for other issues (e.g., missing status)
            return { message: "Status is required." };
        },
    }),
    // addressId: z.string({ required_error: "Address is required." }),
});

export const UpdateProjectSchema = ProjectSchema.partial().extend({
    id: z.string(),
});

// ****************** ProjectService Schema ******************

export const ProjectServiceSchema = z.object({
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
  quantity: z.coerce.number().positive({ message: "Quantity must be greater than 0." }),
  amount: z.coerce.number().nonnegative({ message: "Amount must be non-negative." }),
}).refine(
  (data) => data.serviceId || data.serviceName,
  {
    message: "Either service ID or service name is required.",
    path: ["serviceId"], // You could also set this to "serviceName"
  }
);

export const ProjectServicesArraySchema = z.array(ProjectServiceSchema);

export type ParsedProjectService = z.infer<typeof ProjectServiceSchema>;


// ****************** ProjectAssignment Schema ******************

export const ProjectAssignmentSchema = z.object({
    workerId: z.string(),
    projectId: z.string(),
    startDate: z.string(), // ISO date
    endDate: z.string().optional(),
});

export const UpdateProjectAssignmentSchema = ProjectAssignmentSchema.partial().extend({
    id: z.string(),
});

// ****************** WorkEntry Schema ******************

export const WorkEntrySchema = z.object({
    workerId: z.string(),
    projectId: z.string(),
    date: z.string(), // ISO date
    isFullDay: z.boolean().optional(),
    notes: z.string().optional(),
});

export const UpdateWorkEntrySchema = WorkEntrySchema.partial().extend({
    id: z.string(),
});

// ****************** Vacation Schema ******************

export const VacationSchema = z.object({
    workerId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    approved: z.boolean().optional(),
    reason: z.string().optional(),
});

export const UpdateVacationSchema = VacationSchema.partial().extend({
    id: z.string(),
});

// ****************** Payment Schema ******************

export const PaymentSchema = z.object({
    workerId: z.string(),
    amount: z.number().nonnegative(),
    date: z.string(),
    status: z.enum(["paid", "pending", "partial"]),
    notes: z.string().optional(),
});

export const UpdatePaymentSchema = PaymentSchema.partial().extend({
    id: z.string(),
});

// ****************** Invoice Schema ******************

export const InvoiceSchema = z.object({
    projectId: z.string(),
    status: z.enum(["pending", "paid"]),
    services: z.array(z.object({
        serviceId: z.string().optional(),
        serviceName: z.string().optional(),
        quantity: z.number().min(1),
        amount: z.number().min(0),
    })),
});

export const UpdateInvoiceSchema = InvoiceSchema.partial().extend({
    id: z.string(),
});

// ****************** InvoiceService Schema ******************

export const InvoiceServiceSchema = z.object({
    invoiceId: z.string(),
    serviceId: z.string(),
    amount: z.number().nonnegative(),
    quantity: z.number().positive().optional(),
});

export const UpdateInvoiceServiceSchema = InvoiceServiceSchema.partial().extend({
    id: z.string(),
});

// ****************** Service Schema ******************
export const ServiceSchema = z.object({
    name: z.string().min(1),
});

export const UpdateServiceSchema = ServiceSchema.partial().extend({
    id: z.string(),
});
