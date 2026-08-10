// Logika panelu admina (panel.html)
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  if (typeof PakoAuth === 'undefined' || !PakoAuth.isLoggedIn()) {
    window.location.href = 'logowanie.html?redirect=panel.html';
    return;
  }
  if (!PakoAuth.isAdmin()) {
    // Zalogowany, ale bez uprawnień admina — nie odsyłamy z powrotem do
    // logowania (to zapętliłoby się z auto-przekierowaniem zalogowanego
    // użytkownika w login.js), tylko na stronę główną.
    window.location.href = 'index.html';
    return;
  }

  const user = PakoAuth.getUser();
  const userInfo = document.getElementById('admin-user-info');
  if (userInfo) userInfo.textContent = `Zalogowano jako ${user.name} (${user.email})`;

  const form = document.getElementById('product-form');
  const formTitle = document.getElementById('form-title');
  const errorEl = document.getElementById('admin-error');
  const newBtn = document.getElementById('new-product-btn');
  const cancelBtn = document.getElementById('cancel-form-btn');

  const CATEGORY_NAMES = {
    kubki: 'Kubki i naczynia',
    pudelka: 'Pudełka gastronomiczne',
    eko: 'Opakowania ekologiczne',
    czystosc: 'Środki czystości',
    cukiernia: 'Cukiernia',
  };
  const BADGE_LABELS = { new: 'Nowość', promo: 'Promocja' };

  let products = [];

  function loadProducts() {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        products = data;
        renderTable();
      })
      .catch(() => {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-msg">Nie udało się pobrać produktów.</td></tr>';
      });
  }

  function renderTable() {
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-msg">Brak produktów.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map((p) => `
      <tr data-id="${p.id}">
        <td><img src="${p.image}" alt=""></td>
        <td>${escapeHtml(p.name)}</td>
        <td>${CATEGORY_NAMES[p.category] || p.category}</td>
        <td>${p.price.toFixed(2).replace('.', ',')} zł</td>
        <td>${p.badge ? BADGE_LABELS[p.badge] : '—'}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-action="edit" aria-label="Edytuj">✎</button>
            <button type="button" class="del" data-action="delete" aria-label="Usuń">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function showForm(product) {
    errorEl.style.display = 'none';
    form.style.display = 'block';
    if (product) {
      formTitle.innerHTML = '<span class="step-num">✎</span> Edytuj produkt';
      document.getElementById('product-id').value = product.id;
      document.getElementById('p-name').value = product.name;
      document.getElementById('p-category').value = product.category;
      document.getElementById('p-price').value = product.price;
      document.getElementById('p-badge').value = product.badge || '';
      document.getElementById('p-image').value = product.image;
    } else {
      formTitle.innerHTML = '<span class="step-num">+</span> Nowy produkt';
      form.reset();
      document.getElementById('product-id').value = '';
    }
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideForm() {
    form.style.display = 'none';
    form.reset();
  }

  newBtn.addEventListener('click', () => showForm(null));
  cancelBtn.addEventListener('click', hideForm);

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.closest('tr').dataset.id);
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (btn.dataset.action === 'edit') {
      showForm(product);
    }
    if (btn.dataset.action === 'delete') {
      if (!window.confirm(`Usunąć produkt „${product.name}”?`)) return;
      PakoAuth.authFetch(`/api/products/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (res.status === 401 || res.status === 403) return handleAuthError();
          if (!res.ok && res.status !== 204) throw new Error();
          loadProducts();
        })
        .catch(() => {
          errorEl.textContent = 'Nie udało się usunąć produktu.';
          errorEl.style.display = 'block';
        });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const id = document.getElementById('product-id').value;
    const payload = {
      name: document.getElementById('p-name').value,
      category: document.getElementById('p-category').value,
      price: Number(document.getElementById('p-price').value),
      image: document.getElementById('p-image').value,
      badge: document.getElementById('p-badge').value || undefined,
    };
    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

    PakoAuth.authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) return handleAuthError();
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || 'Błąd zapisu'); });
        return res.json();
      })
      .then((result) => {
        if (!result) return;
        hideForm();
        loadProducts();
      })
      .catch((err) => {
        errorEl.textContent = err.message || 'Nie udało się zapisać produktu.';
        errorEl.style.display = 'block';
      });
  });

  function handleAuthError() {
    PakoAuth.logout();
    window.location.href = 'logowanie.html?redirect=panel.html';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  loadProducts();
});
