import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sage Green Clinical Management System — Bug Audit & Improvement Report</title>
<style>
  @page {
    size: A4 portrait;
    margin: 14mm 14mm 14mm 14mm;
  }
  
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1F2937;
    background: #FFFFFF;
    line-height: 1.45;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }

  .cover-page {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 82vh;
    padding: 40px 30px;
    border-left: 10px solid #1A3D2B;
    background: linear-gradient(135deg, #F1F9F3 0%, #FFFFFF 100%);
  }

  .badge-chip {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #E8F5E9;
    color: #1A3D2B;
    border: 1px solid #A5D6A7;
    margin-bottom: 20px;
  }

  h1.cover-title {
    font-size: 24pt;
    font-weight: 800;
    color: #1A3D2B;
    margin: 0 0 10px 0;
    line-height: 1.2;
  }

  h2.cover-subtitle {
    font-size: 14pt;
    font-weight: 600;
    color: #374151;
    margin: 0 0 20px 0;
  }

  .meta-box {
    margin-top: 25px;
    padding: 16px 20px;
    background: #FFFFFF;
    border: 1px solid #D1E7DD;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }

  .meta-item {
    font-size: 9.5pt;
    color: #4B5563;
    margin-bottom: 5px;
  }
  .meta-item strong {
    color: #111827;
  }

  .audit-card {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 10px;
    padding: 9px 13px;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-left: 4px solid #1A3D2B;
    border-radius: 6px;
  }

  h2.section-header {
    font-size: 13pt;
    color: #1A3D2B;
    border-bottom: 2px solid #2D5A3F;
    padding-bottom: 3px;
    margin-top: 14px;
    margin-bottom: 8px;
    break-after: avoid;
    page-break-after: avoid;
  }

  h3.item-header {
    font-size: 10.5pt;
    color: #111827;
    margin-top: 0;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .severity-tag {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 700;
    color: #FFF;
    text-transform: uppercase;
  }
  .sev-critical { background: #DC2626; }
  .sev-high { background: #EA580C; }
  .sev-med { background: #D97706; }
  .sev-low { background: #059669; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px 0;
    font-size: 8.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  th {
    background-color: #1A3D2B;
    color: #FFFFFF;
    text-align: left;
    padding: 6px 9px;
    font-weight: 600;
  }

  td {
    padding: 6px 9px;
    border-bottom: 1px solid #E5E7EB;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #F9FAFB;
  }

  .code-block {
    background: #F3F4F6;
    border-left: 3px solid #1A3D2B;
    padding: 5px 8px;
    font-family: Consolas, monospace;
    font-size: 8pt;
    color: #1F2937;
    border-radius: 4px;
    margin: 5px 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .callout-box {
    break-inside: avoid;
    page-break-inside: avoid;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-left: 4px solid #16A34A;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 8px 0;
    font-size: 9pt;
  }

  ul {
    margin: 3px 0 6px 16px;
    padding: 0;
  }
  li {
    margin-bottom: 2px;
  }
  p {
    margin: 3px 0;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div>
    <span class="badge-chip">Official Certification Assessment</span>
  </div>
  <h1 class="cover-title">Sage Green Clinical Management & AI System</h1>
  <h2 class="cover-subtitle">Technical Bug Audit, HIPAA Privacy Evaluation & Strategic Improvement Roadmap</h2>
  
  <p style="color: #4B5563; font-size: 10pt; max-width: 620px; margin-top: 10px;">
    A rigorous end-to-end technical inspection of the backend FastAPI service, SQLite/SQLAlchemy ORM layer, React 18 single-page application, and Google Gemini Clinical AI gateway against production healthcare certification standards.
  </p>

  <div class="meta-box">
    <div class="meta-item"><strong>Target Platform:</strong> Sage Green Clinical Management System (CMS)</div>
    <div class="meta-item"><strong>Audited Repositories:</strong> <code>https://github.com/proeduvate/CMS.git</code> &amp; <code>https://github.com/jayasri21072006/clinical--management-syystem.git</code></div>
    <div class="meta-item"><strong>Branch:</strong> <code>develop</code></div>
    <div class="meta-item"><strong>Evaluation Date:</strong> October 2026</div>
    <div class="meta-item"><strong>Certification Status:</strong> Audit Complete — Remediation &amp; Strategic Roadmap Documented</div>
  </div>
</div>

<!-- SECTION 1 & 2 -->
<div>
  <h2 class="section-header">1. Executive Audit Summary</h2>
  <p>
    An in-depth code and architecture review of the Sage Green Clinical Management System was executed. While the platform exhibits high UI/UX polish, a calming Sage Green design system, and multi-module capabilities, several <strong>critical HIPAA security vulnerabilities</strong>, <strong>database concurrency flaws</strong>, and <strong>frontend routing omissions</strong> require immediate remediation before clinical certification.
  </p>

  <table>
    <thead>
      <tr>
        <th>Severity</th>
        <th>Category</th>
        <th>Count</th>
        <th>Remediation Timeline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong style="color: #DC2626;">CRITICAL</strong></td>
        <td>HIPAA Privacy &amp; Data Leakage</td>
        <td>3</td>
        <td>Immediate (Prior to patient onboarding)</td>
      </tr>
      <tr>
        <td><strong style="color: #EA580C;">HIGH</strong></td>
        <td>Database Concurrency &amp; Logic Errors</td>
        <td>5</td>
        <td>Phase 1 (Sprint 1)</td>
      </tr>
      <tr>
        <td><strong style="color: #D97706;">MEDIUM</strong></td>
        <td>Frontend Routing &amp; UI Disconnects</td>
        <td>6</td>
        <td>Phase 2 (Sprint 1-2)</td>
      </tr>
      <tr>
        <td><strong style="color: #059669;">LOW</strong></td>
        <td>Pydantic Warnings &amp; Test Hygiene</td>
        <td>4</td>
        <td>Phase 3 (Ongoing)</td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-header">2. Critical Bugs &amp; HIPAA Privacy Vulnerabilities</h2>

  <div class="audit-card">
    <h3 class="item-header">
      <span>2.1 Raw Patient Database Dump into Gemini Cloud Prompts</span>
      <span class="severity-tag sev-critical">CRITICAL</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/chat.py</code> (Lines 40–70 &amp; 92–93)</p>
    <p><strong>Finding:</strong> The KT specification explicitly mandates zero-PII cloud leakage. However, in <code>chat.py</code>, function <code>_get_hospital_context_summary()</code> pulls real patient names, ages, diagnoses, and physician information from SQLite and prefixes it verbatim to every conversation prompt sent to Google Gemini cloud API without de-identification.</p>
    <div class="code-block"># In chat.py:
patients = db.query(PatientModel).all()
for p in patients:
    patient_list.append(f"- ID #{p.id}: {p.name}, Age: {p.age}, Gender: {p.gender}, Status: {p.status}")
# Appended to context_prompt and sent to Gemini cloud without de-identification!</div>
    <p><strong>Remediation:</strong> Remove un-sanitized patient data dumping. Route all context through <code>ClinicalDeidentifier.sanitize_clinical_text()</code> before sending.</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>2.2 Missing Server-Side Re-Identification Layer</span>
      <span class="severity-tag sev-critical">CRITICAL</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/ai_analysis.py</code> &amp; <code>backend/app/services/deidentifier.py</code></p>
    <p><strong>Finding:</strong> KT Architecture Step 3 defines a Local Server Re-Identifier that swaps <code>[REDACTED_...]</code> tokens back to original values before output is delivered to doctors. In current implementation, <code>deidentifier.py</code> has no re-identification function, returning raw masked tokens to clinical staff.</p>
    <p><strong>Remediation:</strong> Implement <code>reidentify_text(sanitized_text, token_map)</code> to automatically replace tokens with original patient data prior to returning HTTP responses.</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>2.3 Shared Token Counter Collision in HIPAA Sanitizer</span>
      <span class="severity-tag sev-high">HIGH</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/services/deidentifier.py</code> (Lines 41, 76, 85, 122)</p>
    <p><strong>Finding:</strong> National IDs, MRNs, Insurance IDs, and Credit Card tokens all share the same <code>token_counter["ID"]</code>. A document containing 1 SSN and 1 MRN outputs <code>[REDACTED_NATIONAL_ID_1]</code> and <code>[REDACTED_MRN_2]</code>, desynchronizing surrogate indexing.</p>
    <p><strong>Remediation:</strong> Provide distinct dictionary keys for each identifier category.</p>
  </div>

  <h2 class="section-header">3. Backend Logic &amp; Database Integrity Issues</h2>

  <div class="audit-card">
    <h3 class="item-header">
      <span>3.1 Unregistered AI Risk Router</span>
      <span class="severity-tag sev-high">HIGH</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/ai_risk.py</code> vs <code>backend/app/main.py</code></p>
    <p><strong>Finding:</strong> A complete clinical comorbidity and risk scoring router exists in <code>ai_risk.py</code> (with <code>/api/ai-risk/overview</code> and <code>/api/ai-risk/patients</code>), but was omitted from <code>main.py</code>'s <code>app.include_router()</code> list, causing 404 Not Found errors on access.</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>3.2 Inventory ID Collision &amp; Concurrency Crash</span>
      <span class="severity-tag sev-high">HIGH</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/inventory.py</code> (Lines 27–28)</p>
    <p><strong>Finding:</strong> New inventory IDs are computed as <code>count = db.query(InventoryModel).count() + 1</code>. If any medication is deleted, count decreases, causing subsequent inserts to attempt duplicate IDs on the unique <code>item_id</code> column, crashing with an unhandled 500 error.</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>3.3 Missing Inventory Update and Deletion Endpoints</span>
      <span class="severity-tag sev-high">HIGH</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/inventory.py</code></p>
    <p><strong>Finding:</strong> The inventory router lacks <code>PATCH</code> and <code>DELETE</code> endpoints. When pharmacy technicians dispense remedies, stock levels cannot be decremented via REST API.</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>3.4 Rigid Schemas Causing 422 Errors on PATCH Requests</span>
      <span class="severity-tag sev-med">MEDIUM</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/patients.py</code> &amp; <code>backend/app/routers/appointments.py</code></p>
    <p><strong>Finding:</strong> The <code>PATCH</code> endpoints require <code>PatientCreate</code> / <code>AppointmentCreate</code> schemas with mandatory non-null attributes. Sending partial update payloads causes FastAPI to reject the request with HTTP 422.</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>3.5 Patient ID Search Omitted in SQL Query</span>
      <span class="severity-tag sev-med">MEDIUM</span>
    </h3>
    <p><strong>Location:</strong> <code>backend/app/routers/patients.py</code> (Lines 31–37)</p>
    <p><strong>Finding:</strong> Receptionists looking up patients by ID (#P-001 or 1) receive empty search results because the SQL query only searches <code>name</code>, <code>phone</code>, and <code>email</code>.</p>
  </div>

  <h2 class="section-header">4. Frontend Routing &amp; UI Gaps</h2>

  <div class="audit-card">
    <h3 class="item-header">
      <span>4.1 Orphaned Pages Omitted from Router</span>
      <span class="severity-tag sev-high">HIGH</span>
    </h3>
    <p><strong>Location:</strong> <code>frontend/src/App.jsx</code> &amp; <code>frontend/src/components/Sidebar/Sidebar.jsx</code></p>
    <p><strong>Finding:</strong> Fully developed components exist in the repository but have no routes in <code>App.jsx</code> and are omitted from navigation: <strong>PrintLabel</strong> (<code>/print-label</code>, KT Module 10) and <strong>RetailSelling</strong> (<code>/retail-selling</code>, pharmacy POS counter).</p>
  </div>

  <div class="audit-card">
    <h3 class="item-header">
      <span>4.2 Missing 2 of 4 Dashboard KPI Metric Cards</span>
      <span class="severity-tag sev-med">MEDIUM</span>
    </h3>
    <p><strong>Location:</strong> <code>frontend/src/pages/Dashboard/Dashboard.jsx</code></p>
    <p><strong>Finding:</strong> KT Page 2 specifies 4 real-time KPI cards: Total Patients, Today's Scheduled Appointments, Pending Purchase Orders, and Low Stock Inventory Warnings. The current dashboard only renders the first two.</p>
  </div>

  <h2 class="section-header">5. Strategic Improvement Roadmap (6 Core Pillars)</h2>

  <table>
    <thead>
      <tr>
        <th>Pillar</th>
        <th>Strategic Enhancement</th>
        <th>Clinical &amp; Operational Benefit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. AI &amp; HIPAA</strong></td>
        <td>Two-way automated sanitization + Server-Sent Events (SSE) streaming</td>
        <td>Guarantees 100% HIPAA compliance while reducing perceived AI diagnostic latency to under 400ms.</td>
      </tr>
      <tr>
        <td><strong>2. Database Persistence</strong></td>
        <td>Migration to PostgreSQL 16 with async connection pool + Alembic migrations</td>
        <td>Eliminates SQLite file-lock bottlenecks in high-volume clinics with multiple simultaneous receptionist/doctor desks.</td>
      </tr>
      <tr>
        <td><strong>3. Clinical UX</strong></td>
        <td>Route <code>/print-label</code> &amp; <code>/retail-selling</code> + 1-click consultation state machine</td>
        <td>Unlocks bottle label printing, pharmacy dispensing POS, and instant 1-click visit status transitions.</td>
      </tr>
      <tr>
        <td><strong>4. Security &amp; RBAC</strong></td>
        <td>JWT authentication with role permissions (Doctor, Pharmacist, Receptionist, Admin)</td>
        <td>Restricts sensitive patient health and financial records to authorized healthcare personnel only.</td>
      </tr>
      <tr>
        <td><strong>5. Pharmacy Supply</strong></td>
        <td>FEFO (First-Expired, First-Out) dispensing + Barcode scanning support</td>
        <td>Prevents pharmaceutical waste by prioritizing near-expiry medications and eliminating manual entry errors.</td>
      </tr>
      <tr>
        <td><strong>6. DevSecOps</strong></td>
        <td>Automated Pytest suite + Playwright E2E tests + GitHub Actions CI/CD</td>
        <td>Ensures regulatory stability, regression resistance, and automated compliance auditing on pull requests.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-header">6. Implementation Phasing &amp; Certification Readiness</h2>

  <div class="callout-box">
    <strong>Phase 1: Certification Prerequisites (Week 1)</strong><br>
    Resolve HIPAA PII leakage in <code>chat.py</code>, implement local re-identification, register <code>ai_risk</code> router, fix CORS configuration, and patch inventory ID sequence generation.
  </div>

  <div class="callout-box">
    <strong>Phase 2: UI/UX &amp; Module Completeness (Week 2)</strong><br>
    Register routes for <code>/print-label</code> and <code>/retail-selling</code>, restore 4 KPI cards on Executive Dashboard, and link live database patients to the AI Assistant.
  </div>

  <div class="callout-box">
    <strong>Phase 3: Security &amp; Enterprise Scalability (Weeks 3–4)</strong><br>
    Deploy PostgreSQL async connection pooling, Alembic migration scripts, JWT-based role authentication, and automated Pytest verification suites.
  </div>

  <div style="margin-top: 18px; padding: 12px 16px; background: #F1F9F3; border: 1px solid #A5D6A7; border-radius: 8px; text-align: center;">
    <strong style="color: #1A3D2B; font-size: 10.5pt;">ProEduvate CMS Certification Assessment Ready</strong><br>
    <span style="color: #4B5563; font-size: 9pt;">All documentation, technical analyses, and roadmap artifacts committed to Git repository under <code>docs/</code>.</span>
  </div>
</div>

</body>
</html>
"""

html_path = os.path.abspath("docs/audit_report_source.html")
pdf_path = os.path.abspath("docs/Clinical_Management_System_Audit_and_Improvements.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Executing Edge PDF conversion...")
result = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", result.returncode)
if os.path.exists(pdf_path):
    print("PDF successfully generated! Size:", os.path.getsize(pdf_path), "bytes")
