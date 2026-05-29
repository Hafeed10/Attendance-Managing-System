# Attendance Managing System - Admin Backend API

This repository contains the backend Express/Node.js application for the Admin Panel of the Attendance Managing System.

## Architecture

We are using a standard **Model-View-Controller (MVC)** architecture without the "View" (since the frontend team handles that). 
- **Database**: MariaDB / MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt

## For the Team: How to Connect and Run

If you are just pulling this code, follow these steps to get the server running on your machine:

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Setup the Database Connection
1. Duplicate the `.env.example` file and rename it to `.env`.
2. Ensure you have MySQL or MariaDB running on your machine.
3. Open your database (via terminal or a GUI tool like phpMyAdmin/DBeaver) and run this SQL command:
   ```sql
   CREATE DATABASE IF NOT EXISTS attendance_system;
   ```
4. Update the `.env` file with your local database username and password (default is usually user: `root`, password: ``).

### 3. Start the Server
Run the development server using nodemon:
```bash
npm run dev
```

> **Note**: When you run the server for the first time, Sequelize will automatically `sync` and generate all the database tables based on our Models! It will also automatically create a super admin account (`admin@school.com` / `admin123`) so you can log in immediately.

---

## For the Product Manager: Implementation Summary

This backend currently successfully implements **Phase 1 (Setup & Database Design)**, **Phase 2 (Security)** and the beginnings of **Phase 3 (Core CRUD)** as requested in the PRD.

### Implemented Features:
- **Database Schemas**: Designed and created relational models for `User`, `Faculty`, and `Student`.
- **JWT Authentication Flow**: Endpoints are secured. Only users with an `admin` role in their JWT can access the management routes.
- **Admin Management APIs**: Built endpoints to add Faculty and Students which successfully parse JSON bodies and insert rows into the database.

### API Routes Available:
| Method | Route | Description | Protection |
|--------|-------|-------------|------------|
| `GET` | `/` | Health check / Welcome route | Public |
| `POST` | `/api/login` | Login for all users, returns JWT token | Public |
| `POST` | `/api/admin/faculty` | Add a new Faculty member | Admin Only |
| `POST` | `/api/admin/student` | Add a new Student | Admin Only |

### Next Steps:
- Build out the endpoints for Edit/Delete on Faculty and Students.
- Create schemas and logic for tracking daily Attendance.
