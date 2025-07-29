# 1. Base image
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo

# 2. Prune the monorepo
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN turbo prune @collab-edit/client --docker

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN turbo build --filter=@collab-edit/client...

# 4. Runner
FROM nginx:1.25-alpine AS runner

# Add wget for health checks
RUN apk add --no-cache wget

# Copy built static files
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]