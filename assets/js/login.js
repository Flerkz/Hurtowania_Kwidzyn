// Logika strony logowania (logowanie.html)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form || typeof PakoAuth === 'undefined') return;
  const errorEl = document.getElementById('login-error');

  if (PakoAuth.isLoggedIn()) {
    redirectAfterLogin(PakoAuth.getUser());
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logowanie…';

    PakoAuth.login(form.email.value, form.password.value)
      .then((user) => redirectAfterLogin(user))
      .catch((err) => {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Zaloguj się';
      });
  });

  function redirectAfterLogin(user) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.location.href = redirect;
    } else if (user.role === 'admin') {
      window.location.href = 'panel.html';
    } else {
      window.location.href = 'index.html';
    }
  }
});
