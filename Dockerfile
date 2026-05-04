# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for a NestJS + Prisma app
# Comments are placed on their OWN lines so they never end up inside a RUN
# shell command (inline comments after `\` continuations would be executed
# by /bin/sh and break the build).
# ─────────────────────────────────────────────────────────────────────────────


# ─── Stage 1: Dependencies ───────────────────────────────────────────────────

# Base image: Node 24.15 on Alpine for a small footprint.
FROM node:24.15-alpine AS deps

# Working directory inside the container.
WORKDIR /app

# Copy manifest files first so Docker can cache `npm ci` when they don't change.
COPY package*.json ./

# Copy the Prisma schema so any postinstall hooks can find it.
COPY prisma ./prisma/

# CHANGED: replaced deprecated `--only=production` with `--omit=dev`.
# Your previous build logged: "npm warn config only Use `--omit=dev` ...".
# We install prod deps, stash them for the final stage, then install full
# (dev + prod) deps which the builder stage needs for `tsc` / `nest build`.
RUN npm ci --omit=dev \
 && cp -R node_modules /tmp/prod_node_modules \
 && npm ci


# ─── Stage 2: Builder ────────────────────────────────────────────────────────

# Fresh stage that compiles TypeScript and generates the Prisma client.
FROM node:24.15-alpine AS builder

WORKDIR /app

# Reuse the full (dev + prod) node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code.
COPY . .

# CHANGED: this is the fix for your original error
#   "PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL"
#
# Newer Prisma CLI eagerly resolves env("DATABASE_URL") in schema.prisma at
# `prisma generate` time, even though generate does NOT connect to the DB.
# We pass a placeholder URL inline (same shell line, so it's an env var for
# that one command). The REAL DATABASE_URL is supplied at runtime via
# env_file in docker-compose.yaml.
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate \
 && npm run build


# ─── Stage 3: Production ─────────────────────────────────────────────────────

# Final lean runtime image.
FROM node:24.15-alpine AS production

WORKDIR /app

# Tell Node / Nest we are in production mode.
ENV NODE_ENV=production

# CHANGED: install wget so the docker-compose healthcheck
#   wget -qO- http://localhost:3000/health
# actually works. node:alpine images do NOT ship wget by default.
RUN apk add --no-cache wget

# Create a non-root user/group for security.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

# Slim prod-only node_modules from stage 1.
COPY --from=deps    /tmp/prod_node_modules   ./node_modules

# Compiled JS output from the builder.
COPY --from=builder /app/dist                ./dist

# Prisma schema + migrations folder (needed by `migrate deploy` at runtime).
COPY --from=builder /app/prisma              ./prisma

# package.json — Nest reads it at runtime.
COPY --from=builder /app/package.json        ./package.json

# Prisma generated client artifacts produced by `prisma generate`.
COPY --from=builder /app/node_modules/.prisma        ./node_modules/.prisma

# CHANGED: also copy the @prisma/client runtime package from the builder.
# The prod node_modules from stage 1 contains @prisma/client, but its
# generated files live in node_modules/.prisma AND inside @prisma/client
# after generate runs. Copying both keeps them in sync.
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Make sure the runtime user owns the app directory.
RUN chown -R nestjs:nodejs /app

# Drop privileges.
USER nestjs

# Document the listening port.
EXPOSE 3000

# Default command: start the compiled NestJS app.
CMD ["node", "dist/main"]
