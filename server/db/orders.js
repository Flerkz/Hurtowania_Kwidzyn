// Warstwa dostępu do danych zamówień.
// Tak jak w db/products.js — dane w pamięci, kształt gotowy pod przyszłą
// tabelę `orders` w bazie danych. Brak integracji z prawdziwym operatorem
// płatności: status zamówienia jest symulowany.

const orders = [];
let nextId = 1;

function createOrder({ items, customer, paymentMethod }) {
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const order = {
    id: nextId++,
    items,
    customer,
    paymentMethod,
    total: Number(total.toFixed(2)),
    status: 'opłacone',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

function getOrderById(id) {
  return orders.find((o) => o.id === id) || null;
}

module.exports = { createOrder, getOrderById };
