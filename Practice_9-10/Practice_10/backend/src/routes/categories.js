const express = require('express');
const { authMiddleware } = require('../middleware/authJwt');
const categoriesStore = require('../store/categories.store');
const productsStore = require('../store/products.store');

const router = express.Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
 */
router.get('/', (req, res) => {
  res.json(categoriesStore.getAll());
});

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Создать категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Категория создана
 */
router.post('/', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newCategory = categoriesStore.create({
    name: name.trim(),
    description: description?.trim() || ''
  });
  
  res.status(201).json(newCategory);
});

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Категория найдена
 *       404:
 *         description: Не найдено
 */
router.get('/:id', (req, res) => {
  const category = categoriesStore.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

/**
 * @openapi
 * /api/categories/{id}:
 *   patch:
 *     summary: Обновить категорию
 *     tags: [Categories]
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
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Категория обновлена
 */
router.patch('/:id', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();

  const updated = categoriesStore.update(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  
  res.json(updated);
});

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Категория удалена
 *       404:
 *         description: Не найдено
 *       409:
 *         description: Нельзя удалить категорию с товарами
 */
router.delete('/:id', authMiddleware, (req, res) => {
  if (categoriesStore.hasProducts(req.params.id, productsStore)) {
    return res.status(409).json({ error: 'Cannot delete category with associated products' });
  }
  
  const deleted = categoriesStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Category not found' });
  
  res.status(204).send();
});

/**
 * @openapi
 * /api/categories/{id}/with-products:
 *   get:
 *     summary: Категория с товарами и метриками
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Агрегированные данные
 */
router.get('/:id/with-products', (req, res) => {
  const category = categoriesStore.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const categoryProducts = productsStore.getAll().filter(p => p.categoryId === category.id);

  const metrics = {
    totalProducts: categoryProducts.length,
    avgRating: categoryProducts.length > 0
      ? Number((categoryProducts.reduce((sum, p) => sum + p.rating, 0) / categoryProducts.length).toFixed(2))
      : 0,
    totalStock: categoryProducts.reduce((sum, p) => sum + p.stock, 0),
    minPrice: categoryProducts.length > 0 ? Math.min(...categoryProducts.map(p => p.price)) : 0,
    maxPrice: categoryProducts.length > 0 ? Math.max(...categoryProducts.map(p => p.price)) : 0
  };

  res.json({ ...category, products: categoryProducts, metrics });
});

module.exports = router;