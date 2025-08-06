# --- Stage 1: The Build Stage ---
FROM node:23-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update -y \
  && apt-get install -y openssl libssl-dev curl \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files, including schema.prisma
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Run pnpm install and then prisma generate in a single step
# The "native" target will resolve to "linux-arm64" because we are inside the container
RUN pnpm install --frozen-lockfile --production=false && pnpm prisma generate

# Copy the rest of the application source code
COPY . .

# Now, build the production app
RUN SKIP_DB_CONNECT=true pnpm build

# --- Stage 2: The Production Stage ---
FROM node:23-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package files for production dependencies
COPY package.json pnpm-lock.yaml ./
# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the built application from the builder stage
# This is where the generated Prisma client is copied
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma/

# Copy the entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose the port
EXPOSE 3000

# Start the application using your entrypoint script
CMD ["./entrypoint.sh"]