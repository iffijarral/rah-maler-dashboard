FROM node:23-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install

# === Generate the Prisma client here ===
RUN pnpm prisma generate

COPY . .

# 🔥 Add production build step
RUN pnpm build

RUN chmod 755 entrypoint.sh

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["/bin/sh", "-c", "./entrypoint.sh"]
