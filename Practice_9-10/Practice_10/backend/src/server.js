const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎵 Backend running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📦 Categories: ${require('./store/categories.store').getAll().length}, Products: ${require('./store/products.store').getAll().length}`);
});