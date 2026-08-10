const jwt = require('jsonwebtoken');

// Placeholder wyłącznie na potrzeby dev/demo — w realnym środowisku
// JWT_SECRET musi pochodzić ze zmiennej środowiskowej / sekretu.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Wymagane uprawnienia administratora' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
