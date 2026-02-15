<p align="center">
  <img src="https://img.shields.io/badge/SafeGuard-AI-0EA5E9?style=for-the-badge&logo=shield&logoColor=white" alt="SafeGuard AI" />
  <img src="https://img.shields.io/badge/YOLOv8-Computer%20Vision-FF6F00?style=for-the-badge&logo=opencv&logoColor=white" alt="YOLOv8" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

<h1 align="center">🛡️ SafeGuard AI — PPE Compliance Monitor</h1>

<p align="center">
  <strong>Real-time Personal Protective Equipment detection & compliance monitoring powered by YOLOv8, OpenCV, and Face Recognition</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

---

## 📖 Overview

**SafeGuard AI** is an intelligent workplace safety monitoring system that uses computer vision to detect PPE compliance in real-time. It processes multi-camera video feeds, identifies workers via face recognition, detects safety gear (helmets & high-visibility vests) using YOLOv8 + HSV color analysis, and provides a comprehensive dashboard for safety officers.

> **Why SafeGuard AI?** Traditional safety monitoring relies on manual inspections. SafeGuard AI automates this process with AI-powered detection, reducing human error and enabling 24/7 monitoring across multiple zones simultaneously.

---

## ✨ Features

### 🎯 Core Detection
| Feature | Description |
|---------|-------------|
| **YOLOv8 Person Detection** | Detects people in video frames using Ultralytics YOLOv8 Nano model |
| **PPE Compliance Check** | HSV color-space analysis to verify helmet & vest presence |
| **Face Recognition** | Identifies registered workers using `dlib`-based face encodings |
| **Multi-Camera Support** | Simultaneous processing of 3+ camera feeds with threaded pipelines |

### 📊 Dashboard & Analytics
| Feature | Description |
|---------|-------------|
| **Real-time Dashboard** | Live stats — people tracked, FPS, compliance rate, active violations |
| **Live Monitoring** | MJPEG video stream with annotated bounding boxes & PPE status |
| **Violations Log** | Searchable, filterable log with snapshots & severity levels |
| **Analytics Panel** | Zone-wise breakdown, violation trends, severity distribution |
| **CSV Export** | One-click export of violation data for reporting |

### 🔐 Security & Access Control
| Feature | Description |
|---------|-------------|
| **Firebase Authentication** | Google Sign-In + Email/Password login |
| **Role-Based Access (RBAC)** | `Admin`, `Staff`, and `Viewer` roles with granular permissions |
| **User Management** | Admins can invite users and assign roles |
| **Firestore Integration** | User profiles & roles stored in Firestore |

