# apps/api/Dockerfile

FROM node:24-alpine AS base

# --- Stage 1: prune the monorepo down to just what api needs ---
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# --- Stage 2: install deps + build ---
FROM base AS builder
WORKDIR /app
# for bcrypt
RUN apk add --no-cache python3 make g++
COPY --from=pruner /app/out/json/ .
RUN npm install
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=api

# --- Stage 3: slim runtime image ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]