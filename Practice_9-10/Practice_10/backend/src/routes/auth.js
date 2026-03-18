const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const { authMiddleware, generateAccessToken, generateRefreshToken } = require('../middleware/authJwt');
const usersStore = require('../store/users.store');

const router = express.Router();
const refreshTokens = new Set(); // В продакшене → БД/Redis

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, age, first_name, last_name]
 *             properties:
 *               email: { type: string, format: email, example: ivan@example.com }
 *               password: { type: string, format: password, example: qwerty123 }
 *               first_name: { type: string, example: Ivan }
 *               last_name: { type: string, example: Ivanovic }
 *               age: { type: integer, minimum: 1, example: 20 }
 *     responses:
 *       201:
 *         description: Пользователь создан
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, age } = req.body;
    
    if (!email || !password || !first_name || !last_name || age === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (usersStore.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = usersStore.create({
      id: nanoid(6),
      email,
      first_name,
      last_name,
      age: Number(age),
      passwordHash
    });

    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Авторизация
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 refreshToken: { type: string }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = usersStore.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    refreshTokens.delete(refreshToken);

    const user = usersStore.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Получить текущий профиль
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 */
router.get('/me', authMiddleware, (req, res) => {
  const user = usersStore.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;