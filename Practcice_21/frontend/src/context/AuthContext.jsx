// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin'
};

export const hasRole = (userRole, allowedRoles) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🔍 Читаем токен из localStorage
        const token = localStorage.getItem('accessToken');
        console.log('🔍 checkAuth - Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
        
        if (!token) {
          console.log('⚠️ No token, setting loading = false');
          setLoading(false);
          return;
        }

        // ✅ Проверяем токен на бэкенде
        const response = await authApi.me();
        console.log('✅ User data loaded:', response.data);
        
        setUser(response.data);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        // ❌ Токен невалидный — очищаем
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        // ✅ Всегда завершаем загрузку
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // ← Пустой массив зависимостей = только при монтировании

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
      // 🔍 Логирование ответа
      console.log('📥 Login response:', response);
      
      // ✅ Получаем токены (поддержка разных форматов ответа)
      const accessToken = response.data?.accessToken || response.accessToken;
      const refreshToken = response.data?.refreshToken || response.refreshToken;
      
      if (!accessToken) {
        throw new Error('No accessToken in response');
      }

      // ✅ Сохраняем как СТРОКИ (не объекты!)
      localStorage.setItem('accessToken', String(accessToken));
      localStorage.setItem('refreshToken', String(refreshToken));
      
      console.log('✅ Tokens saved to localStorage');

      // ✅ Получаем данные пользователя
      const userData = await authApi.me();
      setUser(userData.data || userData);
      
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    return await authApi.register(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Хелперы для проверки прав
  const isSeller = () => hasRole(user?.role, [ROLES.SELLER, ROLES.ADMIN]);
  const isAdmin = () => hasRole(user?.role, [ROLES.ADMIN]);
  const checkRole = (roles) => hasRole(user?.role, Array.isArray(roles) ? roles : [roles]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isSeller,
      isAdmin,
      checkRole,
      ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
};