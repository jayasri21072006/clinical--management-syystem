import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Activity,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Pill,
  ArrowRight,
  RefreshCw,
  Info,
  CheckSquare,
  Square,
  FileSearch,
  Send,
  Upload,
  Image as ImageIcon,
  FlaskConical,
  BrainCircuit,
  FileCheck2,
  Download,
  Check,
  HelpCircle,
  Cpu,
  Zap,
  Ban,
  Shield
} from 'lucide-react';
import api from '../../services/api';
import AuditLogPanel from './AuditLogPanel';
import './AIAssistant.css';

// Sample presets for quick demonstration
const SAMPLE_CHEST_XRAY = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%230b1329'/%3E%3Cpath d='M140,80 Q200,60 260,80 L280,240 Q200,260 120,240 Z' fill='%231e293b' stroke='%2338bdf8' stroke-width='2' opacity='0.7'/%3E%3Cellipse cx='170' cy='150' rx='35' ry='60' fill='%23334155' opacity='0.6'/%3E%3Cellipse cx='230' cy='150' rx='35' ry='60' fill='%23334155' opacity='0.6'/%3E%3Cpath d='M190,140 Q210,180 200,210' stroke='%23f43f5e' stroke-width='3' fill='none'/%3E%3Ctext x='20' y='30' fill='%2338bdf8' font-family='sans-serif' font-size='12'%3ECHEST PA - DE-IDENTIFIED RADIOGRAPH%3C/text%3E%3C/svg%3E";

const SAMPLE_DERM_PHOTO = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23451a03'/%3E%3Ccircle cx='200' cy='150' r='60' fill='%2378350f' stroke='%23f59e0b' stroke-width='3' stroke-dasharray='4'/%3E%3Ccircle cx='190' cy='140' r='25' fill='%23991b1b' opacity='0.8'/%3E%3Ccircle cx='215' cy='160' r='18' fill='%23b91c1c' opacity='0.7'/%3E%3Ctext x='20' y='30' fill='%23fbbf24' font-family='sans-serif' font-size='12'%3EDERMATOLOGY CLINICAL SCAN - ERYTHEMA%3C/text%3E%3C/svg%3E";

const SAMPLE_LAB_TEXT = `BIOCHEMISTRY & METABOLIC LABORATORY REPORT
Patient Reference: #LAB-8942 | Specimen: Venous Blood

1. GLYCEMIC PROFILE
- Fasting Blood Glucose: 142 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
- Glycated Hemoglobin (HbA1c): 7.9% (Reference: < 5.7%) [HIGH]

2. LIPID PROFILE
- Total Cholesterol: 224 mg/dL (Reference: < 200 mg/dL) [HIGH]
- Triglycerides: 185 mg/dL (Reference: < 150 mg/dL) [HIGH]
- HDL (Good Cholesterol): 38 mg/dL (Reference: > 50 mg/dL) [LOW]
- LDL (Bad Cholesterol): 149 mg/dL (Reference: < 100 mg/dL) [HIGH]

3. RENAL & ELECTROLYTE FUNCTION
- Serum Creatinine: 0.95 mg/dL (Reference: 0.6 - 1.2 mg/dL) [NORMAL]
- Blood Urea Nitrogen: 16 mg/dL (Reference: 7 - 20 mg/dL) [NORMAL]
- Serum Potassium: 4.2 mEq/L (Reference: 3.5 - 5.0 mEq/L) [NORMAL]

4. LIVER FUNCTION
- SGOT / AST: 28 U/L (Reference: 10 - 40 U/L) [NORMAL]
- SGPT / ALT: 32 U/L (Reference: 7 - 56 U/L) [NORMAL]`;

