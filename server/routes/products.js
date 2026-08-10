const express = require('express');
const db = require('../db/products');

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
