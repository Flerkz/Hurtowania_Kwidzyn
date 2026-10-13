// MAXI Hurtownia Kwidzyn — interakcje UI + katalog produktów (strona statyczna, bez serwera)
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initMobileMenu();
  initProductsPage();
  markActiveNavLink();
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
    if (hrefPath !== currentPath) return;
    if (hrefQuery) {
      if (`?${hrefQuery}` === currentSearch) a.classList.add('active');
    } else if (!currentSearch) {
      a.classList.add('active');
    }
  });
}

const CATEGORY_NAMES = {
  kubki: 'Kubki i naczynia',
  pudelka: 'Pudełka gastronomiczne',
  eko: 'Opakowania ekologiczne',
  czystosc: 'Środki czystości',
  cukiernia: 'Cukiernia',
};

function initProductsPage() {
  const grid = document.getElementById('product-grid');
  const filterList = document.getElementById('category-filters');
  if (!grid || !filterList) return;

  let allProducts = [];
  const params = new URLSearchParams(window.location.search);
  let activeCategory = params.get('cat') || 'all';
  const query = (params.get('q') || '').trim().toLowerCase();
  const searchInput = document.querySelector('.search-form input[name="q"]');
  if (searchInput) searchInput.value = params.get('q') || '';

  function renderGrid(products) {
    if (!products.length) {
      grid.innerHTML = '<p class="loading-msg">Brak produktów spełniających kryteria.</p>';
      return;
    }
    grid.innerHTML = products.map((p) => `
      <article class="product-card" data-cat="${p.category}">
        <div class="thumb"><img src="${p.image}" alt="${escapeHtml(p.name)}"></div>
        <div class="info">
          <span class="cat-label">${CATEGORY_NAMES[p.category] || p.category}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="price-row">
            <span class="price">${p.price == null ? 'Zapytaj o cenę' : `${p.price.toFixed(2).replace('.', ',')} zł`}</span>
          </div>
        </div>
      </article>
    `).join('');
  }

  function applyFilter() {
    const filtered = allProducts.filter((p) =>
      (activeCategory === 'all' || p.category === activeCategory)
      && (!query || p.name.toLowerCase().includes(query)));
    renderGrid(filtered);
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

  allProducts = PRODUCTS;
  renderFilters(allProducts);
  applyFilter();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
