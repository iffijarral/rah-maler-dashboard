import { format } from 'date-fns';
import { prisma } from "./prisma";
import { ProjectStatus } from '@prisma/client';
import { startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import {
  ProjectWithExtras,
  SalarySummary,
  WorkerShort,
} from "./definitions";
import { formatCurrency } from "./utils";
import { Prisma } from '@prisma/client';

const ITEMS_PER_PAGE = 6;

// ****************** Revenue ******************

export async function fetchRevenue() {
  try {
    const now = new Date();
    // Start date for the last 12 months (inclusive of the start month)
    // We want data from 1st of (current month - 11) up to end of current month
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Using raw SQL for efficient monthly aggregation
    // This query sums the 'totalAmount' for 'paid' invoices,
    // filters by date, and groups by year and month.
    // Ensure totalAmount exists and is indexed in your Invoice model
    const revenueData: { month_year: string; total_revenue: number }[] =
      await prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'YYYY-MM') AS month_year,
        SUM("totalAmount") AS total_revenue
      FROM "Invoice"
      WHERE status = 'paid'
        AND "is_deleted" = FALSE
        AND date >= ${twelveMonthsAgo}
        AND date <= ${now} -- Include invoices up to the current date
      GROUP BY month_year
      ORDER BY month_year ASC;
    `;

    // Initialize result map for all 12 months with 0 revenue
    const result: { month: string; revenue: number }[] = [];
    const revenueMap: Record<string, number> = {};

    // Populate revenueMap with fetched data
    revenueData.forEach(row => {
      revenueMap[row.month_year] = Number(row.total_revenue); // Ensure it's a number
    });

    // Generate the last 12 months and fill in revenue
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1); // Get the 1st of the month
      const key = format(date, 'yyyy-MM');
      result.push({ month: key, revenue: revenueMap[key] || 0 });
    }

    return result;
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    // In a real application, you might want to throw the error
    // or return a more informative empty state.
    return [];
  }
}



// ****************** Cards ******************

export async function fetchCardData() {
  try {
    const [
      invoiceCount,
      customerCount,
      totalPaidAmountResult, // Renamed for clarity
      totalPendingAmountResult, // Renamed for clarity
    ] = await prisma.$transaction([
      // 1. Total invoice count (no change, already efficient)
      prisma.invoice.count(),

      // 2. Total customer count (no change, already efficient)
      prisma.customer.count({ where: { isDeleted: false } }),

      // 3. Sum of totalAmount for paid invoices
      prisma.invoice.aggregate({
        _sum: {
          totalAmount: true, // Summing the denormalized totalAmount field
        },
        where: {
          status: 'paid',
          isDeleted: false,
        },
      }),

      // 4. Sum of totalAmount for pending invoices
      prisma.invoice.aggregate({
        _sum: {
          totalAmount: true, // Summing the denormalized totalAmount field
        },
        where: {
          status: 'pending',
          isDeleted: false,
        },
      }),
    ]);

    // Extract the summed values (they will be null if no records match)
    const totalPaid = totalPaidAmountResult._sum.totalAmount || 0;
    const totalPending = totalPendingAmountResult._sum.totalAmount || 0;

    // Convert to readable currency format
    const totalPaidInvoices = formatCurrency(totalPaid);
    const totalPendingInvoices = formatCurrency(totalPending);

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}


// ****************** Invoices ******************

export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        date: true,
        status: true,
        totalAmount: true, // Select the new totalAmount field
        project: {
          select: {
            name: true,
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
      take: 5,
    });

    return data.map((invoice) => ({
      ...invoice,
      projectName: invoice.project.name,
      customerName: invoice.project.customer.name,
      customerEmail: invoice.project.customer.email,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}


export async function fetchFilteredInvoices(query: string, page: number = 1) {
  const take = ITEMS_PER_PAGE;
  const skip = (page - 1) * take;

  try {
    const searchTerms = query.toLowerCase();

    // Initialize the base WHERE clause
    const whereClause: Prisma.InvoiceWhereInput = {
      isDeleted: false,
    };

    const isStatusQuery = searchTerms === 'pending' || searchTerms === 'paid';
    const isAmountQuery = !isNaN(Number(query)) && Number(query) > 0;
    const numericAmount = Number(query) * 100; // Assuming amounts are stored in cents/pennies

    // Conditions for the OR clause, which will be dynamically built
    const orConditions: Prisma.InvoiceWhereInput[] = [];

    // 1. Text Search Filters (for project name, customer name, email)
    // These should always be considered unless amount is *exclusive*
    orConditions.push(
      { project: { name: { contains: searchTerms, mode: 'insensitive' } } },
      { project: { customer: { name: { contains: searchTerms, mode: 'insensitive' } } } },
      { project: { customer: { email: { contains: searchTerms, mode: 'insensitive' } } } }
    );

    // 2. Status Filter
    if (isStatusQuery) {
      orConditions.push({ status: searchTerms as 'pending' | 'paid' });
    }

    // 3. Amount Filter (NEW - uses the totalAmount column)
    if (isAmountQuery) {
      // If the query is a number, prioritize exact match on totalAmount
      // You might want to decide if amount search is *exclusive* or *additive*
      // For now, let's assume it's additive to the text/status search
      orConditions.push({ totalAmount: numericAmount });
    }

    // Apply the OR conditions if any
    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }


    const [invoices, totalCount] = await prisma.$transaction([
      prisma.invoice.findMany({
        where: whereClause,
        select: {
          id: true,
          date: true,
          status: true,
          isDeleted: true,
          totalAmount: true, // <--- Select the new totalAmount field
          project: {
            select: {
              id: true,
              name: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  address: {
                    select: {
                      id: true,
                      street: true,
                      postalCode: true,
                      city: true,
                    },
                  },
                },
              },
            },
          },
          // No need to select 'services' if you're only using totalAmount for filtering/display
          // Only include if you display individual services on the invoice list.
          // If you do need services, keep this block:
          services: {
            select: {
              id: true,
              quantity: true,
              amount: true,
              serviceId: true,
              invoiceId: true,
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip: skip,
        take: take,
      }),
      prisma.invoice.count({
        where: whereClause, // Count based on the same filters
      }),
    ]);

    return {
      invoices: invoices.map(inv => ({
        ...inv,
        date: inv.date.toISOString(),
      })),
      totalPages: Math.ceil(totalCount / take),
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch filtered invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const searchTerms = query.toLowerCase();

    // Initialize the base WHERE clause
    const whereClause: Prisma.InvoiceWhereInput = {
      isDeleted: false,
    };

    const isStatusQuery = searchTerms === 'pending' || searchTerms === 'paid';
    const isAmountQuery = !isNaN(Number(query)) && Number(query) > 0;
    const numericAmount = Number(query) * 100; // Use the same logic as fetchFilteredInvoices

    // Conditions for the OR clause, dynamically built
    const orConditions: Prisma.InvoiceWhereInput[] = [];

    // 1. Text Search Filters (for project name, customer name, email)
    orConditions.push(
      { project: { name: { contains: searchTerms, mode: 'insensitive' } } },
      { project: { customer: { name: { contains: searchTerms, mode: 'insensitive' } } } },
      { project: { customer: { email: { contains: searchTerms, mode: 'insensitive' } } } }
    );

    // 2. Status Filter
    if (isStatusQuery) {
      orConditions.push({ status: searchTerms as 'pending' | 'paid' });
    }

    // 3. Amount Filter (NOW uses the totalAmount column, assuming it's denormalized)
    if (isAmountQuery) {
      orConditions.push({ totalAmount: numericAmount });
    }

    // Apply the OR conditions if any are present
    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }

    // Use prisma.invoice.count directly with the constructed whereClause
    const totalInvoices = await prisma.invoice.count({
      where: whereClause,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalInvoices / ITEMS_PER_PAGE);

    return totalPages;

  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

// ****************** Invoices By ID ******************

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        projectId: true,
        date: true,
        status: true,
        isDeleted: true,
        totalAmount: true, // Select the new totalAmount field
        project: {
          select: {
            id: true,
            name: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            address: {
              select: {
                id: true,
                street: true,
                city: true,
                postalCode: true,
              },
            },
          },
        },
        services: {
          select: {
            id: true,
            quantity: true,
            amount: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice,
      date: invoice.date.toISOString(), // Convert Date → string
    };
  } catch (error) {
    console.error('Database Error (getInvoiceById):', error);
    throw new Error('Failed to fetch invoice.');
  }
}


// ****************** Customers ******************

export async function fetchCustomersPages(query: string) {
  try {

    const count = await prisma.customer.count({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          { isDeleted: false },
        ],
      },
    });

    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of customers.");
  }
}

export async function fetchServices() {
  try {
    return await prisma.service.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all services.");
  }
}

export async function fetchServicesByProject(projectId: string) {
  try {
    const projectServices = await prisma.projectService.findMany({
      where: { projectId },
      include: {
        service: true,
      },
    });

    return projectServices.map((ps) => ({
      id: ps.service.id,
      name: ps.service.name,
      quantity: ps.quantity,
      unitPrice: ps.unitPrice,
      projectId: ps.projectId,
    }));
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch services for the project.");
  }
}

// export async function fetchCustomers() {
//   try {
//     const customers = await prisma.customer.findMany({
//       where: { isDeleted: false },
//       select: {
//         id: true,
//         name: true,
//         type: true,
//         cvrNumber: true,
//         email: true,
//         addresses: {
//           select: {
//             id: true,
//             street: true,
//             postalCode: true,
//             city: true,
//             isPrimary: true,
//           },
//         },
//         isDeleted: true,
//       },
//       orderBy: { name: "asc" },
//     });

//     return customers.map((customer) => ({
//       ...customer,
//       type: customer.type as 'private' | 'company', // Cast type to the union type
//     }));
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch all customers.");
//   }
// }


// export async function fetchFilteredCustomers(query: string, currentPage: number) {
//   try {
//     const data = await prisma.customer.findMany({
//       where: {
//         AND: [
//           {
//             OR: [
//               { name: { contains: query, mode: "insensitive" } },
//               { email: { contains: query, mode: "insensitive" } },
//             ],
//           },
//           { isDeleted: false },
//         ],
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         type: true,
//         cvrNumber: true,
//         invoices: {
//           select: {
//             id: true,
//             status: true,
//             customerId: true,
//             date: true,
//             services: {
//               select: {
//                 amount: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { name: "asc" },
//       skip: (currentPage - 1) * ITEMS_PER_PAGE,
//       take: ITEMS_PER_PAGE,
//     });

//     return data.map((customer) => {
//       // Calculate totals for each invoice
//       const totalInvoices = customer.invoices?.length || 0;

//       const totalPending = formatCurrency(
//         (customer.invoices ?? [])
//           .filter((inv) => inv.status === "pending")
//           .reduce((sum, inv) => sum + inv.services.reduce((s, service) => s + service.amount, 0), 0)
//       );

//       const totalPaid = formatCurrency(
//         (customer.invoices ?? [])
//           .filter((inv) => inv.status === "paid")
//           .reduce((sum, inv) => sum + inv.services.reduce((s, service) => s + service.amount, 0), 0)
//       );

//       return {
//         id: customer.id,
//         name: customer.name,
//         email: customer.email,
//         type: customer.type,
//         cvrNumber: customer.cvrNumber,
//         invoices: customer.invoices,
//         totalInvoices,
//         totalPending,
//         totalPaid,
//       };
//     });
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch customer table.");
//   }
// }

export async function fetchFilteredCustomers(query: string, currentPage: number) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          { isDeleted: false },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        cvrNumber: true,
        // --- Aggregation for Invoice Totals per Customer ---
        // This is a more complex select to get sums directly from DB
        projects: {
          select: {
            // We only need the invoices to aggregate their totalAmount
            invoices: {
              where: { isDeleted: false },
              select: {
                status: true,
                totalAmount: true, // Crucial: use the denormalized totalAmount
              },
            },
          },
        },
        // You could also add other aggregates here if needed,
        // e.g., count of projects directly.
        _count: { // Get total number of projects for this customer
          select: {
            projects: {
              where: { isDeleted: false } // Only count non-deleted projects
            }
          }
        }
      },
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    return customers.map((customer) => {
      // Flatten all invoices from all projects for this customer that were fetched
      const allInvoices = customer.projects.flatMap((project) => project.invoices);

      const totalInvoices = allInvoices.length; // Count of relevant invoices

      // Now, calculate the sums using the pre-fetched totalAmount from the database
      const totalPendingAmount = allInvoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + inv.totalAmount, 0); // Use totalAmount directly

      const totalPaidAmount = allInvoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0); // Use totalAmount directly

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        type: customer.type,
        cvrNumber: customer.cvrNumber,
        totalInvoices, // Still a client-side count of fetched invoices
        totalPending: formatCurrency(totalPendingAmount),
        totalPaid: formatCurrency(totalPaidAmount),
      };
    });
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}



export async function fetchCustomerById(id: string) {
  try {
    return await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        cvrNumber: true,
        address: {
          select: {
            id: true,
            street: true,
            postalCode: true,
            city: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer.");
  }
}

export async function loadCustomers() {
  return await prisma.customer.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });
}

// ****************** Projects ******************
export async function fetchProjectsPages(query: string) {
  try {
    // 1. Get all possible ProjectStatus enum keys (e.g., 'active', 'cancelled')
    const allStatusKeys = Object.keys(ProjectStatus);

    // 2. Filter these keys to find which ones contain the query string (case-insensitive)
    const matchingStatuses = allStatusKeys.filter(statusKey =>
      statusKey.toLowerCase().includes(query.toLowerCase())
    ).map(statusKey => ProjectStatus[statusKey as keyof typeof ProjectStatus]);
    // .map() converts the string key back to the actual enum value (e.g., 'active' -> ProjectStatus.active)

    const count = await prisma.project.count({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              // 🎯 FIXED: Filter status using 'in' operator with matching enum values
              ...(matchingStatuses.length > 0 ? [{ status: { in: matchingStatuses } }] : []),
              // The spread operator `...` and conditional check `matchingStatuses.length > 0`
              // ensure that if no statuses match, this OR condition is not added,
              // preventing potential empty array issues with `in`.
            ],
          },
          { isDeleted: false },
        ],
      },
    });

    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of projects.');
  }
}


export async function fetchFilteredProjects(query: string, currentPage: number) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { customer: { name: { contains: query, mode: 'insensitive' } } },
            ],
          },
          { isDeleted: false },
        ],
      },
      select: { // Use select instead of include for fine-grained control
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true, // Assuming project.status is a string as per your schema
        plannedPrice: true, // Optional, can be null if not set
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoices: {
          where: { isDeleted: false }, // Only consider non-deleted invoices
          select: {
            id: true,
            status: true,
            date: true, // You had date here before, keep it if needed for other logic
            totalAmount: true, // <--- CRUCIAL: Use the denormalized totalAmount
            // No need to select 'services' if you're only using totalAmount for sums
            // services: {
            //   select: {
            //     amount: true,
            //     quantity: true,
            //   },
            // },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    return projects.map((project) => {
      // These are already filtered for isDeleted=false during the fetch
      const allInvoices = project.invoices;

      const totalInvoices = allInvoices.length;

      const totalPending = formatCurrency(
        allInvoices
          .filter((inv) => inv.status === 'pending')
          .reduce(
            (sum, inv) => sum + inv.totalAmount, // <--- Use totalAmount directly
            0
          )
      );

      const totalPaid = formatCurrency(
        allInvoices
          .filter((inv) => inv.status === 'paid')
          .reduce(
            (sum, inv) => sum + inv.totalAmount, // <--- Use totalAmount directly
            0
          )
      );

      return {
        id: project.id,
        name: project.name,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate?.toISOString(),
        status: project.status, // Ensure project.status is pulled if used
        plannedPrice: project.plannedPrice ? formatCurrency(project.plannedPrice) : '', // Format if set
        customer: project.customer,
        totalInvoices,
        totalPending,
        totalPaid,
      };
    });
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch project table.');
  }
}

export async function fetchProjectById(id: string): Promise<ProjectWithExtras | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        plannedPrice: true,
        services: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
              },
            },
            unitPrice: true,
            quantity: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignments: {
          select: {
            worker: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        address: {
          select: {
            id: true,
            street: true,
            postalCode: true,
            city: true,
          },
        },
        invoices: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            date: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!project) return null;

    const workers = Array.from(
      new Map(
        project.assignments.map((entry) => [entry.worker.id, entry.worker])
      ).values()
    );

    const services = project.services.map((s) => ({
      id: s.id,
      name: s.service.name,
      unitPrice: s.unitPrice,
      quantity: s.quantity,
    }));

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString(),
      plannedPrice: project.plannedPrice,
      customer: project.customer,
      address: project.address || {
        street: '',
        postalCode: '',
        city: '',
      },
      workers,
      services,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project.');
  }
}

// loadProjects
export async function loadProjects() {
  return await prisma.project.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
    orderBy: { name: 'asc' },
  });
}

// ****************** Workers ******************

export async function fetchFilteredWorkers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  // Define the exact payload type for the `worker` objects returned by Prisma
  type WorkerWithAddress = Prisma.WorkerGetPayload<{
    select: {
      id: true;
      name: true;
      email: true;
      phone: true;
      position: true;
      startDate: true;
      dailyRate: true;
      isActive: true;
      address: {
        select: {
          id: true;
          street: true;
          postalCode: true;
          city: true;
        };
      };
      createdAt: true;
      updatedAt: true;
    };
  }>;

  const workers = await prisma.worker.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        { isDeleted: false },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: offset,
    take: ITEMS_PER_PAGE,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      position: true,
      startDate: true,
      dailyRate: true,
      isActive: true,
      address: {
        select: {
          id: true,
          street: true,
          postalCode: true,
          city: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Explicitly type the 'worker' parameter in the map function
  // We expect 'worker' to be of type WorkerWithAddress
  return workers.map((worker: WorkerWithAddress) => ({
    ...worker,
    startDate: worker.startDate?.toISOString() ?? null, // Ensure startDate is handled correctly if it can be null/undefined from DB
    createdAt: worker.createdAt.toISOString(),
    updatedAt: worker.updatedAt.toISOString(),
  }));
}

export async function loadWorkers() {
  return await prisma.worker.findMany({
    where: {
      isActive: true,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function fetchWorkerById(id: string) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        startDate: true,
        dailyRate: true,
        isActive: true,
        address: {
          select: {
            id: true,
            street: true,
            postalCode: true,
            city: true,
          },
        },
      }
    });

    if (!worker) {
      return null;
    }

    return {
      ...worker,
      startDate: worker.startDate?.toISOString() ?? undefined,
      address: worker.address
        ? {
          street: worker.address.street,
          postalCode: worker.address.postalCode,
          city: worker.address.city,
        }
        : undefined,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch worker.");
  }
}

export async function fetchWorkerById2(workerId: string) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        startDate: true,
        dailyRate: true,
        isActive: true,
        address: {
          select: {
            id: true,
            street: true,
            postalCode: true,
            city: true,
          },
        },
      }
    });

    if (!worker) {
      return null;
    }

    return {
      ...worker,
      startDate: worker.startDate?.toISOString() ?? undefined,
      address: worker.address
        ? {
          street: worker.address.street,
          postalCode: worker.address.postalCode,
          city: worker.address.city,
        }
        : undefined,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch worker.");
  }
}

export async function fetchWorkersAssignedToProject(projectId: string) {
  try {
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        projectId,
        worker: { // Filter related worker
          isDeleted: false,
          isActive: true,
        },
      },
      select: {
        // --- OPTIMIZATION 1: Select only specific fields for the worker ---
        worker: {
          select: {
            id: true,
            name: true,
            // Add other fields here if WorkerShort includes them (e.g., email, position)
          },
        },
      },
    });

    // --- OPTIMIZATION 2: Deduplicate workers ---
    // Use a Map to ensure unique workers based on their ID
    const uniqueWorkersMap = new Map<string, WorkerShort>();
    assignments.forEach(assignment => {
      // Assuming assignment.worker is already of type WorkerShort due to the select clause
      uniqueWorkersMap.set(assignment.worker.id, assignment.worker);
    });

    return Array.from(uniqueWorkersMap.values()); // Convert Map values back to an array
  } catch (error) {
    console.error('Error fetching workers for project:', error);
    throw new Error('Could not fetch assigned workers');
  }
}

export async function fetchWorkersPages(query: string) {
  try {
    const count = await prisma.worker.count({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { position: { contains: query, mode: 'insensitive' } },
            ],
          },
          { isDeleted: false }, // Assuming you also have an isDeleted field on Worker
        ],
      },
    });

    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of workers.');
  }
}

// ****************** WorkLogs ******************
export async function fetchWorkEntries(
  workerId: string,
  projectId: string,
  startDate: Date, // Changed from month: string
  endDate: Date   // Changed from month: string
) {
  if (!workerId || !projectId || !startDate || !endDate) {
    return []; // Return empty array if parameters are missing
  }

  try {
    const workEntries = await prisma.workEntry.findMany({
      where: {
        workerId,
        projectId,
        date: {
          gte: startDate, // Use provided startDate
          lte: endDate,   // Use provided endDate
        },
      },
      select: { // Select only the fields needed for the grid
        date: true,
        isFullDay: true,
        notes: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Map to a simpler format for the client, if necessary
    return workEntries.map(entry => ({
      date: entry.date.toISOString(), // Ensure date is ISO string
      isFullDay: entry.isFullDay,
      notes: entry.notes || '',
    }));
  } catch (error) {
    console.error('Failed to fetch work entries:', error);
    return [];
  }
}

export async function fetchWorkerLogs(workerId: string, selectedMonth: Date | null) {
  const monthStart = startOfMonth(selectedMonth ?? new Date());
  const monthEnd = endOfMonth(selectedMonth ?? new Date());
  try {
    const logs = await prisma.workEntry.findMany({
      where: {
        workerId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },

      },
      orderBy: { date: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return logs.map((log) => ({
      ...log,
      date: log.date.toISOString(), // Convert Date → string
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch worker logs.');
  }

}

export async function fetchFilteredWorkerLogs(
  workerId: string,
  query: string,
  currentPage: number,
  selectedMonth: Date | null = null
) {
  try {
    const monthStart = startOfMonth(selectedMonth ?? new Date());
    const monthEnd = endOfMonth(selectedMonth ?? new Date());
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    // Summary data for the selected month
    const [payments, workLogs, vacations] = await prisma.$transaction([
      prisma.payment.aggregate({
        where: {
          workerId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.workEntry.count({
        where: {
          workerId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),

      prisma.vacation.count({
        where: {
          workerId,
          AND: [
            { startDate: { lte: monthEnd } },
            { endDate: { gte: monthStart } },
          ],
        },
      }),
    ]);

    // Text OR Date filter (for search)
    const parsedQueryDate = Date.parse(query);
    const textOrDateFilter = isNaN(parsedQueryDate)
      ? {
        notes: {
          contains: query,
          mode: Prisma.QueryMode.insensitive,
        },
      }
      : {
        date: {
          equals: new Date(parsedQueryDate),
        },
      };

    // Logs for table (filtered by selected month and query)
    const logs = await prisma.workEntry.findMany({
      where: {
        workerId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        ...(query ? textOrDateFilter : {}),
      },
      orderBy: { date: 'desc' },
      skip: offset,
      take: ITEMS_PER_PAGE,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      totalWage: payments._sum.amount ?? 0,
      totalWorkingDays: workLogs,
      totalVacationDays: vacations,
      logs,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch worker log data.');
  }
}


// ****************** Vacations ******************

export async function fetchVacationsByWorker(workerId: string) {
  try {
    return await prisma.vacation.findMany({
      where: { workerId },
      orderBy: { startDate: "desc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch vacation records.");
  }
}

// ****************** Payments ******************

export async function fetchPaymentsByWorker(workerId: string) {
  try {
    const data = await prisma.payment.findMany({
      where: { workerId },
      orderBy: { date: "desc" },
    });

    return data.map((payment) => ({
      ...payment,
      amount: formatCurrency(payment.amount),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch payments.");
  }
}

export async function fetchPendingPayments() {
  try {
    const data = await prisma.payment.findMany({
      where: { status: "pending" },
      include: { worker: true },
    });

    return data.map((payment) => ({
      ...payment,
      amount: formatCurrency(payment.amount),
      workerName: payment.worker.name,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pending payments.");
  }
}

export async function getSalarySummaryByYear(workerId: string, year: number): Promise<SalarySummary[]> {
  // Fetch worker to get daily rate (already efficient)
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    select: { dailyRate: true },
  });

  if (!worker) throw new Error('Worker not found');

  const dailyRate = worker.dailyRate;

  const months = eachMonthOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  });

  const summaries = await Promise.all(
    months.map(async (monthStartDate) => {
      const start = startOfMonth(monthStartDate);
      const end = endOfMonth(monthStartDate);

      // --- OPTIMIZATION: Use Prisma aggregates and select clauses ---
      // Combine multiple queries for the month into a single transaction
      const [daysWorkedCountResult, totalPaidAggregateResult, paymentsData] = await prisma.$transaction([
        // 1. Get count of work entries (for daysWorked)
        prisma.workEntry.count({
          where: {
            workerId,
            date: {
              gte: start,
              lte: end,
            },
          },
        }),
        // 2. Get sum of payment amounts (for totalPaid)
        prisma.payment.aggregate({
          where: {
            workerId,
            date: {
              gte: start,
              lte: end,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        // 3. Fetch detailed payments with a specific select clause for the array
        prisma.payment.findMany({
          where: {
            workerId,
            date: {
              gte: start,
              lte: end,
            },
          },
          orderBy: { date: 'asc' },
          select: { // <--- CRUCIAL: Only select needed fields for the payments array
            id: true,
            amount: true,
            date: true,
            status: true,
            notes: true, // Assuming 'notes' is the field for the payment note
          },
        }),
      ]);

      const daysWorked = daysWorkedCountResult; // Direct count from DB
      const totalPaid = totalPaidAggregateResult._sum.amount ?? 0; // Sum from DB, handle null if no payments
      const payable = dailyRate * daysWorked;
      const outstanding = payable - totalPaid;

      return {
        month: monthStartDate.toLocaleString('default', { month: 'long' }),
        daysWorked,
        dailyRate,
        payable,
        totalPaid,
        outstanding,
        payments: paymentsData.map(p => ({ // Map the already optimized paymentsData
          id: p.id,
          amount: p.amount,
          date: p.date.toISOString(),
          status: p.status,
          note: p.notes ?? undefined, // Use p.notes if that's the field name
        })),
      };
    })
  );

  return summaries;
}


// ****************** Worker Vacations By Year ******************
export async function getVacationsByYear(workerId: string, year: number) {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 11, 31));

  const vacations = await prisma.vacation.findMany({
    where: {
      workerId,
      OR: [
        {
          startDate: {
            gte: start,
            lte: end,
          },
        },
        {
          endDate: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
    orderBy: { startDate: 'asc' },
  });

  return vacations;
}

// ****************** Utilities ******************

export async function fetchWorkerHistory(workerId: string, year: number) {
  // Define year boundaries (startDate is inclusive, endDate is exclusive for work entries)
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`); // Explicit ISO string for clarity
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`); // Exclusive end date

  const [vacations, workEntries, salarySummaries] = await Promise.all([
    // Fetch Vacations for the year
    prisma.vacation.findMany({
      where: {
        workerId,
        // Correct overlap logic for intervals
        startDate: { lt: endDate }, // vacation starts before the first day of the next year
        endDate: { gte: startDate }, // vacation ends on or after the first day of the current year
      },
      // --- OPTIMIZATION 1: Remove redundant worker include ---
      // If worker details are needed, fetch them once via fetchWorkerById.
      // --- OPTIMIZATION 2: Add select for Vacation fields ---
      select: {
        id: true,
        workerId: true, // Include workerId if you need it for reference
        startDate: true,
        endDate: true,
        approved: true, // Assuming you have an 'approved' field
        worker: {
          select: {
            id: true,
            name: true, // Assuming you need worker's name for display
            // Add other fields if needed, but avoid fetching entire worker object
          },
        },
        // status: true, // Example: include status if you display it
        // notes: true, // Example: include notes if you display them
        // Add any other specific fields from Vacation that you need in the return
      },
      orderBy: { startDate: 'asc' },
    }),
    // Fetch Work Entries for the year
    prisma.workEntry.findMany({
      where: {
        workerId,
        date: {
          gte: startDate,
          lt: endDate, // Correctly includes all entries up to Dec 31st of the year
        },
      },
      orderBy: { date: 'asc' },
      // --- OPTIMIZATION 3: Add select for WorkEntry fields ---
      select: {
        id: true,
        date: true, // Essential for 'workedDaysPerMonth' calculation and mapping
        // hours: true, // Example: if hours are displayed in the UI
        notes: true, // Example: if notes are displayed in the UI
        project: { // This inclusion is fine, only selects id and name
          select: {
            id: true,
            name: true,
          },
        },
        // Add any other specific fields from WorkEntry that you need
      },
    }),
    // Fetch Salary Summaries for the year (this function was already optimized)
    getSalarySummaryByYear(workerId, year),
  ]);

  // Calculate worked days per month (client-side, as it's aggregating from fetched data)
  const workedDaysPerMonth: Record<number, number> = {};

  // Ensure unique days are counted even if multiple entries exist for one day
  const uniqueWorkedDates = new Set(
    workEntries.map(entry => entry.date.toISOString().split('T')[0])
  );

  for (const dateStr of uniqueWorkedDates) {
    const date = new Date(dateStr);
    const month = date.getMonth(); // getMonth() returns 0-11
    workedDaysPerMonth[month] = (workedDaysPerMonth[month] || 0) + 1;
  }

  return {
    vacations: vacations.map(v => ({
      ...v,
      startDate: v.startDate.toISOString(),
      endDate: v.endDate.toISOString(),
    })),
    workEntries: workEntries.map(w => ({
      ...w,
      date: w.date.toISOString(),
    })),
    workedDaysPerMonth,
    salarySummaries,
  };
}

// ****************** WorkDetails By Date ******************
export async function fetchWorkDetailsByMonth(workerId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1); // JS month is 0-indexed
  const endDate = new Date(year, month, 1); // start of next month
  console.log(`Fetching work details for worker ${workerId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  const entries = await prisma.workEntry.findMany({
    where: {
      workerId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  return entries.map(entry => ({
    id: entry.id,
    date: entry.date.toISOString(),
    isFullDay: entry.isFullDay,
    notes: entry.notes || '',
    project: entry.project.name,
  }));
}