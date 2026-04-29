// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ROLES } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header/Header';

import LoginPage from './pages/auth/LoginPage/LoginPage';
import RegisterPage from './pages/auth/RegisterPage/RegisterPage';

import ProductsPage from './pages/ProductPages/ProductsPage';

import UsersPage from './pages/UserPages/UsersPage';

import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route path="/products" element={
                <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.SELLER, ROLES.ADMIN]}>
                  <ProductsPage />
                </ProtectedRoute>
              } />

              <Route path="/users" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <UsersPage />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;