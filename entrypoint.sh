#!/bin/sh

echo "⏳ Waiting for PostgreSQL to be ready..."
# Use pg_isready with correct parameters for your environment
until pg_isready -h db -p 5432; do
  sleep 1
done
echo "✅ PostgreSQL is up!"
# pnpm prisma generate
# Apply migrations
# This is the correct command for production environments
pnpm prisma migrate deploy

# Run the production build.
pnpm start