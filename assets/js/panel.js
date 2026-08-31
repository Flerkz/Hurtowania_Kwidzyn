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

  const formWrap = document.getElementById('product-form-wrap');
  const form = document.getElementById('product-form');
  const formTitle = document.getElementById('form-title');
  const errorEl = document.getElementById('admin-error');
  const newBtn = document.getElementById('new-product-btn');
  const cancelBtn = document.getElementById('cancel-form-btn');

  const fields = {
    name: document.getElementById('p-name'),
    category: document.getElementById('p-category'),
    image: document.getElementById('p-image'),
    description: document.getElementById('p-description'),
    price: document.getElementById('p-price'),
    stock: document.getElementById('p-stock'),
    badge: document.getElementById('p-badge'),
  };

  const preview = {
    img: document.getElementById('preview-img'),
    cat: document.getElementById('preview-cat'),
    name: document.getElementById('preview-name'),
    desc: document.getElementById('preview-desc'),
    stock: document.getElementById('preview-stock'),
    price: document.getElementById('preview-price'),
    ribbon: document.getElementById('preview-ribbon'),
  };

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
        tbody.innerHTML = '<tr><td colspan="7" class="loading-msg">Nie udało się pobrać produktów.</td></tr>';
      });
  }

  function stockCellClass(stock) {
    if (stock === 0) return 'out';
    if (stock <= 10) return 'low';
    return 'ok';
  }

  function renderTable() {
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-msg">Brak produktów.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map((p) => `
      <tr data-id="${p.id}">
        <td><img src="${p.image}" alt=""></td>
        <td>${escapeHtml(p.name)}</td>
        <td>${CATEGORY_NAMES[p.category] || p.category}</td>
        <td>${p.price.toFixed(2).replace('.', ',')} zł</td>
        <td class="stock-cell ${stockCellClass(p.stock ?? 0)}">${p.stock ?? '—'}</td>
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

  function updatePreview() {
    const name = fields.name.value.trim();
    const category = fields.category.value;
    const image = fields.image.value.trim();
    const description = fields.description.value.trim();
    const price = parseFloat(fields.price.value) || 0;
    const stock = fields.stock.value === '' ? null : parseInt(fields.stock.value, 10);
    const badge = fields.badge.value;

    preview.img.src = image;
    preview.cat.textContent = CATEGORY_NAMES[category] || category;
    preview.name.textContent = name;
    preview.desc.textContent = description || 'Opis pojawi się tutaj…';
    preview.price.textContent = `${price.toFixed(2).replace('.', ',')} zł`;

    if (stock === null || Number.isNaN(stock)) {
      preview.stock.textContent = 'Podaj stan magazynowy';
      preview.stock.className = 'stock-line';
    } else if (stock === 0) {
      preview.stock.textContent = 'Wyprzedane';
      preview.stock.className = 'stock-line out';
    } else if (stock <= 10) {
      preview.stock.textContent = `Zostały ostatnie ${stock} szt.!`;
      preview.stock.className = 'stock-line low';
    } else {
      preview.stock.textContent = `Dostępne — ${stock} szt. w magazynie`;
      preview.stock.className = 'stock-line ok';
    }

    if (badge) {
      preview.ribbon.style.display = '';
      preview.ribbon.className = `ribbon ribbon-${badge}`;
      preview.ribbon.textContent = BADGE_LABELS[badge] || '';
    } else {
      preview.ribbon.style.display = 'none';
    }
  }

  Object.values(fields).forEach((el) => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  function showForm(product) {
    errorEl.style.display = 'none';
    formWrap.style.display = 'block';
    if (product) {
      formTitle.innerHTML = '<span class="step-num">✎</span> Edytuj produkt';
      document.getElementById('product-id').value = product.id;
      fields.name.value = product.name;
      fields.category.value = product.category;
      fields.image.value = product.image;
      fields.description.value = product.description || '';
      fields.price.value = product.price;
      fields.stock.value = product.stock ?? 0;
      fields.badge.value = product.badge || '';
    } else {
      formTitle.innerHTML = '<span class="step-num">+</span> Nowy produkt';
      form.reset();
      document.getElementById('product-id').value = '';
    }
    updatePreview();
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideForm() {
    formWrap.style.display = 'none';
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
      name: fields.name.value,
      category: fields.category.value,
      image: fields.image.value,
      description: fields.description.value,
      price: Number(fields.price.value),
      stock: Number(fields.stock.value),
      badge: fields.badge.value || undefined,
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
