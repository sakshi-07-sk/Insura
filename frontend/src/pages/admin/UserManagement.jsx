import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  RefreshCw,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth, DEMO_ACCOUNTS, ROLE_DETAILS, ROLES } from '../../context/AuthContext';

export function UserManagement() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState(DEMO_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // New User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('demo1234');
  const [newRole, setNewRole] = useState(ROLES.CLAIMS_OFFICER);
  const [creatingUser, setCreatingUser] = useState(false);

  const loadUsers = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getUsers();
      if (Array.isArray(res) && res.length > 0) {
        setUsersList(res.map(u => ({
          ...u,
          name: u.full_name,
          initials: (u.full_name || u.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        })));
      }
    } catch (e) {
      console.warn('Backend getUsers fallback to local demo accounts:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (email, newRoleVal, userId) => {
    setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRoleVal } : u));
    setActionMessage(`Successfully updated role for ${email} to ${ROLE_DETAILS[newRoleVal]?.name || newRoleVal}`);
    setTimeout(() => setActionMessage(null), 4000);

    if (userId) {
      try {
        await api.updateUserRole(userId, newRoleVal);
      } catch (err) {
        console.warn('Role update error:', err);
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setCreatingUser(true);
    try {
      await api.signup({
        email: newEmail.trim(),
        full_name: newName.trim(),
        password: newPassword,
        role: newRole
      });
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      setActionMessage(`Created user account for ${newName} (${newRole})`);
      setTimeout(() => setActionMessage(null), 4000);
      loadUsers();
    } catch (err) {
      alert(`User creation error: ${err.message}`);
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              User Provisioning & Account Management
            </h1>
            <span style={{ 
              background: 'rgba(6, 182, 212, 0.15)', 
              color: '#06b6d4', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(6, 182, 212, 0.3)' 
            }}>
              RBAC Directory
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Manage platform accounts, enforce role privileges, and provision credentials on IBM LinuxONE
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Plus size={16} />
            Provision New User
          </button>

          <button
            onClick={loadUsers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              padding: '10px 14px',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Users Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search user name or corporate email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.INVESTIGATOR, ROLES.ANALYST].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    background: selectedRoleFilter === r ? '#06b6d4' : 'var(--bg-app)',
                    color: selectedRoleFilter === r ? '#060b14' : 'var(--text-muted)'
                  }}
                >
                  {r === 'ALL' ? 'All Roles' : (ROLE_DETAILS[r]?.name || r)}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: '13px', color: '#06b6d4', fontWeight: 600 }}>
            {filteredUsers.length} Registered Accounts
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity & Email</th>
                <th>Corporate Role</th>
                <th>Security Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Reassign Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const details = ROLE_DETAILS[u.role] || ROLE_DETAILS[ROLES.CLAIMS_OFFICER];
                return (
                  <tr key={u.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: details.bg,
                          color: details.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          border: `1px solid ${details.color}40`,
                          flexShrink: 0
                        }}>
                          {u.initials || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {u.name || u.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: details.bg,
                        color: details.color,
                        border: `1px solid ${details.color}35`
                      }}>
                        {details.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {details.badge}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.email, e.target.value, u.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {Object.entries(ROLE_DETAILS).map(([rKey, rVal]) => (
                          <option key={rKey} value={rKey} style={{ background: '#0a1122', color: '#ffffff' }}>
                            {rVal.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 11, 20, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Provision Corporate Account
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
              Create a new user with salted PBKDF2 password hashing on IBM LinuxONE
            </p>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Sterling"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rachel@insura.ai"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Role Assignment</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="form-control"
                >
                  <option value={ROLES.CLAIMS_OFFICER}>Claims Officer</option>
                  <option value={ROLES.INVESTIGATOR}>Fraud Investigator</option>
                  <option value={ROLES.ANALYST}>Risk Analyst</option>
                  <option value={ROLES.ADMIN}>Platform Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#06b6d4',
                    border: 'none',
                    color: '#060b14',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {creatingUser ? 'Creating...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
