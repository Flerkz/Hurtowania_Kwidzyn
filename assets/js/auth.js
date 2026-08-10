// PakoDirect — logowanie i sesja (JWT trzymany w localStorage)
const PakoAuth = (() => {
  const KEY = 'pakodirect_auth';

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  }

  function getUser() {
    const s = getSession();
    return s ? s.user : null;
  }

  function getToken() {
    const s = getSession();
    return s ? s.token : null;
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function isAdmin() {
    const u = getUser();
    return !!u && u.role === 'admin';
  }

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Błąd logowania');
    localStorage.setItem(KEY, JSON.stringify(data));
    renderAuthUI();
    return data.user;
  }

  function logout() {
    localStorage.removeItem(KEY);
    renderAuthUI();
  }

  function authFetch(url, options = {}) {
    const token = getToken();
    const headers = Object.assign({}, options.headers, token ? { Authorization: `Bearer ${token}` } : {});
    return fetch(url, Object.assign({}, options, { headers }));
  }

  function renderAuthUI() {
    const link = document.getElementById('account-link');
    const label = document.getElementById('account-label');
    const logoutLink = document.getElementById('logout-link');
    if (!link || !label) return;
    const user = getUser();
    if (!user) {
      link.href = 'logowanie.html';
      label.textContent = 'Zaloguj się';
      if (logoutLink) logoutLink.style.display = 'none';
      return;
    }
    if (user.role === 'admin') {
      link.href = 'panel.html';
      label.textContent = 'Panel admina';
    } else {
      link.href = 'index.html';
      label.textContent = user.name.split(' ')[0];
    }
    if (logoutLink) logoutLink.style.display = '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderAuthUI();
    document.addEventListener('click', (e) => {
      const el = e.target.closest('#logout-link');
      if (!el) return;
      e.preventDefault();
      logout();
      window.location.href = 'index.html';
    });
  });

  return { getUser, getToken, isLoggedIn, isAdmin, login, logout, authFetch, renderAuthUI };
})();
