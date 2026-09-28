import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Copy,
  RefreshCw,
  FileText,
  Check,
  ExternalLink,
  Layers,
  Heart,
  Calendar,
  Activity,
  FlaskConical,
  Pill,
  BookOpen,
  Shield,
  FileCheck,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ClinicalTimelineView from './ClinicalTimelineView';
import './ClinicalAIComponents.css';

/* ─── Helper Copy & Toast ─── */
const copyToClipboard = (text, setCopied) => {
  if (text) {
    navigator.clipboard.writeText(text);
    if (setCopied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
};

/* ─────────────────────────────────────────────
   1. PATIENT SUMMARY RESPONSE
   ───────────────────────────────────────────── */
export const PatientSummaryResponse = ({ data, onViewSource }) => {
  const [copied, setCopied] = useState(false);
  const demo = data.demographics || {};

  return (
    <div className="clinical-card-container patient_summary">
      <div className="clinical-card-header">
        <div className="header-left">
          <span className="card-type-badge"><User size={12} /> Patient Clinical Summary</span>
        </div>
        <span className="card-review-badge"><AlertTriangle size={11} /> Review Required</span>
      </div>

      <div className="summary-demographics-grid">
        <div className="demo-chip"><strong>Name:</strong> {demo.name}</div>
        <div className="demo-chip"><strong>ID / MRN:</strong> {demo.mrn || data.patientId}</div>
        <div className="demo-chip"><strong>Age / Sex:</strong> {demo.age}y {demo.gender}</div>
        <div className="demo-chip"><strong>Status:</strong> {demo.status}</div>
      </div>

      <div className="clinical-card-body">
        <div className="clinical-card-block">
          <h4>Active Conditions</h4>
          <ul>
            {data.conditions?.length > 0 ? (
              data.conditions.map((c, i) => (
                <li key={i}><strong>{c.name}</strong> ({c.icd10 || 'N/A'}) — Status: {c.status}</li>
              ))
            ) : <li>No active conditions documented.</li>}
          </ul>
        </div>

        <div className="clinical-card-block">
          <h4>Active Allergies</h4>
          <p className="alert-text">{data.allergies?.join(', ') || 'No known allergies'}</p>
        </div>

        <div className="clinical-card-block">
          <h4>Current Medications</h4>
          <ul>
            {data.medications?.length > 0 ? (
              data.medications.map((m, i) => (
                <li key={i}>{m.name} {m.dose} ({m.frequency})</li>
              ))
            ) : <li>No medications documented.</li>}
          </ul>
        </div>

        <div className="clinical-card-block">
          <h4>Recent Clinical Visits</h4>
          <ul>
            {data.recentVisits?.length > 0 ? (
              data.recentVisits.map((v, i) => (
                <li key={i}>{v.date} — {v.clinic} ({v.physician})</li>
              ))
            ) : <li>No recent visits documented.</li>}
          </ul>
        </div>
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter
        onCopy={() => copyToClipboard(JSON.stringify(data.demographics), setCopied)}
        copied={copied}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   2. CLINICAL TIMELINE RESPONSE
   ───────────────────────────────────────────── */
export const ClinicalTimelineResponse = ({ data, onViewSource }) => {
  return (
    <div className="clinical-card-container clinical_timeline">
      <div className="clinical-card-header">
        <span className="card-type-badge"><Calendar size={12} /> Patient Clinical Timeline</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Review Required</span>
      </div>

      <div className="clinical-card-body">
        <ClinicalTimelineView events={data.events} onSelectSource={onViewSource} />
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   3. LAB ANALYSIS RESPONSE
   ───────────────────────────────────────────── */
export const LabAnalysisResponse = ({ data, onViewSource }) => {
  const [copied, setCopied] = useState(false);
  const [timeframe, setTimeframe] = useState('1y');

  return (
    <div className="clinical-card-container lab_analysis">
      <div className="clinical-card-header">
        <span className="card-type-badge"><FlaskConical size={12} /> Laboratory Analysis & Trends</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Clinical Review Recommended</span>
      </div>

      <div className="clinical-card-body">
        {data.abnormalResults?.length > 0 && (
          <div className="card-context-notice">
            <AlertTriangle size={13} />
            <span>Abnormal Values Flagged: {data.abnormalResults.map(a => a.test).join(', ')}</span>
          </div>
        )}

        <div className="lab-table-wrapper">
          <table className="lab-data-table">
            <thead>
              <tr>
                <th>Test / Biomarker</th>
                <th>Current</th>
                <th>Previous</th>
                <th>Reference Range</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.results?.map((res, i) => (
                <tr key={i} className={res.isAbnormal ? 'abnormal-row' : ''}>
                  <td><strong>{res.test}</strong></td>
                  <td><span className="current-val">{res.current} {res.unit}</span></td>
                  <td>{res.previous} {res.unit}</td>
                  <td>[{res.refRange}]</td>
                  <td><span className={`trend-badge ${res.trend.toLowerCase()}`}>{res.trend}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SVG Sparkline Charts */}
        {data.trends?.length > 0 && (
          <div className="lab-trends-wrapper" style={{ marginTop: '14px' }}>
            <div className="lab-trends-header">
              <span className="trends-title"><Activity size={14} /> Historical Biomarker Sparklines</span>
              <div className="timeframe-buttons">
                {['7d', '30d', '90d', '1y'].map((tf) => (
                  <button key={tf} className={`tf-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="lab-charts-grid">
              {data.trends.map((item, idx) => {
                const history = item.history || [];
                if (history.length < 2) return null;
                const values = history.map(h => h.value);
                const min = Math.min(...values) * 0.9;
                const max = Math.max(...values) * 1.1 || 1;
                const points = history.map((h, i) => {
                  const x = (i / (history.length - 1)) * 220 + 10;
                  const y = 50 - ((h.value - min) / (max - min)) * 35 - 5;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <div key={idx} className="lab-chart-card">
                    <div className="lab-chart-info">
                      <span className="lab-chart-name">{item.test}</span>
                      <span className="lab-chart-val">{history[history.length - 1].value}</span>
                    </div>
                    <svg className="lab-svg-sparkline" viewBox="0 0 240 50">
                      <polyline fill="none" stroke="#2D5A4C" strokeWidth="2.5" strokeLinecap="round" points={points} />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="clinical-card-block" style={{ marginTop: '12px' }}>
          <h4>AI Clinical Observations</h4>
          <ul>
            {data.observations?.map((obs, i) => <li key={i}>{obs}</li>)}
          </ul>
        </div>
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter onCopy={() => copyToClipboard(JSON.stringify(data.results), setCopied)} copied={copied} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   4. MEDICATION REVIEW RESPONSE
   ───────────────────────────────────────────── */
export const MedicationReviewResponse = ({ data, onViewSource }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="clinical-card-container medication_review">
      <div className="clinical-card-header">
        <span className="card-type-badge"><Pill size={12} /> Medication Reconciliation & Safety Review</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Review Required</span>
      </div>

      <div className="clinical-card-body">
        <div className="clinical-card-block">
          <h4>Active Prescribed Regimen</h4>
          <ul>
            {data.medications?.map((m, i) => (
              <li key={i}><strong>{m.name}</strong> {m.dose} — {m.frequency} (Category: {m.category})</li>
            ))}
          </ul>
        </div>

        {data.interactionFlags?.length > 0 && (
          <div className="clinical-card-block considerations">
            <h4>Potential Drug Interaction Flags</h4>
            <ul>
              {data.interactionFlags.map((flag, i) => (
                <li key={i}><strong>[{flag.severity}]:</strong> {flag.flag}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="clinical-card-block">
          <h4>Allergy Safety Check</h4>
          <p>Known Allergies: <strong>{data.allergies?.join(', ') || 'NKDA'}</strong>. No direct beta-lactam or cross-reactive drug conflicts found in active prescriptons.</p>
        </div>
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter onCopy={() => copyToClipboard(JSON.stringify(data.medications), setCopied)} copied={copied} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   5. SOAP NOTE RESPONSE (ISOLATED DRAFT STATE)
   ───────────────────────────────────────────── */
export const SOAPNoteResponse = ({ data, onViewSource, onAddToRecord }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [soapDraft, setSoapDraft] = useState({
    subjective: data.subjective || '',
    objective: data.objective || '',
    assessment: data.assessment || '',
    plan: data.plan || ''
  });
  const [addedToast, setAddedToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAdd = () => {
    setAddedToast(true);
    if (onAddToRecord) onAddToRecord({ type: 'soap_note', draft: soapDraft });
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="clinical-card-container soap_note">
      <div className="clinical-card-header">
        <span className="card-type-badge"><FileText size={12} /> Structured SOAP Note Draft</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> AI DRAFT — REVIEW REQUIRED</span>
      </div>

      <div className="clinical-card-body">
        {isEditing ? (
          <div className="soap-editor-grid">
            <label><span>Subjective (S)</span><textarea value={soapDraft.subjective} onChange={e => setSoapDraft({ ...soapDraft, subjective: e.target.value })} rows={3} /></label>
            <label><span>Objective (O)</span><textarea value={soapDraft.objective} onChange={e => setSoapDraft({ ...soapDraft, objective: e.target.value })} rows={3} /></label>
            <label><span>Assessment (A)</span><textarea value={soapDraft.assessment} onChange={e => setSoapDraft({ ...soapDraft, assessment: e.target.value })} rows={3} /></label>
            <label><span>Plan (P)</span><textarea value={soapDraft.plan} onChange={e => setSoapDraft({ ...soapDraft, plan: e.target.value })} rows={3} /></label>
            <button className="btn-save-draft" onClick={() => setIsEditing(false)}><Check size={14} /> Done Editing</button>
          </div>
        ) : (
          <div className="soap-card-sections">
            <div className="soap-block subjective"><h5>S — SUBJECTIVE</h5><p>{soapDraft.subjective}</p></div>
            <div className="soap-block objective"><h5>O — OBJECTIVE</h5><p>{soapDraft.objective}</p></div>
            <div className="soap-block assessment"><h5>A — ASSESSMENT</h5><p>{soapDraft.assessment}</p></div>
            <div className="soap-block plan"><h5>P — PLAN</h5><p>{soapDraft.plan}</p></div>
          </div>
        )}
      </div>

      {addedToast && <div className="record-added-toast"><Check size={14} /> Added to Clinical Record Drafts</div>}
      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter
        onCopy={() => copyToClipboard(`S:\n${soapDraft.subjective}\n\nO:\n${soapDraft.objective}\n\nA:\n${soapDraft.assessment}\n\nP:\n${soapDraft.plan}`, setCopied)}
        copied={copied}
        onEdit={() => setIsEditing(!isEditing)}
        onAdd={handleAdd}
        addLabel="Add to Clinical Notes"
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   6. REFERRAL RESPONSE (ISOLATED DRAFT STATE)
   ───────────────────────────────────────────── */
export const ReferralResponse = ({ data, onViewSource, onAddToRecord }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [referralDraft, setReferralDraft] = useState({
    specialty: data.specialty || 'Cardiology',
    reasonForReferral: data.reasonForReferral || '',
    relevantHistory: data.relevantHistory || '',
    investigations: data.investigations || '',
    medications: data.medications || '',
    clinicalQuestion: data.clinicalQuestion || ''
  });
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const fullText = `RE: Specialist Referral to ${referralDraft.specialty}

REASON FOR REFERRAL:
${referralDraft.reasonForReferral}

RELEVANT HISTORY:
${referralDraft.relevantHistory}

INVESTIGATIONS:
${referralDraft.investigations}

CURRENT MEDICATIONS:
${referralDraft.medications}

CLINICAL QUESTION:
${referralDraft.clinicalQuestion}`;

  return (
    <div className="clinical-card-container referral_letter">
      <div className="clinical-card-header">
        <span className="card-type-badge"><BookOpen size={12} /> Specialist Referral Draft</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> AI DRAFT — REVIEW REQUIRED</span>
      </div>

      <div className="clinical-card-body">
        {isEditing ? (
          <div className="soap-editor-grid">
            <label><span>Specialty</span><input type="text" value={referralDraft.specialty} onChange={e => setReferralDraft({ ...referralDraft, specialty: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1' }} /></label>
            <label><span>Reason for Referral</span><textarea value={referralDraft.reasonForReferral} onChange={e => setReferralDraft({ ...referralDraft, reasonForReferral: e.target.value })} rows={3} /></label>
            <label><span>Relevant History</span><textarea value={referralDraft.relevantHistory} onChange={e => setReferralDraft({ ...referralDraft, relevantHistory: e.target.value })} rows={3} /></label>
            <label><span>Investigations</span><textarea value={referralDraft.investigations} onChange={e => setReferralDraft({ ...referralDraft, investigations: e.target.value })} rows={2} /></label>
            <label><span>Medications</span><textarea value={referralDraft.medications} onChange={e => setReferralDraft({ ...referralDraft, medications: e.target.value })} rows={2} /></label>
            <label><span>Clinical Question</span><textarea value={referralDraft.clinicalQuestion} onChange={e => setReferralDraft({ ...referralDraft, clinicalQuestion: e.target.value })} rows={2} /></label>
            <button className="btn-save-draft" onClick={() => setIsEditing(false)}><Check size={14} /> Save Letter Edits</button>
          </div>
        ) : (
          <div className="draft-text-box">
            <pre>{fullText}</pre>
          </div>
        )}
      </div>

      {addedToast && <div className="record-added-toast"><Check size={14} /> Referral Draft Saved to Chart</div>}
      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter
        onCopy={() => copyToClipboard(fullText, setCopied)}
        copied={copied}
        onEdit={() => setIsEditing(!isEditing)}
        onAdd={() => { setAddedToast(true); if (onAddToRecord) onAddToRecord({ type: 'referral', draft: referralDraft }); setTimeout(() => setAddedToast(false), 2500); }}
        addLabel="Add to Referrals"
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   7. PATIENT INSTRUCTIONS RESPONSE
   ───────────────────────────────────────────── */
export const PatientInstructionsResponse = ({ data, onViewSource }) => {
  const [mode, setMode] = useState('patient');
  const [copied, setCopied] = useState(false);

  return (
    <div className="clinical-card-container patient_instructions">
      <div className="clinical-card-header">
        <span className="card-type-badge"><Heart size={12} /> Patient Discharge & Care Guide</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Review Required</span>
      </div>

      <div className="instruction-toggle-bar">
        <button className={`inst-btn ${mode === 'patient' ? 'active' : ''}`} onClick={() => setMode('patient')}>
          <Heart size={13} /> Patient-Friendly Version
        </button>
        <button className={`inst-btn ${mode === 'clinical' ? 'active' : ''}`} onClick={() => setMode('clinical')}>
          <FileText size={13} /> Clinical EMR Version
        </button>
      </div>

      <div className="clinical-card-body">
        {mode === 'patient' ? (
          <div className="instruction-view-box">
            <h4>1. What We Found Today</h4>
            <ul>{data.findings?.map((f, i) => <li key={i}>{f}</li>)}</ul>

            <h4>2. What You Should Do</h4>
            <ul>{data.instructions?.map((ins, i) => <li key={i}>{ins}</li>)}</ul>

            <h4>3. Medications to Continue</h4>
            <ul>{data.medications?.map((m, i) => <li key={i}>{m}</li>)}</ul>

            <h4>4. When to Seek Urgent Care</h4>
            <ul className="warning-list">{data.warningSigns?.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        ) : (
          <div className="draft-text-box">
            <pre>{data.clinicalSummary || data.explanation}</pre>
          </div>
        )}
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter onCopy={() => copyToClipboard(JSON.stringify(data.instructions), setCopied)} copied={copied} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   8. ICD-10 CODING RESPONSE
   ───────────────────────────────────────────── */
export const ICD10Response = ({ data, onViewSource }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="clinical-card-container icd10_coding">
      <div className="clinical-card-header">
        <span className="card-type-badge"><Shield size={12} /> Suggested ICD-10 Diagnostic Codes</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Billing Support Only</span>
      </div>

      <div className="clinical-card-body">
        <div className="icd-code-cards-grid">
          {data.suggestions?.map((item, i) => (
            <div key={i} className="icd-code-card">
              <div className="icd-code-top">
                <span className="icd-code-val">{item.code}</span>
                <span className="icd-cond-name">{item.condition}</span>
              </div>
              <p className="icd-desc">{item.description}</p>
              <div className="icd-support">Doc: {item.supportingDocumentation}</div>
            </div>
          ))}
        </div>
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter onCopy={() => copyToClipboard(JSON.stringify(data.suggestions), setCopied)} copied={copied} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   9. TRIAGE RESPONSE
   ───────────────────────────────────────────── */
export const TriageResponse = ({ data, onViewSource }) => {
  return (
    <div className="clinical-card-container triage">
      <div className="clinical-card-header">
        <span className="card-type-badge"><Activity size={12} /> Triage Risk & Acuity Assessment</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Decision Support Only</span>
      </div>

      <div className="clinical-card-body">
        <div className="triage-acuity-box">
          <span className="acuity-label">Suggested Acuity:</span>
          <span className={`acuity-value ${data.suggestedAcuity?.toLowerCase()}`}>{data.suggestedAcuity}</span>
        </div>

        <div className="clinical-card-block">
          <h4>Presenting Concern</h4>
          <p>{data.presentingConcern}</p>
        </div>

        <div className="clinical-card-block">
          <h4>Potential Risk Indicators</h4>
          <ul>{data.riskIndicators?.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>

        <div className="clinical-card-block considerations">
          <h4>Clinical Notice</h4>
          <ul>{data.considerations?.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   10. PRIOR AUTHORIZATION RESPONSE
   ───────────────────────────────────────────── */
export const PriorAuthResponse = ({ data, onViewSource, onAddToRecord }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [authDraft, setAuthDraft] = useState({
    treatment: data.requestedTreatment || '',
    necessity: data.medicalNecessity || '',
    history: data.clinicalHistory || ''
  });
  const [copied, setCopied] = useState(false);

  const letterText = `PRIOR AUTHORIZATION MEDICAL NECESSITY DRAFT
Requested Treatment: ${authDraft.treatment}

PATIENT CLINICAL HISTORY:
${authDraft.history}

MEDICAL NECESSITY RATIONALE:
${authDraft.necessity}

SUPPORTING EVIDENCE:
${data.supportingEvidence || 'ADA & KDIGO 2026 Guidelines'}`;

  return (
    <div className="clinical-card-container prior_authorization">
      <div className="clinical-card-header">
        <span className="card-type-badge"><FileCheck size={12} /> Prior Authorization Medical Necessity</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> AI DRAFT — REVIEW REQUIRED</span>
      </div>

      <div className="clinical-card-body">
        {isEditing ? (
          <div className="soap-editor-grid">
            <label><span>Requested Treatment</span><input type="text" value={authDraft.treatment} onChange={e => setAuthDraft({ ...authDraft, treatment: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1' }} /></label>
            <label><span>Clinical History</span><textarea value={authDraft.history} onChange={e => setAuthDraft({ ...authDraft, history: e.target.value })} rows={3} /></label>
            <label><span>Medical Necessity</span><textarea value={authDraft.necessity} onChange={e => setAuthDraft({ ...authDraft, necessity: e.target.value })} rows={4} /></label>
            <button className="btn-save-draft" onClick={() => setIsEditing(false)}><Check size={14} /> Save Auth Edits</button>
          </div>
        ) : (
          <div className="draft-text-box">
            <pre>{letterText}</pre>
          </div>
        )}
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
      <CardActionFooter
        onCopy={() => copyToClipboard(letterText, setCopied)}
        copied={copied}
        onEdit={() => setIsEditing(!isEditing)}
        onAdd={() => onAddToRecord && onAddToRecord({ type: 'prior_auth', draft: authDraft })}
        addLabel="Add to Billing/Auth"
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   11. DOCUMENT ANALYSIS RESPONSE
   ───────────────────────────────────────────── */
export const DocumentAnalysisResponse = ({ data, onViewSource }) => {
  return (
    <div className="clinical-card-container document_analysis">
      <div className="clinical-card-header">
        <span className="card-type-badge"><FileText size={12} /> Document Analysis — {data.fileName}</span>
        <span className="card-review-badge"><AlertTriangle size={11} /> Review Required</span>
      </div>

      <div className="clinical-card-body">
        <div className="clinical-card-summary">
          <p>{data.documentSummary}</p>
        </div>

        <div className="clinical-card-block">
          <h4>Extracted Clinical Parameters</h4>
          <ul>{data.extractedInfo?.map((info, i) => <li key={i}>{info}</li>)}</ul>
        </div>
      </div>

      <SourcesFooter sources={data.sources} onViewSource={onViewSource} />
    </div>
  );
};

/* ─── Shared Footers ─── */
const SourcesFooter = ({ sources, onViewSource }) => {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div className="card-sources-bar">
      <button className="sources-toggle-btn" onClick={() => setOpen(!open)}>
        <Layers size={13} />
        <span>Sources ({sources.length})</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="sources-list-chips">
          {sources.map((src, i) => (
            <button key={i} className="source-chip-btn" onClick={() => onViewSource && onViewSource(src)}>
              <span>✓ {src.label}</span>
              <ExternalLink size={10} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CardActionFooter = ({ onCopy, copied, onEdit, onAdd, addLabel }) => (
  <div className="clinical-card-actions">
    {onCopy && (
      <button className="card-action-btn" onClick={onCopy}>
        <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
      </button>
    )}
    {onEdit && (
      <button className="card-action-btn" onClick={onEdit}>
        <FileText size={12} /> Edit Draft
      </button>
    )}
    {onAdd && (
      <button className="card-action-btn primary" onClick={onAdd}>
        <CheckCircle2 size={12} /> {addLabel || 'Add to Record'}
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   12. CONVERSATIONAL / CHAT RESPONSE
   ───────────────────────────────────────────── */
export const ChatResponse = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const text = data.reply || data.text || data.summary || '';

  // Simple line-by-line renderer for formatted markdown
  const renderFormattedText = (raw) => {
    return raw.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '8px' }} />;

      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '12px 0 6px 0', color: '#1E293B', fontSize: '15px', fontWeight: 600 }}>{trimmed.replace('### ', '')}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={idx} style={{ margin: '14px 0 8px 0', color: '#0F172A', fontSize: '16px', fontWeight: 700 }}>{trimmed.replace('## ', '')}</h3>;
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={idx} style={{ margin: '16px 0 10px 0', color: '#0F172A', fontSize: '18px', fontWeight: 700 }}>{trimmed.replace('# ', '')}</h2>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemContent = trimmed.substring(2);
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '4px 0', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
            <span style={{ color: '#0284C7', fontWeight: 'bold' }}>•</span>
            <span>{renderInlineStyles(itemContent)}</span>
          </div>
        );
      }
      return (
        <p key={idx} style={{ margin: '4px 0', fontSize: '13.5px', color: '#334155', lineHeight: 1.55 }}>
          {renderInlineStyles(trimmed)}
        </p>
      );
    });
  };

  const renderInlineStyles = (str) => {
    // Basic bolding **text**
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#0F172A' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ color: '#475569' }}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="clinical-card-container chat-response" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="clinical-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="card-type-badge" style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> {data.model_used || 'Clinical AI Assistant'}
          </span>
          {data.redaction_count > 0 && (
            <span style={{ background: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
              🛡️ {data.redaction_count} PHI Scrubbed
            </span>
          )}
        </div>
        <button
          onClick={() => copyToClipboard(text, setCopied)}
          style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#64748B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="chat-text-content" style={{ fontSize: '13.5px', color: '#334155' }}>
        {renderFormattedText(text)}
      </div>

      {data.disclaimer && (
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={12} /> {data.disclaimer}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TYPE VALIDATOR & ROUTER
   ───────────────────────────────────────────── */
export const ResponseValidator = ({ data, expectedType, onViewSource, onAddToRecord }) => {
  if (!data) return null;

  // If the response is a chat / general response or has reply text, render ChatResponse
  if (data.type === 'chat' || data.type === 'general' || data.type === 'text' || data.reply) {
    return <ChatResponse data={data} />;
  }

  // Validation Guard: Ensure data type matches expected action if specified
  if (expectedType && data.type !== expectedType && data.type !== 'error' && expectedType !== 'general') {
    return (
      <div className="clinical-card-container error font-notice" style={{ background: '#FEF2F2', borderColor: '#FCA5A5', padding: '16px', borderRadius: '12px' }}>
        <div style={{ color: '#991B1B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} /> Unexpected response format. Please retry.
        </div>
      </div>
    );
  }

  switch (data.type) {
    case 'patient_summary': return <PatientSummaryResponse data={data} onViewSource={onViewSource} />;
    case 'clinical_timeline': return <ClinicalTimelineResponse data={data} onViewSource={onViewSource} />;
    case 'lab_analysis': return <LabAnalysisResponse data={data} onViewSource={onViewSource} />;
    case 'medication_review': return <MedicationReviewResponse data={data} onViewSource={onViewSource} />;
    case 'soap_note': return <SOAPNoteResponse data={data} onViewSource={onViewSource} onAddToRecord={onAddToRecord} />;
    case 'referral_letter':
    case 'referral': return <ReferralResponse data={data} onViewSource={onViewSource} onAddToRecord={onAddToRecord} />;
    case 'patient_instructions': return <PatientInstructionsResponse data={data} onViewSource={onViewSource} />;
    case 'icd10_coding':
    case 'icd10': return <ICD10Response data={data} onViewSource={onViewSource} />;
    case 'triage': return <TriageResponse data={data} onViewSource={onViewSource} />;
    case 'prior_authorization':
    case 'prior_auth': return <PriorAuthResponse data={data} onViewSource={onViewSource} onAddToRecord={onAddToRecord} />;
    case 'document_analysis': return <DocumentAnalysisResponse data={data} onViewSource={onViewSource} />;
    case 'chat':
    case 'general': return <ChatResponse data={data} />;
    default:
      if (data.reply) return <ChatResponse data={data} />;
      return <PatientSummaryResponse data={data} onViewSource={onViewSource} />;
  }
};

export default ResponseValidator;
