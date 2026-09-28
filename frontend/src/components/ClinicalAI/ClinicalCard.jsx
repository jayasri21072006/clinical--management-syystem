import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Copy,
  RefreshCw,
  FileText,
  Send,
  Edit2,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Activity,
  Layers,
  Heart
} from 'lucide-react';
import ClinicalTimelineView from './ClinicalTimelineView';
import './ClinicalAIComponents.css';

const ClinicalCard = ({
  msg,
  onCopy,
  onRegenerate,
  onViewSource,
  onAddToRecord,
  onEditSubmit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState(msg.editableDraftText || '');
  const [editedSoap, setEditedSoap] = useState(msg.editableDraft || { subjective: '', objective: '', assessment: '', plan: '' });
  const [timeframe, setTimeframe] = useState('1y');
  const [instructionMode, setInstructionMode] = useState('patient'); // 'patient' | 'clinical'
  const [showSources, setShowSources] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const type = msg.type || 'general';
  const isDraftable = ['soap_note', 'referral', 'patient_instructions', 'prior_auth'].includes(type);

  const handleSaveDraft = () => {
    setIsEditing(false);
    if (onEditSubmit) {
      onEditSubmit(type === 'soap_note' ? editedSoap : editedDraft);
    }
  };

  const handleAddRecordClick = () => {
    setAddedNotice(true);
    if (onAddToRecord) onAddToRecord(msg);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  /* Render Lab Trend SVG Chart */
  const renderLabTrendChart = (labsData) => {
    if (!labsData || labsData.length === 0) return null;
    const testWithHistory = labsData.filter(l => l.history && l.history.length > 1);

    return (
      <div className="lab-trends-wrapper">
        <div className="lab-trends-header">
          <span className="trends-title"><Activity size={14} /> Biomarker Trends Over Time</span>
          <div className="timeframe-buttons">
            {['7d', '30d', '90d', '1y'].map((tf) => (
              <button
                key={tf}
                className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-charts-grid">
          {testWithHistory.map((item, idx) => {
            const history = item.history;
            const values = history.map(h => h.value);
            const min = Math.min(...values) * 0.9;
            const max = Math.max(...values) * 1.1 || 1;
            const width = 240;
            const height = 60;

            const points = history.map((h, i) => {
              const x = (i / (history.length - 1)) * (width - 20) + 10;
              const y = height - ((h.value - min) / (max - min)) * (height - 20) - 10;
              return `${x},${y}`;
            }).join(' ');

            const latest = history[history.length - 1];

            return (
              <div key={idx} className="lab-chart-card">
                <div className="lab-chart-info">
                  <div className="lab-chart-name">{item.test}</div>
                  <div className="lab-chart-val">
                    <span className="current-val">{latest.value} {item.unit}</span>
                    <span className={`trend-tag ${item.trend.toLowerCase()}`}>{item.trend}</span>
                  </div>
                </div>
                <svg className="lab-svg-sparkline" viewBox={`0 0 ${width} ${height}`}>
                  <polyline
                    fill="none"
                    stroke="#2D5A4C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {history.map((h, i) => {
                    const x = (i / (history.length - 1)) * (width - 20) + 10;
                    const y = height - ((h.value - min) / (max - min)) * (height - 20) - 10;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill={i === history.length - 1 ? '#D97706' : '#2D5A4C'}
                      />
                    );
                  })}
                </svg>
                <div className="lab-chart-meta">Ref: {item.refRange} | Date: {latest.date}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`clinical-card-container ${type}`}>
      {/* Context Warning Notice */}
      {msg.contextNotice && (
        <div className="card-context-notice">
          <AlertTriangle size={13} />
          <span>{msg.contextNotice}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="clinical-card-header">
        <div className="header-left">
          <span className="card-type-badge">
            <Sparkles size={12} />
            {msg.title || 'Clinical AI Response'}
          </span>
          {msg.confidence && (
            <span className="card-confidence-badge">{msg.confidence}</span>
          )}
        </div>
        <div className="header-right">
          <span className="card-review-badge">
            <AlertTriangle size={11} />
            {msg.reviewRequired || 'REVIEW REQUIRED'}
          </span>
        </div>
      </div>

      {/* Card Summary Statement */}
      {msg.summary && (
        <div className="clinical-card-summary">
          <p>{msg.summary}</p>
        </div>
      )}

      {/* Instructions Toggle */}
      {type === 'patient_instructions' && (
        <div className="instruction-toggle-bar">
          <button
            className={`inst-btn ${instructionMode === 'patient' ? 'active' : ''}`}
            onClick={() => setInstructionMode('patient')}
          >
            <Heart size={13} /> Patient-Friendly Guide
          </button>
          <button
            className={`inst-btn ${instructionMode === 'clinical' ? 'active' : ''}`}
            onClick={() => setInstructionMode('clinical')}
          >
            <FileText size={13} /> Clinical EMR Version
          </button>
        </div>
      )}

      {/* Draft Editor vs Render Body */}
      <div className="clinical-card-body">
        {isEditing ? (
          <div className="card-draft-editor">
            {type === 'soap_note' ? (
              <div className="soap-editor-grid">
                <label>
                  <span>Subjective</span>
                  <textarea
                    value={editedSoap.subjective}
                    onChange={(e) => setEditedSoap({ ...editedSoap, subjective: e.target.value })}
                    rows={3}
                  />
                </label>
                <label>
                  <span>Objective</span>
                  <textarea
                    value={editedSoap.objective}
                    onChange={(e) => setEditedSoap({ ...editedSoap, objective: e.target.value })}
                    rows={3}
                  />
                </label>
                <label>
                  <span>Assessment</span>
                  <textarea
                    value={editedSoap.assessment}
                    onChange={(e) => setEditedSoap({ ...editedSoap, assessment: e.target.value })}
                    rows={3}
                  />
                </label>
                <label>
                  <span>Plan</span>
                  <textarea
                    value={editedSoap.plan}
                    onChange={(e) => setEditedSoap({ ...editedSoap, plan: e.target.value })}
                    rows={3}
                  />
                </label>
              </div>
            ) : (
              <textarea
                className="full-draft-textarea"
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                rows={10}
              />
            )}
            <div className="draft-editor-actions">
              <button className="btn-save-draft" onClick={handleSaveDraft}>
                <Check size={14} /> Save Edits
              </button>
              <button className="btn-cancel-draft" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {/* Structured Key Findings */}
            {type === 'patient_instructions' ? (
              <div className="instruction-view-box">
                <pre>{instructionMode === 'patient' ? (msg.patientFriendlyText || msg.summary) : (msg.clinicalText || msg.summary)}</pre>
              </div>
            ) : type === 'referral' || type === 'prior_auth' ? (
              <div className="draft-text-box">
                <pre>{editedDraft || msg.editableDraftText || msg.summary}</pre>
              </div>
            ) : type === 'soap_note' ? (
              <div className="soap-card-sections">
                <div className="soap-block subjective">
                  <h5>S — SUBJECTIVE</h5>
                  <p>{editedSoap.subjective || msg.editableDraft?.subjective}</p>
                </div>
                <div className="soap-block objective">
                  <h5>O — OBJECTIVE</h5>
                  <p>{editedSoap.objective || msg.editableDraft?.objective}</p>
                </div>
                <div className="soap-block assessment">
                  <h5>A — ASSESSMENT</h5>
                  <p>{editedSoap.assessment || msg.editableDraft?.assessment}</p>
                </div>
                <div className="soap-block plan">
                  <h5>P — PLAN</h5>
                  <p>{editedSoap.plan || msg.editableDraft?.plan}</p>
                </div>
              </div>
            ) : type === 'clinical_timeline' ? (
              <ClinicalTimelineView events={msg.timelineEvents} onSelectSource={onViewSource} />
            ) : (
              <div className="findings-section">
                {msg.keyFindings && msg.keyFindings.length > 0 && (
                  <div className="clinical-card-block">
                    <h4>Key Findings & Observations</h4>
                    <ul>
                      {msg.keyFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.chartData && renderLabTrendChart(msg.chartData)}

                {msg.considerations && msg.considerations.length > 0 && (
                  <div className="clinical-card-block considerations">
                    <h4>Clinical Considerations & Recommendations</h4>
                    <ul>
                      {msg.considerations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sources Bar */}
      {msg.sources && msg.sources.length > 0 && (
        <div className="card-sources-bar">
          <button className="sources-toggle-btn" onClick={() => setShowSources(!showSources)}>
            <Layers size={13} />
            <span>Sources ({msg.sources.length})</span>
            {showSources ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showSources && (
            <div className="sources-list-chips">
              {msg.sources.map((src, idx) => (
                <button key={idx} className="source-chip-btn" onClick={() => onViewSource && onViewSource(src)}>
                  <span>✓ {src.label}</span>
                  <ExternalLink size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast Notice */}
      {addedNotice && (
        <div className="record-added-toast">
          <Check size={14} /> Added to Patient Clinical Record Drafts
        </div>
      )}

      {/* Card Action Buttons Footer */}
      <div className="clinical-card-actions">
        <button className="card-action-btn" onClick={() => onCopy && onCopy(msg.summary || msg.editableDraftText)}>
          <Copy size={12} /> Copy
        </button>

        {isDraftable && (
          <button className="card-action-btn" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 size={12} /> {isEditing ? 'Cancel Edit' : 'Edit Draft'}
          </button>
        )}

        <button className="card-action-btn" onClick={() => onRegenerate && onRegenerate()}>
          <RefreshCw size={12} /> Regenerate
        </button>

        <button className="card-action-btn primary" onClick={handleAddRecordClick}>
          <FileText size={12} /> Add to Record
        </button>

        <span className="card-timestamp">{msg.time || 'Just now'}</span>
      </div>
    </div>
  );
};

export default ClinicalCard;
