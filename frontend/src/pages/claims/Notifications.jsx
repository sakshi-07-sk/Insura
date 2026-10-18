import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Check, 
  Trash2,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Notifications() {
  const [filter, setFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-1',
      title: 'Fast-Track Payout Approved: CLM-2026-6188',
      message: 'Claim passed AI risk check with a score of 0.082 (LOW). Instant settlement of $4,850.00 disbursed via ACH.',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      type: 'SUCCESS',
      unread: true,
      claimId: 'CLM-2026-6188'
    },
    {
      id: 'NOTIF-2',
      title: 'SIU Hold Alert: CLM-2026-9041 Flagged',
      message: 'Claim scored 0.824 (HIGH risk). Claim placed on automatic hold and routed to Fraud Investigation Unit.',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      type: 'ALERT',
      unread: true,
      claimId: 'CLM-2026-9041'
    },
    {
      id: 'NOTIF-3',
      title: 'Manual Review Requested: CLM-2026-4412',
      message: 'Claim scored 0.450 (MEDIUM risk). Requires policyholder statement verification regarding third-party witness.',
      timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
      type: 'INFO',
      unread: false,
      claimId: 'CLM-2026-4412'
    },
    {
      id: 'NOTIF-4',
      title: 'Investigation Resolution: CLM-2026-8712 Cleared',
      message: 'SIU Investigator Damian cleared claim after body shop repair estimate audit. Payout ready for final sign-off.',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      type: 'SUCCESS',
      unread: false,
      claimId: 'CLM-2026-8712'
    },
    {
      id: 'NOTIF-5',
      title: 'Inference Engine Latency Baseline Verified',
      message: 'LinuxONE s390x inference engine reported 18.2ms average response time over the last 500 scoring requests.',
      timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
      type: 'SYSTEM',
      unread: false
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return n.unread;
    if (filter === 'ALERT') return n.type === 'ALERT';
    if (filter === 'SUCCESS') return n.type === 'SUCCESS';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Activity Stream & Claim Notifications
            </h1>
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#3b82f6', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(59, 130, 246, 0.3)' 
            }}>
              {notifications.filter(n => n.unread).length} Unread
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Real-time feed of automated claim scoring decisions, investigator escalations, and settlement disbursements.
          </p>
        </div>

        <button
          onClick={markAllRead}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '10px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Check size={14} /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        {['ALL', 'UNREAD', 'ALERT', 'SUCCESS'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              border: filter === f ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
              color: filter === f ? '#06b6d4' : 'var(--text-muted)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {f === 'ALL' ? 'All Notifications' : (f === 'UNREAD' ? 'Unread Only' : (f === 'ALERT' ? 'SIU Alerts' : 'Fast-Track Approvals'))}
          </button>
        ))}
      </div>

      {/* Notification Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications in this view.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              style={{
                background: notif.unread ? 'rgba(6, 182, 212, 0.04)' : 'var(--bg-card)',
                border: notif.unread ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                position: 'relative'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {notif.type === 'ALERT' ? (
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <AlertTriangle size={18} />
                  </div>
                ) : notif.type === 'SUCCESS' ? (
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <CheckCircle2 size={18} />
                  </div>
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <Clock size={18} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                  {notif.message}
                </div>

                {notif.claimId && (
                  <div style={{ marginTop: '10px' }}>
                    <Link
                      to="/claims/status"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#38bdf8',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      Inspect Claim {notif.claimId} &rarr;
                    </Link>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => toggleRead(notif.id)}
                  title={notif.unread ? "Mark read" : "Mark unread"}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Check size={16} color={notif.unread ? '#06b6d4' : 'var(--text-muted)'} />
                </button>
                <button
                  onClick={() => deleteNotification(notif.id)}
                  title="Dismiss notification"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
