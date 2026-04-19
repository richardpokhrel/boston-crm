# Boston CRM — MERN Stack Boilerplate
https://privatebin.net/?caceb4a8b6751fa9#DAWmL5VderuMU3D9VjBtipcNeRk9sWWmDULt2bSr5Kxo
Full-stack MERN application boilerplate for the Boston CRM education consultancy platform.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS            |
| Backend    | Node.js 20, Express 4                  |
| Database   | MongoDB 7 (Mongoose ODM)               |
| Cache      | Redis 7                                 |
| Auth       | JWT (access + refresh token pattern)   |
| Real-time  | Socket.io                               |
| Jobs       | BullMQ                                  |
| Container  | Docker + Docker Compose                 |
| CI/CD      | GitHub Actions                          |

---

## Project Structure

```
boston-crm/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── api/          # Axios API functions
│   │   ├── components/   # Reusable UI + layout
│   │   ├── hooks/        # React Query hooks
│   │   ├── pages/        # Route-level pages
│   │   └── store/        # Zustand state
│   └── Dockerfile
├── server/               # Node.js backend (Express)
│   ├── src/
│   │   ├── config/       # DB, Redis, logger, env
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, error, validation
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   ├── utils/        # JWT, apiHelpers
│   │   └── validators/   # Joi schemas
│   └── Dockerfile
├── .github/workflows/    # CI/CD pipelines
├── docker-compose.yml    # Dev: MongoDB + Redis
├── docker-compose.prod.yml
└── package.json          # Root scripts
```

---

## Quick Start

### 1. Prerequisites

```bash
node --version   # v20+
docker --version # v24+
```

### 2. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/boston-crm.git
cd boston-crm
npm install                          # root (concurrently)
npm install --prefix server
npm install --prefix client
```

### 3. Environment Variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` — set your JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start Docker Services

```bash
docker compose up -d
# Starts MongoDB on :27017 and Redis on :6379
docker compose ps   # both should show (healthy)
```

### 5. Seed Database

```bash
npm run seed
```

Output:
```
admin@bostoncrm.com       Admin@123!
sarah@bostoncrm.com       Staff@123!
ram@bostoncrm.com         Staff@123!
```

### 6. Start Dev Servers

```bash
npm run dev
```

| Service     | URL                        |
|-------------|----------------------------|
| Frontend    | http://localhost:3000       |
| Backend API | http://localhost:5000/api   |
| Health      | http://localhost:5000/health|

---

## API Reference

### Auth

| Method | Endpoint           | Auth     | Description           |
|--------|--------------------|----------|-----------------------|
| POST   | /api/auth/login    | Public   | Login, returns JWT    |
| POST   | /api/auth/logout   | Bearer   | Invalidate token      |
| GET    | /api/auth/me       | Bearer   | Get current user      |
| POST   | /api/auth/refresh  | Cookie   | Refresh access token  |
| POST   | /api/auth/register | Admin    | Create new user       |

### Leads

| Method | Endpoint              | Auth   | Description          |
|--------|-----------------------|--------|----------------------|
| GET    | /api/leads            | Bearer | List leads (filtered)|
| POST   | /api/leads            | Bearer | Create lead          |
| GET    | /api/leads/:id        | Bearer | Get lead details     |
| PATCH  | /api/leads/:id        | Bearer | Update lead          |
| PATCH  | /api/leads/:id/status | Bearer | Update pipeline stage|
| DELETE | /api/leads/:id        | Admin  | Delete lead          |

### Users (Admin only)

| Method | Endpoint     | Description      |
|--------|--------------|------------------|
| GET    | /api/users   | List users        |
| GET    | /api/users/:id | Get user        |
| PATCH  | /api/users/:id | Update user     |
| DELETE | /api/users/:id | Deactivate user |

---

## Docker Production Build

```bash
# Build and test production stack locally
docker compose -f docker-compose.prod.yml up --build -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f server
```

---

## CI/CD

### GitHub Secrets Required

| Secret              | Description                          |
|---------------------|--------------------------------------|
| DOCKER_HUB_USER     | Docker Hub username                  |
| DOCKER_HUB_TOKEN    | Docker Hub access token              |
| MONGO_USER          | Production MongoDB username          |
| MONGO_PASSWORD      | Production MongoDB password          |
| MONGO_DB            | Production DB name                   |
| REDIS_PASSWORD      | Production Redis password            |
| DEPLOY_HOST         | Production server IP                 |
| DEPLOY_USER         | SSH username                         |
| DEPLOY_SSH_KEY      | Private SSH key for deployment       |

### Branch Strategy

```
main      → production (auto-deploy on merge)
develop   → staging (CI tests on every push)
feature/* → developer branches (PR to develop)
```

---

## Testing

```bash
cd server && npm test
# Runs against in-memory MongoDB via test environment
```

---

## Extend the Boilerplate

Next modules to build (all patterns are established):

- `src/controllers/taskController.js` — follow leadController pattern
- `src/models/Document.js` — document management
- `src/jobs/emailJob.js` — BullMQ email queue
- `src/services/notificationService.js` — Socket.io notifications
- `client/src/pages/admin/` — user management pages
