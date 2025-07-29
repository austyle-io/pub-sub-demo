# 1. Base image
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g pnpm turbo

# 2. Prune the monorepo
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN turbo prune @collab-edit/server --docker

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN turbo build --filter=@collab-edit/server...
RUN pnpm prune --prod

# 4. Runner
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat wget
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "apps/server/dist/server.js"]