### ⚙️ System Configuration
| Feature | Description |
|---------|-------------|
| **Zone-Based PPE Rules** | Define different PPE requirements per zone |
| **Camera Source Config** | Switch between file, RTSP, or webcam feeds |
| **Detection Sensitivity** | Adjustable confidence thresholds |
| **Dark Mode** | Full dark/light theme support |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| ![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white) | Core backend language |
| ![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white) | REST API framework |
| ![OpenCV](https://img.shields.io/badge/OpenCV-4.x-5C3EE8?logo=opencv&logoColor=white) | Image/video processing |
| ![YOLOv8](https://img.shields.io/badge/Ultralytics-YOLOv8-FF6F00?logo=yolo&logoColor=white) | Object detection model |
| ![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite&logoColor=white) | Local database (violations, metrics, workers) |
| `face_recognition` | dlib-based facial encoding & matching |

### Frontend
| Technology | Purpose |
|-----------|---------|
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) | UI framework |
| ![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white) | Build tool & dev server |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white) | Utility-first CSS |
| ![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?logo=firebase&logoColor=black) | Auth & Firestore |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-0055FF?logo=framer&logoColor=white) | Animations |
| `lucide-react` | Icon library |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SAFEGUARD AI                             │
├─────────────────────────┬───────────────────────────────────────┤
│                         │                                       │
│   ┌─────────────────┐   │   ┌─────────────────────────────────┐ │
│   │  React Frontend │   │   │       Flask Backend             │ │
│   │  (Vite + TW)    │   │   │                                 │ │
│   │                 │   │   │  ┌───────────┐  ┌────────────┐  │ │
│   │  • Dashboard    │◄──┼──►│  │ REST API  │  │  MJPEG     │  │ │
│   │  • Monitoring   │   │   │  │ /api/*    │  │  Streaming │  │ │
│   │  • Analytics    │   │   │  └─────┬─────┘  └──────┬─────┘  │ │
│   │  • Violations   │   │   │        │               │        │ │
│   │  • Settings     │   │   │  ┌─────▼───────────────▼─────┐  │ │
│   └─────────────────┘   │   │  │   Video Processor (x3)    │  │ │
│                         │   │  │   Threaded per camera      │  │ │
│   ┌─────────────────┐   │   │  └─────┬───────────────┬─────┘  │ │
│   │    Firebase      │   │   │        │               │        │ │
│   │  • Auth (Google) │   │   │  ┌─────▼─────┐  ┌─────▼─────┐  │ │
│   │  • Firestore     │   │   │  │  YOLOv8   │  │   Face    │  │ │
│   │  • User Roles    │   │   │  │  Detector  │  │   Recog.  │  │ │
│   └─────────────────┘   │   │  └───────────┘  └───────────┘  │ │
│                         │   │        │                        │ │
│                         │   │  ┌─────▼─────────────────────┐  │ │
│                         │   │  │  SQLite DB (WAL mode)     │  │ │
│                         │   │  │  violations │ metrics │    │  │ │
│                         │   │  │  workers   │ settings │    │  │ │
│                         │   │  └───────────────────────────┘  │ │
│                         │   └─────────────────────────────────┘ │
└─────────────────────────┴───────────────────────────────────────┘
```

### Detection Pipeline

```
Camera Feed ──► Video Processor ──► YOLOv8 (Person Detection)
                     │                        │
                     │                  ┌─────▼──────┐
                     │                  │ Person ROI │
                     │                  └─────┬──────┘
                     │                        │
                     │              ┌─────────▼─────────┐
                     │              │  HSV Color Check   │
                     │              │  • Head (top 25%)  │
                     │              │    → Helmet check  │
                     │              │  • Torso (15-70%)  │
                     │              │    → Vest check    │
                     │              └─────────┬─────────┘
                     │                        │
                     │              ┌─────────▼─────────┐
                     │              │  Compliant / Vio.  │
                     │              └─────────┬─────────┘
                     │                        │
                     ▼                        ▼
              Annotated Frame         DB + Snapshot Log
              (MJPEG Stream)          (if violation)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`
- **Firebase Project** (for authentication)
- **Webcam or video files** for testing

### 1. Clone the Repository

```bash
git clone https://github.com/Akshaykumar-B/safeguard-ai-ppe-monitor.git
cd safeguard-ai-ppe-monitor
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install flask flask-cors opencv-python ultralytics numpy firebase-admin

# Optional: Face recognition support
pip install face_recognition dlib

# Run the backend
python app.py
```

> The backend starts at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> The frontend starts at `http://localhost:5173`

### 4. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Google Sign-In** under Authentication → Sign-in method
3. Create a **Firestore Database**
4. Update `frontend/src/firebase.js` with your config
5. Place your Firebase Admin SDK key in the backend (for server-side auth)

### 5. Video Sources

By default, the system looks for video files in the project root:
- `Assembly Line A-Cam 01.mp4`
- `Dock Area-Cam 02.mp4`
- `upstairs-Cam 03.mp4`

You can also configure **webcam** or **RTSP** sources in the Settings page.

---

## 📡 API Reference

### Health & Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/metrics` | Real-time detection metrics (tracked, violations, FPS) |

### Workers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/workers` | — | List all workers |
| `POST` | `/api/workers` | Admin | Add a new worker |
| `DELETE` | `/api/workers/:id` | Admin | Remove a worker |

### Violations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/violations` | — | Get recent violations (max 50) |
| `PUT` | `/api/violations/:id` | Staff+ | Update violation status |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | Get unread alerts |
| `PUT` | `/api/alerts/:id/read` | Mark alert as read |
| `DELETE` | `/api/alerts/:id` | Dismiss alert |

### Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings` | — | Get app configuration |
| `PUT` | `/api/settings` | Admin | Update configuration |

### Detection & Streaming

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/detect` | Upload image for PPE detection |
| `GET` | `/video_feed/:cam_id` | MJPEG live video stream |

---

## 📁 Project Structure

```
safeguard-ai-ppe-monitor/
│
├── backend/
│   ├── app.py                      # Flask API server & route definitions
│   ├── video_processor.py          # Threaded video processing pipeline
│   ├── yolo_logic.py               # YOLOv8 detection + HSV PPE analysis
│   ├── face_recognition_engine.py  # Face encoding & recognition engine
│   ├── firebase_auth.py            # Firebase Admin SDK auth middleware
│   ├── yolov8n.pt                  # YOLOv8 Nano pre-trained weights
│   ├── best.pt                     # Custom-trained model weights
│   ├── face_data/                  # Face encodings & reference images
│   ├── snapshots/                  # Violation snapshot images
│   └── uploads/                    # Uploaded images for detection
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main app with role-based routing
│   │   ├── firebase.js             # Firebase configuration
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication & RBAC logic
│   │   │   └── AppContext.jsx      # Global app state management
│   │   ├── pages/
│   │   │   ├── DashboardScreen.jsx     # Safety overview dashboard
│   │   │   ├── LiveMonitoringScreen.jsx # Real-time camera feeds
│   │   │   ├── AnalyticsScreen.jsx     # Violation analytics & trends
│   │   │   ├── ViolationsLogScreen.jsx # Searchable violations log
│   │   │   ├── WorkersScreen.jsx       # Worker management
│   │   │   ├── SettingsScreen.jsx      # System configuration
│   │   │   ├── UserManagementScreen.jsx # User roles & invitations
│   │   │   └── LoginScreen.jsx         # Authentication page
│   │   └── components/
│   │       ├── Sidebar.jsx         # Navigation sidebar
│   │       ├── Header.jsx          # Page header with alerts
│   │       ├── ProtectedRoute.jsx  # RBAC route guard
│   │       └── Toast.jsx           # Notification toasts
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── firestore.rules                 # Firestore security rules
└── README.md
```

---

## 🔒 Role-Based Access Control

| Permission | Admin | Staff | Viewer |
|-----------|:-----:|:-----:|:------:|
| Dashboard | ✅ | ✅ | ✅ |
| Live Monitoring | ✅ | ✅ | ✅ |
| Worker Management | ✅ | ❌ | ❌ |
| Face Dataset Upload | ✅ | ❌ | ❌ |
| Violation Logs | ✅ | ✅ | ✅ |
| Acknowledge Violations | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |

---

## 🤖 ML Models Used

### 1. YOLOv8 Nano (`yolov8n.pt`)
- **Purpose:** Real-time person detection in video frames
- **Source:** Ultralytics pre-trained on COCO dataset
- **Class Used:** Class `0` (Person) only
- **Confidence Threshold:** `0.15` (tuned for detecting smaller/distant subjects)

### 2. HSV Color-Space Analysis
- **Purpose:** PPE (helmet & vest) detection via color segmentation
- **Helmet Colors:** Yellow (Hue 20–40), White (low saturation, high value)  
- **Vest Colors:** Orange (Hue 0–20), Neon Green (Hue 35–85)
- **Detection Regions:** Head = top 25% of person ROI, Torso = 15–70%

### 3. Face Recognition (`dlib` + `face_recognition`)
- **Purpose:** Identify registered workers from camera feeds
- **Method:** 128-dimensional face embeddings via HOG + Linear SVM
- **Storage:** Pickle-serialized encoding files

---

## 🔧 Configuration

Key settings can be adjusted via the **Settings** page or directly in the code:

| Setting | Default | Location |
|---------|---------|----------|
| Violation Cooldown | 15 seconds | `video_processor.py` |
| Detection Confidence | 0.15 | `yolo_logic.py` |
| Helmet Color Threshold | 3% pixel match | `yolo_logic.py` |
| Vest Color Threshold | 3% pixel match | `yolo_logic.py` |
| Max Stored Violations | 10 | `app.py` |
| Metrics Update Interval | 2 seconds | `app.py` |

---

## 📊 How It Works

1. **Video Capture** — Each camera feed runs in a separate daemon thread via `VideoProcessor`
2. **Person Detection** — YOLOv8 identifies all people in each frame (class 0, COCO)
3. **PPE Analysis** — For each detected person:
   - Head region (top 25%) is checked for helmet colors via HSV masks
   - Torso region (15–70%) is checked for vest colors via HSV masks
4. **Violation Logging** — Non-compliant detections are logged to SQLite with a snapshot image
5. **Live Streaming** — Annotated frames are served as MJPEG streams to the frontend
6. **Dashboard Updates** — Metrics are polled every 2 seconds and displayed in real-time

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

<p align="center">
  <img src="https://github.com/Akshaykumar-B.png" width="120" height="120" style="border-radius: 50%;" alt="Akshaykumar B" />
</p>

<p align="center">
  <strong>Akshaykumar B</strong><br/>
  <a href="https://github.com/Akshaykumar-B">
    <img src="https://img.shields.io/badge/GitHub-Akshaykumar--B-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---

<p align="center">
  <strong>Built with ❤️ for workplace safety</strong>
</p>
