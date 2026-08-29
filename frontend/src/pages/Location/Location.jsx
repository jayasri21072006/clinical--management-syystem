import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Phone, Building, X, RefreshCw } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './Location.css';

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    status: 'Branch',
  });

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await api.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await api.createLocation(formData);
      setShowModal(false);
      setFormData({ name: '', address: '', city: '', phone: '', status: 'Branch' });
      await loadLocations();
    } catch (err) {
      alert('Failed to add location.');
    }
  };

  return (
    <div className="location-page">
      <Header title="Location" subtitle="Clinic Branches & Operations Setup">
        <button className="btn-refresh" onClick={loadLocations} title="Refresh" style={{ marginRight: '8px' }}>
          <RefreshCw size={16} />
        </button>
        <button className="btn-add-patient" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Location
        </button>
      </Header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading locations from backend...
        </div>
      ) : locations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          No locations found. Click "Add Location" to create one.
        </div>
      ) : (
        <div className="grid-auto">
          {locations.map((loc) => (
            <div className="card fade-in-up" key={loc.id} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--sage-50)', color: 'var(--sage-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>{loc.name}</h3>
                  <span className="badge badge-sage">{loc.status}</span>
                </div>
              </div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-600)', marginBottom: '8px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {loc.address}, {loc.city}
              </p>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)', marginBottom: '8px' }}>
                <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {loc.phone}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Add New Location</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddLocation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Branch Name *</label>
                <input type="text" required placeholder="e.g. South Branch - Sage Green Wellness" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Address</label>
                <input type="text" placeholder="e.g. 22 Health Road, Koramangala" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>City</label>
                  <input type="text" placeholder="e.g. Bengaluru" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Phone</label>
                  <input type="text" placeholder="e.g. +91 98403 45678" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Type</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}>
                  <option value="Branch">Branch</option>
                  <option value="Main Clinic">Main Clinic</option>
                  <option value="Satellite">Satellite</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">Add Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Location;
