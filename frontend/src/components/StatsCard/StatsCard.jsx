import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

const StatsCard = ({ icon: Icon, value, label, trend, trendValue, color = 'green', footer }) => {
  return (
    <div className={`stats-card ${color} fade-in-up`}>
      <div className="stats-card-header">
        <div className="stats-card-icon">
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`stats-card-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="stats-card-value">{value}</div>
      <div className="stats-card-label">{label}</div>
      {footer && <div className="stats-card-footer">{footer}</div>}
    </div>
  );
};

export default StatsCard;
