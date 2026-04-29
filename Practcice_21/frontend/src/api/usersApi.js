// src/api/usersApi.js
import { api } from './apiClient';

export const usersApi = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  update: async (id, userData) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  block: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  }
};