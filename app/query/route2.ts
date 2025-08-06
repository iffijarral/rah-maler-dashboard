// import postgres from 'postgres';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// // async function testConnection() {
// //   try {
// //     const customers = await sql`SELECT * from customers`; // Simple query to check if the DB responds
// //     console.log('users', customers);
// //     if (!customers) {
// //       throw new Error('No users found.');
// //     }
// //     console.log('✅ Database connection established successfully.');
// //   } catch (error) {
// //     console.error('❌ Database connection failed:', error);
// //     process.exit(1); // Exit the process if the connection fails
// //   }
// // }



// export async function listInvoices() {
//   const data = await sql`
//     SELECT invoices.amount, customers.name
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id;
//   `;
//   console.log('invoices', data);
//   return data;
// }

// export async function GET() {
 
//   try {    
//   	return Response.json(await listInvoices());
//   } catch (error) {
//   	return Response.json({ error }, { status: 500 });
//   }
// }
// export async function dropTables() {
//   await sql`
//     DROP TABLE IF EXISTS invoices CASCADE;
//   `;
// }