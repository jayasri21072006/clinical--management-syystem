import React, { useState, useEffect } from 'react';
import { Boxes, BookOpen, Stethoscope, Award, FileSpreadsheet, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './Modules.css';

// Map icon_name strings from the backend to actual lucide-react components
const iconMap = {
  BookOpen,
  Stethoscope,
  Cpu,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  Boxes,
};

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadModules = async () => {
    try {
      setLoading(true);
      const data = await api.getModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return (
    <div className="modules-page">
      <Header title="Modules" subtitle="Clinical Applications & Tools">
        <button className="btn-refresh" onClick={loadModules} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </Header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading modules from backend...
        </div>
      ) : modules.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          No modules found.
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((m, idx) => {
            const Icon = iconMap[m.icon_name] || Boxes;
            return (
              <div className="module-card fade-in-up" key={m.id} style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="module-icon">
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>{m.title}</h3>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)', flex: 1 }}>{m.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span className="badge badge-sage">{m.status}</span>
                  <button className="btn btn-secondary btn-sm">Launch</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Modules;
