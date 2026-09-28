import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, X } from 'lucide-react';
import './Header.css';

const Header = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('sage_theme') === 'dark';
  });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('sage_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('sage_theme', 'light');
    }
  }, [isDarkMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/patients?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="header">
      <div className="header-left">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-center">
        <form onSubmit={handleSearchSubmit} className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Quick search patients (press Enter)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => setGlobalSearch('')}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </form>
      </div>

      <div className="header-right">
        <span className="header-date">{today}</span>
        
        {/* Dark Mode & High Contrast Toggle */}
        <button
          className="header-icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Sage Green Day Theme' : 'Switch to Soft Dark Night-Shift Theme'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} style={{ color: '#FBBF24' }} /> : <Moon size={18} />}
        </button>

        {children}
      </div>
    </div>
  );
};

export default Header;

