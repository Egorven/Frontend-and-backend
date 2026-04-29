// src/pages/UsersPage/UsersPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/usersApi';
import UserModal from './UserModal';
import './UsersPage.scss';

export default function UsersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Проверка: только админ может видеть эту страницу
    if (user?.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Load users error:', err);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    // Нельзя редактировать самого себя
    if (user.id === window.authUserId) {
      alert('Нельзя редактировать свой аккаунт отсюда');
      return;
    }
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleBlock = async (id) => {
    if (id === window.authUserId) {
      alert('Нельзя заблокировать себя');
      return;
    }
    if (!window.confirm('Заблокировать этого пользователя?')) return;
    
    try {
      await usersApi.block(id);
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, isBlocked: true } : u
      ));
    } catch (err) {
      console.error('Block error:', err);
      alert('Ошибка блокировки');
    }
  };

  const handleUpdate = async (userData) => {
    try {
      const updated = await usersApi.update(userData.id, userData);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      closeModal();
    } catch (err) {
      console.error('Update error:', err);
      alert('Ошибка обновления');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Загрузка пользователей...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">🎵 MusicStore</div>
          <div className="header__right">
            <span>Панель администратора</span>
            <button className="btn" onClick={() => navigate('/products')}>
              ← К товарам
            </button>
            <button className="btn btn--danger" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Управление пользователями</h1>
            <span className="count">Всего: {users.length}</span>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Возраст</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.isBlocked ? 'row--blocked' : ''}>
                    <td>{u.email}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>
                      <span className={`badge badge--${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.age || '—'}</td>
                    <td>
                      {u.isBlocked ? (
                        <span className="status status--blocked">🚫 Заблокирован</span>
                      ) : (
                        <span className="status status--active">✅ Активен</span>
                      )}
                    </td>
                    <td className="actions">
                      {!u.isBlocked && u.id !== window.authUserId && (
                        <>
                          <button 
                            className="btn btn--small"
                            onClick={() => openEdit(u)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn--small btn--danger"
                            onClick={() => handleBlock(u.id)}
                          >
                            🚫
                          </button>
                        </>
                      )}
                      {u.isBlocked && (
                        <span className="text--muted">Заблокирован</span>
                      )}
                      {u.id === window.authUserId && (
                        <span className="text--muted">Вы</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <UserModal
        open={modalOpen}
        user={editingUser}
        onClose={closeModal}
        onSubmit={handleUpdate}
      />
    </div>
  );
}