import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Mail, Phone, Calendar, X } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './Physician.css';

const Physician = () => {
  const [physicians, setPhysicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    qual: 'BHMS, MD (Homeopathy)',
    exp: '5 years exp',
    patients: 100,
    status: 'Active'
  });

  const loadPhysicians = async () => {
    try {
      setLoading(true);
      const data = await api.getPhysicians();
      setPhysicians(data);
    } catch (err) {
      console.error('Failed to load physicians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhysicians();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await api.createPhysician({ ...formData, patients: parseInt(formData.patients, 10) || 0 });
      setShowModal(false);
      setFormData({ name: '', qual: 'BHMS, MD (Homeopathy)', exp: '5 years exp', patients: 100, status: 'Active' });
      await loadPhysicians();
    } catch (err) {
      alert('Failed to register physician.');
    }
  };

  return (
    <div className="physician-page">
      <Header title="Physician Directory" subtitle="Doctors Profile & Consultation Schedules">
        <button className="btn-add-patient" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Physician
        </button>
      </Header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading physician records...
        </div>
      ) : (
        <div className="physicians-grid">
          {physicians.map((doc) => (
            <div className="physician-card fade-in-up" key={doc.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="avatar avatar-lg" style={{ background: 'var(--sage-700)' }}>
                  {doc.name.split(' ')[1]?.charAt(0) || doc.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>{doc.name}</h3>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>{doc.qual}</p>
                </div>
              </div>

              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-600)', background: 'var(--neutral-25)', padding: '10px', borderRadius: '8px' }}>
                <div><strong>Experience:</strong> {doc.exp}</div>
                <div><strong>Patients Consulted:</strong> {doc.patients}</div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Physician Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Add New Physician</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Qualifications</label>
                <input
                  type="text"
                  placeholder="e.g. BHMS, MD (Homeopathy)"
                  value={formData.qual}
                  onChange={(e) => setFormData({ ...formData, qual: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 years exp"
                    value={formData.exp}
                    onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Patients Consulted</label>
                  <input
                    type="number"
                    value={formData.patients}
                    onChange={(e) => setFormData({ ...formData, patients: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">Add Physician</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Physician;
