const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(express.json());

let categories = [
  { id: nanoid(6), name: 'Гитары', description: 'Электро, акустические и бас-гитары' },
  { id: nanoid(6), name: 'Клавишные', description: 'Пианино, синтезаторы, MIDI-клавиатуры' },
  { id: nanoid(6), name: 'Ударные', description: 'Барабанные установки и перкуссия' },
  { id: nanoid(6), name: 'Звук', description: 'Микрофоны, наушники, аудиоинтерфейсы' },
  { id: nanoid(6), name: 'Усилители', description: 'Гитарные и басовые усилители' },
  { id: nanoid(6), name: 'Струнные', description: 'Скрипки, альты, виолончели, укулеле' },
  { id: nanoid(6), name: 'Духовые', description: 'Трубы, саксофоны, флейты' }
];

let products = [
  { id: nanoid(6), name: 'Электрогитара Fender Stratocaster', categoryId: categories[0].id, description: 'Классическая электрогитара', price: 89990, stock: 8, rating: 4.9, image: '/images/electric-guitar.jpg' },
  { id: nanoid(6), name: 'Цифровое пианино Yamaha P-125', categoryId: categories[1].id, description: '88 клавиш', price: 65000, stock: 5, rating: 4.8, image: '/images/electric-piano.jpg' },
  { id: nanoid(6), name: 'Акустическая барабанная установка Tama', categoryId: categories[2].id, description: '5 предметов, комплект тарелок в упаковке', price: 120000, stock: 3, rating: 4.7, image: '/images/baraban.jpg' },
  { id: nanoid(6), name: 'Синтезатор Korg Minilogue XD', categoryId: categories[1].id, description: 'Аналоговый полифонический синтезатор, 4 голоса', price: 78500, stock: 6, rating: 4.9, image: '/images/synthesizer.jpg' },
  { id: nanoid(6), name: 'Бас-гитара Ibanez SR300E', categoryId: categories[0].id, description: '4-струнный бас, активная электроника, легкий корпус', price: 42000, stock: 12, rating: 4.6, image: '/images/bas-guitar.jpg' },
  { id: nanoid(6), name: 'Микрофон Shure SM58', categoryId: categories[3].id, description: 'Динамический вокальный микрофон', price: 9500, stock: 25, rating: 5.0, image: '/images/microphone.jpg' },
  { id: nanoid(6), name: 'Наушники Audio-Technica ATH-M50x', categoryId: categories[3].id, description: 'Студийные мониторные наушники', price: 14500, stock: 30, rating: 4.8, image: '/images/headphones.jpg' },
  { id: nanoid(6), name: 'Усилитель для гитары Fender Champion 40', categoryId: categories[4].id, description: '40 Вт, встроенные эффекты, Bluetooth', price: 28000, stock: 10, rating: 4.7, image: '/images/guitar-amplifier.jpg' },
  { id: nanoid(6), name: 'Скрипка Stentor Student II 4/4', categoryId: categories[5].id, description: 'Полноразмерная скрипка для обучения, еловая дека, комплект со смычком и канифолью', price: 24500, stock: 6, rating: 4.4, image: '/images/violin.jpg' },
  { id: nanoid(6), name: 'Труба Bach TR300H2', categoryId: categories[6].id, description: 'Ученическая труба, мундштук 7C в комплекте', price: 30900, stock: 4, rating: 4.9, image: '/images/flute.jpg' }
];

let users = [];


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API музыкального магазина',
      version: '1.0.0',
      description: 'REST API с связями сущностей и агрегацией',
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
    tags: [
      { name: 'Products', description: 'Операции с товарами' },
      { name: 'Categories', description: 'Операции с категориями' },
    ],
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/images', express.static(path.join(__dirname, '/public/images')));


app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}][${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});


function findUserOr404(email, res) {
  const user = users.find(u => u.email == email);
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return null;
  }
  return user;
}
async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}
async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

function findCategoryOr404(id, res) {
  const category = categories.find(c => c.id === id);
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return null;
  }
  return category;
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, age, first_name, last_name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               first_name:
 *                 type: string
 *                 example: Ivan
 *               last_name:
 *                 type: string
 *                 example: Ivanovic
 *               age:
 *                 type: integer
 *                 minimum: 1
 *                 example: 20
 *               password:
 *                 type: string
 *                 format: password
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: ab12cd
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: ivan@example.com
 *                 first_name:
 *                   type: string
 *                   example: Ivan
 *                 last_name:
 *                   type: string
 *                   example: Ivanovic
 *                 age:
 *                   type: integer
 *                   example: 20
 *                 hashedPassword:
 *                   type: string
 *                   example: $2b$10$kO6Hq7ZKfV4cPzGm8u7mEuR7r4Xx2p9mP0q3t1yZbCq9Lh5a8b1QW
 *       400:
 *         description: Некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "email, first_name, last_name, password and age are required"
 */

app.post("/api/auth/register", async (req, res) => {
  const { email, first_name, last_name, age, password } = req.body;
  if (!email || !password || !first_name || !last_name || age === undefined) {
    return res.status(400).json({ error: "email, first_name, last_name, password and age are required" });
  }
  const newUser = {
    id: nanoid(6),
    email: email,
    first_name: first_name,
    last_name: last_name,
    age: Number(age),
    hashedPassword: await hashPassword(password)
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет логин и пароль пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "email and password are required"
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "not authentethicated"
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "user not found"
 */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "email and password are required" });
}
const user = findUserOr404(email, res);
    if (!user) return;
    isAuthentethicated = await verifyPassword(password,
      user.hashedPassword);
    if (isAuthentethicated) {
      res.status(200).json({ login: true });
    }
    else {
      res.status(401).json({ error: "not authentethicated" })
    }
  });


