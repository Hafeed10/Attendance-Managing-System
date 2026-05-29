# Attendance Managing System - Admin Backend API

This backend provides the Admin Panel API for the Attendance Managing System.

## Architecture
- **Server**: Node.js + Express
- **ORM**: Sequelize
- **Database**: MySQL / MariaDB
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, rate limiting, CORS

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and set your database credentials.

Example values:
```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendance_system
DB_DIALECT=mysql
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=8h
PORT=5001
NODE_ENV=development
```

### 3. Create the database
```sql
CREATE DATABASE IF NOT EXISTS attendance_system;
```

### 4. Start the server
```bash
npm run dev
```

The backend starts on `http://localhost:5001`.

When the server starts for the first time, it will automatically create a default admin user if none exists:
- Email: `admin@school.com`
- Password: `admin123`

## API Overview

### Authentication
- `POST /api/login`
  - Body: `{ "email": "admin@school.com", "password": "admin123" }`
  - Returns a JWT token.

### Admin Routes
All admin endpoints require `Authorization: Bearer <token>`.

#### Faculty Management
- `POST /api/admin/faculty`
  - Validates faculty creation payload.
- `GET /api/admin/faculty`
- `GET /api/admin/faculty/:id`
- `PUT /api/admin/faculty/:id`
  - Validates faculty update payload.
- `DELETE /api/admin/faculty/:id`

#### Student Management
- `POST /api/admin/student`
  - Validates student creation payload.
- `GET /api/admin/student`
- `GET /api/admin/student/:id`
- `PUT /api/admin/student/:id`
  - Validates student update payload.
- `DELETE /api/admin/student/:id`

#### Class Management
- `POST /api/admin/class`
  - Validates class creation payload.
- `GET /api/admin/class`
- `GET /api/admin/class/:id`
- `PUT /api/admin/class/:id`
  - Validates class update payload.
- `DELETE /api/admin/class/:id`

#### Subject Management
- `POST /api/admin/subject`
  - Validates subject creation payload.
- `GET /api/admin/subject`
- `GET /api/admin/subject/:id`
- `PUT /api/admin/subject/:id`
  - Validates subject update payload.
- `DELETE /api/admin/subject/:id`

#### Temporary Access Management
- `POST /api/admin/temporary-access`
  - Validates temporary access creation payload.
- `GET /api/admin/temporary-access`
- `GET /api/admin/temporary-access/:id`
- `PUT /api/admin/temporary-access/:id`
  - Validates temporary access update payload.
- `DELETE /api/admin/temporary-access/:id`

#### Audit Logs
- `GET /api/admin/audit-logs`

#### Report Generation
- `POST /api/admin/reports/class-monthly`
  - Validates class report payload.
- `POST /api/admin/reports/student-monthly`
  - Validates student report payload.
- `POST /api/admin/reports/defaulters`
  - Validates defaulter report payload.
- `GET /api/admin/reports`
- `GET /api/admin/reports/download/:fileName`

## Notes
- Request validation is enforced on all create/update admin routes.
- Invalid request bodies return `400 Validation Error` with detailed messages.
- Admin routes are protected by JWT and role checks.

## Status
The backend now supports:
- Admin user and role-based authentication
- Faculty, Student, Class, Subject CRUD
- Temporary faculty access assignments
- Audit log streaming
- Report generation endpoints with PDF support

## Useful commands
```bash
cd backend
npm run dev
```
