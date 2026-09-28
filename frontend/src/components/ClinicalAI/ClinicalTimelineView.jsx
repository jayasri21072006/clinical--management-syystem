import React from 'react';
import { Calendar, Activity, FlaskConical, Image as ImageIcon, Pill, BookOpen, FileText } from 'lucide-react';
import './ClinicalAIComponents.css';

const getItemIcon = (type) => {
  switch (type) {
    case 'Clinical Visit': return FileText;
    case 'Lab Results': return FlaskConical;
    case 'Imaging': return ImageIcon;
    case 'Medication Change': return Pill;
    case 'Referral': return BookOpen;
    default: return Activity;
  }
};

const ClinicalTimelineView = ({ events = [], onSelectSource }) => {
  if (!events || events.length === 0) {
    return (
      <div className="timeline-empty">
        <Calendar size={24} />
        <span>No clinical events documented in timeline.</span>
      </div>
    );
  }

  return (
    <div className="clinical-timeline-container">
      <div className="timeline-tree">
        {events.map((evt, index) => {
          const Icon = getItemIcon(evt.type);
          return (
            <div key={index} className="timeline-item-row" onClick={() => onSelectSource && onSelectSource({ label: evt.title, type: evt.type, date: evt.date })}>
              <div className="timeline-node">
                <Icon size={14} />
              </div>
              <div className="timeline-content-card">
                <div className="timeline-card-header">
                  <span className="timeline-date">{evt.date}</span>
                  <span className={`timeline-badge ${evt.type.toLowerCase().replace(/\s+/g, '-')}`}>
                    {evt.type}
                  </span>
                </div>
                <h4 className="timeline-title">{evt.title}</h4>
                <p className="timeline-desc">{evt.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClinicalTimelineView;
