// backend/src/middleware/checkRole.js

/**
 * @param  {...string} allowedRoles 
 * @returns {(req, res, next) => void} 
 */
const checkRole = (...allowedRoles) => {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = checkRole;