# Web Generator

A Node.js/TypeScript web application with PostgreSQL database integration.

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
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=web_generator
   DB_USER=postgres
   DB_PASSWORD=your_password_here
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

## Database API Endpoints

The application includes several database-related endpoints for monitoring and testing:

- `GET /db/health` - Check database connection health and pool status
- `GET /db/version` - Get PostgreSQL version information
- `GET /db/tables` - List all tables in the current database

## Project Structure

```
src/
├── controllers/
│   ├── database.controller.ts    # Database API endpoints
│   ├── health.controller.ts      # Health check endpoints
│   └── web_generator.ts          # Web generator endpoints
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
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `web_generator` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | (required) |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
