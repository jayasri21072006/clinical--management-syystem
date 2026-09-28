import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
  Cpu, Eye, Clock, Activity, Ban, Lock, Zap
} from 'lucide-react';
import api from '../../services/api';

const OPERATION_LABELS = {
  clinical_chat: 'Clinical Chat',
  doc_analysis: 'Doc Analysis',
  risk: 'Risk Prediction',
  image: 'Image Analysis',
  lab: 'Lab Report',
  multi_factor_agent: 'Multi-Factor Agent',
  safety_report: 'Safety Report',
};

const MODEL_BADGES = {
  'gemini-2.5-pro': { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', text: '⚡ Pro' },
  'gemini-2.5-flash': { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', text: '🔵 Flash' },
};

const ValidationBadge = ({ status }) => {
  if (status === 'passed') return (
    <span style={{ color: '#2E7D4F', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
      <CheckCircle2 size={13} /> Passed
    </span>
  );
  if (status === 'pii_echo_stripped') return (
    <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
      <AlertTriangle size={13} /> PII Stripped
    </span>
  );
  return (
    <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
      <XCircle size={13} /> {status}
    </span>
  );
};

const AuditLogPanel = () => {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logRes, statsRes] = await Promise.all([
        api.getAuditLog(100),
        api.getAuditStats()
      ]);
      setEntries(logRes.entries || []);
      setStats(statsRes.stats);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Audit log fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const statCards = stats ? [
    { label: 'Total Requests', value: stats.total_requests, icon: Activity, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
    { label: 'PHI Detections', value: stats.pii_detections, icon: Lock, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { label: 'Injection Blocks', value: stats.injection_blocks, icon: Ban, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
    { label: 'Pro Model Uses', value: stats.pro_model_uses, icon: Cpu, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { label: 'Flash Model Uses', value: stats.flash_model_uses, icon: Zap, color: '#2D5A3D', bg: '#E8F5E9', border: '#A8D5BA' },
    { label: 'Requests Blocked', value: stats.requests_blocked, icon: XCircle, color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Stats Banner */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {statCards.map((card, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              border: '1px solid var(--neutral-200, #DFE1E0)',
              borderRadius: '12px',
              padding: '1.1rem 0.85rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0, 0, 0, 0.04))',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: card.bg,
                border: `1px solid ${card.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem auto'
              }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value ?? 0}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--neutral-600, #5A5F5B)', marginTop: '0.2rem', fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={22} style={{ color: 'var(--sage-700, #3A6B4E)' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--neutral-900, #1A1D1B)', fontSize: '1rem' }}>AI Security Audit Log</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--neutral-500, #7A7F7B)' }}>
              No raw clinical text stored · De-identified metadata only · HIPAA Compliant
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {lastRefresh && (
            <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500, #7A7F7B)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--neutral-700, #3E433F)', cursor: 'pointer', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              style={{ accentColor: 'var(--sage-700, #3A6B4E)' }}
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={fetchData}
            disabled={loading}
            className="ai-btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && !loading && (
        <div className="ai-empty-state">
          <Eye size={42} className="ai-empty-icon" />
          <div className="ai-empty-title">No audit entries yet</div>
          <div className="ai-empty-desc">Audit entries will appear here automatically whenever an AI operation is performed.</div>
        </div>
      )}

      {/* Audit Table */}
      {entries.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--neutral-200, #DFE1E0)', background: '#FFFFFF', boxShadow: 'var(--shadow-xs)' }}>
          <table className="ai-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Operation</th>
                <th>Model</th>
                <th>PHI Scrubbed</th>
                <th>Injection Check</th>
                <th>Validation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const isBlocked = !entry.request_allowed;
                const isInjection = entry.injection_blocked;
                const isRateLimited = entry.rate_limited;
                const rowBg = isBlocked
                  ? '#FEF2F2'
                  : entry.pii_detected
                    ? '#FFFBEB'
                    : idx % 2 === 0 ? '#FFFFFF' : 'var(--neutral-25, #FAFBFA)';

                const badge = MODEL_BADGES[entry.model_used] || MODEL_BADGES['gemini-2.5-flash'];
                const ts = new Date(entry.timestamp);
                const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = ts.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <tr key={entry.request_id + idx} style={{ background: rowBg }}>
                    {/* ID */}
                    <td style={{ color: 'var(--neutral-500, #7A7F7B)', fontFamily: 'monospace', fontSize: '0.74rem' }}>
                      {entry.request_id}
                    </td>

                    {/* Time */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-800, #2C302D)' }}>{timeStr}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--neutral-400, #9CA09D)' }}>{dateStr}</div>
                    </td>

                    {/* Operation */}
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--neutral-900, #1A1D1B)' }}>
                        {OPERATION_LABELS[entry.operation] || entry.operation}
                      </span>
                    </td>

                    {/* Model */}
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {badge.text}
                      </span>
                    </td>

                    {/* PHI */}
                    <td>
                      {entry.pii_detected ? (
                        <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
                          <Lock size={12} /> {entry.pii_count} scrubbed
                        </span>
                      ) : (
                        <span style={{ color: 'var(--neutral-400, #9CA09D)', fontSize: '0.78rem' }}>None</span>
                      )}
                    </td>

                    {/* Injection */}
                    <td>
                      {entry.injection_detected ? (
                        <span style={{ color: entry.injection_blocked ? '#DC2626' : '#D97706', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
                          <Ban size={12} /> {entry.injection_blocked ? 'Blocked' : 'Sanitized'}
                        </span>
                      ) : (
                        <span style={{ color: '#2E7D4F', fontSize: '0.78rem', fontWeight: 600 }}>Clean</span>
                      )}
                    </td>

                    {/* Validation */}
                    <td>
                      <ValidationBadge status={entry.response_validation} />
                    </td>

                    {/* Status */}
                    <td>
                      {isRateLimited ? (
                        <span style={{ color: '#EA580C', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 700 }}>
                          <Ban size={12} /> Rate Limited
                        </span>
                      ) : isBlocked ? (
                        <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 700 }}>
                          <XCircle size={12} /> Blocked
                        </span>
                      ) : (
                        <span style={{ color: '#2E7D4F', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 700 }}>
                          <CheckCircle2 size={12} /> Allowed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Compliance Footer */}
      <div style={{
        background: 'var(--sage-25, #F1F9F3)',
        border: '1px solid var(--sage-200, #A8D5BA)',
        borderRadius: '10px',
        padding: '0.85rem 1.1rem',
        fontSize: '0.8rem',
        color: 'var(--neutral-700, #3E433F)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        <Shield size={16} style={{ color: 'var(--sage-700, #3A6B4E)', flexShrink: 0 }} />
        <span>
          <strong style={{ color: 'var(--sage-900, #1A3D2B)' }}>Privacy Guarantee:</strong> This audit log contains only metadata.
          No raw clinical text, patient names, PHI, or AI prompt content is ever stored or displayed here.
          All entries are HIPAA-compliant sanitized records.
        </span>
      </div>
    </div>
  );
};

export default AuditLogPanel;
