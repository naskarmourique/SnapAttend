# 📸 SnapAttend

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![DeepFace](https://img.shields.io/badge/AI-DeepFace-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://github.com/serengil/deepface)
[![FaceNet](https://img.shields.io/badge/Model-FaceNet512-blue?style=for-the-badge)](https://arxiv.org/abs/1503.03832)

**SnapAttend** is a high-precision, real-time facial recognition attendance system designed for modern institutions. It combines state-of-the-art AI models with a sleek, liquid-glass UI to provide a seamless attendance experience.

---

## ✨ Key Features

- 🎯 **High-Accuracy Biometrics**: Powered by **Facenet512** and **RetinaFace** for industry-leading precision.
- ⚡ **Real-Time Recognition**: Ultra-fast live detection using optimized preprocessing pipelines.
- 📸 **Biometric Burst Mode**: Captures multiple samples during registration to create a robust "Master Embedding" for every student.
- 📊 **Live Analytics**: Instant dashboard updates for daily and monthly attendance rates.
- 🌓 **Neon Liquid UI**: A beautiful, modern interface with dark/light mode support and fluid animations.
- 🛡️ **Anti-Spoofing**: Built-in liveness detection to prevent photo-based attendance fraud.

---

## 🛠️ Tech Stack

### Backend (Python)
- **FastAPI**: High-performance web framework.
- **DeepFace**: AI wrapper for Facenet512 & RetinaFace.
- **SQLAlchemy**: Secure database management (MySQL/SQLite).
- **OpenCV**: Real-time image processing & enhancement.

### Frontend (TypeScript)
- **React**: Component-based UI library.
- **Tailwind CSS**: Modern utility-first styling.
- **Framer Motion**: Smooth, high-performance animations.
- **Vite**: Lightning-fast build tool.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- A working webcam

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
SnapAttend/
├── backend/            # FastAPI Server & AI Logic
│   ├── models/         # Database Schemas
│   ├── services/       # Face & Attendance Logic
│   └── uploads/        # Biometric Data (Ignored by Git)
├── frontend/           # React + Vite Application
│   ├── src/components/ # Reusable UI Elements
│   └── src/pages/      # Dashboard, Registration, etc.
└── start_snapattend.bat # Quick-start script
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

<p align="center">Made with ❤️ for modern education</p>
