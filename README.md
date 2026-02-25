# IT Software Management (Deploy Skeleton)
- Stack: Backend = Node.js (Express), Frontend = Next.js + Tailwind, DB = PostgreSQL

## Requirements

- **Docker:** 24.0+ (tested on 29.0.1)
- **Docker Compose:** v2.x (tested on v2.23+)
- **Node.js:** >=20 (tested on v24.11.1)
- **Git:** >=2.x (tested on v2.52.0.)


## Database
- Image: postgres:15-alpine
- Default credentials:
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=postgres
  - POSTGRES_DB=it_software_mgmt
- Port: 5432
- Init script: ./db/init.sql (runs on first container start)
ต่อไปนี้คือ **README เวอร์ชัน Professional (ภาษาไทย)** ที่อ้างอิงจากโครงสร้างไฟล์จริงใน zip ที่คุณส่งมา และจัดเรียงตาม architecture จริงของโปรเจกต์

---

# IT Asset Management System

ระบบบริหารจัดการทรัพย์สินและซอฟต์แวร์ภายในองค์กร

---

## 1) ภาพรวมโปรเจกต์ (Project Overview)

โปรเจกต์นี้เป็นระบบบริหารจัดการทรัพย์สิน IT และ Software License ภายในองค์กร โดยรองรับการทำงานหลักดังนี้:

### ความสามารถของระบบ

* จัดการข้อมูลพนักงาน (Employees)
* จัดการอุปกรณ์ (Devices)
* จัดการซอฟต์แวร์ (Software)
* จัดการ License และ License Management
* จัดการข้อยกเว้น (Exceptions)
* ระบบ Assign พนักงาน ↔ Exception
* ระบบรายงาน (Reports)
* Dashboard แสดงผลข้อมูลเชิงสถิติ
* ระบบ Authentication (NextAuth v4)

โปรเจกต์นี้ถูกจัดโครงสร้างแบบ **Monorepo** โดยแบ่งเป็น:

```
apps/
  api/    → Backend (Node.js + Express + Sequelize)
  web/    → Frontend (Next.js App Router)
```

---

## 2) Technology Stack

### 🔹 Frontend (`apps/web`)

* Next.js (App Router)
* TypeScript
* TailwindCSS
* ESLint
* Chart.js (ผ่าน lib/chartjs.ts)
* NextAuth v4

โครงสร้างเด่นของ frontend:

```
apps/web/
  app/              → route structure (App Router)
  components/       → reusable UI components
  hooks/            → custom hooks
  services/         → API abstraction layer
  lib/              → utility & helper functions
  types/            → TypeScript types
  config/           → form configuration
  mock/             → mock data
```

---

### 🔹 Backend (`apps/api`)

* Node.js
* Express
* Sequelize
* MySQL
* Docker support

โครงสร้าง backend:

```
apps/api/src/
  controllers/
  services/
  models/
  routes/
  middlewares/
  config/
  db/
  utils/
```

Backend architecture:

```
Route → Controller → Service → Model (Sequelize) → Database
```

---

## 3) โครงสร้างโปรเจกต์ (Repository Structure)

จากไฟล์จริง:

```
it-asset-management/
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── middlewares/
│   │   │   ├── config/
│   │   │   ├── db/
│   │   │   └── utils/
│   │   └── Dockerfile
│   │
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── config/
│   │   ├── mock/
│   │   └── Dockerfile
│   │
│   └── db/
│       └── init.sql
│
├── docker-compose.yml
├── turbo.json
├── tsconfig.base.json
└── package.json
```

---

## 4) วิธีติดตั้ง (Installation)

ที่ root ของโปรเจกต์:

```bash
npm install
```

---

## 5) วิธีรันโปรเจกต์ (Development)

### 🔹 รัน Backend

```bash
cd apps/api
npm run dev
```

หรือถ้าใช้ Docker:

```bash
docker-compose up --build
```

---

### 🔹 รัน Frontend

```bash
cd apps/web
npm run dev
```

เข้าใช้งานที่:

