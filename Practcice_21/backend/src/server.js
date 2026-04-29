const app = require('./app');
const { initRedis } = require('./middleware/cache');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initRedis();
    app.listen(PORT, () => {
      console.log(`🎵 Backend running on http://localhost:${PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`📦 Categories: ${require('./store/categories.store').getAll().length}, Products: ${require('./store/products.store').getAll().length}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();