// Warstwa dostępu do danych użytkowników.
// Jak w db/products.js — dane w pamięci, kształt gotowy pod przyszłą tabelę
// `users` w bazie danych. Hasła seedowane tylko na potrzeby demo — w
// produkcji hasła i sekrety trafiają wyłącznie przez zmienne środowiskowe.

const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    name: 'Admin PakoDirect',
    email: 'admin@pakodirect.pl',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    role: 'admin',
  },
  {
    id: 2,
    name: 'Anna Testowa',
    email: 'klient@pakodirect.pl',
    passwordHash: bcrypt.hashSync('Klient123!', 10),
    role: 'customer',
  },
];

function findByEmail(email) {
  if (!email) return null;
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

function toPublic(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

module.exports = { findByEmail, toPublic };
