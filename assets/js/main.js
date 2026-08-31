// PakoDirect — interakcje UI + pobieranie produktów z API
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initMobileMenu();
  initDemoForms();
  initProductsPage();
  markActiveNavLink();
  initScrollReveal();
  initBackToTop();
  initCounters();
});

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length < 2) return;
  let current = 0;
  const show = (i) => {
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
    current = i;
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  setInterval(() => show((current + 1) % slides.length), 5000);
}

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const catNav = document.querySelector('.category-nav');
  if (!toggle || !catNav) return;
  toggle.addEventListener('click', () => catNav.classList.toggle('is-open'));
}

function initDemoForms() {
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = 'Dziękujemy!';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = original; btn.disabled = false; form.reset(); }, 2500);
    });
  });
}

function markActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentSearch = window.location.search;
  document.querySelectorAll('.main-nav a[href]').forEach((a) => {
    const [hrefPath, hrefQuery] = a.getAttribute('href').split('?');
    if (hrefPath !== currentPath) return;
    if (hrefQuery) {
      if (`?${hrefQuery}` === currentSearch) a.classList.add('active');
    } else if (!currentSearch) {
      a.classList.add('active');
    }
  });
}

// Płynne pojawianie się sekcji przy przewijaniu
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((t) => observer.observe(t));
}

// Przycisk "do góry"
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Przewiń do góry');
  btn.textContent = '↑';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });
}

// Licznik "12k+ zamówień" animowany od 0 przy wejściu w widok
function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.countSuffix || '';
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => observer.observe(c));
}

