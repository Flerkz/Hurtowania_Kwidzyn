// Renderowanie strony płatności (platnosc.html)
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('checkout-container');
  if (!container || typeof PakoCart === 'undefined') return;

  renderCheckout();

  function renderCheckout() {
    const items = PakoCart.getItems();
    if (!items.length) {
      container.innerHTML = `
        <div class="cart-empty" style="grid-column:1/-1;">
          <p>Twój koszyk jest pusty — dodaj produkty, aby przejść do płatności.</p>
          <a href="produkty.html" class="btn btn-primary">Przejdź do produktów</a>
        </div>
      `;
      return;
    }

    const subtotal = PakoCart.total();
    const shipping = subtotal >= 300 ? 0 : 19.99;
    const total = subtotal + shipping;

    container.innerHTML = `
      <div>
        <form id="checkout-form" novalidate>
          <div class="checkout-section">
            <h3><span class="step-num">1</span> Dane do wysyłki</h3>
            <div class="form-row">
              <div class="form-group"><label for="co-name">Imię i nazwisko</label><input id="co-name" name="name" type="text" required></div>
              <div class="form-group"><label for="co-company">Nazwa firmy (opcjonalnie)</label><input id="co-company" name="company" type="text"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label for="co-email">E-mail</label><input id="co-email" name="email" type="email" required></div>
              <div class="form-group"><label for="co-phone">Telefon</label><input id="co-phone" name="phone" type="tel" required></div>
            </div>
            <div class="form-group full">
              <label for="co-address">Adres dostawy</label>
              <input id="co-address" name="address" type="text" placeholder="Ulica, numer, kod pocztowy, miasto" required>
            </div>
          </div>

          <div class="checkout-section">
            <h3><span class="step-num">2</span> Metoda płatności</h3>
            <div class="payment-methods">
              <label class="payment-method">
                <input type="radio" name="paymentMethod" value="karta" checked>
                <span class="ic">💳</span><span class="label">Karta płatnicza</span>
              </label>
              <label class="payment-method">
                <input type="radio" name="paymentMethod" value="blik">
                <span class="ic">📱</span><span class="label">BLIK</span>
              </label>
              <label class="payment-method">
                <input type="radio" name="paymentMethod" value="przelewy24">
                <span class="ic">🏦</span><span class="label">Przelewy24</span>
              </label>
              <label class="payment-method">
                <input type="radio" name="paymentMethod" value="pobranie">
                <span class="ic">💵</span><span class="label">Za pobraniem</span>
              </label>
            </div>
            <div class="card-fields is-visible" id="card-fields">
              <div class="form-group"><label for="co-card-number">Numer karty</label><input id="co-card-number" type="text" placeholder="4242 4242 4242 4242" inputmode="numeric" maxlength="19"></div>
              <div class="form-group"><label for="co-card-name">Imię i nazwisko na karcie</label><input id="co-card-name" type="text"></div>
              <div class="form-group"><label for="co-card-expiry">Data ważności</label><input id="co-card-expiry" type="text" placeholder="MM/RR" maxlength="5"></div>
              <div class="form-group"><label for="co-card-cvc">CVC</label><input id="co-card-cvc" type="text" placeholder="123" maxlength="3" inputmode="numeric"></div>
            </div>
            <p style="color:var(--gray);font-size:12.5px;margin-top:14px;margin-bottom:0;">Środowisko demonstracyjne — żadne dane płatności nie są nigdzie wysyłane ani przetwarzane naprawdę.</p>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;" id="checkout-submit">Złóż zamówienie — ${PakoCart.formatPrice(total)}</button>
          <p id="checkout-error" style="display:none;color:#c85a3a;font-size:13px;margin-top:12px;text-align:center;"></p>
        </form>
      </div>

      <aside class="order-summary">
        <h3>Twoje zamówienie</h3>
        ${items.map((i) => `<div class="mini-item"><span>${escapeHtml(i.name)} × ${i.qty}</span><span>${PakoCart.formatPrice(i.price * i.qty)}</span></div>`).join('')}
        <div class="summary-row" style="margin-top:14px;"><span>Produkty</span><span>${PakoCart.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Dostawa</span><span>${shipping === 0 ? 'Gratis' : PakoCart.formatPrice(shipping)}</span></div>
        <div class="summary-row total"><span>Razem</span><span>${PakoCart.formatPrice(total)}</span></div>
      </aside>
    `;

    wireForm(items, total);
  }

  function wireForm(items, total) {
    const form = document.getElementById('checkout-form');
    const cardFields = document.getElementById('card-fields');
    const errorEl = document.getElementById('checkout-error');

    form.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        form.querySelectorAll('.payment-method').forEach((el) => el.classList.remove('is-selected'));
        radio.closest('.payment-method').classList.add('is-selected');
        cardFields.classList.toggle('is-visible', radio.value === 'karta');
      });
    });
    form.querySelector('input[name="paymentMethod"]:checked').closest('.payment-method').classList.add('is-selected');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errorEl.style.display = 'none';
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const submitBtn = document.getElementById('checkout-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Przetwarzanie…';

      const payload = {
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        customer: {
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          address: form.address.value,
          company: form.company.value,
        },
        paymentMethod: form.paymentMethod.value,
      };

      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Błąd zamówienia');
          return res.json();
        })
        .then((order) => {
          PakoCart.clear();
          showSuccess(order);
        })
        .catch(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = `Złóż zamówienie — ${PakoCart.formatPrice(total)}`;
          errorEl.textContent = 'Nie udało się złożyć zamówienia. Upewnij się, że serwer działa (npm start w folderze server/) i spróbuj ponownie.';
          errorEl.style.display = 'block';
        });
    });
  }

  function showSuccess(order) {
    container.innerHTML = `
      <div class="checkout-success" style="grid-column:1/-1;">
        <div class="icon">✓</div>
        <h2>Dziękujemy za zamówienie!</h2>
        <p>Numer zamówienia <strong>#${order.id}</strong> został przyjęty i opłacony (symulacja płatności). Potwierdzenie wysłalibyśmy na podany adres e-mail.</p>
        <a href="produkty.html" class="btn btn-primary">Wróć do zakupów</a>
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
