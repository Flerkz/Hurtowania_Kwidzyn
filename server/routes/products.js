const express = require('express');
const db = require('../db/products');

const router = express.Router();

// GET /api/products?category=kubki
router.get('/products', (req, res) => {
  const { category } = req.query;
  res.json(db.getAllProducts({ category }));
});

// GET /api/products/:id
router.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = db.getProductById(id);
  if (!product) {
    return res.status(404).json({ error: 'Produkt nie znaleziony' });
  }
  res.json(product);
});

// GET /api/categories
router.get('/categories', (req, res) => {
  res.json(db.getCategories());
});

module.exports = router;
