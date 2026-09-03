import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Search,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  User,
  Sparkles,
  Stethoscope,
  X,
  FileText,
  Clock,
  HeartPulse
} from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api';
import './RiskPrediction.css';

const RiskPrediction = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, HIGH, MODERATE, LOW
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, patientsData] = await Promise.all([
        api.getRiskOverview(),
        api.getPatientRisks()
      ]);
      setStats(overviewData);
      setPatients(patientsData);
    } catch (err) {
      console.error('Failed to load risk prediction data:', err);
      setError('Could not connect to backend AI Risk Engine. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.chief_complaints.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.includes(searchTerm);
    
    if (selectedFilter === 'ALL') return matchesSearch;
    return matchesSearch && patient.risk_level.toUpperCase() === selectedFilter.toUpperCase();
  });

  return (
    <div className="risk-page fade-in">
      <Header
        title="AI Patient Risk Prediction"
        subtitle="Algorithmic risk evaluation engine analyzing clinical histories, symptom severity, and visit compliance."
      >
        <button className="btn-refresh-risk" onClick={fetchData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Recalculate Risk</span>
        </button>
      </Header>

      {error && (
        <div className="risk-banner-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="risk-stats-grid">
        <div className="risk-card-stat">
          <div className="stat-icon-wrap neutral">
            <User size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats ? stats.total_analyzed : '--'}</span>
            <span className="stat-title">Patients Analyzed</span>
          </div>
          <div className="stat-sub">Live database pool</div>
        </div>

        <div className="risk-card-stat high">
          <div className="stat-icon-wrap red">
            <ShieldAlert size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number text-red">{stats ? stats.high_risk_count : 0}</span>
            <span className="stat-title">High Risk Alerts</span>
          </div>
          <div className="stat-sub text-red">Immediate consultation needed</div>
        </div>

        <div className="risk-card-stat moderate">
          <div className="stat-icon-wrap amber">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number text-amber">{stats ? stats.moderate_risk_count : 0}</span>
            <span className="stat-title">Moderate Risk</span>
          </div>
          <div className="stat-sub text-amber">Follow-up review advised</div>
        </div>

        <div className="risk-card-stat low">
          <div className="stat-icon-wrap emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number text-emerald">{stats ? stats.low_risk_count : 0}</span>
            <span className="stat-title">Low Risk</span>
          </div>
          <div className="stat-sub text-emerald">Routine health maintenance</div>
        </div>

        <div className="risk-card-stat cyan">
          <div className="stat-icon-wrap blue">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number text-blue">{stats ? `${stats.avg_risk_score}%` : '--'}</span>
            <span className="stat-title">Average Risk Score</span>
          </div>
          <div className="stat-sub text-blue">Clinic-wide risk index</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="risk-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient name, symptom, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="risk-filter-pills">
          <button
            className={`risk-pill ${selectedFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('ALL')}
          >
            All Patients ({patients.length})
          </button>
          <button
            className={`risk-pill high ${selectedFilter === 'HIGH' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('HIGH')}
          >
            🔴 High Risk ({stats ? stats.high_risk_count : 0})
          </button>
          <button
            className={`risk-pill moderate ${selectedFilter === 'MODERATE' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('MODERATE')}
          >
            🟡 Moderate Risk ({stats ? stats.moderate_risk_count : 0})
          </button>
          <button
            className={`risk-pill low ${selectedFilter === 'LOW' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('LOW')}
          >
            🟢 Low Risk ({stats ? stats.low_risk_count : 0})
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <div className="risk-loading-state">
          <RefreshCw size={32} className="spin text-sage" />
          <p>Running backend clinical AI risk assessment algorithms...</p>
        </div>
      ) : (
        <div className="patient-cards-grid">
          {filteredPatients.length === 0 ? (
            <div className="risk-empty-state">
              <Activity size={40} />
              <p>No patients match the selected risk filter.</p>
            </div>
          ) : (
            filteredPatients.map((pt) => (
              <div key={pt.patient_id} className={`patient-risk-card border-${pt.risk_level.toLowerCase()}`}>
                <div className="card-header-group">
                  <div className="patient-avatar-box">
                    {pt.patient_name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div className="patient-info">
                    <h3 className="patient-name-title">{pt.patient_name}</h3>
                    <div className="patient-demographics">
                      ID #{pt.patient_id} • {pt.age} yrs • {pt.gender}
                    </div>
                  </div>
                  <div className={`risk-tag tag-${pt.risk_level.toLowerCase()}`}>
                    {pt.risk_level === 'High' && <ShieldAlert size={13} />}
                    {pt.risk_level === 'Moderate' && <AlertTriangle size={13} />}
                    {pt.risk_level === 'Low' && <CheckCircle2 size={13} />}
                    <span>{pt.risk_level} Risk</span>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="risk-meter-box">
                  <div className="meter-label-row">
                    <span>Clinical Risk Index</span>
                    <span className="meter-score-value" style={{ color: pt.risk_color }}>
                      {pt.risk_score}%
                    </span>
                  </div>
                  <div className="meter-track">
                    <div
                      className="meter-bar-fill"
                      style={{
                        width: `${pt.risk_score}%`,
                        backgroundColor: pt.risk_color,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Primary Risk Factors */}
                <div className="card-info-section">
                  <span className="section-heading">
                    <Activity size={13} /> Key Risk Drivers
                  </span>
                  <div className="risk-chip-group">
                    {pt.primary_factors.map((factor, idx) => (
                      <span key={idx} className="risk-chip">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Complaints */}
                <div className="card-info-section">
                  <span className="section-heading">
                    <FileText size={13} /> Clinical Summary
                  </span>
                  <p className="complaint-text-preview">
                    {pt.chief_complaints}
                  </p>
                </div>

                {/* Actions */}
                <div className="card-info-section">
                  <span className="section-heading text-sage-dark">
                    <Stethoscope size={13} /> Recommended Clinical Action
                  </span>
                  <ul className="clinical-action-bullets">
                    {pt.recommended_actions.slice(0, 2).map((act, idx) => (
                      <li key={idx}>
                        <ChevronRight size={13} /> <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="btn-view-risk-breakdown"
                  onClick={() => setSelectedPatient(pt)}
                >
                  <span>Detailed Clinical Assessment</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Patient Assessment Modal */}
      {selectedPatient && (
        <div className="risk-modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="risk-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="risk-modal-header">
              <div className="patient-avatar-box large">
                {selectedPatient.patient_name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="modal-patient-details">
                <h2>{selectedPatient.patient_name}</h2>
                <p>
                  Patient ID #{selectedPatient.patient_id} • Age {selectedPatient.age} • {selectedPatient.gender} • Status: {selectedPatient.status}
                </p>
              </div>
              <button className="btn-modal-close" onClick={() => setSelectedPatient(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="risk-modal-body">
              {/* Score Highlight Banner */}
              <div
                className="risk-summary-banner"
                style={{ borderLeftColor: selectedPatient.risk_color }}
              >
                <div className="banner-score-circle" style={{ color: selectedPatient.risk_color, borderColor: selectedPatient.risk_color }}>
                  {selectedPatient.risk_score}%
                </div>
                <div className="banner-details">
                  <span className={`risk-tag tag-${selectedPatient.risk_level.toLowerCase()}`}>
                    {selectedPatient.risk_level} Risk Tier
                  </span>
                  <h3>Algorithmic Clinical Risk Evaluation</h3>
                  <p>Analyzed from backend database patient records, case complaints, and visit patterns.</p>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="modal-two-columns">
                <div className="modal-panel-box">
                  <h4 className="panel-title">
                    <HeartPulse size={16} /> Algorithmic Risk Weight Breakdown
                  </h4>
                  <div className="weight-bars-list">
                    <div className="weight-row">
                      <div className="weight-meta">
                        <span>Age Risk Factor</span>
                        <strong>{selectedPatient.breakdown.age_factor} pts</strong>
                      </div>
                      <div className="w-track">
                        <div className="w-fill" style={{ width: `${(selectedPatient.breakdown.age_factor / 30) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="weight-row">
                      <div className="weight-meta">
                        <span>Symptom Severity Index</span>
                        <strong>{selectedPatient.breakdown.symptom_severity} pts</strong>
                      </div>
                      <div className="w-track">
                        <div className="w-fill amber" style={{ width: `${(selectedPatient.breakdown.symptom_severity / 45) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="weight-row">
                      <div className="weight-meta">
                        <span>Active Unresolved Case Index</span>
                        <strong>{selectedPatient.breakdown.active_case_factor} pts</strong>
                      </div>
                      <div className="w-track">
                        <div className="w-fill red" style={{ width: `${(selectedPatient.breakdown.active_case_factor / 20) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="weight-row">
                      <div className="weight-meta">
                        <span>Appointment Density Factor</span>
                        <strong>{selectedPatient.breakdown.appointment_compliance} pts</strong>
                      </div>
                      <div className="w-track">
                        <div className="w-fill cyan" style={{ width: `${(selectedPatient.breakdown.appointment_compliance / 15) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-panel-box">
                  <h4 className="panel-title">
                    <Stethoscope size={16} /> Recommended Clinical Interventions
                  </h4>
                  <ul className="full-recommendation-list">
                    {selectedPatient.recommended_actions.map((act, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={16} className="text-emerald" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Full Case Record */}
              <div className="modal-panel-box full-width">
                <h4 className="panel-title">
                  <FileText size={16} /> Recorded Clinical Case History
                </h4>
                <div className="case-detail-card">
                  <div className="case-row">
                    <strong>Chief Complaints:</strong>
                    <p>{selectedPatient.chief_complaints}</p>
                  </div>
                  <div className="case-row">
                    <strong>Recorded Symptoms:</strong>
                    <div className="symptom-badges-row">
                      {selectedPatient.symptoms.map((symptom, idx) => (
                        <span key={idx} className="symptom-badge">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="risk-modal-footer">
              <button className="btn-modal-done" onClick={() => setSelectedPatient(null)}>
                Close Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPrediction;
