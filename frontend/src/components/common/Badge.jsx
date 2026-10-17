import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Clock, Search, CheckCircle, Flag } from 'lucide-react';

/**
 * Risk Category Badge (LOW, MEDIUM, HIGH)
 * Strictly does not rely on color alone - displays clear text label and distinct icon.
 */
export function RiskBadge({ category, size = 'md' }) {
  const cat = (category || 'UNKNOWN').toUpperCase();

  let config = {
    className: 'badge-low',
    icon: ShieldCheck,
    label: 'Low Risk'
  };

  if (cat === 'HIGH') {
    config = {
      className: 'badge-high',
      icon: AlertOctagon,
      label: 'High Risk'
    };
  } else if (cat === 'MEDIUM') {
    config = {
      className: 'badge-medium',
      icon: AlertTriangle,
      label: 'Medium Risk'
    };
  }

  const IconComponent = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`badge ${config.className}`} title={`Triage Tier: ${cat}`}>
      <IconComponent size={iconSize} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Review Status Badge (PENDING_REVIEW, UNDER_REVIEW, CLEARED, ESCALATED)
 */
export function StatusBadge({ status, size = 'md' }) {
  const st = (status || 'PENDING_REVIEW').toUpperCase();

  let config = {
    className: 'badge-pending',
    icon: Clock,
    label: 'Pending Review'
  };

  if (st === 'UNDER_REVIEW') {
    config = {
      className: 'badge-under-review',
      icon: Search,
      label: 'Under Review'
    };
  } else if (st === 'CLEARED') {
    config = {
      className: 'badge-cleared',
      icon: CheckCircle,
      label: 'Cleared / Fast-Track'
    };
  } else if (st === 'ESCALATED') {
    config = {
      className: 'badge-escalated',
      icon: Flag,
      label: 'Escalated to SIU'
    };
  }

  const IconComponent = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`badge ${config.className}`} title={`Review Status: ${st}`}>
      <IconComponent size={iconSize} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
