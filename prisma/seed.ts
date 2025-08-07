// import { PrismaClient } from '@prisma/client';
// import { faker } from '@faker-js/faker';

// const prisma = new PrismaClient();

// async function main() {
//   // Create Services (shared across invoices)
//   const services = await Promise.all(
//     Array.from({ length: 3 }).map(() =>
//       prisma.service.create({
//         data: { name: faker.commerce.product() },
//       })
//     )
//   );

//   // Create multiple Customers with Address, Project, and Invoice
//   for (let i = 0; i < 5; i++) {
//     const address = await prisma.address.create({
//       data: {
//         street: faker.location.streetAddress(),
//         postalCode: faker.location.zipCode(),
//         city: faker.location.city(),
//       },
//     });

//     const customer = await prisma.customer.create({
//       data: {
//         name: faker.company.name(),
//         email: faker.internet.email(),
//         type: 'company',
//         cvrNumber: faker.string.numeric(8),
//         address: { connect: { id: address.id } },
//       },
//     });

//     const project = await prisma.project.create({
//       data: {
//         name: faker.commerce.productName(),
//         customer: { connect: { id: customer.id } },
//         startDate: faker.date.past(),
//         status: 'active',
//         address: { connect: { id: address.id } },
//       },
//     });

//     const invoice = await prisma.invoice.create({
//       data: {
//         projectId: project.id,
//         status: 'pending',
//         date: faker.date.recent(),
//         services: {
//           create: services.map(service => ({
//             serviceId: service.id,
//             amount: faker.number.int({ min: 5000, max: 20000 }),
//             quantity: faker.number.int({ min: 1, max: 5 }),
//           })),
//         },
//       },
//     });
//   }

//   // Create multiple Workers with assignments, payments, workEntries, vacations
//   for (let i = 0; i < 5; i++) {
//     const address = await prisma.address.create({
//       data: {
//         street: faker.location.streetAddress(),
//         postalCode: faker.location.zipCode(),
//         city: faker.location.city(),
//       },
//     });

//     const worker = await prisma.worker.create({
//       data: {
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         position: faker.person.jobTitle(),
//         dailyRate: faker.number.int({ min: 20000, max: 35000 }),
//         startDate: faker.date.past({ years: 1 }),
//         address: { connect: { id: address.id } },
//       },
//     });

//     // Get a random project
//     const [randomProject] = await prisma.project.findMany({
//       take: 1,
//       orderBy: { createdAt: 'desc' },
//     });

//     if (randomProject) {
//       await prisma.projectAssignment.create({
//         data: {
//           workerId: worker.id,
//           projectId: randomProject.id,
//           startDate: faker.date.past({ years: 1 }),
//         },
//       });

//       // Create 5 Work Entries
//       await Promise.all(
//         Array.from({ length: 5 }).map(() =>
//           prisma.workEntry.create({
//             data: {
//               workerId: worker.id,
//               projectId: randomProject.id,
//               date: faker.date.recent({ days: 30 }),
//               isFullDay: faker.datatype.boolean(),
//               notes: faker.lorem.sentence(),
//             },
//           })
//         )
//       );
//     }

//     // Payment
//     await prisma.payment.create({
//       data: {
//         workerId: worker.id,
//         amount: faker.number.int({ min: 40000, max: 60000 }),
//         date: faker.date.recent(),
//         status: 'paid',
//         notes: 'Monthly salary',
//       },
//     });

//     // Vacation
//     await prisma.vacation.create({
//       data: {
//         workerId: worker.id,
//         startDate: faker.date.recent(),
//         endDate: faker.date.soon(),
//         approved: faker.datatype.boolean(),
//         reason: faker.lorem.words(3),
//       },
//     });
//   }

//   console.log('Multiple test records seeded successfully!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => prisma.$disconnect());