const SAMPLE_DOCUMENT = `CLINICAL PROGRESS NOTE
Patient Name: Ananya Sharma
DOB: 14/05/1996 | MRN: #48921 | Contact: +91 98401 12345 | Email: ananya@gmail.com
Address: 104 MG Road, Indiranagar, Bengaluru

Chief Complaints:
Patient presents with 6-month history of severe unilateral pulsating headaches accompanied by photophobia and nausea. Reports stress triggers and disturbed sleep pattern.

Vital Signs:
BP: 138/88 mmHg | HR: 82 bpm | Temp: 98.6 F | SpO2: 98%

Clinical Assessment & Diagnosis:
Psora-Vasomotor background. Clinical presentation consistent with Chronic Migraine with Aura. Secondary evaluation shows mild stress-induced hypertension baseline.

Prescribed Regimen:
1. Belladonna 200C - 4 pills twice daily before meals (7 days)
2. Natrum Muriaticum 30C - 4 pills at bedtime (14 days)
3. Biochemic #12 - 2 tablets thrice daily`;

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('agent'); // agent | image | lab_report | doc_analysis | safety_report | governance

  // 1. Multi-Factor Agent State
  const [agentForm, setAgentForm] = useState({
    age: '58',
    gender: 'Female',
    vitals: { bp: '138/88 mmHg', hr: '82 bpm', spo2: '98%' },
    chief_complaints: 'Severe unilateral headaches, photophobia, shortness of breath on climbing stairs for 3 days',
    symptoms: 'Throbbing Headache, Dyspnea, Mild Fatigue, Ankle heaviness',
    diagnosis: 'Chronic Migraine with Aura, Stage 1 Essential Hypertension baseline',
    current_medications: 'Amlodipine 5mg, Metformin 500mg, Belladonna 200C',
    lab_summary: 'HbA1c 7.9% (Elevated), Total Cholesterol 224 mg/dL, Normal Creatinine 0.95',
    imaging_summary: 'Chest Radiograph shows mild bronchovascular prominence; no acute consolidation.'
  });
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [agentReviewed, setAgentReviewed] = useState(false);

  // 2. Medical Image Analysis State
  const [imageBase64, setImageBase64] = useState(SAMPLE_CHEST_XRAY);
  const [imageNotes, setImageNotes] = useState('Patient with persistent cough and mild chest tightness. Evaluate cardiothoracic ratio and lung parenchyma.');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState(null);

  // 3. Lab Report State
  const [labText, setLabText] = useState(SAMPLE_LAB_TEXT);
  const [labLoading, setLabLoading] = useState(false);
  const [labResult, setLabResult] = useState(null);

  // 4. Document Analysis State
  const [docText, setDocText] = useState(SAMPLE_DOCUMENT);
  const [patientName, setPatientName] = useState('Ananya Sharma');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docResult, setDocResult] = useState(null);
  const [docReviewed, setDocReviewed] = useState(false);

  // 5. Governance & Safety State
  const [govPolicy, setGovPolicy] = useState(null);
  const [safetyReportLoading, setSafetyReportLoading] = useState(false);
  const [safetyReportResult, setSafetyReportResult] = useState(null);

  // 6. Audit Stats State
  const [auditStats, setAuditStats] = useState(null);

  useEffect(() => {
    api.getGovernancePolicy()
      .then(res => setGovPolicy(res))
      .catch(err => console.error("Error loading governance policy:", err));
    api.getAuditStats()
      .then(res => setAuditStats(res.stats))
      .catch(() => {});
  }, []);

  // Handlers
  const handleRunAgent = async () => {
    setAgentLoading(true);
    setAgentReviewed(false);
    try {
      const res = await api.runMultiFactorAgent(agentForm);
      setAgentResult(res.agent_synthesis);
    } catch (err) {
      console.error("Multi-factor agent error:", err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageBase64) return;
    setImageLoading(true);
    try {
      const res = await api.analyzeImage({
        image_base64: imageBase64,
        clinical_notes: imageNotes,
        patient_name: patientName
      });
      setImageResult(res.image_analysis);
    } catch (err) {
      console.error("Image analysis error:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeLabReport = async () => {
    if (!labText.trim()) return;
    setLabLoading(true);
    try {
      const res = await api.analyzeLabReport({
        lab_text: labText,
        patient_name: patientName
      });
      setLabResult(res.lab_analysis);
    } catch (err) {
      console.error("Lab report analysis error:", err);
    } finally {
      setLabLoading(false);
    }
  };

  const handlePreviewRedaction = async () => {
    if (!docText.trim()) return;
    setPreviewLoading(true);
    setDocResult(null);
    setDocReviewed(false);
    try {
      const res = await api.previewRedaction({
        raw_text: docText,
        patient_name: patientName
      });
      setPreviewResult(res);
    } catch (err) {
      console.error("Redaction preview error:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAnalyzeDoc = async () => {
    if (!docText.trim()) return;
    setDocLoading(true);
    setDocReviewed(false);
    try {
      const res = await api.analyzeDocument({
        raw_text: docText,
        patient_name: patientName
      });
      setDocResult(res);
      setPreviewResult({
        sanitized_text: res.sanitized_prompt_sent_to_gemini,
        redaction_audit_log: res.redaction_audit_log,
        total_phi_elements_redacted: res.total_phi_elements_redacted
      });
    } catch (err) {
      console.error("Document analysis error:", err);
    } finally {
      setDocLoading(false);
    }
  };

  const handleGenerateSafetyReportTab = async () => {
    setSafetyReportLoading(true);
    try {
      const res = await api.generateSafetyReport({
        age: agentForm.age,
        gender: agentForm.gender,
        chief_complaints: agentForm.chief_complaints,
        diagnosis: agentForm.diagnosis,
        current_medications: agentForm.current_medications
      });
      setSafetyReportResult(res.safety_report);
    } catch (err) {
      console.error("Safety report error:", err);
    } finally {
      setSafetyReportLoading(false);
    }
  };

  const handleDownloadSafetyPDFFromTab = (rep) => {
    if (!rep) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      alert('Please allow popups to download report PDFs.');
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Safety & Clinical Governance Report - ${rep.report_id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; margin: 0; line-height: 1.5; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: 800; color: #065f46; letter-spacing: -0.5px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; border: 1px solid #a7f3d0; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 20px; }
            h2 { color: #1e293b; margin-top: 0; font-size: 18px; }
            h3 { color: #334155; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 20px; }
            ul { margin: 8px 0 0 20px; padding: 0; }
            li { margin-bottom: 6px; font-size: 13px; color: #334155; }
            .disclaimer { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; font-size: 12px; color: #991b1b; margin-top: 24px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">SAGE GREEN WELLNESS CLINIC</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Clinical Decision Support & Data Governance Division</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">HIPAA DE-IDENTIFIED</span>
              <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Report ID: ${rep.report_id}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${rep.audit_timestamp}</div>
            </div>
          </div>

          <div class="card">
            <h2>AI Safety & Clinical Risk Governance Audit</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div><strong>AI Model Engine:</strong> ${rep.ai_model_version}</div>
              <div><strong>Overall Safety Rating:</strong> <span style="color: #059669; font-weight: bold;">${rep.overall_safety_rating}</span></div>
              <div><strong>Privacy Status:</strong> ${rep.privacy_compliance_status}</div>
              <div><strong>Risk Score Index:</strong> ${rep.clinical_risk_analysis?.risk_score_index}</div>
            </div>
          </div>

          <h3>Clinical Risk & Triage Recommendation</h3>
          <p style="font-size: 13px; color: #334155;"><strong>Triage Guidance:</strong> ${rep.clinical_risk_analysis?.triage_recommendation}</p>
          <div style="margin-top: 10px;">
            <strong>Contraindications & Safety Warnings:</strong>
            <ul>
              ${rep.clinical_risk_analysis?.contraindication_alerts?.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          <h3>Data Governance & HIPAA Privacy Safeguards</h3>
          <ul>
            ${rep.governance_safeguards?.map(g => `<li>${g}</li>`).join('')}
          </ul>

          <h3>Actionable Clinical Safety Protocols</h3>
          <ul>
            ${rep.actionable_safety_protocols?.map(p => `<li>${p}</li>`).join('')}
          </ul>

          <div class="disclaimer">
            <strong>MANDATORY HUMAN CLINICAL OVERSIGHT:</strong><br/>
            ${rep.clinician_sign_off_statement} AI decision support output must be validated by an authorized treating clinician prior to medical intervention.
          </div>

          <div class="footer">
            Confidential Healthcare Audit Document — Sage Green Wellness AI Privacy Gateway — Generated on ${new Date().toLocaleString()}
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="ai-assistant-container">
      {/* Header */}
      <div className="ai-header">
        <div>
          <div className="ai-header-title">
            <Sparkles size={28} className="text-emerald-400" />
            <h1>Multi-Purpose Secure Clinical AI Platform</h1>
            <span className="ai-badge">
              <ShieldCheck size={14} /> Server-Side Privacy Gateway Active
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Multi-Modal Medical Imaging · Lab Diagnostics · Clinical Decision Support · Governed by AI Security Gateway
          </p>
        </div>

        {/* Model Router Status Banner */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(2, 6, 23, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '8px', fontSize: '0.75rem', color: '#7dd3fc' }}>
            <Zap size={13} /><span><strong>Flash</strong> — Fast Tasks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '8px', fontSize: '0.75rem', color: '#c4b5fd' }}>
            <Cpu size={13} /><span><strong>Pro</strong> — Complex Reasoning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', fontSize: '0.75rem', color: '#34d399' }}>
            <Shield size={13} /><span>AI Router: <strong>Active</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', fontSize: '0.75rem', color: '#34d399' }}>
            <Lock size={13} /><span>Privacy Gateway: <strong>Active</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', fontSize: '0.75rem', color: '#34d399' }}>
            <Activity size={13} /><span>Audit Log: <strong>{auditStats ? `${auditStats.total_requests} entries` : 'Live'}</strong></span>
          </div>
          {auditStats?.injection_blocks > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', fontSize: '0.75rem', color: '#fca5a5' }}>
              <Ban size={13} /><span><strong>{auditStats.injection_blocks}</strong> Injections Blocked</span>
            </div>
          )}
        </div>

        {/* Mandatory Clinical Decision Support Standard Banner */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          padding: '0.75rem 1.25rem',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: '#fca5a5'
        }}>
          <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
          <span>
            <strong>Clinical Decision Support Standard:</strong> AI-generated information is intended only as clinical decision support. It must be reviewed and validated by an appropriately qualified healthcare professional before being used for patient care.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-tabs" style={{ flexWrap: 'wrap' }}>
        <button
          className={`ai-tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('agent')}
        >
          <BrainCircuit size={18} /> Multi-Factor Clinical Agent
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          <ImageIcon size={18} /> Medical Image Analysis (Gemini Vision)
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'lab_report' ? 'active' : ''}`}
          onClick={() => setActiveTab('lab_report')}
        >
          <FlaskConical size={18} /> Lab & Report Analysis
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'doc_analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('doc_analysis')}
        >
          <FileText size={18} /> Document De-Identification
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'safety_report' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('safety_report');
            if (!safetyReportResult) handleGenerateSafetyReportTab();
          }}
        >
          <FileCheck2 size={18} /> Safety & Governance Audit
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'audit_log' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit_log')}
        >
          <Shield size={18} /> Security Audit Log
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
          style={{ background: activeTab === 'instructions' ? 'linear-gradient(135deg, #059669 0%, #0284c7 100%)' : 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(52, 211, 153, 0.4)' }}
        >
          <ShieldCheck size={18} /> System Instructions & Rules
        </button>
      </div>

      {/* TAB 1: MULTI-FACTOR CLINICAL AGENT */}
      {activeTab === 'agent' && (
        <div className="ai-grid-2">
          {/* Left Column: Dossier Input */}
          <div className="ai-card">
            <div className="ai-card-title">
              <BrainCircuit size={20} className="text-emerald-400" /> Patient Multi-Modal Clinical Dossier
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Synthesizes Vitals, Symptoms, Lab Biomarkers, and Diagnostic Imaging into an individualized clinical strategy.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Age:</label>
                <input
                  type="text"
                  value={agentForm.age}
                  onChange={(e) => setAgentForm({ ...agentForm, age: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Gender:</label>
                <select
                  value={agentForm.gender}
                  onChange={(e) => setAgentForm({ ...agentForm, gender: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Blood Pressure:</label>
                <input
                  type="text"
                  value={agentForm.vitals.bp}
                  onChange={(e) => setAgentForm({ ...agentForm, vitals: { ...agentForm.vitals, bp: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Chief Complaints & Symptoms:</label>
              <textarea
                rows={2}
                value={agentForm.chief_complaints}
                onChange={(e) => setAgentForm({ ...agentForm, chief_complaints: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Laboratory Biomarker Summary:</label>
              <input
                type="text"
                value={agentForm.lab_summary}
                onChange={(e) => setAgentForm({ ...agentForm, lab_summary: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Diagnostic Imaging Summary (X-Ray / Scan / ECG):</label>
              <input
                type="text"
                value={agentForm.imaging_summary}
                onChange={(e) => setAgentForm({ ...agentForm, imaging_summary: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <button
              className="ai-btn-primary"
              onClick={handleRunAgent}
              disabled={agentLoading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)' }}
            >
              {agentLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Synthesizing Multi-Modal Factors with Gemini...
                </>
              ) : (
                <>
                  <BrainCircuit size={18} /> Execute Multi-Factor Agent Synthesis
                </>
              )}
            </button>
          </div>

          {/* Right Column: Integrated Strategy Output */}
          <div>
            {agentResult ? (
              <div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={22} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>CLINICAL DECISION SUPPORT NOTICE</strong>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                      Multi-Factor Agent correlations provide advisory decision support. Regimen must be validated by the licensed physician.
                    </p>
                  </div>
                </div>

                <div className="ai-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Unified Triage</span>
                      <h3 style={{ margin: '0.2rem 0 0 0', color: '#f8fafc' }}>Integrated Case Strategy</h3>
                    </div>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {agentResult.integrated_risk_matrix?.overall_vulnerability_score}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>HOLISTIC CASE ASSESSMENT:</span>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                      {agentResult.holistic_case_assessment}
                    </p>
                  </div>

                  {/* Key Findings & Abnormal Findings */}
                  {agentResult.key_findings && agentResult.key_findings.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#34d399' }}>Key Findings:</strong>
                      <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {agentResult.key_findings.map((kf, idx) => (
                          <li key={idx} style={{ marginBottom: '0.2rem' }}>{kf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {agentResult.abnormal_findings && agentResult.abnormal_findings.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>Abnormal Findings:</strong>
                      <div style={{ marginTop: '0.3rem' }}>
                        {agentResult.abnormal_findings.map((ab, idx) => (
                          <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.4rem 0.6rem', borderRadius: '6px', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                            <strong style={{ color: '#fcd34d' }}>{ab.finding || ab}</strong>
                            {ab.why_important && <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>{ab.why_important}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>Cross-Modal Correlations:</strong>
                    <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {agentResult.multimodal_correlations?.map((cor, idx) => (
                        <li key={idx} style={{ marginBottom: '0.3rem' }}>{cor}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>Individualized Prescriptive Strategy:</strong>
                    <div style={{ marginTop: '0.4rem' }}>
                      {agentResult.individualized_prescriptive_strategy?.map((item, idx) => (
                        <div key={idx} style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                          <div style={{ fontWeight: 700, color: '#34d399' }}>{item.remedy}</div>
                          <div style={{ color: '#cbd5e1' }}>Target: {item.indication}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Dosage: {item.dosage}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Follow-up & Limitations */}
                  {agentResult.suggested_follow_up && agentResult.suggested_follow_up.length > 0 && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>SUGGESTED CLINICAL FOLLOW-UP:</span>
                      <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: '#e2e8f0' }}>
                        {agentResult.suggested_follow_up.map((fu, idx) => (
                          <li key={idx}>{fu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {agentResult.limitations && (
                    <div style={{ background: 'rgba(148, 163, 184, 0.08)', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(148, 163, 184, 0.2)', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <strong style={{ color: '#cbd5e1' }}>Limitations:</strong> {agentResult.limitations}
                    </div>
                  )}

                  <div style={{
                    background: agentReviewed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${agentReviewed ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => setAgentReviewed(!agentReviewed)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {agentReviewed ? (
                        <CheckSquare size={20} className="text-emerald-400" />
                      ) : (
                        <Square size={20} style={{ color: '#94a3b8' }} />
                      )}
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: agentReviewed ? '#34d399' : '#cbd5e1' }}>
                          {agentReviewed ? "Multi-Factor Synthesis Validated by Clinician" : "Pending Clinician Validation"}
                        </strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: agentReviewed ? '#059669' : '#475569', color: '#fff', fontWeight: '600' }}>
                      {agentReviewed ? "CERTIFIED" : "UNVERIFIED"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <BrainCircuit size={48} style={{ color: '#475569', margin: '0 auto 1rem auto' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Multi-Factor Agent Ready</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                  Click <strong>"Execute Multi-Factor Agent Synthesis"</strong> to cross-correlate vitals, symptoms, lab markers, and diagnostic scans.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL IMAGE ANALYSIS (GEMINI VISION) */}
      {activeTab === 'image' && (
        <div className="ai-grid-2">
          {/* Left Column: Image Upload & Preview */}
          <div className="ai-card">
            <div className="ai-card-title">
              <ImageIcon size={20} className="text-blue-400" /> Multimodal Clinical Image Inspection
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Upload or select sample diagnostic images (Radiographs, Dermatology photos, ECG strips, Scanned reports) for Gemini Vision evaluation.
            </p>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setImageBase64(SAMPLE_CHEST_XRAY);
                  setImageNotes("Chest Radiograph PA view. Evaluate lung fields, cardiomegaly, and costophrenic angles.");
                }}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Sample Chest X-Ray
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setImageBase64(SAMPLE_DERM_PHOTO);
                  setImageNotes("Dermatology lesion scan on left forearm. Mild erythema with irregular margins.");
                }}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Sample Derm Scan
              </button>
            </div>

            {/* Preview Box */}
            <div style={{
              background: 'rgba(2, 6, 23, 0.8)',
              border: '2px dashed rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              {imageBase64 ? (
                <img
                  src={imageBase64}
                  alt="Clinical Inspection Target"
                  style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ padding: '2rem 0', color: '#64748b' }}>
                  <Upload size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Upload Medical Image File</div>
                </div>
              )}
            </div>

            {/* Custom Upload Button */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
                <Upload size={16} /> Choose Image from Device
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Clinical Context Notes (De-Identified):</label>
              <textarea
                rows={2}
                value={imageNotes}
                onChange={(e) => setImageNotes(e.target.value)}
                placeholder="Enter clinical presentation or anatomical region..."
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <button
              className="ai-btn-primary"
              onClick={handleAnalyzeImage}
              disabled={imageLoading || !imageBase64}
              style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
            >
              {imageLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Inspecting Image with Gemini Vision...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Run Gemini Vision Diagnostic Analysis
                </>
              )}
            </button>
          </div>

          {/* Right Column: Image Analysis Results */}
          <div>
            {imageResult ? (
              <div className="ai-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase' }}>Modality Detected</span>
                    <h3 style={{ margin: '0.2rem 0 0 0', color: '#f8fafc' }}>{imageResult.modality_type}</h3>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    fontWeight: 700
                  }}>
                    {imageResult.severity_index}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Visual Morphological Observations:</strong>
                  <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {imageResult.visual_observations?.map((obs, idx) => (
                      <li key={idx} style={{ marginBottom: '0.3rem' }}>{obs}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>Differential Diagnoses:</strong>
                  <div style={{ marginTop: '0.4rem' }}>
                    {imageResult.differential_diagnosis?.map((diff, idx) => (
                      <div key={idx} style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '0.5rem 0.8rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{diff.condition}:</strong> {diff.rationale}</span>
                        <span style={{ color: '#38bdf8', fontWeight: 600, marginLeft: '8px' }}>{diff.probability}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>DIAGNOSTIC SUMMARY:</span>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    {imageResult.clinical_summary}
                  </p>
                </div>

                <div>
                  <strong style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Recommended Confirmatory Investigations:</strong>
                  <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    {imageResult.recommended_investigations?.map((inv, idx) => (
                      <li key={idx} style={{ marginBottom: '0.2rem' }}>{inv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="ai-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <ImageIcon size={48} style={{ color: '#475569', margin: '0 auto 1rem auto' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Awaiting Image Inspection</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                  Select a clinical sample or upload a diagnostic scan to run Gemini Vision multimodal evaluation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LAB & REPORT ANALYSIS */}
      {activeTab === 'lab_report' && (
        <div className="ai-grid-2">
          {/* Left Column: Lab Report Input */}
          <div className="ai-card">
            <div className="ai-card-title">
              <FlaskConical size={20} className="text-emerald-400" /> Laboratory Report Input & Biomarker Extractor
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
                Unstructured Lab Test Data / Blood Panels:
              </label>
              <textarea
                className="ai-textarea"
                rows={10}
                value={labText}
                onChange={(e) => setLabText(e.target.value)}
                placeholder="Paste lab text, CBC, lipid profile, or metabolic panel..."
              />
            </div>

            <button
              className="ai-btn-primary"
              onClick={handleAnalyzeLabReport}
              disabled={labLoading || !labText.trim()}
              style={{ width: '100%' }}
            >
              {labLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Extracting Biomarkers & Risk Indicators...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Analyze Laboratory Biomarkers with Gemini
                </>
              )}
            </button>
          </div>

          {/* Right Column: Lab Analysis Results */}
          <div>
            {labResult ? (
              <div className="ai-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Pathology Breakdown</span>
                    <h3 style={{ margin: '0.2rem 0 0 0', color: '#f8fafc' }}>{labResult.panel_name}</h3>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    fontWeight: 700
                  }}>
                    {labResult.risk_flags_count} Flags Detected
                  </span>
                </div>

                {/* Biomarkers Table */}
                <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(2, 6, 23, 0.8)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Test Parameter</th>
                        <th style={{ padding: '8px' }}>Measured</th>
                        <th style={{ padding: '8px' }}>Reference</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResult.biomarkers?.map((b, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '8px', color: '#f8fafc', fontWeight: 600 }}>{b.test_name}</td>
                          <td style={{ padding: '8px', color: '#cbd5e1' }}>{b.measured_value}</td>
                          <td style={{ padding: '8px', color: '#94a3b8' }}>{b.reference_range}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: b.flag === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : b.flag === 'LOW' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: b.flag === 'HIGH' ? '#fca5a5' : b.flag === 'LOW' ? '#fbbf24' : '#34d399'
                            }}>
                              {b.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Organ System Impacts */}
                {labResult.organ_system_impact && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>Organ System Physiological Impact:</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#cbd5e1' }}>Metabolic:</strong> {labResult.organ_system_impact.metabolic}
                      </div>
                      <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#cbd5e1' }}>Cardiovascular:</strong> {labResult.organ_system_impact.cardiovascular}
                      </div>
                      <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#cbd5e1' }}>Renal:</strong> {labResult.organ_system_impact.renal}
                      </div>
                      <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#cbd5e1' }}>Hepatic:</strong> {labResult.organ_system_impact.hepatic}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>DIETARY & THERAPEUTIC ADVICE:</span>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    {labResult.therapeutic_diet_advice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="ai-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <FlaskConical size={48} style={{ color: '#475569', margin: '0 auto 1rem auto' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Awaiting Lab Analysis</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                  Click <strong>"Analyze Laboratory Biomarkers"</strong> to extract structured flags and organ system impacts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT ANALYSIS & REDACTION */}
      {activeTab === 'doc_analysis' && (
        <div className="ai-grid-2">
          {/* Left Column: Input Form */}
          <div className="ai-card">
            <div className="ai-card-title">
              <FileText size={20} className="text-emerald-400" /> 1. Input Clinical Record / Doctor Notes
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
                Patient Name (for explicit scrubbing validation):
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.9rem',
                  background: 'rgba(2, 6, 23, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
                Unstructured Clinical Text / Progress Notes:
              </label>
              <textarea
                className="ai-textarea"
                value={docText}
                onChange={(e) => {
                  setDocText(e.target.value);
                  setPreviewResult(null);
                }}
                placeholder="Paste SOAP notes, clinical summary, or lab report here..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="ai-btn-primary"
                onClick={handlePreviewRedaction}
                disabled={previewLoading || docLoading}
                style={{
                  flex: 1,
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8'
                }}
              >
                {previewLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} /> Inspecting PHI...
                  </>
                ) : (
                  <>
                    <FileSearch size={18} /> Preview PHI Redaction
                  </>
                )}
              </button>

              <button
                className="ai-btn-primary"
                onClick={handleAnalyzeDoc}
                disabled={docLoading || previewLoading}
                style={{ flex: 1 }}
              >
                {docLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} /> Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Sanitize & Send to AI
                  </>
                )}
              </button>
            </div>

            {previewResult && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} /> Redaction Gateway Preview ({previewResult.total_phi_elements_redacted} Elements Masked)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Safe for Gemini API</span>
                </div>

                <div className="redaction-preview-box" style={{ marginBottom: '1rem' }}>
                  {previewResult.sanitized_text}
                </div>

                {!docResult && (
                  <button
                    className="ai-btn-primary"
                    onClick={handleAnalyzeDoc}
                    disabled={docLoading}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)' }}
                  >
                    <Send size={18} /> Confirm & Dispatch Sanitized Text to Gemini
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: AI Analysis & Oversight */}
          <div>
            {docResult ? (
              <div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={22} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>HUMAN CLINICAL OVERSIGHT MANDATORY</strong>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                      AI-generated information is intended only as clinical decision support. It must be reviewed and validated by an appropriately qualified healthcare professional before being used for patient care.
                    </p>
                  </div>
                </div>

                <div className="ai-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                    <div className="ai-card-title" style={{ margin: 0 }}>
                      <Stethoscope size={20} className="text-blue-400" /> Structured Clinical Report Analysis
                    </div>
                    {docResult.ai_analysis.risk_support && (
                      <span style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: docResult.ai_analysis.risk_support.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : docResult.ai_analysis.risk_support.risk_level === 'MODERATE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: docResult.ai_analysis.risk_support.risk_level === 'HIGH' ? '#fca5a5' : docResult.ai_analysis.risk_support.risk_level === 'MODERATE' ? '#fbbf24' : '#34d399',
                        border: `1px solid ${docResult.ai_analysis.risk_support.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.4)' : docResult.ai_analysis.risk_support.risk_level === 'MODERATE' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                      }}>
                        Risk Level: {docResult.ai_analysis.risk_support.risk_level || 'LOW'}
                      </span>
                    )}
                  </div>

                  {/* 1. Clinical Summary */}
                  {docResult.ai_analysis.clinical_summary && (
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid #38bdf8' }}>
                      <span style={{ fontSize: '0.75rem', color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase' }}>Clinical Summary:</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#f1f5f9', lineHeight: '1.4' }}>
                        {docResult.ai_analysis.clinical_summary}
                      </p>
                    </div>
                  )}

                  {/* Working Diagnosis & Vitals */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Clinical Assessment</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontWeight: '600', color: '#f1f5f9', fontSize: '0.85rem' }}>
                        {docResult.ai_analysis.diagnosis}
                      </p>
                    </div>

                    <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Vitals Summary</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        BP: {docResult.ai_analysis.vital_signs?.blood_pressure || '120/80 mmHg'} | HR: {docResult.ai_analysis.vital_signs?.heart_rate || '78 bpm'}
                      </p>
                    </div>
                  </div>

                  {/* 2. Key Findings & 3. Abnormal Findings */}
                  {docResult.ai_analysis.key_findings && docResult.ai_analysis.key_findings.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700' }}>Key Findings:</span>
                      <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {docResult.ai_analysis.key_findings.map((kf, idx) => (
                          <li key={idx} style={{ marginBottom: '0.2rem' }}>{kf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {docResult.ai_analysis.abnormal_findings && docResult.ai_analysis.abnormal_findings.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700' }}>Abnormal / Important Findings:</span>
                      <div style={{ marginTop: '0.3rem' }}>
                        {docResult.ai_analysis.abnormal_findings.map((ab, idx) => (
                          <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                            <strong style={{ color: '#fcd34d' }}>{ab.finding || ab}</strong>
                            {ab.why_important && <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>{ab.why_important}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Evidence Separation (Section 1.B Requirement) */}
                  {docResult.ai_analysis.evidence_separation && (
                    <div style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Evidence Differentiation:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.78rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.5rem', borderRadius: '6px' }}>
                          <strong style={{ color: '#34d399' }}>1. Direct From Report:</strong>
                          <div style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>{docResult.ai_analysis.evidence_separation.found_in_report?.join('; ') || 'Explicit text data'}</div>
                        </div>
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.5rem', borderRadius: '6px' }}>
                          <strong style={{ color: '#38bdf8' }}>2. AI Interpretation:</strong>
                          <div style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>{docResult.ai_analysis.evidence_separation.ai_interpretation?.join('; ') || 'Analytical synthesis'}</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.5rem', borderRadius: '6px' }}>
                          <strong style={{ color: '#fbbf24' }}>3. Clinical Considerations:</strong>
                          <div style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>{docResult.ai_analysis.evidence_separation.possible_considerations?.join('; ') || 'Differential considerations'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Recommended Prescriptions / Regimen (Subject to validation):</span>
                    <div style={{ marginTop: '0.4rem' }}>
                      {docResult.ai_analysis.recommended_prescriptions?.map((med, idx) => (
                        <div key={idx} style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '0.5rem 0.8rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Pill size={14} className="text-emerald-400" />
                          <strong>{med.medicine}</strong> - {med.dosage} ({med.duration})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Suggested Follow-up */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>SUGGESTED CLINICAL FOLLOW-UP:</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#e2e8f0' }}>
                      {Array.isArray(docResult.ai_analysis.suggested_follow_up) ? docResult.ai_analysis.suggested_follow_up.join(' · ') : (docResult.ai_analysis.follow_up_recommendation || 'Clinical review in 7-10 days.')}
                    </p>
                  </div>

                  {/* 7. Limitations */}
                  {docResult.ai_analysis.limitations && (
                    <div style={{ background: 'rgba(148, 163, 184, 0.08)', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(148, 163, 184, 0.2)', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <strong style={{ color: '#cbd5e1' }}>Limitations & Uncertainty:</strong> {docResult.ai_analysis.limitations}
                    </div>
                  )}

                  {/* Clinician Review & Sign-Off Section */}
                  <div style={{
                    background: docReviewed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${docReviewed ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDocReviewed(!docReviewed)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {docReviewed ? (
                        <CheckSquare size={20} className="text-emerald-400" />
                      ) : (
                        <Square size={20} style={{ color: '#94a3b8' }} />
                      )}
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: docReviewed ? '#34d399' : '#cbd5e1' }}>
                          {docReviewed ? "Validated & Approved by Treating Clinician" : "Pending Clinician Verification & Review"}
                        </strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: docReviewed ? '#059669' : '#475569', color: '#fff', fontWeight: '600' }}>
                      {docReviewed ? "CERTIFIED" : "UNVERIFIED"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Eye size={48} style={{ color: '#475569', margin: '0 auto 1rem auto' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Awaiting Analysis Execution</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                  Click <strong>"Preview PHI Redaction"</strong> to verify that all patient identifiers are removed before sending data to Gemini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY & GOVERNANCE REPORT */}
      {activeTab === 'safety_report' && (
        <div>
          <div className="ai-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="ai-card-title" style={{ color: '#34d399', margin: 0 }}>
                <ShieldCheck size={24} /> Official Clinical Safety & Risk Governance Audit Report
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
                Audits multi-factor clinical variables, drug-drug contraindications, and HIPAA de-identification compliance using Google Gemini.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="ai-btn-primary"
                onClick={handleGenerateSafetyReportTab}
                disabled={safetyReportLoading}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {safetyReportLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Re-auditing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Re-run Audit
                  </>
                )}
              </button>
              {safetyReportResult && (
                <button
                  className="ai-btn-primary"
                  onClick={() => handleDownloadSafetyPDFFromTab(safetyReportResult)}
                  style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                >
                  <Download size={16} /> Export Official PDF
                </button>
              )}
            </div>
          </div>

          {safetyReportLoading ? (
            <div className="ai-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <RefreshCw className="animate-spin" size={44} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Evaluating Clinical Safety Parameters with Gemini...</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '450px', margin: '0 auto' }}>
                Executing automated PHI sanitization, drug-drug interaction matrix evaluation, and clinical governance audits.
              </p>
            </div>
          ) : safetyReportResult ? (
            <div>
              <div className="ai-grid-2">
                <div className="ai-card">
                  <div className="ai-card-title">
                    <ShieldCheck size={20} className="text-emerald-400" /> Audit Executive Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Safety Rating</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#34d399' }}>
                        {safetyReportResult.overall_safety_rating}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Privacy Compliance</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', fontWeight: '600', color: '#38bdf8' }}>
                        {safetyReportResult.privacy_compliance_status}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Risk Index</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#fbbf24' }}>
                        {safetyReportResult.clinical_risk_analysis?.risk_score_index}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>AI Model Version</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1' }}>
                        {safetyReportResult.ai_model_version}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ai-card">
                  <div className="ai-card-title">
                    <AlertTriangle size={20} className="text-amber-400" /> Contraindications & Alerts
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ marginTop: '0.4rem' }}>
                      {safetyReportResult.clinical_risk_analysis?.contraindication_alerts?.map((alert, idx) => (
                        <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.5rem 0.8rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#fca5a5' }}>
                          • {alert}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 6: SECURITY AUDIT LOG */}
      {activeTab === 'audit_log' && (
        <div>
          <AuditLogPanel />
        </div>
      )}

      {/* TAB 7: CLINICAL AI ASSISTANT SYSTEM INSTRUCTIONS & GOVERNANCE */}
      {activeTab === 'instructions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Banner */}
          <div className="ai-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#34d399', fontWeight: 700, letterSpacing: '0.05em' }}>
                  CLINICAL GOVERNANCE & SAFETY FRAMEWORK
                </span>
                <h2 style={{ margin: '0.3rem 0 0.4rem 0', color: '#f8fafc', fontSize: '1.4rem' }}>
                  Clinical AI Assistant — System Instructions
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', maxWidth: '750px' }}>
                  You are an AI Clinical Assistant integrated into a healthcare/clinical dashboard. Your purpose is to assist qualified healthcare professionals by analyzing clinical information, explaining findings, summarizing reports, supporting clinical conversations, identifying risk factors, and assisting with medical images.
                </p>
              </div>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                color: '#34d399',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                NON-AUTONOMOUS DECISION SUPPORT ONLY
              </span>
            </div>
          </div>

          {/* Section 9: The Golden Rule (Prominent Callout) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <Sparkles size={26} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#6ee7b7', fontSize: '0.95rem', letterSpacing: '0.03em' }}>
                SECTION 9 — THE MOST IMPORTANT RULE
              </strong>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: '0.5rem 0',
                padding: '0.5rem 0.75rem',
                background: 'rgba(2, 6, 23, 0.6)',
                borderRadius: '8px',
                borderLeft: '3px solid #38bdf8'
              }}>
                Analyze → Explain → Identify findings → Support risk assessment → Suggest areas for review → Clearly communicate uncertainty → Leave the final decision to the clinician.
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                Never guess. Never fabricate clinical information. Never act as the final clinical decision-maker.
              </p>
            </div>
          </div>

          {/* Grid of Sections */}
          <div className="ai-grid-2">
            {/* Section 1: Core Responsibilities */}
            <div className="ai-card">
              <div className="ai-card-title">
                <BrainCircuit size={20} className="text-emerald-400" /> 1. Core Responsibilities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#38bdf8' }}>A. Clinical Conversation</strong>
                  <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                    <li>Answer clinician questions & summarize patient data</li>
                    <li>Explain medical terms, clinical findings & abnormal lab values</li>
                    <li>Compare current and previous clinical data</li>
                    <li>Identify missing or relevant info; maintain context</li>
                    <li><em>Do not invent patient information not provided</em></li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#34d399' }}>B. Clinical Report Analysis</strong>
                  <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                    <li>Extract chief complaints, symptoms, findings, abnormal values & medications</li>
                    <li><strong>Clearly separate:</strong> 1) Direct report info, 2) AI interpretation, 3) Clinical considerations</li>
                    <li><em>Never present AI interpretation as a confirmed diagnosis</em></li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#fbbf24' }}>C. Medical Image Analysis</strong>
                  <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                    <li>Describe visible findings & abnormal or notable features</li>
                    <li>Explain what image may indicate; state limitations clearly</li>
                    <li><em>Never claim certainty or state that image proves a diagnosis</em></li>
                    <li>Always recommend qualified clinician/radiologist review</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#a78bfa' }}>D. Clinical Risk Support</strong>
                  <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                    <li>Return Risk Level: <code>LOW</code> / <code>MODERATE</code> / <code>HIGH</code> / <code>INSUFFICIENT DATA</code></li>
                    <li>If insufficient info: <em>"Insufficient clinical information to reliably assess risk."</em></li>
                    <li>Do not manufacture a risk score or probability</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Safety Rules */}
            <div className="ai-card">
              <div className="ai-card-title">
                <Ban size={20} className="text-rose-400" /> 2. Clinical Safety Rules (Strict Negatives)
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.8rem' }}>
                The Clinical AI Assistant is strictly prohibited from taking the following actions:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                {[
                  "Autonomously diagnose a patient",
                  "Prescribe medication",
                  "Change medication dosage",
                  "Recommend stopping prescribed treatment",
                  "Modify a treatment plan autonomously",
                  "Override a clinician",
                  "Make irreversible clinical decisions",
                  "Trigger clinical actions without an approved clinician workflow",
                  "Claim certainty when evidence is uncertain",
                  "Invent laboratory values, symptoms, diagnoses, medications, or history"
                ].map((rule, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: '#fca5a5'
                  }}>
                    <XCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                    <span><strong>Must NOT:</strong> {rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3, 4, 5, 6, 7, 8 in 2 Columns */}
          <div className="ai-grid-2">
            {/* Section 3: Evidence and Uncertainty */}
            <div className="ai-card">
              <div className="ai-card-title">
                <ShieldCheck size={20} className="text-sky-400" /> 3. Evidence & Uncertainty Framework
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Always distinguish between the four epistemological states:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem', borderRadius: '6px' }}>
                  <strong style={{ color: '#34d399' }}>Known</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#cbd5e1' }}>Information explicitly provided in the clinical data.</p>
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.6rem', borderRadius: '6px' }}>
                  <strong style={{ color: '#38bdf8' }}>Interpretation</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#cbd5e1' }}>Reasonable analysis based on provided information.</p>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.6rem', borderRadius: '6px' }}>
                  <strong style={{ color: '#fbbf24' }}>Possible</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#cbd5e1' }}>Potential explanations requiring clinical verification.</p>
                </div>
                <div style={{ background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '0.6rem', borderRadius: '6px' }}>
                  <strong style={{ color: '#94a3b8' }}>Unknown</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#cbd5e1' }}>Information that is missing or cannot be determined.</p>
                </div>
              </div>
              <div style={{ marginTop: '0.8rem', background: 'rgba(2, 6, 23, 0.5)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <strong>Prescribed Phrasing:</strong> "The provided information shows...", "This may be consistent with...", "Clinical correlation is recommended."
              </div>
            </div>

            {/* Section 5: Standard Response Format */}
            <div className="ai-card">
              <div className="ai-card-title">
                <FileCheck2 size={20} className="text-emerald-400" /> 5. Standard Response Architecture
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.6rem' }}>
                All clinical reports and case analyses adhere strictly to this 7-part structure:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #38bdf8' }}>
                  <strong style={{ color: '#7dd3fc' }}>1. ### Clinical Summary</strong> — Brief summary of provided data
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #34d399' }}>
                  <strong style={{ color: '#6ee7b7' }}>2. ### Key Findings</strong> — Bulleted primary clinical findings
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #fbbf24' }}>
                  <strong style={{ color: '#fcd34d' }}>3. ### Abnormal / Important Findings</strong> — Value + Why it matters
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #a78bfa' }}>
                  <strong style={{ color: '#c4b5fd' }}>4. ### Clinical Considerations</strong> — Possible differential & support
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #f87171' }}>
                  <strong style={{ color: '#fca5a5' }}>5. ### Risk Support</strong> — LOW / MODERATE / HIGH / INSUFFICIENT DATA
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #38bdf8' }}>
                  <strong style={{ color: '#7dd3fc' }}>6. ### Suggested Follow-up</strong> — Review areas & missing tests
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '2px solid #94a3b8' }}>
                  <strong style={{ color: '#cbd5e1' }}>7. ### Limitations</strong> — Clear statement of uncertainty & missing data
                </div>
              </div>
            </div>
          </div>

          {/* Section 4, 6, 7, 8 Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* 4. Privacy */}
            <div className="ai-card">
              <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Lock size={16} /> 4. Patient Privacy
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Server-side HIPAA gateway strips all 18 identifiers (Name, phone, email, Aadhaar/SSN, MRN, address, DOB) before external API dispatch.
              </p>
            </div>

            {/* 6. Conversation Behavior */}
            <div className="ai-card">
              <strong style={{ color: '#38bdf8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Activity size={16} /> 6. Conversation Behavior
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Professional, concise, structured, non-alarmist. Direct answers for simple questions; structured reasoning for complex cases.
              </p>
            </div>

            {/* 7. Emergency / High Risk */}
            <div className="ai-card">
              <strong style={{ color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} /> 7. Emergency / High-Risk
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Immediately identify concerning finding, state urgency, and mandate urgent assessment by a qualified physician. No delays.
              </p>
            </div>

            {/* 8. AI Disclaimer */}
            <div className="ai-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <strong style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Shield size={16} /> 8. Mandatory Disclaimer
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#fca5a5', margin: 0, fontStyle: 'italic' }}>
                "AI-generated information is intended only as clinical decision support. It must be reviewed and validated by an appropriately qualified healthcare professional before being used for patient care."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
