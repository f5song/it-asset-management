# ========== Build ==========
FROM node:20-alpine AS builder
WORKDIR /repo

# คัดลอกไฟล์สำหรับติดตั้งและ build เฉพาะที่จำเป็นก่อน เพื่อลด cache bust
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/tsconfig.json apps/api/tsconfig.json

# ติดตั้ง deps แบบ workspaces (รวม root)
RUN npm ci --workspaces --include-workspace-root

# คัดลอกซอร์สทั้งหมด (หลังจาก deps ลงแล้วเพื่อใช้ layer cache ได้)
COPY . .

# Build เฉพาะแพ็กเกจ API (ใช้ชื่อ workspace)
RUN npm run build -w @it-asset/api

# ========== Runtime ==========
FROM node:20-alpine AS runner
WORKDIR /repo

# คัดลอก package.json และ lockfile (จำเป็นต่อ npm ci ใน runtime)
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json

# ติดตั้งเฉพาะ production deps ของทุก workspace
# (วิธีที่ง่ายและชัวร์สุดว่าจะมีโมดูลครบ รวมทั้ง dotenv ใน workspace ของ API)
RUN npm ci --omit=dev --workspaces --include-workspace-root

# คัดลอก dist ของ API ที่ build ไว้จาก stage แรก
COPY --from=builder /repo/apps/api/dist ./apps/api/dist

WORKDIR /repo/apps/api
EXPOSE 8000

# preload dotenv/config เสมอ (แม้เราจะส่ง ENV ผ่าน compose ก็ไม่เสียหาย)
CMD ["node", "-r", "dotenv/config", "dist/index.js"]
