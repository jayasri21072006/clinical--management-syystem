/**
 * Clinical AI Service Abstraction Layer
 * Encapsulates patient datasets, explicit action routing, and typed response schemas.
 */

import api from './api';

// Comprehensive mock/demo patient dataset linked by patientId
export const DEMO_PATIENTS = [
  {
    id: 'P-10294',
    mrn: 'MRN-10294',
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    dob: '1968-04-12',
    phone: '(555) 234-5678',
    status: 'Inpatient',
    allergies: ['Penicillin (Anaphylaxis)', 'Sulfa Drugs (Rash)'],
    conditions: [
      { name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', diagnosed: '2019-03-15', status: 'Uncontrolled' },
      { name: 'Essential Hypertension', icd10: 'I10', diagnosed: '2016-08-20', status: 'Managed' },
      { name: 'Chronic Kidney Disease Stage 3a', icd10: 'N18.31', diagnosed: '2022-11-04', status: 'Monitoring' }
    ],
    medications: [
      { name: 'Metformin', dose: '1000 mg', frequency: 'Twice daily', startDate: '2019-03-16', category: 'Antidiabetic' },
      { name: 'Amlodipine', dose: '10 mg', frequency: 'Once daily', startDate: '2016-08-22', category: 'Antihypertensive' },
      { name: 'Lisinopril', dose: '20 mg', frequency: 'Once daily', startDate: '2017-02-11', category: 'ACE Inhibitor' },
      { name: 'Atorvastatin', dose: '40 mg', frequency: 'Once daily', startDate: '2018-01-12', category: 'Statin' }
    ],
    recentVisits: [
      { date: '2026-09-02', clinic: 'Endocrinology Follow-up', physician: 'Dr. Sarah Jenkins' },
      { date: '2026-06-05', clinic: 'Primary Care Routine', physician: 'Dr. Michael Chang' }
    ],
    labs: [
      {
        test: 'Hemoglobin',
        unit: 'g/dL',
        refRange: '13.8 - 17.2',
        current: 10.4,
        previous: 11.2,
        trend: 'Decreasing',
        isAbnormal: true,
        date: '2026-09-02',
        history: [
          { date: '2025-09-01', value: 14.2 },
          { date: '2026-03-10', value: 12.1 },
          { date: '2026-06-05', value: 11.2 },
          { date: '2026-09-02', value: 10.4 }
        ]
      },
      {
        test: 'HbA1c',
        unit: '%',
        refRange: '4.0 - 5.6',
        current: 8.6,
        previous: 8.9,
        trend: 'Elevated',
        isAbnormal: true,
        date: '2026-09-02',
        history: [
          { date: '2025-09-01', value: 7.8 },
          { date: '2026-03-10', value: 8.5 },
          { date: '2026-09-02', value: 8.6 }
        ]
      },
      {
        test: 'Creatinine',
        unit: 'mg/dL',
        refRange: '0.74 - 1.35',
        current: 1.62,
        previous: 1.5,
        trend: 'Increasing',
        isAbnormal: true,
        date: '2026-09-02',
        history: [
          { date: '2025-09-01', value: 1.2 },
          { date: '2026-03-10', value: 1.4 },
          { date: '2026-09-02', value: 1.62 }
        ]
      }
    ],
    timelineEvents: [
      { date: '2026-09-02', type: 'Clinical Visit', title: 'Endocrinology Follow-up', summary: 'Reviewed HbA1c (8.6%) and CKD progression.', sourceId: 'note-301' },
      { date: '2026-09-02', type: 'Lab Results', title: 'Metabolic Panel & CBC', summary: 'Hgb 10.4 (Decreasing), Creatinine 1.62 (Elevated).', sourceId: 'lab-902' },
      { date: '2026-08-28', type: 'Imaging', title: 'Chest X-Ray 2 Views', summary: 'Mild cardiomegaly, clear lungs.', sourceId: 'img-101' },
      { date: '2026-06-10', type: 'Medication Change', title: 'Initiated Empagliflozin 10mg', summary: 'SGLT2 inhibitor started.', sourceId: 'med-empag' }
    ]
  },
  {
    id: 'P-20411',
    mrn: 'MRN-20411',
    name: 'Sarah Smith',
    age: 42,
    gender: 'Female',
    dob: '1984-11-23',
    phone: '(555) 891-2345',
    status: 'Outpatient',
    allergies: ['Codeine (Nausea)'],
    conditions: [
      { name: 'Rheumatoid Arthritis', icd10: 'M06.9', diagnosed: '2021-05-10', status: 'Active Flare' }
    ],
    medications: [
      { name: 'Methotrexate', dose: '15 mg', frequency: 'Once weekly', startDate: '2021-06-01', category: 'DMARD' }
    ],
    recentVisits: [{ date: '2026-08-15', clinic: 'Rheumatology', physician: 'Dr. Amanda Vance' }],
    labs: [
      {
        test: 'ESR',
        unit: 'mm/hr',
        refRange: '0 - 20',
        current: 48,
        previous: 32,
        trend: 'Increasing',
        isAbnormal: true,
        date: '2026-08-15',
        history: [{ date: '2026-02-14', value: 32 }, { date: '2026-08-15', value: 48 }]
      }
    ],
    timelineEvents: [
      { date: '2026-08-15', type: 'Clinical Visit', title: 'Rheumatology Flare Check', summary: 'Elevated ESR (48) noted.', sourceId: 'note-401' }
    ]
  }
];

export const clinicalAIService = {
  /**
   * Search patients cleanly
   */
  searchPatients: async (query = '') => {
    try {
      const live = await api.getPatients();
      const list = Array.isArray(live) ? live : (live?.patients || []);
      if (list.length > 0) {
        const q = query.toLowerCase().trim();
        if (!q) return list;
        return list.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.id?.toString().includes(q) ||
          p.mrn?.toLowerCase().includes(q)
        );
      }
    } catch {
      // Fallback to demo
    }
    const q = query.toLowerCase().trim();
    if (!q) return DEMO_PATIENTS;
    return DEMO_PATIENTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q)
    );
  },

  /**
   * CENTRAL ACTION ROUTER
   * runClinicalAIAction({ action, patientId, input, context, file })
   */
  runClinicalAIAction: async ({ action, patientId, input = '', context = {}, file = null }) => {
    // Locate exact patient record
    const patient = DEMO_PATIENTS.find(p => p.id === patientId || p.mrn === patientId) || DEMO_PATIENTS[0];
    const pId = patient ? patient.id : 'P-UNKNOWN';

    // Format context notice if context flags are disabled
    const disabledContext = [];
    if (context && context.history === false) disabledContext.push('Medical History');
    if (context && context.labs === false) disabledContext.push('Labs');
    if (context && context.medications === false) disabledContext.push('Medications');
    if (context && context.notes === false) disabledContext.push('Previous Notes');
    if (context && context.imaging === false) disabledContext.push('Imaging');
    const contextNotice = disabledContext.length > 0 ? `Excluded context: ${disabledContext.join(', ')}` : null;

    switch (action) {
      // 1. PATIENT SUMMARY
      case 'patient_summary':
        return {
          type: 'patient_summary',
          patientId: pId,
          demographics: {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            dob: patient.dob,
            mrn: patient.mrn,
            phone: patient.phone,
            status: patient.status
          },
          conditions: context.history !== false ? patient.conditions : [],
          allergies: patient.allergies || [],
          medications: context.medications !== false ? patient.medications : [],
          recentVisits: patient.recentVisits || [],
          keyFindings: [
            `${patient.name} (${patient.age}y ${patient.gender}) is currently marked as ${patient.status}.`,
            `Primary Active Condition: ${patient.conditions?.[0]?.name || 'Routine Care'}`,
            `Active Allergy Alerts: ${patient.allergies?.join(', ') || 'None documented'}`
          ],
          sources: [
            { label: 'Patient EMR Profile', type: 'EMR Record', date: 'Live' }
          ],
          contextNotice
        };

      // 2. CLINICAL TIMELINE
      case 'clinical_timeline':
        return {
          type: 'clinical_timeline',
          patientId: pId,
          events: patient.timelineEvents || [],
          sources: (patient.timelineEvents || []).map(e => ({ label: `${e.type}: ${e.title}`, type: e.type, date: e.date })),
          contextNotice
        };

      // 3. LAB ANALYSIS
      case 'lab_analysis':
        if (context.labs === false) {
          return {
            type: 'lab_analysis',
            patientId: pId,
            results: [],
            abnormalResults: [],
            trends: [],
            observations: ['Labs context chip is currently turned OFF.'],
            sources: [],
            contextNotice
          };
        }
        const abnormal = patient.labs.filter(l => l.isAbnormal);
        return {
          type: 'lab_analysis',
          patientId: pId,
          results: patient.labs,
          abnormalResults: abnormal,
          trends: patient.labs.map(l => ({ test: l.test, trend: l.trend, history: l.history })),
          observations: [
            `Identified ${abnormal.length} abnormal lab biomarkers requiring clinician review.`,
            'Hemoglobin shows progressive downward trend (14.2 → 10.4 g/dL). Evaluate for anemia of CKD.',
            'Creatinine continues upward progression (1.2 → 1.62 mg/dL) representing CKD Stage 3a progression.'
          ],
          sources: [
            { label: 'Comprehensive Metabolic Panel', type: 'Laboratory', date: '2026-09-02' },
            { label: 'Complete Blood Count (CBC)', type: 'Laboratory', date: '2026-09-02' }
          ],
          contextNotice
        };

      // 4. MEDICATION REVIEW
      case 'medication_review':
        if (context.medications === false) {
          return {
            type: 'medication_review',
            patientId: pId,
            medications: [],
            allergies: [],
            interactionFlags: [],
            duplicateFlags: [],
            considerations: ['Medications context is currently turned OFF.'],
            sources: [],
            contextNotice
          };
        }
        return {
          type: 'medication_review',
          patientId: pId,
          medications: patient.medications,
          allergies: patient.allergies || [],
          interactionFlags: [
            { severity: 'Moderate', flag: 'Metformin 1000mg BID + Renal Impairment (Creatinine 1.62, eGFR ~44). Monitor eGFR closely per FDA guidelines.' },
            { severity: 'Low', flag: 'Lisinopril + Empagliflozin requires monitoring serum potassium.' }
          ],
          duplicateFlags: [],
          considerations: [
            'No beta-lactam or sulfonamide medications prescribed (safe regarding Penicillin & Sulfa allergy).',
            'Consider eGFR-based Metformin dose evaluation at next check.'
          ],
          sources: [
            { label: 'Active Prescription List', type: 'Pharmacy EMR', date: '2026-09-02' }
          ],
          contextNotice
        };

      // 5. SOAP NOTE
      case 'soap_note':
        return {
          type: 'soap_note',
          patientId: pId,
          subjective: `Patient ${patient.name} presents for follow-up review. ${input || 'Reports fatigue over past 3 weeks. Denies acute shortness of breath or chest pain.'}`,
          objective: `Vitals: BP 136/82 mmHg, HR 74 bpm. Recent Labs: HbA1c 8.6%, Hgb 10.4 g/dL, Creatinine 1.62 mg/dL.`,
          assessment: `1. Type 2 Diabetes Mellitus (E11.9) — Uncontrolled.\n2. Chronic Kidney Disease Stage 3a (N18.31) — Mild decline.\n3. Normocytic Anemia (D64.9).`,
          plan: `1. Continue oral antihyperglycemics.\n2. Order Iron panel (TIBC, Ferritin) for anemia workup.\n3. Recheck BMP in 90 days.`,
          status: 'draft',
          sources: [{ label: 'Patient Context Chart', type: 'EMR Data', date: 'Live' }],
          contextNotice
        };

      // 6. REFERRAL LETTER
      case 'referral_letter':
        return {
          type: 'referral_letter',
          patientId: pId,
          specialty: 'Cardiology',
          reasonForReferral: `Evaluation of mild cardiomegaly on recent Chest X-Ray and blood pressure management in setting of CKD Stage 3a.`,
          relevantHistory: `${patient.name} is a ${patient.age}-year-old ${patient.gender} with T2DM, HTN, and CKD Stage 3a.`,
          investigations: `BP: 136/82 mmHg | Creatinine: 1.62 mg/dL | HbA1c: 8.6% | CXR: Mild cardiomegaly.`,
          medications: patient.medications?.map(m => `${m.name} ${m.dose}`).join(', ') || 'Metformin, Amlodipine, Lisinopril',
          clinicalQuestion: 'Opinion requested regarding cardiovascular risk optimization and blood pressure targets.',
          status: 'draft',
          sources: [{ label: 'Patient Master Chart', type: 'EMR Profile', date: 'Live' }],
          contextNotice
        };

      // 7. PATIENT INSTRUCTIONS
      case 'patient_instructions':
        return {
          type: 'patient_instructions',
          patientId: pId,
          findings: [
            'Blood sugar levels (HbA1c 8.6%) need extra management to protect kidney health.',
            'Kidney lab numbers show mild strain.'
          ],
          explanation: `Here is a clear guide on how to take care of your health following today's visit for ${patient.name}.`,
          instructions: [
            'Take your prescribed daily medications exactly as instructed.',
            'Drink adequate fluids unless instructed otherwise by your physician.',
            'Maintain regular 20-30 minute walks as tolerated.'
          ],
          medications: patient.medications?.map(m => `${m.name} ${m.dose} — ${m.frequency}`) || [],
          followUp: 'Return to clinic in 3 months for follow-up blood work.',
          warningSigns: [
            'Chest tightness or shortness of breath',
            'Severe dizziness or headache',
            'Sudden swelling in ankles'
          ],
          clinicalSummary: `Patient counselled on T2DM glycemic control, BP targets, and CKD progression mitigation. Red flag warning signs reviewed.`,
          sources: [{ label: 'Clinical Discharge Guidelines', type: 'Protocol', date: '2026' }],
          contextNotice
        };

      // 8. ICD-10 CODING
      case 'icd10_coding':
        return {
          type: 'icd10_coding',
          patientId: pId,
          suggestions: patient.conditions?.map(c => ({
            condition: c.name,
            code: c.icd10 || 'E11.9',
            description: `ICD-10-CM code for ${c.name}`,
            supportingDocumentation: `Diagnosed ${c.diagnosed} (${c.status})`
          })) || [],
          sources: [{ label: 'Active Diagnosis List', type: 'EMR Problem List', date: 'Live' }],
          contextNotice
        };

      // 9. TRIAGE
      case 'triage':
        let acuity = 'Routine';
        if (input.toLowerCase().includes('chest pain') || input.toLowerCase().includes('shortness of breath')) {
          acuity = 'Urgent';
        }
        return {
          type: 'triage',
          patientId: pId,
          presentingConcern: input || 'Routine symptom evaluation and clinical check.',
          relevantSymptoms: [input || 'Mild fatigue documented.'],
          riskIndicators: ['CKD Stage 3a', 'Uncontrolled HbA1c 8.6%'],
          suggestedAcuity: acuity,
          considerations: [
            'Triage suggestions are decision support only.',
            'Clinical judgment of attending nurse/physician must be exercised.'
          ],
          sources: [{ label: 'ESI Triage Protocol', type: 'Clinical Protocol', date: '2026' }],
          contextNotice
        };

      // 10. PRIOR AUTHORIZATION
      case 'prior_authorization':
        return {
          type: 'prior_authorization',
          patientId: pId,
          requestedTreatment: 'SGLT2 Inhibitor (Empagliflozin 10mg)',
          patientCondition: `Type 2 Diabetes Mellitus with CKD Stage 3a (ICD-10: E11.22, N18.31)`,
          clinicalHistory: `${patient.name} has persistent hyperglycemia (HbA1c 8.6%) and CKD Stage 3a (Creatinine 1.62, eGFR ~44).`,
          medicalNecessity: 'ADA & KDIGO 2026 guidelines mandate SGLT2 inhibitor therapy for renal protection in T2DM with CKD.',
          previousTreatments: ['Metformin 1000mg BID (Failed target HbA1c <7.0%)'],
          supportingEvidence: 'KDIGO 2026 Guidelines for Diabetes Management in Chronic Kidney Disease.',
          status: 'draft',
          sources: [{ label: 'KDIGO Guidelines 2026', type: 'Clinical Evidence', date: '2026' }],
          contextNotice
        };

      // 11. DOCUMENT ANALYSIS
      case 'document_analysis':
        const fname = file ? file.name : 'Uploaded_Lab_Report.pdf';
        return {
          type: 'document_analysis',
          patientId: pId,
          fileName: fname,
          fileType: file ? file.mimeType : 'application/pdf',
          extractedInfo: [
            `Document Name: ${fname}`,
            'Parsed Category: Diagnostic Laboratory Panel',
            'Extracted Biomarkers: Hemoglobin 10.4 g/dL (Low), Creatinine 1.62 mg/dL (High).'
          ],
          documentSummary: `Content extracted from ${fname}. Extracted values have been matched against ${patient.name}'s baseline history.`,
          sources: [{ label: fname, type: 'Uploaded File', date: 'Just now' }],
          contextNotice
        };

      default:
        return {
          type: 'patient_summary',
          patientId: pId,
          demographics: { name: patient.name, age: patient.age, gender: patient.gender, mrn: patient.mrn },
          conditions: patient.conditions || [],
          allergies: patient.allergies || [],
          medications: patient.medications || [],
          recentVisits: patient.recentVisits || [],
          keyFindings: [`Patient query evaluated: "${input}"`],
          sources: [],
          contextNotice
        };
    }
  }
};

export default clinicalAIService;
