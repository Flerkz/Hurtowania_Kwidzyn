// MAXI Hurtownia Kwidzyn — interakcje UI + katalog produktów (strona statyczna, bez serwera)
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initMobileMenu();
  initSideCategories();
  initCategoryTiles();
  initProductsPage();
  markActiveNavLink();
  initLightbox();
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

function markActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentSearch = window.location.search;
  document.querySelectorAll('.main-nav a[href]').forEach((a) => {
    const [hrefPath, hrefQuery] = a.getAttribute('href').split('?');
    const cat = new URLSearchParams(currentSearch).get('cat');
    const active = hrefPath === currentPath
      && (hrefQuery ? new URLSearchParams(hrefQuery).get('cat') === cat : true);
    a.classList.toggle('active', active);
  });
}

function findCategory(slug) {
  return typeof CATEGORIES === 'undefined' ? null : CATEGORIES.find((c) => c.slug === slug);
}

function categoryLabel(p) {
  const cat = findCategory(p.category);
  if (!cat) return p.category;
  const sub = cat.subs.find((s) => s.slug === p.sub);
  return sub ? `${cat.name} › ${sub.name}` : cat.name;
}

// Pionowe menu kategorii po lewej; podkategorie wysuwają się po najechaniu.
function initSideCategories() {
  const list = document.getElementById('side-categories');
  if (!list || typeof CATEGORIES === 'undefined') return;
  list.innerHTML = CATEGORIES.map((c) => `
    <li style="--c:${c.color}">
      <a class="side-cat" href="produkty.html?cat=${c.slug}">${escapeHtml(c.name)}</a>
      <div class="side-flyout">
        <a class="side-flyout-title" href="produkty.html?cat=${c.slug}">${escapeHtml(c.name)} →</a>
        <ul>${c.subs.map((s) => `<li><a href="produkty.html?cat=${c.slug}&sub=${s.slug}">${escapeHtml(s.name)}</a></li>`).join('')}</ul>
      </div>
    </li>
  `).join('') + '<li class="side-all"><a class="side-cat" href="produkty.html">Wszystkie produkty</a></li>';
}

// Kafelki kategorii na stronie głównej (dane z CATEGORIES w products.js).
function initCategoryTiles() {
  const box = document.getElementById('category-tiles');
  if (!box || typeof CATEGORIES === 'undefined') return;
  const shown = 6;
  box.innerHTML = CATEGORIES.map((c) => `
    <a class="cat-tile" href="produkty.html?cat=${c.slug}" style="--c:${c.color}">
      <h3>${escapeHtml(c.name)}</h3>
      <ul>${c.subs.slice(0, shown).map((s) => `<li>${escapeHtml(s.name)}</li>`).join('')}</ul>
      <span class="more">${c.subs.length > shown ? `+${c.subs.length - shown} więcej · ` : ''}Zobacz →</span>
    </a>
  `).join('');
}

function initProductsPage() {
  const grid = document.getElementById('product-grid');
  const filterList = document.getElementById('category-filters');
  if (!grid || !filterList) return;

  const params = new URLSearchParams(window.location.search);
  let activeCategory = findCategory(params.get('cat')) ? params.get('cat') : 'all';
  let activeSub = activeCategory !== 'all' ? (params.get('sub') || '') : '';
  const query = (params.get('q') || '').trim().toLowerCase();
  const searchInput = document.querySelector('.search-form input[name="q"]');
  if (searchInput) searchInput.value = params.get('q') || '';

  function renderGrid(products) {
    if (!products.length) {
      grid.innerHTML = activeCategory !== 'all' && !query
        ? '<p class="loading-msg">Tego asortymentu nie ma jeszcze w katalogu online — znajdziesz go w hurtowni. <a href="kontakt.html">Zapytaj o dostępność</a>.</p>'
        : '<p class="loading-msg">Brak produktów spełniających kryteria.</p>';
      return;
    }
    grid.innerHTML = products.map((p) => `
      <article class="product-card" data-cat="${p.category}">
        <div class="thumb"><img src="${p.image}" alt="${escapeHtml(p.name)}"></div>
        <div class="info">
          <span class="cat-label">${escapeHtml(categoryLabel(p))}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="price-row">
            <span class="price">${p.price == null ? 'Zapytaj o cenę' : `${p.price.toFixed(2).replace('.', ',')} zł`}</span>
          </div>
        </div>
      </article>
    `).join('');
  }

  function applyFilter() {
    renderGrid(PRODUCTS.filter((p) =>
      (activeCategory === 'all' || p.category === activeCategory)
      && (!activeSub || p.sub === activeSub)
      && (!query || p.name.toLowerCase().includes(query))));
  }

  function setActive(cat, sub) {
    activeCategory = cat;
    activeSub = sub;
    renderFilters();
    applyFilter();
    const url = new URL(window.location.href);
    url.searchParams.delete('cat');
    url.searchParams.delete('sub');
    if (cat !== 'all') url.searchParams.set('cat', cat);
    if (sub) url.searchParams.set('sub', sub);
    window.history.replaceState({}, '', url);
    markActiveNavLink();
  }

  // Panel po lewej: kafelek na kategorię, podkategorie rozwijają się pod aktywną.
  function renderFilters() {
    const count = (cat, sub) => PRODUCTS.filter((p) => p.category === cat && (!sub || p.sub === sub)).length;
    const badge = (n) => (n ? ` <span>${n}</span>` : '');
    const link = (cat, sub, label, n, active) =>
      `<a href="produkty.html?cat=${cat}${sub ? `&sub=${sub}` : ''}" data-cat="${cat}" data-sub="${sub}"${active ? ' class="active"' : ''}>${escapeHtml(label)}${badge(n)}</a>`;

    filterList.innerHTML = [
      `<li class="filter-cat"><a href="produkty.html" data-cat="all" data-sub=""${activeCategory === 'all' ? ' class="active"' : ''}>Wszystkie produkty${badge(PRODUCTS.length)}</a></li>`,
      ...CATEGORIES.map((c) => {
        const open = c.slug === activeCategory;
        const subs = open
          ? `<ul class="filter-subs">${c.subs.map((s) =>
              `<li>${link(c.slug, s.slug, s.name, count(c.slug, s.slug), activeSub === s.slug)}</li>`).join('')}</ul>`
          : '';
        return `<li class="filter-cat${open ? ' is-open' : ''}" style="--c:${c.color}">${link(c.slug, '', c.name, count(c.slug), open && !activeSub)}${subs}</li>`;
      }),
    ].join('');

    filterList.querySelectorAll('a[data-cat]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setActive(a.dataset.cat, a.dataset.sub);
      });
    });
  }

  renderFilters();
  applyFilter();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Powiększanie zdjęć po kliknięciu (galeria, katalog, sekcje „o nas”).
function initLightbox() {
  const selector = '.gallery-grid img, .product-card .thumb img, .about-block img';
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = '<button type="button" class="lightbox-close" aria-label="Zamknij">×</button><img alt="">';
  document.body.appendChild(overlay);
  const big = overlay.querySelector('img');

  const close = () => overlay.classList.remove('is-open');
  document.addEventListener('click', (e) => {
    const img = e.target.closest(selector);
    if (!img) return;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    overlay.classList.add('is-open');
  });
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
