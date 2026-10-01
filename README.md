# 🌿 Sage Green Clinical Management & AI System (CMS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Pro%20%26%20Vision-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An integrated, full-stack clinical management platform engineered to streamline patient intake, clinical scheduling, pharmacy inventory, and doctor rosters with an anxiety-reducing **Sage Green Wellness** aesthetic and **HIPAA-grade privacy-preserving Clinical AI**.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Security & HIPAA Privacy Gateway](#-security--hipaa-privacy-gateway)
- [Directory Structure](#-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [API Documentation](#-api-documentation)
- [Contributing & Git Workflow](#-contributing--git-workflow)
- [Author & Acknowledgements](#-author--acknowledgements)

---

## 🩺 Executive Overview

Modern healthcare facilities struggle with fragmented data across disparate paper files, spreadsheets, and legacy interfaces. The **Sage Green Clinical Management System (CMS)** resolves this by unifying:
1. **Clinical Operations:** High-speed patient intake, smart calendar scheduling, and electronic case records.
2. **Pharmacy Supply Chain:** Formulations tracking, unit inventory, batch expiration alerts, and purchase orders.
3. **Clinical Intelligence:** Longitudinal chart synthesis, differential diagnosis suggestions, and medical document/ECG image inspection via Google Gemini—**without compromising patient privacy**.

---

## ✨ Key Features

### 1. 📊 Executive Dashboard (`/`)
* **Live KPI Cards:** Instant metrics for Active Patients, Scheduled Today, Pending Orders, and Low Stock alerts.
* **Today's Timeline:** Chronological consultation feed with real-time appointment status updates.
* **Quick-Action Bar:** One-click shortcuts to register patients, schedule consultations, and log restock orders.

### 2. 👥 Patient Management (`/patients`)
* **High-Density Table View:** Color-coded avatar initials, demographic age/gender badges, and contact details.
* **Real-Time Search & Filtering:** Debounced search (<400ms) with dynamic status filters.
* **Full CRUD Lifecycle:** Add, update, and manage patient profiles seamlessly.

### 3. 🗓️ Appointments & Scheduling (`/appointments`)
* **Formatted Calendar Date Tiles:** Categorized date groups (`SEP 21 MON`) with duration and time badges.
* **Consultation State Machine:** Lifecycle tracking (`Confirmed`, `In Progress`, `Completed`, `Cancelled`).
* **Conflict-Free Scheduling:** Select doctor, patient, date, and appointment category.

### 4. 🧠 Clinical AI Assistant & EMR Intelligence (`/ai-assistant`)
* **Longitudinal Chart Summary:** Synthesizes complex medical history into a structured executive narrative.
* **Differential Diagnosis:** Generates ranked clinical condition hypotheses with recommended diagnostic workups.
* **Prescription & Lab Trend Analysis:** Inspects clinical text and lab markers for contraindications and abnormal trends.
* **Gemini Vision Multi-Modal Analysis:** Analyzes uploaded medical images, prescription slips, and ECGs.

### 5. 💊 Medical Inventory & Pharmacy (`/medical-inventory`)
* **Formulation Catalog:** Supports Dilutions, Mother Tinctures, Biochemics, Tablets, and Ointments.
* **Batch & Expiry Monitoring:** Visual warnings for low stock levels and expiring batches (`YYYY-MM`).

### 6. 📦 Purchase Orders & Supply Chain (`/purchase-orders`)
* **Vendor Procurement Pipeline:** Workflow management for `Pending Approval`, `Ordered`, and `Received` supplies.
* **Direct Requisition:** Fast order generation for low-stock pharmaceutical inventory.

### 7. 👨‍⚕️ Physician Directory (`/physician`)
* **Practitioner Roster:** Doctor profiles, credentials (e.g., MBBS, BHMS, MD), specialties, and experience.
* **Consultation Metrics:** Track cumulative appointments and active cases per physician.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["React 18 + Vite Frontend\n(Sage Green Design System)"]
    API["FastAPI Asynchronous Gateway\n(Python 3.11 / Uvicorn)"]
    DB[(SQLite3 / SQLAlchemy 2.0\nclinical.db)]
    Privacy["HIPAA Privacy Gateway\n(Regex & Token De-Identifier)"]
    Gemini["Google Gemini AI\n(1.5 Flash / 1.5 Pro / Vision)"]

    Client -->|REST API Requests| API
    API -->|ORM Transactions| DB
    API -->|Clinical Text / Images| Privacy
    Privacy -->|Masked Tokens [REDACTED_...]| Gemini
    Gemini -->|AI Medical Insights| Privacy
    Privacy -->|Re-identified Safe Response| API
    API -->|JSON Response| Client
```

---

## 🛠️ Tech Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | `^18.2.0` | Declarative, component-based user interface |
| **Build Tool** | Vite | `^5.1.0` | Ultra-fast HMR and frontend bundling |
| **Icons & Design** | Lucide React + Vanilla CSS | `^0.344.0` | Modern Sage Green aesthetic tokens |
| **Routing** | React Router DOM | `^6.22.0` | Single Page Application (SPA) client routing |
| **Backend Framework**| FastAPI | `^0.109.0`| High-performance asynchronous REST API |
| **Server Engine** | Uvicorn | `^0.27.0` | ASGI web server implementation |
| **Data Validation** | Pydantic v2 | `^2.6.0`  | Request/Response schema validation |
| **Database & ORM** | SQLite3 + SQLAlchemy | `^2.0.25` | Lightweight, zero-config relational storage |
| **AI Engine** | Google GenAI SDK | `^0.8.0`  | Gemini 1.5 Flash/Pro and Vision integration |

---

## 🛡️ Security & HIPAA Privacy Gateway

Patient data privacy and healthcare compliance are paramount in this system:

1. **Automated De-Identification Engine:**
   * Before any prompt or patient note is passed to external AI services, the backend de-identifier automatically redacts all 18 HIPAA identifier categories (Names, Phone Numbers, Emails, National IDs, MRNs, DOBs, Physical Addresses, and Financial accounts).
   * Replaces sensitive data with deterministic surrogate tokens: e.g., `[REDACTED_PATIENT_NAME_1]`.
2. **Local Re-Identification:**
   * Surrogate tokens are restored only on the secure local server before returning results to the physician.
   * **Zero Personally Identifiable Information (PII) leaves the local perimeter.**
3. **Environment & Key Isolation:**
   * Secret keys and `.env` files are excluded in `.gitignore`.
   * Sample environment template [`backend/.env.example`](backend/.env.example) ensures safe deployment without leaking API credentials.

---

## 📂 Directory Structure

```text
clinical-system/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routers/          # FastAPI route controllers (patients, appointments, ai, etc.)
│   │   ├── schemas/          # Pydantic data schemas
│   │   ├── services/         # Gemini AI service, De-identifier, AI Gateway
│   │   ├── database.py       # DB connection engine and session factory
│   │   └── main.py           # FastAPI entrypoint and CORS middleware
│   ├── .env.example          # Sanitized environment variable template
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Sidebar, Header, Modals)
│   │   ├── pages/            # View pages (Dashboard, Patients, AI Assistant, etc.)
│   │   ├── services/         # Axios / Fetch API client abstractions
│   │   ├── App.jsx           # Master route configuration
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Sage Green design system and CSS variables
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite bundler configuration
├── .gitignore                # Production ignore rules (secrets, db, node_modules)
├── PROJECT_REPORT.md         # Comprehensive modular architecture report
└── README.md                 # System overview and quick start guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python**: `3.11` or higher
* **Node.js**: `18.x` or higher
* **npm**: `9.x` or higher
* **Google Gemini API Key** (Get free key from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```powershell
# Navigate into backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Create your .env file from the template
copy .env.example .env

# Open .env and add your Gemini API Key:
# GEMINI_API_KEY=your_actual_api_key_here

# Launch the FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
Backend will start on: `http://localhost:8000`

---

### 2. Frontend Setup

In a separate terminal:

```powershell
# Navigate into frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be running on: `http://localhost:5173`

---

## 📖 API Documentation

Once the backend is running, explore the interactive OpenAPI specifications:
* **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Specification:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🌿 Contributing & Git Workflow

```powershell
# 1. Fetch latest changes from upstream
git fetch upstream

# 2. Checkout develop branch
git checkout develop
git pull upstream develop

# 3. Create your feature branch
git checkout -b feature/your-feature-name

# 4. Commit changes with conventional commit syntax
git commit -m "feat: add clinical analytics chart export"

# 5. Push branch to upstream
git push -u upstream feature/your-feature-name
```

---

## 👩‍💻 Author & Acknowledgements

* **Developer:** **Jayasri T** ([@jayasri21072006](https://github.com/jayasri21072006))
* **Organization Repository:** [proeduvate/CMS](https://github.com/proeduvate/CMS)
* Built for the Clinical Management System Initiative with modern healthcare web standards.
