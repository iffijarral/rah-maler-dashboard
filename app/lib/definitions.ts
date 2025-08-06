export type User = {
  id?: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  type: 'private' | 'company';
  cvr_number?: string | null;
  addresses: Address[];
  is_deleted: boolean;
};

export type Address = {
  id?: string | number;
  street: string;
  postalCode: string;
  city: string;
  isPrimary?: boolean;
}

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  email: string;
};

export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

// Invoice type now only contains references to InvoiceService
export type Invoice = {
  id: string;
  customerId?: string;
  status: 'pending' | 'paid';
  date: Date;
  isDeleted: boolean;
  services: InvoiceService[];  // Relation to InvoiceService model
  customer: {            // Include customer information in Invoice type
    name: string;
    email: string;
    addresses: Address[]; // Array of customer addresses
  };
};

export type InvoiceService = {
  id: string;
  invoiceId: string;
  serviceId: string;
  amount: number;  // Amount is now part of InvoiceService
  quantity: number; // Quantity of the service
  service: Service;  // The service related to this InvoiceService
};

export type Service = {
  id: string;
  name: string;
  services?: InvoiceService[];  // This relationship is not necessary to include in the type, but it reflects the relationship in the schema
};

// Updated CustomersTableType to reflect the correct service data
export type CustomersTableType = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  total_invoices?: number;
  total_pending?: number;
  total_paid?: number;
  invoices?: Invoice[];  // Referring to the Invoice model
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  is_deleted: boolean;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
  addresses: Address[];
};

// For the Invoice Form (use InvoiceService to track amount)
export type InvoiceForm = {
  id?: string;
  customerId?: string;
  status: 'pending' | 'paid';
  services: {
    id: string;        // Unique ID for this service item (use uuid or similar)
    invoiceId: string; // ID of the invoice this service belongs to
    serviceId: string; // ID of the service (it refers to the Service model)
    amount: number;    // The cost of the service
    quantity: number;  // Quantity of the service
    service: Service;  // The actual Service object associated with this InvoiceService
  }[]; // Contains services linked to the invoice
};

// Faktura Email type
export type FakturaEmail = {
  customer: {
    name: string;
    email: string;
    addresses: Address[];
  };
  services: InvoiceService[];
  invoiceId: string; // ID of the invoice
}

// Existing CustomerField remains mostly the same
export type CustomerField = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvr_number?: string | null;
  type: 'private' | 'company';  
  isDeleted: boolean;
  addresses: Address[];
};

export type EmailParams = {
  errors?: {
    receiver?: string[];
    subject?: string[];
    message?: string[];
    files?: string[];
  };
  receiver?: string | null;
  subject?: string | null;
  message?: string | null;
  files?: FileList | null;
  success?: boolean;
};

// Worker Type
export type Worker = {
  id: string;
  name: string;
  email: string;
  phone: string;  // Optional phone number
  position: string;
  hourlyRate: number;  // In smallest currency unit (øre/cent)
  startDate: Date;
  isActive: boolean;
  workLogs: WorkLog[];  // Array of WorkLog objects
  vacations: Vacation[];  // Array of Vacation objects
  payments: Payment[];  // Array of Payment objects
};
export type WorkerListItem = {
  id: string;
  name: string;
  email: string;
  startDate: Date;
  position: string;
  hourlyRate: number;
  isActive: boolean;
};
// WorkLog Type
export type WorkLog = {
  id: string;
  workerId: string;  // ID of the worker this work log belongs to
  date: Date;  // Date of the work performed
  hours: number;  // Number of hours worked
  notes?: string;  // Optional notes for the work log
  worker: Worker;  // The worker associated with the work log (if you want to include this)
};

// Vacation Type


// Payment Type
export type Payment = {
  id: string;
  workerId: string;  // ID of the worker receiving payment
  amount: number;  // Payment amount (calculated from hourly rate * hours worked)
  date: Date;  // Date the payment was made
  status: 'paid' | 'pending' | 'partial';  // Payment status
  notes?: string;  // Optional notes regarding the payment
  worker: Worker;  // The worker associated with the payment (if you want to include this)
};



/******************** Customer Related Types ********************/
// For Creating a Customer
export type CreateCustomerInput = {
  name: string;
  email: string;
  phone: string;
  type: 'private' | 'company';
  cvrNumber?: string | null;
  address: CreateAddressInput | null; // Address is optional for creation
};

// For Updating a Customer
export type UpdateCustomerInput = Partial<CreateCustomerInput> & {
  id: string;
};

// For Table View
export type CustomerTableRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'private' | 'company';
  cvrNumber?: string | null;
  address: AddressTableRow; // nested type
  createdAt: string;
  updatedAt: string;
};

export type CustomerTableRowShort = {
  id?: string;
  name: string;
  email: string;
  phone: string;
}
/******************** Project Related Types ********************/

