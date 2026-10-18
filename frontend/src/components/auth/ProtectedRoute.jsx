import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '60px auto', textAlign: 'center' }} className="glass-panel">
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldAlert size={28} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Your current profile (<strong>{user.role}</strong>) does not hold authorization to access this area. 
          Use the role switcher in the top bar to preview other platform workspaces.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'var(--primary)',
            color: '#060b14',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Return to Previous Workspace
        </button>
      </div>
    );
  }

  return children;
}
