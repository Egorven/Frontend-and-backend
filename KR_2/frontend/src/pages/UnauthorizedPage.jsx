// src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UnauthorizedPage.scss';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="icon">🚫</div>
        <h1>Доступ запрещён</h1>
        <p className="message">
          У вас недостаточно прав для просмотра этой страницы.
        </p>
        
        {user && (
          <p className="user-info">
            Вы вошли как: <strong>{user.role}</strong>
          </p>
        )}

        <div className="actions">
          <Link to="/products" className="btn btn--primary">
            Вернуться к товарам
          </Link>
          {user && (
            <button className="btn" onClick={() => { logout(); navigate('/login'); }}>
              Выйти из аккаунта
            </button>
          )}
        </div>
      </div>
    </div>
  );
}