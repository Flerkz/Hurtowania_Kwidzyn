const express = require('express');
const db = require('../db/products');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Lista produktów
 *     description: Zwraca wszystkie produkty, opcjonalnie przefiltrowane po kategorii.
 *     tags: [Produkty]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Slug kategorii (np. kubki, pudelka, eko, czystosc, cukiernia)
 *     responses:
 *       200:
 *         description: Lista produktów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products', (req, res) => {
  const { category } = req.query;
  res.json(db.getAllProducts({ category }));
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Szczegóły pojedynczego produktu
 *     tags: [Produkty]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produktu
 *     responses:
 *       200:
 *         description: Produkt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produkt nie znaleziony
 */
router.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = db.getProductById(id);
  if (!product) {
    return res.status(404).json({ error: 'Produkt nie znaleziony' });
  }
  res.json(product);
});

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Dodanie nowego produktu (admin)
 *     tags: [Produkty]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, price, image, stock]
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer, description: 'Ile sztuk zostało w magazynie' }
 *               image: { type: string }
 *               badge: { type: string, enum: [new, promo] }
 *     responses:
 *       201: { description: Produkt utworzony }
 *       400: { description: Nieprawidłowe dane }
 *       401: { description: Brak autoryzacji }
 *       403: { description: Wymagane uprawnienia administratora }
 */
router.post('/products', requireAuth, requireAdmin, (req, res) => {
  const { name, category, description, price, stock, image, badge } = req.body || {};
  if (!name || !category || price == null || !image || stock == null) {
    return res.status(400).json({ error: 'Brak wymaganych pól: name, category, price, stock, image' });
  }
  const product = db.addProduct({ name, category, description, price, stock, image, badge });
  res.status(201).json(product);
});

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Edycja produktu (admin)
 *     tags: [Produkty]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               image: { type: string }
 *               badge: { type: string, enum: [new, promo] }
 *     responses:
 *       200: { description: Produkt zaktualizowany }
 *       401: { description: Brak autoryzacji }
 *       403: { description: Wymagane uprawnienia administratora }
 *       404: { description: Produkt nie znaleziony }
 */
router.put('/products/:id', requireAuth, requireAdmin, (req, res) => {
  const updated = db.updateProduct(Number(req.params.id), req.body || {});
  if (!updated) return res.status(404).json({ error: 'Produkt nie znaleziony' });
  res.json(updated);
});

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Usunięcie produktu (admin)
 *     tags: [Produkty]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Produkt usunięty }
 *       401: { description: Brak autoryzacji }
 *       403: { description: Wymagane uprawnienia administratora }
 *       404: { description: Produkt nie znaleziony }
 */
router.delete('/products/:id', requireAuth, requireAdmin, (req, res) => {
  const ok = db.deleteProduct(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Produkt nie znaleziony' });
  res.status(204).send();
});

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Lista kategorii produktów
 *     tags: [Kategorie]
 *     responses:
 *       200:
 *         description: Lista kategorii
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/categories', (req, res) => {
  res.json(db.getCategories());
});

module.exports = router;
