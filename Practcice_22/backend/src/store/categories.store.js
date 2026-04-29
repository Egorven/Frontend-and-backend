const { nanoid } = require('nanoid');

let categories = [
  { id: nanoid(6), name: 'Гитары', description: 'Электро, акустические и бас-гитары' },
  { id: nanoid(6), name: 'Клавишные', description: 'Пианино, синтезаторы, MIDI-клавиатуры' },
  { id: nanoid(6), name: 'Ударные', description: 'Барабанные установки и перкуссия' },
  { id: nanoid(6), name: 'Звук', description: 'Микрофоны, наушники, аудиоинтерфейсы' },
  { id: nanoid(6), name: 'Усилители', description: 'Гитарные и басовые усилители' },
  { id: nanoid(6), name: 'Струнные', description: 'Скрипки, альты, виолончели, укулеле' },
  { id: nanoid(6), name: 'Духовые', description: 'Трубы, саксофоны, флейты' }
];

module.exports = {
  getAll: () => categories,
  findById: (id) => categories.find(c => c.id === id),
  create: (data) => {
    const newCategory = { id: nanoid(6), ...data };
    categories.push(newCategory);
    return newCategory;
  },
  update: (id, updates) => {
    const category = categories.find(c => c.id === id);
    if (!category) return null;
    Object.assign(category, updates);
    return category;
  },
  delete: (id) => {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    categories.splice(index, 1);
    return true;
  },
  hasProducts: (categoryId, productsStore) => 
    productsStore.getAll().some(p => p.categoryId === categoryId),
  _clear: () => { categories = []; }
};