import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import './Header.css';

const Header = ({ title, subtitle, children }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="header">
      <div className="header-left">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-right">
        <span className="header-date">{today}</span>
        {children}
      </div>
    </div>
  );
};

export default Header;