// ===== Swagger Schemas =====
/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required: [name]
 *       properties:
 *         id:
 *           type: string
 *           example: "aBc123"
 *         name:
 *           type: string
 *           example: "Гитары"
 *         description:
 *           type: string
 *           example: "Электро-, акустические и бас-гитары"
 *     Product:
 *       type: object
 *       required: [name, price, categoryId]
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         categoryId:
 *           type: string
 *           description: "Ссылка на Category.id"
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         rating:
 *           type: number
 *           format: float
 *         image:
 *           type: string
 *     CategoryWithProducts:
 *       allOf:
 *         - $ref: '#/components/schemas/Category'
 *         - type: object
 *           properties:
 *             products:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *             metrics:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: integer
 *                 avgRating:
 *                   type: number
 *                   format: float
 *                 totalStock:
 *                   type: integer
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Создать категорию
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Аксессуары"
 *               description:
 *                 type: string
 *                 example: "Струны, медиаторы, стойки"
 *     responses:
 *       201:
 *         description: Категория создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Ошибка валидации
 */
app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const newCategory = {
    id: nanoid(6),
    name: name.trim(),
    description: description?.trim() || ""
  };
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
app.get("/api/categories", (req, res) => {
  res.json(categories);
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Не найдено
 */
app.get("/api/categories/:id", (req, res) => {
  const category = findCategoryOr404(req.params.id, res);
  if (category) res.json(category);
});

/**
 * @openapi
 * /api/categories/{id}:
 *   patch:
 *     summary: Обновить категорию
 *     tags: [Categories]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Пустой запрос
 *       404:
 *         description: Не найдено
 */
app.patch("/api/categories/:id", (req, res) => {
  const category = findCategoryOr404(req.params.id, res);
  if (!category) return;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  const { name, description } = req.body;
  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description.trim();
  res.json(category);
});

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Categories]
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
app.delete("/api/categories/:id", (req, res) => {
  const hasProducts = products.some(p => p.categoryId === req.params.id);
  if (hasProducts) {
    return res.status(409).json({ error: "Cannot delete category with associated products" });
  }
  const exists = categories.some(c => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Category not found" });

  categories = categories.filter(c => c.id !== req.params.id);
  res.status(204).send();
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, categoryId]
 *             properties:
 *               name: { type: string }
 *               categoryId: 
 *                 type: string
 *                 description: "ID существующей категории"
 *                 example: "abc123"
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               rating: { type: number, format: float }
 *               image: { type: string }
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Категория не найдена
 */
app.post("/api/products", (req, res) => {
  const { name, categoryId, description, price, stock, rating, image } = req.body;

  if (!name || price === undefined || !categoryId) {
    return res.status(400).json({ error: "Name, price and categoryId are required" });
  }

  const category = findCategoryOr404(categoryId, res);
  if (!category) return;

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    categoryId,
    description: description || "",
    price: Number(price),
    stock: Number(stock) || 0,
    rating: rating !== undefined ? Number(rating) : 0,
    image: image || ""
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

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
 *         description: Фильтр по ID категории
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  const { categoryId } = req.query;
  if (categoryId) {
    const filtered = products.filter(p => p.categoryId === categoryId);
    return res.json(filtered);
  }
  res.json(products);
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID с информацией о категории
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Товар с категорией
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 */
app.get("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const category = categories.find(c => c.id === product.categoryId);
  res.json({
    product,
    category: category || null
  });
});

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
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
 *       400:
 *         description: Пустой запрос или категория не найдена
 *       404:
 *         description: Товар не найден
 */
app.patch("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, categoryId, description, price, stock, rating, image } = req.body;

  if (categoryId !== undefined) {
    const category = findCategoryOr404(categoryId, res);
    if (!category) return;
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Не найден
 */
app.delete("/api/products/:id", (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Product not found" });
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

/**
 * @openapi
 * /api/categories/{id}/with-products:
 *   get:
 *     summary: Получить категорию с товарами и метриками (агрегация)
 *     description: |
 *       Возвращает категорию, все связанные товары и вычисленные метрики:
 *       - totalProducts: количество товаров
 *       - avgRating: средний рейтинг (округлён до 2 знаков)
 *       - totalStock: общий остаток на складе
 *       - minPrice / maxPrice: диапазон цен
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Агрегированные данные категории
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryWithProducts'
 *       404:
 *         description: Категория не найдена
 */
app.get("/api/categories/:id/with-products", (req, res) => {
  const category = findCategoryOr404(req.params.id, res);
  if (!category) return;

  const categoryProducts = products.filter(p => p.categoryId === category.id);

  const metrics = {
    totalProducts: categoryProducts.length,
    avgRating: categoryProducts.length > 0
      ? Number((categoryProducts.reduce((sum, p) => sum + p.rating, 0) / categoryProducts.length).toFixed(2))
      : 0,
    totalStock: categoryProducts.reduce((sum, p) => sum + p.stock, 0),
    minPrice: categoryProducts.length > 0
      ? Math.min(...categoryProducts.map(p => p.price))
      : 0,
    maxPrice: categoryProducts.length > 0
      ? Math.max(...categoryProducts.map(p => p.price))
      : 0
  };

  res.json({
    ...category,
    products: categoryProducts,
    metrics
  });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`🎵 Сервер запущен: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
  console.log(`📦 Товаров: ${products.length}, Категорий: ${categories.length}`);
});