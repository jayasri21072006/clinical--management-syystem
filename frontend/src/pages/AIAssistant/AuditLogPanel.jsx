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

const MODEL_COLORS = {
  'gemini-2.5-pro': { bg: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: 'rgba(139, 92, 246, 0.4)' },
  'gemini-2.5-flash': { bg: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', border: 'rgba(56, 189, 248, 0.4)' },
};

const ValidationBadge = ({ status }) => {
  if (status === 'passed') return (
    <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
      <CheckCircle2 size={12} /> Passed
    </span>
  );
  if (status === 'pii_echo_stripped') return (
    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
      <AlertTriangle size={12} /> PII Stripped
    </span>
  );
  return (
    <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
      <XCircle size={12} /> {status}
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
    { label: 'Total Requests', value: stats.total_requests, icon: Activity, color: '#38bdf8' },
    { label: 'PHI Detections', value: stats.pii_detections, icon: Lock, color: '#fbbf24' },
    { label: 'Injection Blocks', value: stats.injection_blocks, icon: Ban, color: '#f87171' },
    { label: 'Pro Model Uses', value: stats.pro_model_uses, icon: Cpu, color: '#c4b5fd' },
    { label: 'Flash Model Uses', value: stats.flash_model_uses, icon: Zap, color: '#34d399' },
    { label: 'Requests Blocked', value: stats.requests_blocked, icon: XCircle, color: '#fb923c' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Stats Banner */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          {statCards.map((card, idx) => (
            <div key={idx} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <card.icon size={20} style={{ color: card.color, margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color }}>{card.value ?? 0}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={20} style={{ color: '#34d399' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>AI Security Audit Log</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              No raw clinical text stored · De-identified metadata only · HIPAA Compliant
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastRefresh && (
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              style={{ accentColor: '#34d399' }}
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#475569' }}>
          <Eye size={40} style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>No audit entries yet</div>
          <div style={{ fontSize: '0.85rem' }}>Audit entries will appear here after any AI operation is performed.</div>
        </div>
      )}

      {/* Audit Table */}
      {entries.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(2, 6, 23, 0.9)', color: '#64748b', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Operation</th>
                <th style={{ padding: '0.75rem 1rem' }}>Model</th>
                <th style={{ padding: '0.75rem 1rem' }}>PHI</th>
                <th style={{ padding: '0.75rem 1rem' }}>Injection</th>
                <th style={{ padding: '0.75rem 1rem' }}>Validation</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const isBlocked = !entry.request_allowed;
                const isInjection = entry.injection_blocked;
                const isRateLimited = entry.rate_limited;
                const rowBg = isBlocked
                  ? 'rgba(239, 68, 68, 0.06)'
                  : entry.pii_detected
                    ? 'rgba(245, 158, 11, 0.05)'
                    : idx % 2 === 0 ? 'rgba(15, 23, 42, 0.5)' : 'transparent';

                const modelStyle = MODEL_COLORS[entry.model_used] || MODEL_COLORS['gemini-2.5-flash'];
                const ts = new Date(entry.timestamp);
                const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = ts.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <tr key={entry.request_id + idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* ID */}
                    <td style={{ padding: '0.65rem 1rem', color: '#64748b', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      {entry.request_id}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '0.65rem 1rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.75rem' }}>{timeStr}</div>
                      <div style={{ fontSize: '0.65rem', color: '#475569' }}>{dateStr}</div>
                    </td>

                    {/* Operation */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                        {OPERATION_LABELS[entry.operation] || entry.operation}
                      </span>
                    </td>

                    {/* Model */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: modelStyle.bg,
                        color: modelStyle.color,
                        border: `1px solid ${modelStyle.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {entry.model_used?.includes('pro') ? '⚡ Pro' : '🔵 Flash'}
                      </span>
                    </td>

                    {/* PHI */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      {entry.pii_detected ? (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
                          <Lock size={11} /> {entry.pii_count} items
                        </span>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.75rem' }}>None</span>
                      )}
                    </td>

                    {/* Injection */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      {entry.injection_detected ? (
                        <span style={{ color: entry.injection_blocked ? '#f87171' : '#fbbf24', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
                          <Ban size={11} /> {entry.injection_blocked ? 'Sanitized' : 'Detected'}
                        </span>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.75rem' }}>Clean</span>
                      )}
                    </td>

                    {/* Validation */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <ValidationBadge status={entry.response_validation} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      {isRateLimited ? (
                        <span style={{ color: '#fb923c', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
                          <Ban size={11} /> Rate Limited
                        </span>
                      ) : isBlocked ? (
                        <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
                          <XCircle size={11} /> Blocked
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}>
                          <CheckCircle2 size={11} /> Allowed
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
        background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        fontSize: '0.75rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Shield size={13} style={{ color: '#34d399', flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#34d399' }}>Privacy Guarantee:</strong> This audit log contains only metadata.
          No raw clinical text, patient names, PHI, or AI prompt content is ever stored or displayed here.
          All entries are HIPAA-compliant sanitized records.
        </span>
      </div>
    </div>
  );
};

export default AuditLogPanel;
