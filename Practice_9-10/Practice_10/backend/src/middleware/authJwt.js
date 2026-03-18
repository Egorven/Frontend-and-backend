const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = payload; // { sub, email, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES_IN }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN }
  );

module.exports = {
  authMiddleware,
  generateAccessToken,
  generateRefreshToken,
};