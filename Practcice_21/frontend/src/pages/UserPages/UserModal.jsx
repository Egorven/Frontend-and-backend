// src/pages/UsersPage/UserModal.jsx
import React, { useState, useEffect } from 'react';
import './UserModal.scss';

export default function UserModal({ open, user, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    role: 'user'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        age: user.age || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  if (!open || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: user.id,
      ...formData,
      age: formData.age ? Number(formData.age) : undefined
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>Редактировать пользователя</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled className="input--readonly" />
            <small className="text--muted">Email нельзя изменить</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Имя</label>
              <input 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Возраст</label>
              <input 
                name="age" 
                type="number" 
                value={formData.age} 
                onChange={handleChange}
                min="1"
                max="150"
              />
            </div>
            <div className="form-group">
              <label>Роль</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">Пользователь</option>
                <option value="seller">Продавец</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}