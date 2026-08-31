// PakoDirect — podpowiedzi wyszukiwania na żywo (zdjęcie + opis + trafność)
// Działa na pasku wyszukiwania w nagłówku każdej strony.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.search-form').forEach(initSearchForm);
});

function initSearchForm(form) {
  const input = form.querySelector('input[type="text"]');
  if (!input) return;

  form.classList.add('has-suggest');
  const dropdown = document.createElement('div');
  dropdown.className = 'search-suggest';
  form.appendChild(dropdown);

  let debounceTimer;
  let requestId = 0;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(debounceTimer);
    if (q.length < 2) {
      closeDropdown();
      return;
    }
    debounceTimer = setTimeout(() => runSearch(q), 250);
  });

  input.addEventListener('focus', () => {
    if (dropdown.innerHTML && input.value.trim().length >= 2) dropdown.classList.add('is-open');
  });

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) closeDropdown();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    closeDropdown();
    if (q) window.location.href = `produkty.html?q=${encodeURIComponent(q)}`;
  });

  function runSearch(q) {
    const myRequestId = ++requestId;
    fetch(`/api/products?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((products) => {
        if (myRequestId !== requestId) return; // odpowiedź na nieaktualne zapytanie
        renderDropdown(products.slice(0, 6), q);
      })
      .catch(() => closeDropdown());
  }

  function renderDropdown(products, q) {
    if (!products.length) {
      dropdown.innerHTML = `<div class="search-empty">Brak wyników dla „${escapeHtml(q)}”</div>`;
      dropdown.classList.add('is-open');
      return;
    }
    const items = products.map((p) => {
      const desc = p.description ? escapeHtml(p.description.slice(0, 70)) + (p.description.length > 70 ? '…' : '') : '';
      return `
        <a class="search-item" href="produkty.html?q=${encodeURIComponent(q)}#product-${p.id}">
          <img src="${p.image}" alt="" loading="lazy">
          <div class="search-item-info">
            <strong>${escapeHtml(p.name)}</strong>
            ${desc ? `<p>${desc}</p>` : ''}
            <span class="search-item-price">${p.price.toFixed(2).replace('.', ',')} zł</span>
          </div>
        </a>
      `;
    }).join('');
    dropdown.innerHTML = `${items}<a class="search-view-all" href="produkty.html?q=${encodeURIComponent(q)}">Zobacz wszystkie wyniki →</a>`;
    dropdown.classList.add('is-open');
  }

  function closeDropdown() {
    dropdown.classList.remove('is-open');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
