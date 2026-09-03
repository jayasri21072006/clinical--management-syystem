import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays,
  UserPlus, FileText,
  AlertTriangle, Clock, CheckCircle2, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Header from '../../components/Header/Header.jsx';
import StatsCard from '../../components/StatsCard/StatsCard.jsx';
import api from '../../services/api.js';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointmentsCount: 0,
    appointmentData: [],
    todayAppointments: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await api.getDashboardStats();
        if (data) {
          setStats({
            totalPatients: data.totalPatients ?? 0,
            todayAppointmentsCount: data.todayAppointmentsCount ?? 0,
            appointmentData: data.appointmentData || [],
            todayAppointments: data.todayAppointments || [],
            recentActivity: data.recentActivity || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats from backend:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalPatients = stats.totalPatients ?? 0;
  const todayAppointments = stats.todayAppointments || [];
  const recentActivity = stats.recentActivity || [];
  const appointmentData = stats.appointmentData || [];

  return (
    <div className="dashboard">
      <Header title="Dashboard" subtitle="Clinical Command Center" />

      {error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={18} />
          <span>Notice: Could not connect to backend server. Make sure backend service is running on http://127.0.0.1:8000.</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="dashboard-stats stagger">
        <StatsCard
          icon={Users}
          value={totalPatients.toLocaleString()}
          label="Total Patients"
          trend="up"
          trendValue="+12%"
          color="green"
          footer="Active database cases"
        />
        <StatsCard
          icon={CalendarDays}
          value={stats.todayAppointmentsCount ?? 0}
          label="Today's Appointments"
          trend="up"
          trendValue="+5%"
          color="blue"
          footer="Scheduled consultations"
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="dashboard-chart-card fade-in-up">
          <h3>Weekly Appointments</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEFEE" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7A7F7B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#7A7F7B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #EDEFEE',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" fill="#6B9B7E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-bottom">
        {/* Today's Appointments */}
        <div className="dashboard-chart-card fade-in-up">
          <h3>Today's Appointments</h3>
          <div className="appointment-mini-list">
            {todayAppointments.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '16px 0', fontSize: '14px' }}>
                No appointments scheduled for today.
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div className="appointment-mini-item" key={apt.id || apt.name}>
                  <div className="appointment-mini-avatar" style={{ background: apt.color || '#4A7C5C' }}>
                    {apt.name ? apt.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="appointment-mini-info">
                    <div className="appointment-mini-name">{apt.name}</div>
                    <div className="appointment-mini-time">{apt.time}</div>
                  </div>
                  <span className={`appointment-mini-status ${apt.status || ''}`}>
                    {apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-chart-card fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3>Recent Activity</h3>
          <div className="activity-timeline">
            {recentActivity.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '16px 0', fontSize: '14px' }}>
                No recent activity logged.
              </div>
            ) : (
              recentActivity.map((item, idx) => (
                <div className="activity-item" key={idx}>
                  <div className="activity-dot">
                    <Activity size={14} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                    <div className="activity-time">{item.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-chart-card fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate('/patients')}>
              <UserPlus size={20} />
              <span>New Patient</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/appointments')}>
              <CalendarDays size={20} />
              <span>Book Appointment</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/case-summary')}>
              <FileText size={20} />
              <span>Case Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
