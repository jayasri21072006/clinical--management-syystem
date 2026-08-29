import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays, Pill, DollarSign,
  UserPlus, FileText, ClipboardList, BarChart3,
  AlertTriangle, Clock, CheckCircle2, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
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
    inventoryItemsCount: 0,
    monthlyRevenue: "₹0",
    revenueData: [],
    appointmentData: [],
    todayAppointments: [],
    recentActivity: [],
    lowStockAlerts: []
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
            inventoryItemsCount: data.inventoryItemsCount ?? 0,
            monthlyRevenue: data.monthlyRevenue || "₹0",
            revenueData: data.revenueData || [],
            appointmentData: data.appointmentData || [],
            todayAppointments: data.todayAppointments || [],
            recentActivity: data.recentActivity || [],
            lowStockAlerts: data.lowStockAlerts || []
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
  const lowStockAlerts = stats.lowStockAlerts || [];
  const revenueData = stats.revenueData || [];
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
        <StatsCard
          icon={Pill}
          value={stats.inventoryItemsCount ?? 0}
          label="Inventory Items"
          trend="down"
          trendValue="-3%"
          color="orange"
          footer={`${lowStockAlerts.length} low stock alerts`}
        />
        <StatsCard
          icon={DollarSign}
          value={stats.monthlyRevenue || "₹0"}
          label="Monthly Revenue"
          trend="up"
          trendValue="+18%"
          color="green"
          footer="vs ₹6.1L last month"
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="dashboard-chart-card fade-in-up">
          <h3>Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A7C5C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4A7C5C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEFEE" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7A7F7B' }} axisLine={false} tickLine={false} />
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
              <Area type="monotone" dataKey="revenue" stroke="#4A7C5C" strokeWidth={2.5} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart-card fade-in-up" style={{ animationDelay: '100ms' }}>
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

        {/* Quick Actions & Alerts */}
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
            <button className="quick-action-btn" onClick={() => navigate('/medical-inventory')}>
              <ClipboardList size={20} />
              <span>New Order</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/reports')}>
              <BarChart3 size={20} />
              <span>View Reports</span>
            </button>
          </div>
          <div style={{ marginTop: 'var(--space-5)' }}>
            <h3 style={{ marginBottom: '12px' }}>Low Stock Alerts</h3>
            {lowStockAlerts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                All inventory items sufficiently stocked.
              </div>
            ) : (
              lowStockAlerts.map((item, idx) => (
                <div className="alert-item" key={idx}>
                  <AlertTriangle size={16} />
                  <span className="alert-item-text">{item.name}</span>
                  <span className="alert-item-count">{item.remaining} left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
