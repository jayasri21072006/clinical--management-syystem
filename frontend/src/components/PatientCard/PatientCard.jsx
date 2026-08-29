import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import './PatientCard.css';

const avatarColors = ['green', 'blue', 'purple', 'orange', 'teal'];
const tagColors = ['tag-green', 'tag-blue', 'tag-orange', 'tag-purple'];

const PatientCard = ({ patient, index = 0, onEdit, onDelete }) => {
  const colorIndex = index % avatarColors.length;
  const initial = patient.name ? patient.name.charAt(0).toUpperCase() : 'P';

  return (
    <div className="patient-card fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="patient-card-header">
        <div className={`patient-card-avatar ${avatarColors[colorIndex]}`}>
          {initial}
        </div>
        <div className="patient-card-info">
          <div className="patient-card-name">{patient.name}</div>
          <div className="patient-card-id">#{patient.id}</div>
        </div>
      </div>
      <div className="patient-card-meta">
        {patient.age ? `${patient.age} years` : 'Age N/A'} · {patient.gender}
      </div>
      {patient.phone && (
        <div className="patient-card-phone">
          {patient.phone}
        </div>
      )}
      <div className="patient-card-tags">
        <div className={`patient-card-tag ${tagColors[colorIndex % tagColors.length]}`}></div>
        <div className={`patient-card-tag ${tagColors[(colorIndex + 1) % tagColors.length]}`}></div>
      </div>
      <div className="patient-card-actions">
        <button className="patient-card-action" title="Edit" onClick={onEdit}>
          <Edit3 size={14} />
        </button>
        <button className="patient-card-action" title="Delete" onClick={onDelete} style={{ color: 'var(--error)' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
