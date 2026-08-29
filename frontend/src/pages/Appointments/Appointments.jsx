import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus, Filter, Search, X, RefreshCw, Edit3 } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic filter values from database
  const [filterOptions, setFilterOptions] = useState({ statuses: [], types: [], doctors: [], date_groups: [] });

  const [formData, setFormData] = useState({
    time: '10:00 AM',
    patient: '',
    doctor: 'Dr. Ramesh',
    status: 'Confirmed',
    type: 'Consultation',
    date_group: 'today'
  });

  const [searchTimer, setSearchTimer] = useState(null);

  // Fetch available filter values from DB
  const loadFilters = async () => {
    try {
      const data = await api.getAppointmentFilters();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to load appointment filters:', err);
    }
  };

  // Fetch appointments with server-side filtering
  const loadAppointments = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      const params = {
        search: overrides.search !== undefined ? overrides.search : searchTerm,
        status: (overrides.status !== undefined ? overrides.status : statusFilter) === 'All' ? '' : (overrides.status !== undefined ? overrides.status : statusFilter),
        type: (overrides.type !== undefined ? overrides.type : typeFilter) === 'All' ? '' : (overrides.type !== undefined ? overrides.type : typeFilter),
      };
      const data = await api.getAppointments(params);
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter]);

  // Initial load
  useEffect(() => {
    loadFilters();
    loadAppointments();
  }, []);

  // Re-fetch when filter chips change
  useEffect(() => {
    loadAppointments();
  }, [statusFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      loadAppointments({ search: searchTerm });
    }, 400);
    setSearchTimer(timer);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditingApt(null);
    setFormData({ time: '10:00 AM', patient: '', doctor: 'Dr. Ramesh', status: 'Confirmed', type: 'Consultation', date_group: 'today' });
    setShowModal(true);
  };

  const openEditModal = (apt) => {
    setEditingApt(apt);
    setFormData({
      time: apt.time,
      patient: apt.patient,
      doctor: apt.doctor,
      status: apt.status,
      type: apt.type,
      date_group: apt.date_group,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient.trim()) return;

    try {
      if (editingApt) {
        await api.updateAppointment(editingApt.id, formData);
      } else {
        await api.createAppointment(formData);
      }
      setShowModal(false);
      setEditingApt(null);
      await loadFilters();
      await loadAppointments();
    } catch (err) {
      alert(editingApt ? 'Failed to update appointment.' : 'Failed to book appointment.');
    }
  };

  // Build dynamic filter lists from DB
  const statusFilters = ['All', ...filterOptions.statuses];
  const typeFilters = ['All', ...filterOptions.types];

  // Split results by date_group (already server-filtered)
  const todayList = appointments.filter((a) => a.date_group === 'today');
  const upcomingList = appointments.filter((a) => a.date_group === 'upcoming');

  return (
    <div className="appointments-page">
      <Header title="Appointments" subtitle="Timeline & Scheduling">
        <button className="btn-refresh" onClick={() => { loadFilters(); loadAppointments(); }} title="Refresh" style={{ marginRight: '8px' }}>
          <RefreshCw size={16} />
        </button>
        <button className="btn-add-patient" onClick={openAddModal}>
          <Plus size={16} /> Book Appointment
        </button>
      </Header>

      {/* Filter Bar */}
      <div className="patients-controls" style={{ flexWrap: 'wrap', gap: '12px' }}>
        {/* Search Box */}
        <div className="patients-search-box">
          <Search size={16} className="patients-search-icon" />
          <input
            type="text"
            placeholder="Search patient or doctor..."
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

        <div className="appointments-filter-groups">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: 'var(--neutral-500)' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--neutral-600)' }}>Status:</span>
            {statusFilters.map((f) => (
              <div
                key={f}
                className={`patients-filter-chip ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
                style={{ cursor: 'pointer' }}
              >
                {f}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--neutral-600)' }}>Type:</span>
            {typeFilters.map((f) => (
              <div
                key={f}
                className={`patients-filter-chip ${typeFilter === f ? 'active' : ''}`}
                onClick={() => setTypeFilter(f)}
                style={{ cursor: 'pointer' }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="patients-records-text">{appointments.length} results</div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading appointment schedule...
        </div>
      ) : (
        <div className="appointments-timeline">
          <div>
            <div className="timeline-group-title">
              <Clock size={18} /> Today's Schedule ({todayList.length})
            </div>
            <div className="timeline-cards" style={{ marginTop: '12px' }}>
              {todayList.length === 0 && (
                <div style={{ padding: '16px', color: 'var(--neutral-400)', fontSize: '13px' }}>No appointments match your filter.</div>
              )}
              {todayList.map((apt) => (
                <div className="appointment-card fade-in-up" key={apt.id}>
                  <div className="appointment-left">
                    <div className="appointment-time-badge">{apt.time}</div>
                    <div className="appointment-patient-info">
                      <span className="appointment-patient-name">{apt.patient}</span>
                      <span className="appointment-doctor-name">{apt.doctor} · {apt.type}</span>
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <span className={`badge ${apt.status === 'Confirmed' ? 'badge-success' : apt.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                      {apt.status}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(apt)}>
                      <Edit3 size={12} style={{ marginRight: '4px' }} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div className="timeline-group-title">
              <Calendar size={18} /> Upcoming ({upcomingList.length})
            </div>
            <div className="timeline-cards" style={{ marginTop: '12px' }}>
              {upcomingList.length === 0 && (
                <div style={{ padding: '16px', color: 'var(--neutral-400)', fontSize: '13px' }}>No upcoming appointments match your filter.</div>
              )}
              {upcomingList.map((apt) => (
                <div className="appointment-card fade-in-up" key={apt.id}>
                  <div className="appointment-left">
                    <div className="appointment-time-badge">{apt.time}</div>
                    <div className="appointment-patient-info">
                      <span className="appointment-patient-name">{apt.patient}</span>
                      <span className="appointment-doctor-name">{apt.doctor} · {apt.type}</span>
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <span className={`badge ${apt.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {apt.status}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(apt)}>
                      <Edit3 size={12} style={{ marginRight: '4px' }} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book / Edit Appointment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editingApt ? 'Update Appointment' : 'Book Appointment'}</h2>
              <button onClick={() => { setShowModal(false); setEditingApt(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="First Visit">First Visit</option>
                    <option value="Review">Review</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Doctor</label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Schedule Group</label>
                <select
                  value={formData.date_group}
                  onChange={(e) => setFormData({ ...formData, date_group: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                >
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingApt(null); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">{editingApt ? 'Update' : 'Book Now'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
