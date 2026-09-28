# SAGE GREEN CLINICAL MANAGEMENT & AI SYSTEM
## Comprehensive Project Report & Modular Architecture Guide (Strictly 6 Pages)

---

### Executive Summary
The **Sage Green Clinical Management System** is an integrated, full-stack healthcare web platform engineered to streamline patient intake, doctor scheduling, medical inventory, electronic case records, and clinical reporting. Built with an anxiety-reducing "Sage Green Wellness" design aesthetic, the system provides healthcare professionals with rapid data access, intuitive patient list tables, and privacy-preserving clinical AI support.

---

## Page 1: Executive Overview & Project Specifications
- **Application Stack**: React 18 (Vite) + FastAPI (Python 3.11) + SQLite3 (SQLAlchemy 2.0) + Google Gemini AI.
- **Architecture**: Decoupled Single Page Application (SPA).
- **Core Problem Solved**: Eliminates disjointed spreadsheets and paper files by consolidating patient intake, appointment scheduling, pharmacy inventory, and doctor rosters into one synchronized web interface.
- **Privacy-Preserving AI**: Built-in HIPAA-grade de-identification layer scrubs patient identifiers prior to AI analysis.

---

## Page 2: System Architecture, Tech Stack & Database Design
- **Frontend UI**: React 18, Vite, React Router v6, Lucide React, Pure Vanilla CSS with Sage Green tokens (`#1A3D2B` to `#F1F9F3`).
- **Backend API**: FastAPI asynchronous REST API endpoints with Pydantic v2 data validation and Uvicorn server.
- **Database Schema**:
  - `patients`: `id (PK)`, `name`, `age`, `gender`, `phone`, `email`, `status`, `created_at`.
  - `appointments`: `id (PK)`, `time`, `date`, `patient`, `doctor`, `status`, `type`, `date_group`.
  - `inventory`: `id (PK)`, `item_id`, `name`, `category`, `stock`, `unit`, `expiry`, `status`.
  - `physicians`: `id (PK)`, `name`, `qual`, `exp`, `patients`, `status`.
  - `purchase_orders`: `id (PK)`, `order_id`, `vendor`, `date`, `items`, `total`, `status`.
  - `case_summaries`: `id (PK)`, `patient_id`, `diagnosis`, `symptoms`, `treatment`, `notes`.

---

## Page 3: Core Clinical Operations Modules
- **Module 1: Executive Dashboard (`/`)**: Dynamic KPI metric cards (Active Patients, Scheduled Today, Pending Orders, Low Stock), live today's timeline, quick-action floating bar, and recent activity logs.
- **Module 2: Patients Management (`/patients`)**: High-density list/table view with color-coded avatar initials, demographic age/gender chips, phone & email contact items, debounced search (<400ms), dynamic DB filters, and CRUD modals.
- **Module 3: Appointments & Scheduling (`/appointments`)**: Formatted calendar date tiles (`SEP 21 MON`), time badges, consultation state machine (`Confirmed`, `In Progress`, `Completed`, `Cancelled`), and smart booking wizard.

---

## Page 4: Clinical AI Assistant & EMR Case Intelligence
- **Module 4: Clinical AI Assistant (`/ai-assistant`)**:
  1. *Patient Chart Summary*: Synthesizes longitudinal EMR history into a concise clinical narrative.
  2. *Differential Diagnosis*: Suggests ranked condition hypotheses with recommended tests.
  3. *Clinical Risk Scoring*: Evaluates chronic comorbidities and computes quantitative risk indices.
  4. *Prescription & Lab Trend Analysis*: Flags abnormal markers and potential drug interactions.
- **Module 5: Case Summary & EMR (`/case-summary`)**: Longitudinal patient timeline, doctor clinical notes, and treatment plans.
- **Module 6: Risk Prediction Engine (`/risk-prediction`)**: Preventive health indicators and lifestyle recommendations.

---

## Page 5: Pharmacy Inventory, Supply Chain & Administration
- **Module 7: Medical Inventory & Pharmacy (`/medical-inventory`)**: Formulation catalog (*Dilution*, *Mother Tincture*, *Biochemic*, *Tablets*, *Ointments*), unit tracking, and batch expiry tracking (`YYYY-MM`).
- **Module 8: Purchase Orders & Supply Chain (`/purchase-orders`)**: Vendor tracking, procurement pipeline (`Pending Approval`, `Ordered`, `Received`), and restock requisition modal.
- **Module 9: Physician Directory (`/physician`)**: Doctor profiles, degrees (BHMS, MD), experience, and cumulative consultations count.
- **Module 10: Reports & Practice Analytics (`/reports`)**: Consultation volume trends, doctor workload distribution, and revenue metrics.
- **Modules 11 & 12: Print Labels & Branch Locations (`/print-label`, `/location`)**: Physical bottle label generator and multi-branch clinic directory.

---

## Page 6: Simple & Practical Feature Enhancements & Startup Guide

### 7 Simple & Practical Feature Additions:
1. **One-Click Export to CSV**: Simple client-side JavaScript button on Patients & Appointments tables to download active records as a `.csv` spreadsheet.
2. **WhatsApp / SMS Reminder Link**: Clickable `https://wa.me/{phone}?text=...` icon on appointments for 1-click visit reminders.
3. **Low Stock Badge in Sidebar**: A small visual badge (e.g. `! 3`) next to "Medical Inventory" indicating medicines running low on stock.
4. **Header Global Quick Search**: Universal search input in the top header to look up patients by phone or name from any screen.
5. **Patient Visit History Tab**: Simple tab inside Case Summary listing prior consultation dates and prescribed remedies.
6. **Doctor On-Duty Status Switch**: Toggle switch (`Available`, `In Consultation`, `Off Duty`) in Physician Directory.
7. **Soft Dark Theme Mode**: Toggle using existing CSS variables to switch to a soothing dark palette for night-shift doctors.

### Local Startup Guide:
```bash
# Backend (FastAPI)
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Frontend (React + Vite)
cd frontend
npm install
npm run dev
```

---
*Report generated for Sage Green Clinical Management System.*
