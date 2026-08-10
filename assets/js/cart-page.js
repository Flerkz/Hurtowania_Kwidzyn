// Renderowanie strony koszyka (koszyk.html)
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-container');
  if (!container || typeof PakoCart === 'undefined') return;

  render();
  document.addEventListener('cart:change', render);

  function render() {
    const items = PakoCart.getItems();
    if (!items.length) {
      container.innerHTML = `
        <div class="cart-empty" style="grid-column:1/-1;">
          <p>Twój koszyk jest pusty.</p>
          <a href="produkty.html" class="btn btn-primary">Przejdź do produktów</a>
        </div>
      `;
      return;
    }

    const subtotal = PakoCart.total();
    const shipping = subtotal >= 300 ? 0 : 19.99;
    const total = subtotal + shipping;

    container.innerHTML = `
      <div class="cart-items">
        ${items.map((item) => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <div class="unit-price">${PakoCart.formatPrice(item.price)} / szt.</div>
            </div>
            <div class="qty-stepper">
              <button type="button" data-action="dec" aria-label="Zmniejsz ilość">−</button>
              <span>${item.qty}</span>
              <button type="button" data-action="inc" aria-label="Zwiększ ilość">+</button>
            </div>
            <div class="line-total">${PakoCart.formatPrice(item.price * item.qty)}</div>
            <button type="button" class="remove-btn" data-action="remove" aria-label="Usuń produkt">✕</button>
          </div>
        `).join('')}
      </div>
      <aside class="cart-summary">
        <h3>Podsumowanie</h3>
        <div class="summary-row"><span>Produkty</span><span>${PakoCart.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Dostawa</span><span>${shipping === 0 ? 'Gratis' : PakoCart.formatPrice(shipping)}</span></div>
        <div class="summary-row total"><span>Razem</span><span>${PakoCart.formatPrice(total)}</span></div>
        <a href="platnosc.html" class="btn btn-primary">Przejdź do płatności →</a>
        <a href="produkty.html" class="continue-link">← Kontynuuj zakupy</a>
      </aside>
    `;
  }

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const row = btn.closest('.cart-item');
    if (!row) return;
    const id = Number(row.dataset.id);
    const item = PakoCart.getItems().find((i) => i.id === id);
    if (!item) return;
    if (btn.dataset.action === 'inc') PakoCart.setQty(id, item.qty + 1);
    if (btn.dataset.action === 'dec') {
      if (item.qty <= 1) PakoCart.removeItem(id);
      else PakoCart.setQty(id, item.qty - 1);
    }
    if (btn.dataset.action === 'remove') PakoCart.removeItem(id);
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
