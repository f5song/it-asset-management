# ========== Build ==========
FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspaces

COPY . .
RUN npm run build -w apps/api

# ========== Runtime ==========
FROM node:20-alpine AS runner
WORKDIR /repo

# ติดตั้งเฉพาะ production deps (api)
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev --workspaces --include-workspace-root=false

# คัดลอกไฟล์ build ออกมาเฉพาะของ api
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json

WORKDIR /repo/apps/api
EXPOSE 8000
CMD ["npm", "run", "start"]
