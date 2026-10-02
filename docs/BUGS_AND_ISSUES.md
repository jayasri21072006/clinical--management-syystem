# Clinical Management System (CMS) — Comprehensive Bug & Issue Audit Report

**System Name:** Sage Green Clinical Management & AI System  
**Audit Date:** October 2, 2026  
**Audited Components:** Backend (FastAPI, SQLAlchemy, SQLite, Gemini AI Services), Frontend (React 18, Vite, React Router v6), Clinical AI & HIPAA Gateway  
**Target Repositories:** `https://github.com/proeduvate/CMS.git` | `https://github.com/jayasri21072006/clinical--management-syystem.git`

---

## 1. Executive Summary of Audit Findings

An exhaustive, end-to-end technical inspection of the Sage Green Clinical Management System was performed against the **Project Knowledge Transfer (KT) Specification** and production healthcare engineering standards.

While the system showcases an elegant Sage Green design aesthetic and extensive modular scaffolding, several **critical security and HIPAA privacy vulnerabilities**, **backend schema defects**, **database concurrency issues**, and **frontend routing/component omissions** were identified that must be resolved prior to production clinical certification.

### Summary Severity Breakdown:
| Severity | Category | Count | Status |
|---|---|:---:|:---:|
| **CRITICAL** | Security & HIPAA Compliance | 3 | Immediate Remediation Required |
| **HIGH** | Backend Logic & Database Integrity | 5 | Urgent Fix Required |
| **MEDIUM** | Frontend Routing & UI/UX Gaps | 6 | Recommended Before Release |
| **LOW** | Code Hygiene, Warnings & Dependencies | 4 | Best Practice Polish |

---

## 2. Critical Bugs & Security / HIPAA Privacy Issues

