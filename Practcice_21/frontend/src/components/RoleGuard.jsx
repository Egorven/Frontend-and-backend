// src/components/RoleGuard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Компонент для условного рендеринга по ролям
 * @param {React.ReactNode} children
 * @param {string[]} allowedRoles
 * @param {React.ReactNode} fallback 
 */
export default function RoleGuard({ children, allowedRoles, fallback = null }) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }
  
  return children;
}

export function useRoleGuard(allowedRoles) {
  const { user } = useAuth();
  return {
    hasAccess: user && allowedRoles.includes(user.role),
    user
  };
}