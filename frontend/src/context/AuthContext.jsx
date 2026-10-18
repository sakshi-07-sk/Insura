import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  ADMIN: 'admin',
  CLAIMS_OFFICER: 'claims_officer',
  INVESTIGATOR: 'investigator',
  ANALYST: 'analyst',
};

export const ROLE_DETAILS = {
  [ROLES.ADMIN]: {
    name: 'Administrator',
    badge: 'Platform Admin',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    defaultRoute: '/admin/dashboard',
    description: 'System telemetry, user provisioning, model health, and audit governance.',
  },
  [ROLES.CLAIMS_OFFICER]: {
    name: 'Claims Officer',
    badge: 'Claims Intake',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    defaultRoute: '/claims/dashboard',
    description: 'Claim submission, schema validation, real-time risk evaluation, and triage tracking.',
  },
  [ROLES.INVESTIGATOR]: {
    name: 'Fraud Investigator',
    badge: 'SIU Investigator',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    defaultRoute: '/investigator/dashboard',
    description: 'Priority investigation queue, flagged claim review, decisioning, and case notes.',
  },
  [ROLES.ANALYST]: {
    name: 'Risk Analyst',
    badge: 'Model Intelligence',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    defaultRoute: '/analyst/dashboard',
    description: 'Model telemetry, PR/ROC evaluation, confusion matrix, and feature importances.',
  },
};

export const DEMO_ACCOUNTS = [
  {
    email: 'admin@insura.ai',
    name: 'Sarah Chen (Admin)',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    initials: 'SC',
  },
  {
    email: 'officer@insura.ai',
    name: 'Marcus Vance (Officer)',
    role: ROLES.CLAIMS_OFFICER,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    initials: 'MV',
  },
  {
    email: 'investigator@insura.ai',
    name: 'Elena Rostova (SIU)',
    role: ROLES.INVESTIGATOR,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    initials: 'ER',
  },
  {
    email: 'analyst@insura.ai',
    name: 'David Okafor (Analyst)',
    role: ROLES.ANALYST,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    initials: 'DO',
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('insura_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // invalid
      }
    }
    // Default to Claims Officer for interactive demo experience
    return DEMO_ACCOUNTS[1];
  });

  const [token, setToken] = useState(() => localStorage.getItem('insura_auth_token') || 'demo-jwt-token-s390x');

  useEffect(() => {
    if (user) {
      localStorage.setItem('insura_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('insura_auth_user');
    }
  }, [user]);

  const login = (email, password, forcedRole) => {
    const matched = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
    const assignedRole = forcedRole || (matched ? matched.role : ROLES.CLAIMS_OFFICER);
    const loggedUser = {
      email,
      name: matched ? matched.name : email.split('@')[0],
      role: assignedRole,
      avatar: matched ? matched.avatar : null,
      initials: (email[0] || 'U').toUpperCase(),
    };
    setUser(loggedUser);
    setToken(`jwt-${Date.now()}`);
    return loggedUser;
  };

  const signup = (fullName, email, password) => {
    // New public signups default to CLAIMS_OFFICER for security
    const newUser = {
      email,
      name: fullName,
      role: ROLES.CLAIMS_OFFICER,
      initials: fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    };
    setUser(newUser);
    setToken(`jwt-${Date.now()}`);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('insura_auth_user');
    localStorage.removeItem('insura_auth_token');
  };

  const switchRole = (newRole) => {
    if (!Object.values(ROLES).includes(newRole)) return;
    const account = DEMO_ACCOUNTS.find((a) => a.role === newRole);
    if (account) {
      setUser(account);
    } else if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        roleDetails: user ? ROLE_DETAILS[user.role] : null,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
