// PakoDirect — koszyk oparty o localStorage, wspólny dla wszystkich stron
const PakoCart = (() => {
  const KEY = 'pakodirect_cart';

  function getItems() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    renderBadges();
    document.dispatchEvent(new CustomEvent('cart:change', { detail: { items } }));
  }

  function addItem(product, qty = 1) {
    const items = getItems();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
    }
    save(items);
  }

  function removeItem(id) {
    save(getItems().filter((i) => i.id !== id));
  }

  function setQty(id, qty) {
    const items = getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    save(items);
  }

  function clear() {
    save([]);
  }

  function count() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  function total() {
    return getItems().reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function renderBadges() {
    const n = count();
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = n;
    });
  }

  function formatPrice(value) {
    return `${value.toFixed(2).replace('.', ',')} zł`;
  }

  document.addEventListener('DOMContentLoaded', renderBadges);

  return { getItems, addItem, removeItem, setQty, clear, count, total, renderBadges, formatPrice };
})();
