FROM node:20-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install turbo
RUN pnpm install turbo --global
COPY . .
# Prune the workspace to just what is needed for aira-web
RUN turbo prune aira-web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args if you need to bake env vars into the image
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm turbo build --filter=aira-web...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer /app/apps/aira-web/next.config.js .
COPY --from=installer /app/apps/aira-web/package.json .

# Automatically leverage output traces to reduce image size
COPY --from=installer --chown=nextjs:nodejs /app/apps/aira-web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/aira-web/.next/static ./apps/aira-web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/aira-web/public ./apps/aira-web/public

EXPOSE 3004
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/aira-web/server.js"]