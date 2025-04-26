const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'MONPT';
const skipAuth = process.env.SKIP_AUTH === 'true';

const authMiddleware = (req, res, next) => {
  if (skipAuth) {
    console.log('⚠️ Auth skipped (development mode)');
    req.user = { id: 1, username: 'devuser', role: 'admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};


module.exports = authMiddleware;
