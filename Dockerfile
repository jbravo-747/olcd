# Imagen de producción del sitio + CMS (Next.js standalone).
# Requiere `output: "standalone"` en next.config.ts.

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# El build no toca la base de datos, pero Payload exige que las variables existan.
ARG DATABASE_URI=postgres://build:build@localhost:5432/build
ARG PAYLOAD_SECRET=build-only-secret
# Estas dos se incrustan en el build: deben ser las de producción.
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ARG S3_PUBLIC_URL=http://localhost:9000/olcd
ENV DATABASE_URI=$DATABASE_URI \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    S3_PUBLIC_URL=$S3_PUBLIC_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
