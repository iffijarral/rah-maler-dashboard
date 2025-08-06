import { PrismaClient } from '@prisma/client';

export function createPrismaClientForSeeding() {
    console.log("Attempting to create Prisma client for seeding...");
    return new PrismaClient();
}