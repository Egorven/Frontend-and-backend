const jwt = require('jsonwebtoken');
const usersStore = require('../store/users.store');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {

    const payload = jwt.verify(token, process.env.ACCESS_SECRET);

    const user = usersStore.findById(payload.userId);

    if (!user || user.isBlocked) {
      return res.status(401).json({ error: 'Invalid or expired token' });
      
    }
    
    const { password, ...userPublic } = user;
    req.user = userPublic;
    
    next();
  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const generateAccessToken = (user) =>
  jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role
    },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES_IN || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role
    },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' }
  );

module.exports = {
  authMiddleware,
  generateAccessToken,
  generateRefreshToken,
};

