const express = require('express');
const db = require('../db/orders');

const router = express.Router();

const VALID_METHODS = ['karta', 'blik', 'przelewy24', 'pobranie'];

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Złożenie zamówienia (symulacja płatności)
 *     description: Zapisuje zamówienie i symuluje potwierdzenie płatności. Nie łączy się z żadnym prawdziwym operatorem płatności — do podłączenia w przyszłości.
 *     tags: [Zamówienia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     price: { type: number }
 *                     qty: { type: integer }
 *               customer:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   email: { type: string }
 *                   phone: { type: string }
 *                   address: { type: string }
 *                   company: { type: string }
 *               paymentMethod:
 *                 type: string
 *                 enum: [karta, blik, przelewy24, pobranie]
 *     responses:
 *       201:
 *         description: Zamówienie utworzone
 *       400:
 *         description: Nieprawidłowe dane zamówienia
 */
router.post('/orders', (req, res) => {
  const { items, customer, paymentMethod } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Zamówienie musi zawierać co najmniej jeden produkt' });
  }
  if (!VALID_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Nieprawidłowa metoda płatności' });
  }
  const order = db.createOrder({ items, customer: customer || {}, paymentMethod });
  res.status(201).json(order);
});

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Szczegóły zamówienia
 *     tags: [Zamówienia]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Zamówienie }
 *       404: { description: Zamówienie nie znalezione }
 */
router.get('/orders/:id', (req, res) => {
  const order = db.getOrderById(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Zamówienie nie znalezione' });
  res.json(order);
});

module.exports = router;
