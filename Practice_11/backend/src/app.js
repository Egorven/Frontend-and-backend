require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const categoriesStore = require('./store/categories.store');
const productsStore = require('./store/products.store');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',  // или process.env.CORS_ORIGIN
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],  // ← Добавьте все методы!
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));


app.use('/api/users', require('./routes/users'));

// Статика для изображений
app.use('/images', express.static(path.join(__dirname, '../../public/images')));

// Логгер запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}][${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API музыкального магазина',
      version: '1.0.0',
      description: 'REST API с связями сущностей и агрегацией',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    tags: [
      { name: 'Products', description: 'Операции с товарами' },
      { name: 'Categories', description: 'Операции с категориями' },
      { name: 'Auth', description: 'Авторизация' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ⚠️ Инициализация: привязываем товары к реальным ID категорий
// (так как в products.store.js categoryId = 'placeholder')
const initStores = () => {
  const allCategories = categoriesStore.getAll();
  const allProducts = productsStore.getAll();
  
  allProducts.forEach((product, index) => {
    // Привязываем товары к категориям по порядку (для демо)
    const categoryIndex = index % allCategories.length;
    product.categoryId = allCategories[categoryIndex].id;
  });
};
initStores();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;