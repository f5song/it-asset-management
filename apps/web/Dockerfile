# -------- Build --------
FROM node:20-alpine AS builder
WORKDIR /repo

# คัดลอกไฟล์สำคัญก่อน (ให้ cache ทำงานดี)
COPY package.json package-lock.json turbo.json ./
COPY . .

# ติดตั้งตาม lockfile ทั้ง workspaces
RUN npm ci --workspaces

ENV NEXT_TELEMETRY_DISABLED=1 TURBO_TELEMETRY_DISABLED=1

# build เฉพาะ frontend
RUN npm run build -w apps/web

# -------- Runtime --------
FROM node:20-alpine AS runner
WORKDIR /repo

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# คัดลอกทั้ง repo จาก builder (ชัวร์สุด)
COPY --from=builder /repo /repo

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/web"]