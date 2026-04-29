// src/components/layout/Header/Header.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import RoleGuard from '../RoleGuard';
import './Header.scss';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="header">
      <div className="header__inner container">

        <Link to="/" className="brand">
          🎵 MusicStore
        </Link>

        <nav className="nav">
          <NavLink 
            to="/products" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            📦 Товары
          </NavLink>

          <RoleGuard allowedRoles={[ROLES.SELLER, ROLES.ADMIN]}>
            <NavLink 
              to="/products" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={(e) => {
              }}
            >
              ➕ Добавить
            </NavLink>
          </RoleGuard>

          <RoleGuard allowedRoles={[ROLES.ADMIN]}>
            <NavLink 
              to="/users" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              👥 Пользователи
            </NavLink>
          </RoleGuard>
        </nav>

        <div className="header__right">
          {user ? (
            <>
              <span className="user-info">
                {user.first_name} {user.last_name}
                <small className="user-role">({user.role})</small>
              </span>
              <button className="btn btn--outline" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn--outline">Войти</Link>
              <Link to="/register" className="btn btn--primary">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}