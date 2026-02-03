# syntax=docker/dockerfile:1.7-labs
# -------- Build (builder) --------
FROM node:20-alpine AS builder
WORKDIR /repo

# คัดลอกไฟล์ที่ใช้ติดตั้ง
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/package.json

# ติดตั้ง deps เฉพาะ workspace web
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspaces --include-workspace-root=false \
      --workspace apps/web \
      --no-audit --fund=false

# คัดลอกซอร์สทั้งหมด
COPY . .

# Build (ต้องมี output:'standalone' ใน apps/web/next.config.mjs)
ENV NEXT_TELEMETRY_DISABLED=1 TURBO_TELEMETRY_DISABLED=1
RUN npm run build -w apps/web

# -------- Runtime (runner) --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 NEXT_TELEMETRY_DISABLED=1

# สำหรับ lib ที่ต้องใช้ glibc (เช่น sharp)
RUN apk add --no-cache libc6-compat ca-certificates

# คัดลอก standalone ทั้งก้อน → จะได้ /app/apps/web/server.js
COPY --from=builder /repo/apps/web/.next/standalone ./

# คัดลอก static ไปที่ path ที่ server คาดหวัง
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static


EXPOSE 3000

# **สำคัญ**: ชี้ไปยังไฟล์จริงใน monorepo
CMD ["node", "apps/web/server.js"]