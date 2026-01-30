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


## Quick Start
1) Clone
   - git clone https://github.com/f5song/it-software-management.git
   - cd it-software-management

2) (optional) ENV
   - cp .env.example .env
   - cp backend/.env.example backend/.env
   - cp frontend/.env.example frontend/.env

3) Build & Run
   - docker compose up --build -d

4) Access
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8000
    - DB: localhost:5432 (user/pass: postgres)

## Health
    - Backend: GET /  => "Hello from Backend"
    - Backend: GET /health/db => { db: "ok" }
