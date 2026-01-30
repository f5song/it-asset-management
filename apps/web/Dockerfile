# -------- Build stage --------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# คัดลอกไฟล์ lock ถ้ามี (package.json ต้องมีแน่)
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install

# คัดลอกซอร์สทั้งหมดแล้ว build
COPY . .
RUN npm run build

# -------- Runtime (SSR) --------
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# คัดลอกเฉพาะสิ่งที่ต้องใช้ตอนรัน
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]