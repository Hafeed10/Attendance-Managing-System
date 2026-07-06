# 📊 Edu-Tracker: Smart Attendance & Progress Management System

> [!IMPORTANT]
> This is a **Desktop Application** built with **Python 3.12** using **Tkinter** for the GUI. It does not use any backend databases like MySQL or Supabase. All data is stored in local CSV files for simplicity and offline access.

Edu-Track is a comprehensive desktop application designed to streamline attendance tracking and student progress monitoring. It provides an intuitive interface for teachers and administrators to manage student information, record daily attendance, and generate detailed reports.

## ✨ Key Features

### 👤 Student Management
- **Add & Edit Students**: Register new students with their photo, class, division, roll number, name, and parent details.
- **Student List**: Maintain a searchable list of all students with their complete information.
- **Profile Photos**: Upload and view student profile pictures.

### 📅 Attendance Tracking
- **Simple Interface**: Mark attendance (Present/Absent) for the entire class in a few clicks.
- **Date Management**: Automatic date tracking with a user-friendly calendar interface.
- **Edit Past Attendance**: Easily correct attendance records for previous dates.

### 📈 Progress Monitoring
- **Classwise Reports**: Generate attendance and behavior reports for specific classes.
- **Student Details**: View detailed attendance history and personal information for each student.

### 📁 Data Management
- **CSV Storage**: All data is securely stored in local CSV files (no database required).
- **Backup & Restore**: Create backups of your data and restore them when needed.
- **Clear Data**: Option to clear all existing data and start fresh.

## 🚀 Quick Start

### Prerequisites
- **Python 3.12** or higher
- **Pillow** library (`pip install Pillow`)

### Installation
1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd Edu-Tracker
   ```

2. Install dependencies:
   ```bash
   pip install Pillow
   ```

### Running the Application
1. Open your terminal or command prompt.
2. Navigate to the project directory.
3. Run the main script:
   ```bash
   python Attendance_Main.py
   ```

## 📂 Project Structure

```
Edu-Tracker/
├── Attendance_Main.py         # Main application entry point
├── Admin_Menu.py              # Admin dashboard and navigation
├── student_management.py      # Student information management
├── class_management.py      # Class and division management
├── attendance_marking.py    # Attendance tracking interface
├── student_reports.py         # Student reports and statistics
├── Data/                      # Data storage directory
│   ├── students.csv
│   ├── classes.csv
│   ├── attendance.csv
│   └── student_images/      # Student profile pictures
└── README.md                  # Project documentation
```

## 🤝 How to Use

### 1. Admin Menu (Main Dashboard)
- **Login**: Enter the default password `Admin123` to access the admin panel.
- **Navigation**: Choose from:
  - Manage Students
  - Manage Classes & Divisions
  - Mark Attendance
  - View Student Reports
  - Data Settings

### 2. Manage Students
- **Add Student**: Fill the form to add new students.
- **Upload Photo**: Browse and select a profile picture for the student.
- **View List**: See all students with their complete details.

### 3. Manage Classes & Divisions
- **Add Class**: Create new classes (e.g., "10th", "12th").
- **Add Division**: Create divisions within a class (e.g., "A", "B", "C").

### 4. Mark Attendance
1. Select the **Class** and **Division**.
2. Choose the **Date** using the calendar popup.
3. Mark each student as **Present** or **Absent**.
4. Click **Submit** to save the records.

### 5. View Student Reports
1. Select the **Class** and **Division**.
2. Click **Generate Report**.
3. View detailed attendance history and statistics for all students in that class.

### 6. Data Settings
- **Backup Data**: Create a backup of all data files.
- **Restore Data**: Restore data from a previous backup.
- **Clear Data**: Delete all existing data (use with caution!).

## 🛠️ Technology Stack

- **Language**: Python 3.12
- **GUI Framework**: Tkinter
- **Image Processing**: Pillow
- **Data Storage**: CSV files

## 📁 Data Storage

The application uses CSV files to store all data locally:
- `Data/students.csv`: Stores student information (ID, name, class, roll number, etc.)
- `Data/classes.csv`: Stores class and division details
- `Data/attendance.csv`: Stores attendance records with date and status
- `Data/student_images/`: Directory containing student profile pictures

## 🔐 Security

- **Password Protection**: Admin login requires a password.
- **Data Privacy**: All data is stored locally on the user's device.
- **No Cloud Storage**: No external servers or cloud services are used.

## 📝 License

This project is developed for educational purposes and can be used freely.

## 👨‍💻 Developers

- [Your Name/Team Name]

## 🤝 Contributing

Contributions are welcome! Please feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions or issues, please open an issue in the GitHub repository.

---

Made with ❤️ for Education