// Toast potwierdzający dodanie do koszyka
function showCartToast(message) {
  let toast = document.querySelector('.cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span><span>${message}</span>`;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

const CATEGORY_NAMES = {
  kubki: 'Kubki i naczynia',
  pudelka: 'Pudełka gastronomiczne',
  eko: 'Opakowania ekologiczne',
  czystosc: 'Środki czystości',
  cukiernia: 'Cukiernia',
};

const BADGE_LABELS = { new: 'Nowość', promo: 'Promocja' };

function initProductsPage() {
  const grid = document.getElementById('product-grid');
  const filterList = document.getElementById('category-filters');
  const searchBar = document.getElementById('search-results-bar');
  if (!grid || !filterList) return;

  let allProducts = [];
  let activeCategory = new URLSearchParams(window.location.search).get('cat') || 'all';
  let searchQuery = new URLSearchParams(window.location.search).get('q') || '';
  let hashHandled = false;

  function renderGrid(products) {
    if (!products.length) {
      grid.innerHTML = `<p class="loading-msg">${searchQuery ? 'Brak produktów pasujących do wyszukiwania.' : 'Brak produktów w tej kategorii.'}</p>`;
      return;
    }
    grid.innerHTML = products.map((p) => `
      <article class="product-card reveal" id="product-${p.id}" data-cat="${p.category}">
        ${p.badge ? `<span class="ribbon ribbon-${p.badge}">${BADGE_LABELS[p.badge] || ''}</span>` : ''}
        <div class="thumb"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
        <div class="info">
          <span class="cat-label">${CATEGORY_NAMES[p.category] || p.category}</span>
          <h3>${escapeHtml(p.name)}</h3>
          ${p.description ? `<p class="product-desc">${escapeHtml(p.description)}</p>` : ''}
          ${stockLine(p.stock)}
          <div class="price-row">
            <span class="price">${p.price.toFixed(2).replace('.', ',')} zł</span>
            <button class="add-btn" data-id="${p.id}" aria-label="Dodaj do koszyka" ${p.stock === 0 ? 'disabled' : ''}>+</button>
          </div>
        </div>
      </article>
    `).join('');
    initScrollReveal();
  }

  function renderSearchBarUI(resultCount) {
    if (!searchBar) return;
    if (!searchQuery) {
      searchBar.innerHTML = '';
      searchBar.style.display = 'none';
      return;
    }
    searchBar.style.display = '';
    searchBar.innerHTML = `
      <span>Wyniki wyszukiwania dla „<strong>${escapeHtml(searchQuery)}</strong>” — ${resultCount} ${resultCount === 1 ? 'produkt' : 'produktów'}</span>
      <a href="#" id="clear-search">Wyczyść wyszukiwanie ✕</a>
    `;
    const clearLink = document.getElementById('clear-search');
    if (clearLink) {
      clearLink.addEventListener('click', (e) => {
        e.preventDefault();
        searchQuery = '';
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
        applyFilter();
      });
    }
  }

  function applyFilter() {
    let filtered = activeCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      filtered = filtered
        .map((p) => ({ p, score: relevanceScore(p, needle) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.p);
    }

    renderGrid(filtered);
    renderSearchBarUI(filtered.length);
    handleHashHighlight();
  }

  function handleHashHighlight() {
    if (hashHandled) return;
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#product-')) return;
    const el = document.querySelector(hash);
    if (!el) return;
    hashHandled = true;
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('is-highlighted');
      setTimeout(() => el.classList.remove('is-highlighted'), 1800);
    }, 150);
  }

  function setActiveCategory(slug) {
    activeCategory = slug;
    filterList.querySelectorAll('a[data-filter]').forEach((a) => {
      a.classList.toggle('active', a.dataset.filter === slug);
    });
    applyFilter();
    const url = new URL(window.location.href);
    if (slug === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', slug);
    window.history.replaceState({}, '', url);
  }

  function renderFilters(products) {
    const counts = {};
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const availableSlugs = Object.keys(CATEGORY_NAMES).filter((slug) => counts[slug]);

    const items = [
      `<li><a href="#" data-filter="all">Wszystkie produkty <span>${products.length}</span></a></li>`,
      ...availableSlugs.map((slug) =>
        `<li><a href="#" data-filter="${slug}">${CATEGORY_NAMES[slug]} <span>${counts[slug]}</span></a></li>`
      ),
    ];
    filterList.innerHTML = items.join('');
    filterList.querySelectorAll('a[data-filter]').forEach((link) => {
      link.classList.toggle('active', link.dataset.filter === activeCategory);
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveCategory(link.dataset.filter);
      });
    });
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-btn');
    if (!btn || btn.disabled) return;
    const product = allProducts.find((p) => p.id === Number(btn.dataset.id));
    if (!product || typeof PakoCart === 'undefined') return;
    PakoCart.addItem(product, 1);
    showCartToast('Dodano do koszyka');
    btn.classList.add('is-added');
    setTimeout(() => btn.classList.remove('is-added'), 300);
  });

  grid.innerHTML = '<p class="loading-msg">Ładowanie produktów…</p>';

  fetch('/api/products')
    .then((res) => {
      if (!res.ok) throw new Error('Błąd serwera');
      return res.json();
    })
    .then((products) => {
      allProducts = products;
      renderFilters(products);
      applyFilter();
    })
    .catch(() => {
      grid.innerHTML = '<p class="loading-msg">Nie udało się połączyć z serwerem produktów. Uruchom go poleceniem <code>npm start</code> w folderze <code>server/</code>.</p>';
      filterList.innerHTML = '<li><a href="#" class="active">Wszystkie produkty</a></li>';
    });
}

// Ranking trafności identyczny z tym po stronie API (server/db/products.js)
// — używany tu, by przełączanie kategorii nie wymagało ponownego zapytania.
function relevanceScore(product, needle) {
  const name = product.name.toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const catName = (CATEGORY_NAMES[product.category] || '').toLowerCase();

  let score = 0;
  if (name === needle) score += 100;
  else if (name.startsWith(needle)) score += 60;
  else if (name.includes(needle)) score += 40;

  if (desc.includes(needle)) score += 15;
  if (catName.includes(needle)) score += 10;

  const words = needle.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => name.includes(w))) score += 20;

  return score;
}

function stockLine(stock) {
  if (stock == null) return '';
  if (stock === 0) return '<p class="stock-line out">Wyprzedane</p>';
  if (stock <= 10) return `<p class="stock-line low">Zostały ostatnie ${stock} szt.!</p>`;
  return `<p class="stock-line ok">Dostępne — ${stock} szt. w magazynie</p>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