### 2.1 Critical HIPAA PHI Leakage in Chat Router Context Assembly
* **Location:** [`backend/app/routers/chat.py`](file:///backend/app/routers/chat.py#L40-L70) & [`backend/app/routers/chat.py`](file:///backend/app/routers/chat.py#L92-L93)
* **Severity:** **CRITICAL**
* **Description:**  
  The KT document (Page 1 & 3) mandates: *"Zero Cloud PII Leakage: External AI providers never receive names, phones, emails, national IDs, or addresses."*
  However, in `chat.py`, function `_get_hospital_context_summary()` queries the raw database:
  ```python
  patients = db.query(PatientModel).all()
  for p in patients:
      patient_list.append(f"- ID #{p.id}: {p.name}, Age: {p.age}, Gender: {p.gender}, Status: {p.status}")
  ```
  This raw patient snapshot containing real patient names, ages, diagnoses, and attending physicians is concatenated into `context_prompt` and sent directly to Google Gemini cloud in `gemini_service.generate_chat_reply()` without passing through the de-identifier.
* **Impact:** Direct violation of HIPAA Safe Harbor rules (§ 164.514(b)) and breach of clinical data privacy.
* **Remediation:**  
  Remove raw patient database dumping into LLM prompts. If clinical data must be provided as context, route the entire snapshot through `ClinicalDeidentifier.sanitize_clinical_text()` first, or query only de-identified metrics.

---

### 2.2 Missing Local Re-Identification Layer (KT Architecture Step 3)
* **Location:** [`backend/app/routers/ai_analysis.py`](file:///backend/app/routers/ai_analysis.py#L90-L105) & [`backend/app/services/deidentifier.py`](file:///backend/app/services/deidentifier.py)
* **Severity:** **CRITICAL**
* **Description:**  
  KT Diagram Step 3 explicitly mandates:
  ```
  STEP 3: LOCAL RE-IDENTIFIER (Local Server)
  - Swaps [REDACTED_...] tokens back with real values
  - Delivers seamless, readable output to the Doctor
  ```
  In reality:
  1. `ClinicalDeidentifier` in `deidentifier.py` does not contain a `reidentify_text(text, token_map)` function.
  2. Endpoints such as `POST /api/ai/analyze-document` de-identify input text, send it to Gemini, and return the AI output with un-swapped surrogate tokens (`[REDACTED_PATIENT_NAME_1]`, `[REDACTED_DOB_1]`), forcing doctors to manually decipher tokens.
* **Remediation:**  
  Implement `reidentify_text(sanitized_output: str, token_map: Dict[str, str]) -> str` in `ClinicalDeidentifier` that replaces all `[REDACTED_*]` tokens with original patient data before delivering the HTTP response to the healthcare worker.

---

### 2.3 Shared Surrogate Counter in HIPAA De-Identifier
* **Location:** [`backend/app/services/deidentifier.py`](file:///backend/app/services/deidentifier.py#L41-L89)
* **Severity:** **HIGH**
* **Description:**  
  In `ClinicalDeidentifier.sanitize_clinical_text`, the token counters are initialized as:
  ```python
  token_counter = {"NAME": 1, "PHONE": 1, "EMAIL": 1, "ID": 1, "DATE": 1, "ADDRESS": 1}
  ```
  Both Government IDs (SSN / Aadhaar) and Medical Record Numbers (MRN) share the same `"ID"` counter:
  - Line 76: `token = f"[REDACTED_NATIONAL_ID_{token_counter['ID']}]"` increments `token_counter["ID"] += 1`
  - Line 85: `token = f"[REDACTED_MRN_{token_counter['ID']}]"` increments `token_counter["ID"] += 1`
  - Line 122: Insurance ID also shares `token_counter["ID"] += 1`
  - Line 131: Financial accounts also share `token_counter["ID"] += 1`
* **Impact:** If a document contains 1 National ID and 1 MRN, the output produces `[REDACTED_NATIONAL_ID_1]` and `[REDACTED_MRN_2]` (skipping MRN 1). This breaks standard surrogate parsing and token tracking.
* **Remediation:**  
  Provide distinct counters for `"NATIONAL_ID"`, `"MRN"`, `"INSURANCE"`, and `"FINANCIAL"`.

---

### 2.4 Permissive CORS Configuration with Enabled Credentials
* **Location:** [`backend/app/main.py`](file:///backend/app/main.py#L33-L40)
* **Severity:** **HIGH**
* **Description:**  
  FastAPI CORS middleware is configured as:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
* **Impact:** According to the W3C CORS specification, wildcard origins (`*`) cannot be used when `allow_credentials=True`. Modern browsers will reject credentialed requests (cookies, HTTP basic auth, bearer tokens), causing production API calls to fail. In Starlette/FastAPI, this also triggers server configuration warnings.
* **Remediation:**  
  Configure explicit trusted origins:
  ```python
  allow_origins=[
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
  ]
  ```

---

## 3. Backend Logic & Database Integrity Issues

### 3.1 Unregistered AI Risk Router (`ai_risk.py`)
* **Location:** [`backend/app/routers/ai_risk.py`](file:///backend/app/routers/ai_risk.py) vs [`backend/app/main.py`](file:///backend/app/main.py#L9-L13)
* **Severity:** **HIGH**
* **Description:**  
  A dedicated router `ai_risk.py` containing patient risk calculations, comorbidity evaluation, and endpoints (`/api/ai-risk/overview`, `/api/ai-risk/patients`, `/api/ai-risk/patients/{id}`) exists in the repository, but is **never registered** in `main.py` via `app.include_router(ai_risk.router)`.
* **Impact:** These critical clinical risk endpoints return 404 Not Found if accessed.
* **Remediation:**  
  Import `ai_risk` in `main.py` and register `app.include_router(ai_risk.router)`.

---

### 3.2 Race Condition & Constraint Crash in Inventory ID Generation
* **Location:** [`backend/app/routers/inventory.py`](file:///backend/app/routers/inventory.py#L27-L28)
* **Severity:** **HIGH**
* **Description:**  
  Inventory item creation calculates ID as:
  ```python
  count = db.query(InventoryModel).count() + 1
  generated_id = f"INV-{count:03d}"
  ```
  `InventoryModel.item_id` has a `unique=True` constraint. If an item is deleted (e.g., initial 6 items, one is deleted, count becomes 5, next item attempts `INV-006` which already exists), SQLite throws an unhandled `IntegrityError: UNIQUE constraint failed: inventory.item_id`, crashing the API endpoint with a 500 error.
* **Remediation:**  
  Derive the ID from the maximum existing numeric suffix (`SELECT MAX(id) FROM inventory`) or use a UUID/sequence generator.

---

### 3.3 Missing Inventory Update (PATCH/PUT) and Delete Endpoints
* **Location:** [`backend/app/routers/inventory.py`](file:///backend/app/routers/inventory.py)
* **Severity:** **HIGH**
* **Description:**  
  `inventory.py` only implements `GET /api/inventory` and `POST /api/inventory`. It lacks:
  - `PATCH /api/inventory/{id}` (to update stock levels, batch numbers, or expiry dates)
  - `DELETE /api/inventory/{id}` (to remove expired or discontinued medications)
* **Impact:** Stock adjustments when medicines are dispensed cannot be saved to the database.
* **Remediation:**  
  Add `PATCH /{item_id}` and `DELETE /{item_id}` endpoints in `inventory.py`.

---

### 3.4 Inappropriate Use of Create Schemas for PATCH Endpoints
* **Location:** [`backend/app/routers/patients.py`](file:///backend/app/routers/patients.py#L76-L86) & [`backend/app/routers/appointments.py`](file:///backend/app/routers/appointments.py#L67-L82)
* **Severity:** **MEDIUM**
* **Description:**  
  In `patients.py`, the `PATCH /{patient_id}` endpoint takes `patient_in: PatientCreate`.
  `PatientCreate` requires `name` and `gender`. If a frontend client sends only the fields that changed (the fundamental definition of a PATCH request), FastAPI rejects the payload with HTTP 422 Unprocessable Entity.
  Furthermore, `PatientCreate` does not contain `status`, meaning a patient's status (Active vs Inpatient vs Inactive) cannot be updated via this endpoint!
* **Remediation:**  
  Define `PatientUpdate` and `AppointmentUpdate` schemas in `schemas.py` where all fields are `Optional[...] = None`.

---

### 3.5 Patient ID Search Omitted in Backend SQL Filter
* **Location:** [`backend/app/routers/patients.py`](file:///backend/app/routers/patients.py#L31-L37)
* **Severity:** **MEDIUM**
* **Description:**  
  The endpoint description says *"Search by name, phone, or ID"*, and KT Page 2 mentions searching for Patient ID (`#P-001`). However, the SQL filter only checks:
  ```python
  query = query.filter(
      PatientModel.name.ilike(term)
      | PatientModel.phone.ilike(term)
      | PatientModel.email.ilike(term)
  )
  ```
  `PatientModel.id` is never searched. If a doctor or receptionist types "1", "001", or "P-001", zero results are returned.
* **Remediation:**  
  Extract numeric digits from the search string and include `cast(PatientModel.id, String).ilike(term)` in the SQLAlchemy filter.

---

### 3.6 Potential DB Session Leak in `chat.py`
* **Location:** [`backend/app/routers/chat.py`](file:///backend/app/routers/chat.py#L43-L49)
* **Severity:** **MEDIUM**
* **Description:**  
  `_get_hospital_context_summary()` instantiates `db = SessionLocal()` without a `try ... finally: db.close()` block. If an exception occurs during the queries, the database connection is never returned to the pool, leading to file locks on SQLite.
* **Remediation:**  
  Wrap the session in `with SessionLocal() as db:` or standard `try ... finally`.

---

## 4. Frontend Routing & UI/UX Issues

### 4.1 Orphaned Pages Omitted from Router (`App.jsx`) and Sidebar
* **Location:** [`frontend/src/App.jsx`](file:///frontend/src/App.jsx#L45-L57) & [`frontend/src/components/Sidebar/Sidebar.jsx`](file:///frontend/src/components/Sidebar/Sidebar.jsx#L55-L92)
* **Severity:** **HIGH**
* **Description:**  
  Multiple fully developed page components exist in `frontend/src/pages/` but have **no routes** in `App.jsx` and no navigation links in `Sidebar.jsx`:
  1. `PrintLabel` (`frontend/src/pages/PrintLabel/PrintLabel.jsx`): KT Module 10 specifies `/print-label` for printing medicine bottle labels. It is completely missing from `Routes` and Sidebar.
  2. `RetailSelling` (`frontend/src/pages/RetailSelling/RetailSelling.jsx`): A full 11KB pharmacy POS component exists but is completely unrouted.
  3. `Modules` (`frontend/src/pages/Modules/Modules.jsx`): A clinical directory of add-on modules exists but is unrouted.
  4. Module 12 (`Settings & Preferences`): Mentioned in KT document Page 3, but no settings route or view is configured.
* **Impact:** Users cannot navigate to or use Module 10 (Print Label), Module 12 (Settings), or Retail Selling.
* **Remediation:**  
  Register `<Route path="/print-label" element={<PrintLabel />} />`, `<Route path="/retail-selling" element={<RetailSelling />} />`, and `<Route path="/settings" element={<Settings />} />` in `App.jsx`, and add appropriate navigation links in `Sidebar.jsx`.

---

### 4.2 Missing 2 out of 4 KPI Metric Cards on Executive Dashboard
* **Location:** [`frontend/src/pages/Dashboard/Dashboard.jsx`](file:///frontend/src/pages/Dashboard/Dashboard.jsx#L81-L100)
* **Severity:** **MEDIUM**
* **Description:**  
  KT Page 2 (Module 1) mandates 4 real-time KPI metric cards:
  1. *Total Active Patients*
  2. *Today's Scheduled Appointments*
  3. *Pending Purchase Orders*
  4. *Low Stock Inventory Warnings*
  Currently, `Dashboard.jsx` only renders cards 1 and 2. The Pending Purchase Orders card and Low Stock Warnings card are missing from the dashboard view.
* **Remediation:**  
  Update `Dashboard.jsx` to render all 4 KPI cards using data from `stats.lowStockAlerts.length` and pending purchase order counts.

---

### 4.3 Clinical AI Assistant Dependent on Static Mock Dataset
* **Location:** [`frontend/src/services/clinicalAIService.js`](file:///frontend/src/services/clinicalAIService.js) & [`frontend/src/pages/AIAssistant/AIAssistant.jsx`](file:///frontend/src/pages/AIAssistant/AIAssistant.jsx#L258-L265)
* **Severity:** **MEDIUM**
* **Description:**  
  In `AIAssistant.jsx`, when structured quick actions (Patient Summary, Lab Analysis, Medication Review, SOAP Note, Prior Authorization) are executed, they route to `clinicalAIService.runClinicalAIAction()`.
  This method returns hardcoded static JSON from `DEMO_PATIENTS` regardless of the patient selected in the database, instead of calling the live backend FastAPI endpoints (`/api/ai/analyze-document`, `/api/ai/predict-risk`, etc.).
* **Remediation:**  
  Integrate `clinicalAIService.js` to dispatch dynamic prompts to `/api/ai/analyze-document` and `/api/chat` using live patient records from the SQLite database.

---

## 5. Deprecations, Dependencies & Hygiene

### 5.1 Pydantic v2 `orm_mode` Deprecation Warnings
* **Location:** [`backend/app/schemas/schemas.py`](file:///backend/app/schemas/schemas.py#L21-L22)
* **Severity:** **LOW**
* **Description:**  
  Every schema defines `class Config: orm_mode = True`. In Pydantic v2, `orm_mode` is deprecated in favor of `from_attributes = True`. This causes 10+ verbose `UserWarning: Valid config keys have changed in V2` warnings in console output on server startup.
* **Remediation:**  
  Replace `class Config: orm_mode = True` with `model_config = {"from_attributes": True}` or remove redundant `orm_mode = True`.

---

### 5.2 Incomplete `backend/requirements.txt`
* **Location:** [`backend/requirements.txt`](file:///backend/requirements.txt)
* **Severity:** **LOW**
* **Description:**  
  The current `requirements.txt` only contains 4 packages:
  ```
  fastapi>=0.110.0
  uvicorn>=0.28.0
  sqlalchemy>=2.0.0
  pydantic>=2.0.0
  ```
  Missing dependencies utilized in the backend:
  - `python-dotenv` (required for reliable `.env` file loading)
  - `google-generativeai` (for native Google GenAI SDK support)
  - `httpx` or `requests` (for REST fallback calls in `gemini_service.py`)
  - `pytest` (for automated test runners)
* **Remediation:**  
  Add all utilized packages with version constraints to `requirements.txt`.

---

### 5.3 Complete Lack of Automated Test Suites
* **Location:** Root & `backend/`
* **Severity:** **MEDIUM**
* **Description:**  
  There are zero unit tests, integration tests, or API regression tests in the repository. In a healthcare/clinical system dealing with patient health records and medical AI decision support, automated test coverage is mandatory for compliance and stability.
* **Remediation:**  
  Implement a `tests/` directory with `pytest` testing CRUD endpoints, HIPAA de-identification regex patterns, surrogate token mapping, and response validation.

---

*Report prepared and documented for ProEduvate CMS Certification Review.*
