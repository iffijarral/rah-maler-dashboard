#!/bin/sh

echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z db 5432; do
  sleep 1
done
echo "✅ PostgreSQL is up!"

# Prisma commands are usually fine in dev (generate types, push schema)
pnpm prisma migrate deploy

# No pnpm build in dev!
# pnpm dev # <--- ONLY RUN THE DEVELOPMENT SERVER
pnpm start # <--- RUN THE PRODUCTION SERVER