```
http://localhost:3000
```

---

## 6) วิธี Build

### Backend

```bash
cd apps/api
npm run build
```

### Frontend

```bash
cd apps/web
npm run build
```

---

## 7) Environment Variables

### 🔹 Backend (`apps/api/.env`)

ตัวแปรที่เกี่ยวข้องดูจาก:

```
apps/api/src/config/env.ts
apps/api/src/config/sequelize.ts
```

ตัวอย่าง `.env.example`

```
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
```

### 🔹 Frontend (`apps/web/.env.local`)

```
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

⚠ ห้าม commit `.env` จริงขึ้น repository
ตรวจสอบ `.gitignore` ให้เรียบร้อย

---

## 8) Workflow การทำงาน

### 🔹 Branch Strategy

* main → production
* feature/xxx → feature development
* fix/xxx → bug fix

---

### 🔹 Commit Message Format

```
feat(scope): description
fix(scope): description
refactor(scope): description
docs: update documentation
```

---

### 🔹 Code Quality

Frontend:

```bash
npm run lint
```

Backend:

* แยก service layer
* ไม่เขียน business logic ใน controller
* ใช้ middleware สำหรับ error handling (`middlewares/error.ts`)

---

## 9) Component & API Documentation

### 🔹 Backend Modules

ตัวอย่าง:

```
controllers/
  employee.controller.ts
  exception.controller.ts

services/
  employee.service.ts
  exception.service.ts

models/
  Employee.ts
  ExceptionList.ts
  ExceptionAssignment.ts
```

### 🔹 Frontend Service Layer

```
services/
  devices.service.ts
  employees.service.ts
  exceptions.service.ts
  licenses.service.ts
  software.service.ts
```

Frontend ใช้ pattern:

```
Service → Hook → Component → Page
```

---

## 10) Known Issues / สิ่งที่ควรพัฒนาเพิ่มเติม

* ยังไม่มี unit test
* บาง service ยังมี mock file ค้างอยู่
* ยังไม่มี centralized logging
* RBAC ยังสามารถปรับปรุงเพิ่มเติมได้
* Error handling ฝั่ง frontend ยังสามารถทำ global handler ได้

---

## 11) Deployment Documentation

### Docker

มีไฟล์:

```
docker-compose.yml
apps/api/Dockerfile
apps/web/Dockerfile
```

สามารถ deploy ด้วย:

```bash
docker-compose up --build -d
```

---

## 12) Onboarding Guide (คู่มือเริ่มต้น 5 นาที)

### Step 1 – Clone

```bash
git clone <repository-url>
cd it-asset-management
```

### Step 2 – ติดตั้ง dependencies

```bash
npm install
```

### Step 3 – ตั้งค่า environment

* สร้าง `.env` ใน `apps/api`
* สร้าง `.env.local` ใน `apps/web`

### Step 4 – รัน Backend

```bash
cd apps/api
npm run dev
```

### Step 5 – รัน Frontend

```bash
cd apps/web
npm run dev
```

---

## 13) หมายเหตุด้านสถาปัตยกรรม

* Backend ใช้ Express + Sequelize
* Frontend ใช้ Next.js App Router
* แยก business logic ออกจาก controller
* ใช้ folder-based domain separation
* รองรับ Docker deployment

---

# ผู้พัฒนา

Puttaraporn Jitpranee
Full-Stack Developer
IT Asset Management System

---

ถ้าคุณต้องการ ฉันสามารถ:

* ✍️ ปรับ README ให้ดู Corporate มากขึ้นอีก (ส่ง HR บริษัทใหญ่)
* 📊 เขียน System Architecture อธิบายแบบ Technical Presentation
* 🎤 เขียนสคริปต์ไว้ตอบเวลาสัมภาษณ์เกี่ยวกับโปรเจกต์นี้
* 📄 สร้างเวอร์ชัน README สั้นสำหรับ GitHub Portfolio

บอกฉันได้เลยว่าต้องการระดับไหนต่อ 🚀
