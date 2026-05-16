# 📸 SnapAttend - AI-Powered Biometric Attendance (v3.2.5)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![AI-DeepFace](https://img.shields.io/badge/AI-DeepFace-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://github.com/serengil/deepface)
[![Version](https://img.shields.io/badge/Release-v3.2.5-blue?style=for-the-badge)](https://github.com/naskarmourique/SnapAttend)

**SnapAttend** is a production-ready, high-precision facial recognition attendance system. Built with a professional "Neon Liquid" aesthetic, it combines advanced AI biometric security with a streamlined user experience for both administrators and students.

---

## ✨ v3.2.5 Key Enhancements

### 🛡️ Biometric Security & Integrity
- **Face Duplication Prevention:** Intelligent scanning during registration blocks duplicate face profiles across the database.
- **Personal Scan Mode:** Students can strictly mark only their own attendance; the system ignores unauthorized biometric profiles in the student portal.
- **Liveness Detection:** Integrated anti-spoofing logic to prevent photo-based biometric fraud.

### 👥 Role-Based Access Control (RBAC)
- **Administrative Portal:** Complete system overview, student management, and manual attendance overrides (Mark Today / Void Log).
- **Student Biometric Portal:** Privacy-locked dashboard showing personal stats, high-contrast attendance calendar, and self-service scanning.
- **Dynamic Navigation:** Sidebar automatically adjusts based on the authenticated role (Admin vs. Student).

### 🚀 Performance & UI
- **Zero-Lag Camera:** Optimized background AI processing pipeline for ultra-smooth 60FPS video feed while running complex neural networks.
- **Neon Liquid UI:** Professional glassmorphism design with solid high-contrast LED-style indicators for attendance tracking.
- **Smart Calendar:** Intelligent logic that tracks attendance from the exact registration date and automatically excludes weekends.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy (MySQL), DeepFace (Facenet512 & RetinaFace).
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI.
- **Database:** MySQL for student profiles and attendance logs.

---

## 🚀 Getting Started

1. **Prerequisites:** Python 3.10+, Node.js 18+.
2. **Setup:**
   ```bash
   # Backend
   cd backend && pip install -r requirements.txt
   
   # Frontend
   cd frontend && npm install
   ```
3. **Run:** Execute `start_snapattend.bat` in the root directory.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

<p align="center"><b>SnapAttend v3.2.5 - Attendance Redefined by AI Precision</b></p>
