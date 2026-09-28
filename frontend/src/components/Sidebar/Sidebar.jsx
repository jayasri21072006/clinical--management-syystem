import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Stethoscope,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Sparkles,
  BarChart3,
  Package,
  Pill,
} from 'lucide-react';
import api from '../../services/api.js';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(3);
  const [todayAptsCount, setTodayAptsCount] = useState(5);
  const location = useLocation();

  useEffect(() => {
    const loadSidebarStats = async () => {
      try {
        const stats = await api.getDashboardStats();
        if (stats) {
          if (stats.todayAppointmentsCount !== undefined) {
            setTodayAptsCount(stats.todayAppointmentsCount);
          }
          if (stats.lowStockAlerts && Array.isArray(stats.lowStockAlerts)) {
            setLowStockCount(stats.lowStockAlerts.length);
          }
        }
      } catch (err) {
        // Fallback to checking inventory directly
        try {
          const inv = await api.getInventory();
          if (Array.isArray(inv)) {
            const low = inv.filter((item) => (Number(item.stock) || 0) < 5).length;
            setLowStockCount(low);
          }
        } catch (e) {
          console.warn('Could not load sidebar badges:', e);
        }
      }
    };
    loadSidebarStats();
  }, []);

  const navSections = [
    {
      title: 'Clinical Operations',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Appointments', icon: CalendarDays, path: '/appointments', badge: todayAptsCount },
        { label: 'Case Summary', icon: FileText, path: '/case-summary' },
        { label: 'Physician', icon: Stethoscope, path: '/physician' },
      ],
    },
    {
      title: 'Clinical AI Intelligence',
      items: [
        { label: 'Clinical AI', icon: Sparkles, path: '/ai-assistant' },
      ],
    },
    {
      title: 'Pharmacy & Stock',
      items: [
        {
          label: 'Medical Inventory',
          icon: Pill,
          path: '/medical-inventory',
          badge: lowStockCount > 0 ? `! ${lowStockCount}` : null,
          badgeType: 'warning'
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Purchase Orders', icon: Package, path: '/purchase-orders' },
        { label: 'Reports', icon: BarChart3, path: '/reports' },
        { label: 'Branch Locations', icon: MapPin, path: '/location' },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Leaf size={22} />
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">Sage Green</span>
          <span className="sidebar-brand-subtitle">Wellness Clinic</span>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  end={item.path === '/'}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={18} />
                  </span>
                  <span className="sidebar-link-text">{item.label}</span>
                  {item.badge && (
                    <span className={`sidebar-link-badge ${item.badgeType === 'warning' ? 'badge-warning' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">R</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Dr. Ramesh</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

