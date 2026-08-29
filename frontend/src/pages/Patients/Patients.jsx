import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, X, Filter, RefreshCw } from 'lucide-react';
import PatientCard from '../../components/PatientCard/PatientCard.jsx';
import api from '../../services/api.js';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [activeGender, setActiveGender] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  // Dynamic filter values from database
  const [filterOptions, setFilterOptions] = useState({ genders: [], statuses: [] });

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    email: '',
  });

  // Debounce timer ref
  const [searchTimer, setSearchTimer] = useState(null);

  // Fetch available filter values from DB
  const loadFilters = async () => {
    try {
      const data = await api.getPatientFilters();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to load patient filters:', err);
    }
  };

  // Fetch patients with server-side filtering
  const loadPatients = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      const params = {
        search: overrides.search !== undefined ? overrides.search : searchTerm,
        gender: (overrides.gender !== undefined ? overrides.gender : activeGender) === 'All' ? '' : (overrides.gender !== undefined ? overrides.gender : activeGender),
        status: (overrides.status !== undefined ? overrides.status : activeStatus) === 'All' ? '' : (overrides.status !== undefined ? overrides.status : activeStatus),
      };
      const data = await api.getPatients(params);
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeGender, activeStatus]);

  // Initial load: filters + data
  useEffect(() => {
    loadFilters();
    loadPatients();
  }, []);

  // Re-fetch when filter chips change
  useEffect(() => {
    loadPatients();
  }, [activeGender, activeStatus]);

  // Debounced search — re-fetch 400ms after user stops typing
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      loadPatients({ search: searchTerm });
    }, 400);
    setSearchTimer(timer);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleGenderFilter = (g) => {
    setActiveGender(g);
  };

  const handleStatusFilter = (s) => {
    setActiveStatus(s);
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({ name: '', age: '', gender: 'Female', phone: '', email: '' });
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'Female',
      phone: patient.phone || '',
      email: patient.email || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingPatient) {
        await api.updatePatient(editingPatient.id, formData);
      } else {
        await api.createPatient(formData);
      }
      setShowModal(false);
      setEditingPatient(null);
      setFormData({ name: '', age: '', gender: 'Female', phone: '', email: '' });
      await loadFilters();
      await loadPatients();
    } catch (err) {
      alert(editingPatient ? 'Failed to update patient.' : 'Failed to add patient.');
    }
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await api.deletePatient(patientId);
      await loadFilters();
      await loadPatients();
    } catch (err) {
      alert('Failed to delete patient.');
    }
  };

  // Build gender filter list dynamically from DB
  const genderFilters = ['All', ...filterOptions.genders];
  const statusFilters = ['All', ...filterOptions.statuses];

  return (
    <div className="patients-page">
      {/* Top Header */}
      <div className="patients-top-bar">
        <div className="patients-title-group">
          <h1 className="patients-title">Patients</h1>
          <span className="patients-count-sub">{patients.length} patients</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn-refresh"
            onClick={() => { loadFilters(); loadPatients(); }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button className="btn-add-patient" onClick={openAddModal}>
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="patients-controls">
        <div className="patients-search-box">
          <Search size={16} className="patients-search-icon" />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="patients-filter-section">
          <div className="patients-filter-row">
            <Filter size={14} className="filter-icon" />
            <span className="filter-label">Gender:</span>
            <div className="patients-filter-group">
              {genderFilters.map((f) => (
                <div
                  key={f}
                  className={`patients-filter-chip ${activeGender === f ? 'active' : ''}`}
                  onClick={() => handleGenderFilter(f)}
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
          {statusFilters.length > 1 && (
            <div className="patients-filter-row">
              <span className="filter-label" style={{ marginLeft: '20px' }}>Status:</span>
              <div className="patients-filter-group">
                {statusFilters.map((f) => (
                  <div
                    key={f}
                    className={`patients-filter-chip ${activeStatus === f ? 'active' : ''}`}
                    onClick={() => handleStatusFilter(f)}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="patients-records-text">{patients.length} records</div>
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading patients from backend...
        </div>
      ) : patients.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          No patients found matching your filter.
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map((patient, index) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              index={index}
              onEdit={() => openEditModal(patient)}
              onDelete={() => handleDelete(patient.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="patients-pagination">
        <span className="pagination-info">1-{patients.length} of {patients.length}</span>
        <div className="pagination-controls">
          <button className="page-btn" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="page-btn active">1</button>
          <button className="page-btn" disabled>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editingPatient ? 'Update Patient' : 'Add New Patient'}</h2>
              <button onClick={() => { setShowModal(false); setEditingPatient(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9840912345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">{editingPatient ? 'Update' : 'Save Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
