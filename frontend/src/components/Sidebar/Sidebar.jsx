import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Pill,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Stethoscope,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import './Sidebar.css';

const navSections = [
  {
    title: 'Clinical',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Appointment', icon: CalendarDays, path: '/appointments', badge: 5 },
      { label: 'Patient', icon: Users, path: '/patients' },
      { label: 'Case Summary', icon: FileText, path: '/case-summary' },
    ],
  },
  {
    title: 'Pharmacy',
    items: [
      { label: 'Medical Inventory', icon: Pill, path: '/medical-inventory' },
      { label: 'Retail Selling', icon: ShoppingCart, path: '/retail-selling' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Purchase Orders', icon: ClipboardList, path: '/purchase-orders' },
      { label: 'Reports', icon: BarChart3, path: '/reports' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Physician', icon: Stethoscope, path: '/physician' },
      { label: 'Location', icon: MapPin, path: '/location' },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
                    <span className="sidebar-link-badge">{item.badge}</span>
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
