// backend/src/store/users.store.js

let users = [{id: 1,
      email: "admin@example.com",
      password: "$2b$10$om7mOmKz9HmmgWXucqFSiOi/rjLFCGTajwIVxXAi3i/KyNU.eMfzK",
      first_name: "Admin",
      last_name: "admin",
      age: 25,
      role: "admin",
      isBlocked: false},
      {
    id: 2,
    email: "seller@example.com",
    password: "$2b$10$om7mOmKz9HmmgWXucqFSiOi/rjLFCGTajwIVxXAi3i/KyNU.eMfzK",
    first_name: "Seller",
    last_name: "seller",
    age: 30,
    role: "seller",
    isBlocked: false
  },
  {
    id: 3,
    email: "user@example.com",
    password: "$2b$10$om7mOmKz9HmmgWXucqFSiOi/rjLFCGTajwIVxXAi3i/KyNU.eMfzK",
    first_name: "User",
    last_name: "user",
    age: 30,
    role: "user",
    isBlocked: false
  }
    ];
let nextId = 4;

const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin'
};

const withoutPassword = ({ password, ...user }) => user;

module.exports = {
  ROLES,

  getAll: () => users.map(u => withoutPassword({ ...u })),

  findById: (id) => {
    const user = users.find(u => u.id == id);
    return user ? withoutPassword({ ...user }) : null;
  },

  findByEmail: (email) => {
    const user = users.find(u => u.email === email);
    return user ? { ...user } : null;
  },

  create: (userData) => {
    if (!userData.email || !userData.password) {
      throw new Error('Email и пароль обязательны');
    }
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email уже зарегистрирован');
    }

    const newUser = {
      id: nextId++,
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      age: userData.age || null,
      role: userData.role || ROLES.USER,
      isBlocked: false
    };

    users.push(newUser);
    return withoutPassword({ ...newUser });
  },

  update: (id, updates) => {
    const user = users.find(u => u.id == id);
    if (!user) return null;

    const allowedFields = ['first_name', 'last_name', 'age', 'role', 'isBlocked'];
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = updates[key];
      }
    });

    return withoutPassword({ ...user });
  },

  block: (id) => {
    const user = users.find(u => u.id == id);
    if (!user) return null;
    user.isBlocked = true;
    return withoutPassword({ ...user });
  },

  _clear: () => { 
    users = []; 
    nextId = 1; 
  }
};