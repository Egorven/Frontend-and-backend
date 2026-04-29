// backend/src/routes/users.js
const express = require('express');
const usersStore = require('../store/users.store');
const { authMiddleware } = require('../middleware/authJwt');
const checkRole = require('../middleware/checkRole');
const { cacheMiddleware, saveToCache, invalidateUsersCache } = require('../middleware/cache')
const router = express.Router();

router.use(authMiddleware);
router.use(checkRole('admin'));

const USERS_CACHE_TTL = 60;

router.get('/', 
  cacheMiddleware(() => "users:all", USERS_CACHE_TTL),
  async (req, res) => {
    const data = usersStore.getAll();
    res.json(data);
    if (req.cacheKey) {
      await saveToCache(req.cacheKey, data, req.cacheTTL);
    }
  }
);

router.get('/:id',
  cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL),
  async (req, res) => {
    const user = usersStore.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
    if (req.cacheKey) {
      await saveToCache(req.cacheKey, user, req.cacheTTL);
    }
  }
);

router.put('/:id', async (req, res) => {
  const updated = usersStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Пользователь не найден' });
  await invalidateUsersCache(req.params.id);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  if (req.params.id == req.user.id) {
    return res.status(400).json({ error: 'Нельзя заблокировать себя' });
  }
  const blocked = usersStore.block(req.params.id);
  if (!blocked) return res.status(404).json({ error: 'Пользователь не найден' });
  await invalidateUsersCache(req.params.id);
  res.json({ message: 'Пользователь заблокирован', user: blocked });
});

module.exports = router;