export type ProjectWithExtras = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  plannedPrice: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  address: {
    id?: string;
    street: string;
    postalCode: string;
    city: string;
  };
  workers: { id: string; name: string }[];
  services: {
    id: string;
    name: string;    
    unitPrice: number;
    quantity: number;
  }[];
};
export type CreateProjectInput = {
  name: string;
  customer: CustomerTableRowShort;
  startDate: string;
  endDate?: string;
  status: string;
  address: CreateAddressInput;
};

export type UpdateProjectInput = Partial<CreateProjectInput> & {
  id: string;
  workers: WorkerShort[];
};

export type ProjectTableRow = {
  id: string;
  name: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  customer: CustomerTableRowShort;
  totalInvoices?: number;
  totalPending?: string;
  totalPaid?: string;
  plannedPrice?: string; // Optional, can be null if not set
};
export type ProjectShort = {
  id: string;
  name: string;
};
export type ProjectShortGrid = {
  id: string;
  name: string;
  startDate: Date; // Add startDate
  endDate: Date | null; // Add finishDate, make it nullable
};

export type ProjectService = {
  id: string;
  name: string;
  quantity?: number;
  unitPrice?: number;
  projectId: string;
};

/******************** Worker Related Types ********************/

export type CreateWorkerInput = {
  name: string;
  email: string;
  phone: string; // Optional phone number
  position: string;
  dailyRate: number;
  startDate: string; // ISO format
  isActive: boolean;
  address: CreateAddressInput;
};

export type UpdateWorkerInput = Partial<CreateWorkerInput> & {
  id: string;
  dailyRate: number;
};

export type WorkerTableRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  dailyRate: number;
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkerShort = {
  id: string;
  name: string;
};

export type FullWorkEntry = {
  id: string;
  workerId: string;
  projectId: string;
  date: string; // enriched, parsed from DB
  isFullDay: boolean;
  notes: string | null;
  project: {
    id: string;
    name: string;
  };
};

/******************** Address Types ********************/

export type CreateAddressInput = {
  street: string;
  postalCode: string;
  city: string;
};

export type UpdateAddressInput = Partial<CreateAddressInput> & {
  id: string;
};

export type AddressTableRow = {
  id: string;
  street: string;
  postalCode: string;
  city: string;
};

/******************** Invoice Types ********************/

export type CreateInvoiceInput = {
  projectId: string;
  date: string; // ISO format
  status: 'pending' | 'paid';
};

export type UpdateInvoiceInput = Partial<CreateInvoiceInput> & {
  id: string;
  services: {
    id: string;        // Unique ID for this service item (use uuid or similar)    
    amount: number;    // The cost of the service
    quantity: number;  // Quantity of the service
    service: ServiceTableRow;  // The actual Service object associated with this InvoiceService
  }[]; // Contains services linked to the invoice
}; // Array of services to be included in the invoice

export type InvoiceSummaryRow = {
  id: string;
  status: 'pending' | 'paid';
  isDeleted: boolean;
  // services: {
  //   amount: number;
  //   quantity: number;
  // }[];
  totalAmount: number; // Total amount for the invoice
};

export type InvoiceTableRow = {
  id: string;
  project: {
    id: string;
    name: string;
    customer: {
      id: string;
      name: string;
      email: string;
      address: Address | null; // Address can be null if not provided
    };
  };
  date: string;
  status: 'pending' | 'paid';
  isDeleted: boolean;
  totalAmount: number;
  services: InvoiceServiceTableRow[];
};

/******************** Invoice Service Types ********************/

export type CreateInvoiceServiceInput = {
  invoiceId: string;
  serviceId: string;
  amount: number;
  quantity?: number; // optional because default is 1
};

export type UpdateInvoiceServiceInput = Partial<CreateInvoiceServiceInput> & {
  id: string;
};

export type InvoiceServiceTableRow = {
  id: string;
  serviceId: string;
  invoiceId: string;
  service: ServiceTableRow;
  amount: number;
  quantity: number;
};

/******************** Service Types ********************/
export type CreateServiceInput = {
  name: string;
};

export type UpdateServiceInput = Partial<CreateServiceInput> & {
  id: string;
};

export type ServiceTableRow = {
  id: string;
  name: string;
  defaultUnitPrice?: number; // Optional, can be used for pre-filling in forms
};
export type ServiceRow = {
  serviceId: string;
  serviceName: string;
  quantity: number;
  amount: number;
};

/******************** Missalenius Types ********************/

export class AuthError extends Error {
  type: string;
  constructor(type: string, message?: string) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
  }
}

export type SalarySummary = {
  month: string;
  dailyRate: number;
  daysWorked: number;
  payable: number;
  totalPaid: number;
  outstanding: number;
  payments: SalaryPayment[];
};

export type SalaryPayment = {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'partial';
  note?: string;
};

export type Vacation = {
  id: string;
  workerId: string;  // ID of the worker requesting vacation
  startDate: string;  // Start date of the vacation
  endDate: string;  // End date of the vacation
  approved: boolean;  // Whether the vacation has been approved
  reason?: string | null;  // Optional reason for the vacation
  worker: WorkerShort;  // The worker associated with the vacation (if you want to include this)
};