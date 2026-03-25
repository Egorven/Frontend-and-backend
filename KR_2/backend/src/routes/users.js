// backend/src/routes/users.js
const express = require('express');
const usersStore = require('../store/users.store');
const { authMiddleware } = require('../middleware/authJwt');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole('admin'));

router.get('/', (req, res) => {
  res.json(usersStore.getAll());
});

router.get('/:id', (req, res) => {
  const user = usersStore.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

router.put('/:id', (req, res) => {
  const updated = usersStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  if (req.params.id == req.user.id) {
    return res.status(400).json({ error: 'Нельзя заблокировать себя' });
  }
  const blocked = usersStore.block(req.params.id);
  if (!blocked) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ message: 'Пользователь заблокирован', user: blocked });
});

module.exports = router;