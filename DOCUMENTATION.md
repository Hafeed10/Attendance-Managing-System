# EduTrack Portal & API Documentation

Welcome to the **EduTrack Attendance Management System**! This documentation details the modular structure, REST API specifications, and premium portal features of both the **Faculty Portal** and the newly revamped **Parent Portal**.

The system has been configured with a unified backend supporting both portals, utilizing **Direct Access** by default to allow seamless local demonstration.

---

## 📂 File Directory Structure

All core implementations are modular and self-contained:

```text
├── backend/
│   ├── server.js                 # Unified Express API server, databases, & seeders
│   └── package.json              # Backend node dependencies
└── frontend/
    ├── public/
    │   └── index.html            # HTML entry point (loads Tailwind & Google Fonts)
    └── src/
        ├── App.js                # React Router core configuration (default to /parents)
        ├── index.css             # Global typography defaults
        └── pages/
            ├── faculty/
            │   ├── Faculty.js    # Interactive Faculty Portal component
            │   └── Faculty.css   # Custom CSS transitions & print layouts
            └── parents_page/
                ├── Parents.js    # Interactive Parent Portal component
                └── Parents.css   # Chat bubble layouts, glow effects, & scale-ins
```

---

## 🌐 Unified Backend REST API Specifications

The Express backend runs on `http://localhost:5001`. It compiles statistics dynamically off an in-memory database seeded with **30 days of high-fidelity daily attendance history** (excluding weekends). 

Ryan Kade (`STD002`) is seeded as a student in `CS-112`, which allows the Parent Portal to dynamically compute attendance ratios that perfectly align with what's marked by the faculty!

### 🔒 Global Authentication
* **`POST /api/login`**
  * **Description**: Verifies user logins and returns JWT authorization tokens.

### 👤 Faculty API Endpoints
* **`GET /api/faculty/profile`** - Retrieves profile details for `Prof. Sarah Jenkins` (`FAC001`).
* **`GET /api/classes`** & **`GET /api/subjects`** - Metadata lookups.
* **`GET /api/students/class/:classId`** - Retrieves enrolled student checklists.
* **`GET /api/attendance/sessions`** - Fetches chronological logs of past attendance sheets.
* **`POST /api/attendance/submit`** - Submits a new date-wise attendance sheet.
* **`PUT /api/attendance/update/:sessionId`** - Modifies marked presence states in a past session.
* **`DELETE /api/attendance/delete/:sessionId`** - Removes a session, recalculating averages immediately.
* **`GET /api/students/dashboard/:studentId`** - Single student dial gauges, subject lists, and daily history charts.
* **`GET /api/temp-access/active`** - Live temporary course access countdown indicators.
* **`GET /api/reports/defaulters`** - Filters all students with attendance `< 80%`.

### 👨‍👩‍👦 Parent API Endpoints
* **`GET /api/parent/student`**
  * **Description**: Retrieves details for the parent's child (`Ryan Kade`, ID `STD002`, Class `CS-112`).
* **`GET /api/parent/attendance`**
  * **Description**: Dynamically calculates Ryan's attendance stats (overall percentage, subject breakdowns, and 30-day daily grids) directly off the main session database.
* **`GET /api/parent/messages`**
  * **Description**: Retrieves advisory alerts and teacher logs (e.g., alert regarding Ryan's Physics attendance at 76%).
* **`POST /api/parent/messages/send`**
  * **Description**: Sends a message reply back to the teacher, appending it to the message log.
* **`GET /api/parent/leave-requests`**
  * **Description**: Lists previously submitted academic leave requests.
  * **Response Schema**:
    ```json
    [
      {
        "id": "LV001",
        "startDate": "2026-05-12",
        "endDate": "2026-05-13",
        "reason": "Medical Checkup (Dental)",
        "status": "Approved",
        "appliedDate": "2026-05-10",
        "attachment": "dental_slip.pdf"
      }
    ]
    ```
* **`POST /api/parent/leave-requests/submit`**
  * **Description**: Registers a new leave request (status is marked as `Pending` by default).

---

## 🎨 Immersive Frontend Portal Tabs

### 👨‍🏫 1. Faculty Portal (`/faculty`)
* **Overview**: Quick stats cards (subjects, overall average, total defaulters) and dynamic alert banners.
* **Mark Attendance**: Interactive checklists, bulk mark toggles, and date selectors.
* **Attendance Logs**: Tabular logs of past sheets with inline record editors and quick deletes.
* **Student Insights**: Complete circular attendance gauge indicators and subject bar metrics.
* **Reports & Defaulters**: Printable student spreadsheets equipped with custom official signature blocks.

### 🏠 2. Parent Portal (`/parents` - Primary Showcase)
* **Overview**: Dynamic radial progress dial indicating Ryan's overall attendance (86%), stats cards (Overall, Missed Lectures, Unread Warnings), and a pulsing warning alert card if any course (e.g. Physics) falls below 80%.
* **Subject Performance**: Visual progress meters detailing subject performance (Computer Science 88%, Mathematics 94%, Physics 76%).
* **Lecture Calendar**: Responsive monthly grid cells color-coded for fast review (Present in green, Absent in red) with filters by subject.
* **Teacher Messenger**: Discussion boards displaying chronological chat logs with advisor `Prof. Sarah Jenkins` with an active input replying form.
* **Leave Requests**: Application forms (Dates, details, attachments) coupled with dynamic review history cards.

---

## ⚙️ Running the Applications Locally

Follow these quick commands to spin up the system:

```bash
# 1. Install all dependencies
npm run install-all

# 2. Launch both servers concurrently
npm start
```
*(Bypasses credentials, immediately launching the Portal Dashboard on http://localhost:3000)*
