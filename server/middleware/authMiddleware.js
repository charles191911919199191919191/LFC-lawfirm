const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function authorizeRoles(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    next();
  };
}

async function enrichUser(req, res, next) {
  if (!req.user) {
    return next();
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { lawyer: true }
  });
  req.currentUser = user;
  next();
}

module.exports = { authenticateToken, authorizeRoles, enrichUser };
