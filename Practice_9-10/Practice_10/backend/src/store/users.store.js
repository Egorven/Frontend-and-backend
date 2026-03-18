let users = [];

module.exports = {
  getAll: () => users,
  findById: (id) => users.find(u => u.id === id),
  findByEmail: (email) => users.find(u => u.email === email),
  create: (userData) => {
    users.push(userData);
    return userData;
  },
  // Для очистки (например, в тестах)
  _clear: () => { users = []; }
};