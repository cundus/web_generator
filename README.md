# Web Generator

A Node.js/TypeScript web application with PostgreSQL integration that generates and deploys websites via v0.dev and Vercel.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Create Database

```sql
CREATE DATABASE web_generator;
```

### 3. Environment Configuration

1. Copy the environment template:
   - macOS/Linux:
     ```bash
     cp .env.example .env
     ```
   - Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```

2. Update the `.env` file with your credentials:
   ```env
   # API
   API_KEY=your_api_key_here

   # External services
   V0_API_KEY=your_v0_key
   VERCEL_API_KEY=your_vercel_token

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=web_generator
   DB_USER=postgres
   DB_PASSWORD=your_password_here

   # App (optional)
   NODE_ENV=development
   PORT=3000
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication

All API endpoints require an API key.

- Provide it in header: `X-API-Key: <your_api_key>`
- Or as a query param: `?api_key=<your_api_key>`

Set the server-side key in `.env` as `API_KEY=...`.

## API Endpoints

The application exposes the following endpoints:

- Health
  - `GET /` - Application health/status

- Web Generator
  - `POST /web-generator/` - Test endpoint
  - `POST /web-generator/create` - Generate and deploy a website
  - `GET /web-generator/chats` - List v0.dev chats
  - `GET /web-generator/projects` - List v0.dev projects

- Database
  - `GET /db/health` - Database connection health and pool status
  - `GET /db/version` - PostgreSQL version info
  - `GET /db/tables` - List all tables in the public schema
  - `POST /db/setup` - Create `web_generator` table and indexes
  - `GET /db/web-generator` - List stored web generator records

## Project Structure

```
src/
├── controllers/
│   ├── database.controller.ts    # Database API endpoints
│   ├── health.controller.ts      # Health check endpoints
│   └── web_generator.ts          # Web generator endpoints
├── middleware/
│   └── auth.middleware.ts        # API key authentication middleware
├── services/
│   ├── database.service.ts       # PostgreSQL connection service
│   ├── v0.service.ts             # V0 API service
│   └── vercel.service.ts         # Vercel API service
└── index.ts                      # Main application entry point
```

## Database Service Features

- **Connection Pooling**: Efficient connection management with configurable pool settings
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Health Monitoring**: Built-in connection testing and pool status monitoring
- **Graceful Shutdown**: Proper cleanup of database connections on app termination
- **Environment-based Configuration**: SSL and other settings based on NODE_ENV

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | API key required for all endpoints (sent as `X-API-Key`) | (required) |
| `VERCEL_API_KEY` | Vercel API token for domain management | (required) |
| `V0_API_KEY` | v0.dev API key (used by v0-sdk) | (required) |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `web_generator` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | (required) |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |

## Postman Collection

- Import `postman_collection.json` into Postman.
- Set collection variables:
  - `base_url` (defaults to `http://localhost:3000`)
  - `api_key` to your `API_KEY` from `.env`.
- The collection is configured with collection-level `X-API-Key` auth, so all requests will include the header automatically.

### Example Request (Create Website)

```http
POST {{base_url}}/web-generator/create
Content-Type: application/json
X-API-Key: {{api_key}}

{
  "owner": "johndoe",
  "message": "Create a modern portfolio website with dark theme",
  "description": "A professional portfolio website showcasing projects and skills",
  "app_name": "portfolio"
}
```
