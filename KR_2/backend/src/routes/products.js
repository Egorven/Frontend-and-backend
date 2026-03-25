const express = require('express');
const { authMiddleware } = require('../middleware/authJwt');
const checkRole = require('../middleware/checkRole');
const productsStore = require('../store/products.store');
const categoriesStore = require('../store/categories.store');

const router = express.Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *         description: Фильтр по категории
 *     responses:
 *       200:
 *         description: Список товаров
 */
router.get('/', authMiddleware, checkRole('user', 'seller', 'admin'), (req, res) => {
  const { categoryId } = req.query;
  res.json(productsStore.getAll(categoryId));
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, categoryId]
 *             properties:
 *               name: { type: string }
 *               categoryId: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               rating: { type: number }
 *               image: { type: string }
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Категория не найдена
 */
router.post('/', authMiddleware, checkRole('seller', 'admin'), (req, res) => {
  const { name, categoryId, description, price, stock, rating, image } = req.body;

  if (!name || price === undefined || !categoryId) {
    return res.status(400).json({ error: 'Name, price and categoryId are required' });
  }

  if (!categoriesStore.findById(categoryId)) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const newProduct = productsStore.create({
    name: name.trim(),
    categoryId,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    rating: rating !== undefined ? Number(rating) : 0,
    image: image || ''
  });

  res.status(201).json(newProduct);
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар с категорией
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Товар с категорией
 */
router.get('/:id', authMiddleware, checkRole('user', 'seller', 'admin'), (req, res) => {
  const product = productsStore.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const category = categoriesStore.findById(product.categoryId);
  res.json({ product, category: category || null });
});

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               categoryId: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               rating: { type: number }
 *               image: { type: string }
 *     responses:
 *       200:
 *         description: Товар обновлён
 */
router.patch('/:id', authMiddleware, checkRole('seller', 'admin'), (req, res) => {
  const { name, categoryId, description, price, stock, rating, image } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const product = productsStore.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (categoryId !== undefined) {
    if (!categoriesStore.findById(categoryId)) {
      return res.status(404).json({ error: 'Category not found' });
    }
    product.categoryId = categoryId;
  }

  if (name !== undefined) product.name = name.trim();
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image;

  res.json(product);
});

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Товар удалён
 */
router.delete('/:id', authMiddleware, checkRole('admin'), (req, res) => {
  const deleted = productsStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
});

module.exports = router;