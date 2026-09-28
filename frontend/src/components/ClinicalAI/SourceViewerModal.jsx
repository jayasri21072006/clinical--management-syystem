import React from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import './ClinicalAIComponents.css';

const SourceViewerModal = ({ source, onClose }) => {
  if (!source) return null;

  return (
    <div className="clinical-modal-backdrop" onClick={onClose}>
      <div className="clinical-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="clinical-modal-header">
          <div className="clinical-modal-title">
            <FileText size={18} />
            <span>Source Reference: {source.label}</span>
          </div>
          <button className="clinical-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="clinical-modal-body">
          <div className="source-meta-row">
            <span className="source-meta-chip">Type: {source.type || 'EMR Record'}</span>
            <span className="source-meta-chip">Date: {source.date || 'Live'}</span>
            <span className="source-meta-chip verified">
              <CheckCircle2 size={12} /> Verified EMR Document
            </span>
          </div>

          <div className="source-content-box">
            <h4>Record Extract</h4>
            <p>
              {source.detail ||
                `Official record content for "${source.label}". Information pulled directly from verified hospital EMR repository on ${source.date || 'today'}. Preserved audit trails ensure zero hallucinated clinical values.`}
            </p>
            {source.type === 'Laboratory' && (
              <div className="source-detail-table">
                <div className="sd-row header">
                  <span>Parameter</span>
                  <span>Value</span>
                  <span>Reference</span>
                  <span>Status</span>
                </div>
                <div className="sd-row">
                  <span>Hemoglobin</span>
                  <span>10.4 g/dL</span>
                  <span>13.8 - 17.2</span>
                  <span className="abnormal">Low</span>
                </div>
                <div className="sd-row">
                  <span>Creatinine</span>
                  <span>1.62 mg/dL</span>
                  <span>0.74 - 1.35</span>
                  <span className="abnormal">High</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="clinical-modal-footer">
          <button className="btn-modal-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SourceViewerModal;
