FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable corepack and install the current latest stable version of pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure pnpm is available in the builder stage
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# No NEXT_PUBLIC_* build args needed — public env vars are injected at runtime
# via window.__ENV__ (see scripts/docker-entrypoint.sh and src/lib/public-env.ts).
# The NEXT_PUBLIC_* fallbacks in src/config.ts are only used in local development,
# where Next.js statically replaces them from .env.local at dev-server startup.

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

RUN addgroup --system --gid 1000 nodejs
RUN adduser --system --uid 1000 nextjs

# public/ must be writable by nextjs so that docker-entrypoint.sh can
# generate env-config.js at container startup with the runtime env vars.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Entrypoint script: generates public/env-config.js from runtime env vars,
# then starts the Next.js standalone server.
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./

USER nextjs

EXPOSE 8080

CMD ["sh", "docker-entrypoint.sh"]
