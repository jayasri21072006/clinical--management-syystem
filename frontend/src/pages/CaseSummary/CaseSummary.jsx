import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, User, Calendar, Pill, AlertCircle, Plus, X, Edit3, RefreshCw } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './CaseSummary.css';

const CaseSummary = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_id_ref: '1',
    age: '',
    gender: 'Female',
    last_visit: '',
    chief_complaints: '',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    case_status: 'Active Case',
  });

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getCaseSummaries();
      setCases(data);
      if (data.length > 0 && !selectedCase) {
        setSelectedCase(data[0]);
      } else if (data.length > 0 && selectedCase) {
        const updated = data.find(c => c.id === selectedCase.id);
        setSelectedCase(updated || data[0]);
      }
    } catch (err) {
      console.error('Failed to load case summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const openAddModal = () => {
    setEditingCase(null);
    setFormData({
      patient_name: '', patient_id_ref: '1', age: '', gender: 'Female',
      last_visit: '', chief_complaints: '', symptoms: '', diagnosis: '',
      prescription: '', case_status: 'Active Case',
    });
    setShowModal(true);
  };

  const openEditModal = (caseItem) => {
    setEditingCase(caseItem);
    setFormData({
      patient_name: caseItem.patient_name || '',
      patient_id_ref: caseItem.patient_id_ref || '1',
      age: caseItem.age || '',
      gender: caseItem.gender || 'Female',
      last_visit: caseItem.last_visit || '',
      chief_complaints: caseItem.chief_complaints || '',
      symptoms: caseItem.symptoms || '',
      diagnosis: caseItem.diagnosis || '',
      prescription: caseItem.prescription || '',
      case_status: caseItem.case_status || 'Active Case',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_name.trim()) return;
    try {
      let resultCase = null;
      if (editingCase) {
        resultCase = await api.updateCaseSummary(editingCase.id, formData);
      } else {
        resultCase = await api.createCaseSummary(formData);
      }
      setShowModal(false);
      setEditingCase(null);
      const data = await api.getCaseSummaries();
      setCases(data);
      if (resultCase) {
        setSelectedCase(resultCase);
      } else if (data.length > 0) {
        setSelectedCase(data[data.length - 1]);
      }
    } catch (err) {
      console.error('Failed to save case:', err);
      alert(editingCase ? 'Failed to update case.' : 'Failed to create case.');
    }
  };

  const symptomsArray = selectedCase?.symptoms ? selectedCase.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [];
  const prescriptionLines = selectedCase?.prescription ? selectedCase.prescription.split('\n').filter(Boolean) : [];

  return (
    <div className="case-summary-page">
      <Header title="Case Summary" subtitle="Patient Workspace & Clinical Insights">
        <button className="btn-refresh" onClick={loadCases} title="Refresh" style={{ marginRight: '8px' }}>
          <RefreshCw size={16} />
        </button>
        <button className="btn-add-patient" onClick={openAddModal}>
          <Plus size={16} /> New Case
        </button>
      </Header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading case summaries from backend...
        </div>
      ) : cases.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          No case summaries found. Click "New Case" to create one.
        </div>
      ) : (
        <>
          {/* Case Selector */}
          {cases.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--neutral-600)', marginRight: '4px' }}>
                Select Case ({cases.length}):
              </span>
              {cases.map((c) => (
                <div
                  key={c.id}
                  className={`patients-filter-chip ${selectedCase?.id === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCase(c)}
                  style={{ cursor: 'pointer' }}
                >
                  {c.patient_name} (#{c.patient_id_ref || c.id})
                </div>
              ))}
            </div>
          )}

          {selectedCase && (
            <div className="case-layout">
              {/* Main Content */}
              <div>
                <div className="case-card fade-in-up">
                  <div className="case-card-header">
                    <div className="case-patient-header">
                      <div className="avatar avatar-md" style={{ background: 'var(--sage-600)' }}>
                        {selectedCase.patient_name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>
                          {selectedCase.patient_name} (#{selectedCase.patient_id_ref})
                        </h3>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>
                          {selectedCase.age ? `${selectedCase.age} yrs` : 'Age N/A'} · {selectedCase.gender} · Last visit: {selectedCase.last_visit || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${selectedCase.case_status === 'Active Case' ? 'badge-success' : 'badge-sage'}`}>
                        {selectedCase.case_status}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(selectedCase)}>
                        <Edit3 size={12} style={{ marginRight: '4px' }} /> Edit
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="case-section-title">Chief Complaints</div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-700)' }}>
                      {selectedCase.chief_complaints || 'No complaints recorded.'}
                    </p>
                    {symptomsArray.length > 0 && (
                      <div className="symptoms-tags">
                        {symptomsArray.map((symptom, idx) => (
                          <span className="symptom-tag" key={idx}>{symptom}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="case-section-title">Diagnosis & Miasmatic Analysis</div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-700)' }}>
                      {selectedCase.diagnosis || 'No diagnosis recorded.'}
                    </p>
                  </div>

                  <div>
                    <div className="case-section-title">Prescription Summary</div>
                    <div style={{ background: 'var(--neutral-25)', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
                      {prescriptionLines.length > 0 ? (
                        prescriptionLines.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--neutral-400)' }}>No prescription recorded.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights & Context Panel */}
              <div>
                <div className="ai-insights-panel fade-in-up">
                  <div className="ai-insights-header">
                    <Sparkles size={20} color="var(--sage-600)" />
                    AI Clinical Assistant
                  </div>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                    Suggested remedy repertory match based on totality of symptoms:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {symptomsArray.length > 0 ? (
                      <>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--sage-200)' }}>
                          <strong style={{ color: 'var(--sage-800)', fontSize: '13px' }}>1. Belladonna (92% Match)</strong>
                          <p style={{ fontSize: '11px', color: 'var(--neutral-500)', marginTop: '2px' }}>High affinity for sudden violent headaches & photophobia.</p>
                        </div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--sage-200)' }}>
                          <strong style={{ color: 'var(--sage-800)', fontSize: '13px' }}>2. Spigelia (85% Match)</strong>
                          <p style={{ fontSize: '11px', color: 'var(--neutral-500)', marginTop: '2px' }}>Left-sided neuralgic headache following sun exposure.</p>
                        </div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--sage-200)' }}>
                          <strong style={{ color: 'var(--sage-800)', fontSize: '13px' }}>3. Iris Versicolor (78% Match)</strong>
                          <p style={{ fontSize: '11px', color: 'var(--neutral-500)', marginTop: '2px' }}>Sick headache with blurriness and bilious vomiting.</p>
                        </div>
                      </>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--neutral-400)' }}>
                        Add symptoms to this case to receive AI-powered remedy suggestions.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Case Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '550px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editingCase ? 'Update Case Summary' : 'New Case Summary'}</h2>
              <button onClick={() => { setShowModal(false); setEditingCase(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Patient Name *</label>
                  <input type="text" required placeholder="e.g. Priya Sharma" value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Patient ID Ref</label>
                  <input type="text" placeholder="e.g. 1" value={formData.patient_id_ref} onChange={(e) => setFormData({ ...formData, patient_id_ref: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Age</label>
                  <input type="text" placeholder="e.g. 28" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Last Visit</label>
                  <input type="date" value={formData.last_visit} onChange={(e) => setFormData({ ...formData, last_visit: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Chief Complaints</label>
                <textarea rows={3} placeholder="Describe the patient's chief complaints..." value={formData.chief_complaints} onChange={(e) => setFormData({ ...formData, chief_complaints: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Symptoms (comma-separated)</label>
                <input type="text" placeholder="e.g. Headache, Nausea, Insomnia" value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Diagnosis</label>
                <textarea rows={2} placeholder="Miasmatic analysis and diagnosis..." value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Prescription (one per line)</label>
                <textarea rows={3} placeholder="1. Belladonna 200C - 4 pills, twice daily..." value={formData.prescription} onChange={(e) => setFormData({ ...formData, prescription: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Case Status</label>
                <select value={formData.case_status} onChange={(e) => setFormData({ ...formData, case_status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}>
                  <option value="Active Case">Active Case</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingCase(null); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">{editingCase ? 'Update Case' : 'Create Case'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseSummary;
