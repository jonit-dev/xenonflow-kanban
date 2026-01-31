# XenonFlow Kanban Server

REST API server for the XenonFlow Kanban board application.

## Tech Stack

- **Node.js** with **Express** - Web framework
- **TypeDI** - Dependency Injection
- **SQLite** (better-sqlite3) - Database
- **TypeScript** - Type safety
- **Zod** - Schema validation

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project by ID |
| GET | `/api/projects/:id/details` | Get project with epics and tickets |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Epics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/epics/project/:projectId` | List project epics |
| GET | `/api/epics/:id` | Get epic by ID |
| POST | `/api/epics` | Create epic |
| PUT | `/api/epics/:id` | Update epic |
| DELETE | `/api/epics/:id` | Delete epic |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/project/:projectId` | List project tickets |
| GET | `/api/tickets/:id` | Get ticket by ID |
| POST | `/api/tickets` | Create ticket |
| PUT | `/api/tickets/:id` | Update ticket |
| PATCH | `/api/tickets/:id/status` | Update ticket status |
| DELETE | `/api/tickets/:id` | Delete ticket |

## Example Requests

### Create a Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Alpha Protocol","description":"Test project"}'
```

### Create an Epic

```bash
curl -X POST http://localhost:3000/api/epics \
  -H "Content-Type: application/json" \
  -d '{"project_id":"p-123","name":"Core Infrastructure","color":"#06b6d4"}'
```

### Create a Ticket

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"project_id":"p-123","title":"Fix bug","priority":"high","story_points":3}'
```

## Project Structure

```
src/
├── controllers/      # Request handlers
├── services/         # Business logic
├── repositories/     # Data access layer
├── routes/          # Route definitions
├── middleware/      # Express middleware
├── database/        # Database client and migrations
├── types.ts         # TypeScript types and DTOs
├── di-container.ts  # TypeDI setup
├── app.ts           # Express app
└── index.ts         # Entry point
```
