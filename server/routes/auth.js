const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usersDb = require('../db/users');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Logowanie
 *     description: Zwraca token JWT ważny 8h. Konta demo — admin@pakodirect.pl / Admin123! (rola admin), klient@pakodirect.pl / Klient123! (rola customer).
 *     tags: [Autoryzacja]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Zalogowano
 *       401:
 *         description: Nieprawidłowy e-mail lub hasło
 */
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = usersDb.findByEmail(email);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło' });
  }
  const token = jwt.sign(
    { sub: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, user: usersDb.toPublic(user) });
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Dane aktualnie zalogowanego użytkownika
 *     tags: [Autoryzacja]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Użytkownik }
 *       401: { description: Brak autoryzacji }
 */
router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ id: req.user.sub, name: req.user.name, email: req.user.email, role: req.user.role });
});

module.exports = router;
