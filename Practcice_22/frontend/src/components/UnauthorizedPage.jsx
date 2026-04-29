// src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <h1>🚫 Доступ запрещён</h1>
        <p>У вас недостаточно прав для просмотра этой страницы</p>
        <Link to="/products" className="btn btn--primary">Вернуться к товарам</Link>
      </div>
    </div>
  );
}