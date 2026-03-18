const { nanoid } = require('nanoid');

let products = [
  { id: nanoid(6), name: 'Электрогитара Fender Stratocaster', categoryId: 'placeholder', description: 'Классическая электрогитара', price: 89990, stock: 8, rating: 4.9, image: '/images/electric-guitar.jpg' },
  { id: nanoid(6), name: 'Цифровое пианино Yamaha P-125', categoryId: 'placeholder', description: '88 клавиш', price: 65000, stock: 5, rating: 4.8, image: '/images/electric-piano.jpg' },
  { id: nanoid(6), name: 'Акустическая барабанная установка Tama', categoryId: 'placeholder', description: '5 предметов, комплект тарелок в упаковке', price: 120000, stock: 3, rating: 4.7, image: '/images/baraban.jpg' },
  { id: nanoid(6), name: 'Синтезатор Korg Minilogue XD', categoryId: 'placeholder', description: 'Аналоговый полифонический синтезатор, 4 голоса', price: 78500, stock: 6, rating: 4.9, image: '/images/synthesizer.jpg' },
  { id: nanoid(6), name: 'Бас-гитара Ibanez SR300E', categoryId: 'placeholder', description: '4-струнный бас, активная электроника, легкий корпус', price: 42000, stock: 12, rating: 4.6, image: '/images/bas-guitar.jpg' },
  { id: nanoid(6), name: 'Микрофон Shure SM58', categoryId: 'placeholder', description: 'Динамический вокальный микрофон', price: 9500, stock: 25, rating: 5.0, image: '/images/microphone.jpg' },
  { id: nanoid(6), name: 'Наушники Audio-Technica ATH-M50x', categoryId: 'placeholder', description: 'Студийные мониторные наушники', price: 14500, stock: 30, rating: 4.8, image: '/images/headphones.jpg' },
  { id: nanoid(6), name: 'Усилитель для гитары Fender Champion 40', categoryId: 'placeholder', description: '40 Вт, встроенные эффекты, Bluetooth', price: 28000, stock: 10, rating: 4.7, image: '/images/guitar-amplifier.jpg' },
  { id: nanoid(6), name: 'Скрипка Stentor Student II 4/4', categoryId: 'placeholder', description: 'Полноразмерная скрипка для обучения, еловая дека, комплект со смычком и канифолью', price: 24500, stock: 6, rating: 4.4, image: '/images/violin.jpg' },
  { id: nanoid(6), name: 'Труба Bach TR300H2', categoryId: 'placeholder', description: 'Ученическая труба, мундштук 7C в комплекте', price: 30900, stock: 4, rating: 4.9, image: '/images/flute.jpg' }
];

// ⚠️ После инициализации категорий нужно обновить categoryId!
// Это делается в app.js при старте

module.exports = {
  getAll: (categoryId) => 
    categoryId ? products.filter(p => p.categoryId === categoryId) : products,
  findById: (id) => products.find(p => p.id === id),
  create: (data) => {
    const newProduct = { id: nanoid(6), ...data };
    products.push(newProduct);
    return newProduct;
  },
  update: (id, updates) => {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    Object.assign(product, updates);
    return product;
  },
  delete: (id) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  },
  _clear: () => { products = []; }
};