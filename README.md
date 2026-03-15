# Student Management System
React + ASP.NET Core + PostgreSQL

---

## Quick Start

### Step 1 — Database Setup
1. Open pgAdmin 4 (or psql)
2. Create a new database: `student_db`
3. Run `database/schema.sql` → creates all 5 tables
4. Run `database/stored_procedures.sql` → creates all stored procedures

### Step 2 — Backend (ASP.NET Core)
```bash
cd backend

# Edit appsettings.json — change the password to match your PostgreSQL
# "DefaultConnection": "...Password=yourpassword"

dotnet restore          # download NuGet packages
dotnet run              # start API on http://localhost:5000
```
Open http://localhost:5000/swagger to test endpoints in the browser.

**Register your first admin user:**
Use Swagger or Thunder Client to POST to `/api/auth/register`:
```json
{ "username": "admin", "password": "yourpassword" }
```

### Step 3 — Frontend (React)
```bash
cd frontend
npm install             # download node_modules
npm run dev             # start React on http://localhost:5173
```
Open http://localhost:5173 in your browser and log in.

---

## Project Structure
```
student-management-system/
├── database/
│   ├── schema.sql              ← Run first — creates tables
│   └── stored_procedures.sql  ← Run second — creates procedures
│
├── backend/                   ← ASP.NET Core Web API (C#)
│   ├── Controllers/            ← HTTP endpoints
│   ├── Models/                 ← C# classes matching DB tables
│   ├── Services/               ← Business logic + DB calls
│   ├── Program.cs              ← App startup and config
│   └── appsettings.json        ← DB connection string + JWT config
│
└── frontend/                  ← React app (Vite)
    └── src/
        ├── pages/              ← Full page components
        │   ├── LoginPage.jsx
        │   ├── StudentsPage.jsx
        │   ├── CoursesPage.jsx
        │   └── EnrollmentsPage.jsx
        ├── services/
        │   └── api.js          ← All axios API call functions
        ├── App.jsx             ← Router setup + NavBar
        └── main.jsx            ← React entry point
```

---

## Both Servers Must Run at the Same Time

| Terminal | Folder     | Command             | URL                        |
|----------|------------|---------------------|----------------------------|
| Tab 1    | `backend/` | `dotnet watch run`  | http://localhost:5000       |
| Tab 2    | `frontend/`| `npm run dev`       | http://localhost:5173       |

---

## API Endpoints Reference

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/auth/register              | Register admin user      |
| POST   | /api/auth/login                 | Login → returns JWT      |
| GET    | /api/students                   | Get all students         |
| GET    | /api/students/{id}              | Get one student          |
| POST   | /api/students                   | Add student              |
| PUT    | /api/students/{id}              | Update student           |
| DELETE | /api/students/{id}              | Delete student           |
| GET    | /api/courses                    | Get all courses          |
| POST   | /api/courses                    | Add course               |
| DELETE | /api/courses/{id}               | Delete course            |
| GET    | /api/enrollments/student/{id}   | Get student's courses    |
| POST   | /api/enrollments                | Enroll student           |
| GET    | /api/enrollments/grades/{id}    | Get student grades       |
| POST   | /api/enrollments/grades         | Assign grade             |

---

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| CORS error in browser | Check `app.UseCors("AllowReact")` is in `Program.cs` |
| 401 Unauthorized | Login first via `/api/auth/login` — store the token |
| `relation does not exist` | Run `schema.sql` in pgAdmin first |
| Connection refused | Check PostgreSQL is running on port 5432 |
| `password invalid` | Update password in `appsettings.json` |
| React state not updating | Call `fetchStudents()` again after add/edit/delete |
