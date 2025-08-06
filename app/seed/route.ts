// app/seed/route.ts
"use server";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { users } from '../lib/placeholder-data';

// IMPORTANT: Do NOT instantiate the Prisma client at the top level.
// This is what's causing the build to fail.

// Factory function to create a new Prisma Client instance
function createPrismaClientForSeeding() {
  console.log("Attempting to create Prisma client for seeding...");
  return new PrismaClient();
}

// All seeding logic is now contained within this single function.
async function seedUsers() {
  console.log('Inside seedUsers');
  const prisma = createPrismaClientForSeeding();

  try {
    // Iterate through users, hash password, and create users using Prisma
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Check if user already exists by email, and if not, create
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: hashedPassword,
          },
        });
      } else {
        console.log(`User with email ${user.email} already exists`);
      }
    }
    console.log('Users seeded successfully');
    return true; // Return a success status
  } catch (error) {
    console.error('[SEED_USERS_ERROR]', error);
    return false; // Return a failure status
  } finally {
    await prisma.$disconnect();
  }
}

// This function is the API handler that orchestrates the seeding.
async function runSeedingLogic() {
  console.log('Seeding database...');
  const success = await seedUsers();

  if (success) {
    return NextResponse.json({ message: 'Database seeded successfully' });
  } else {
    return NextResponse.json(
      { error: 'An error occurred during database seeding' },
      { status: 500 }
    );
  }
}

// This is the function that will run during the build
function getSkippedResponse() {
  console.log("Database connection skipped for build process.");
  return new Response('Database connection skipped for build process.', { status: 200 });
}

// Conditionally choose which function to use based on the environment variable
let selectedGetHandler;
if (process.env.SKIP_DB_CONNECT) {
  selectedGetHandler = getSkippedResponse;
} else {
  selectedGetHandler = runSeedingLogic;
}

export const GET = selectedGetHandler;