// Скрипт для проверки created_at / updated_at с Mongoose
// Настройка: установите MONGO_URI, если у вас включена аутентификация
// Например: set MONGO_URI=mongodb://appUser:1234@localhost:27017/practice_db?authSource=myapp

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/practice_db';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO_URI);

  // Очистим коллекцию
  await User.deleteMany({});

  // 1) Создание документа
  const created = await User.create({ name: 'Тест', email: `test_${Date.now()}@local`, age: 20 });
  console.log('\nCreated document:\n', {
    _id: created._id.toString(),
    created_at: created.created_at,
    updated_at: created.updated_at
  });

  // Подождём 2 секунды, затем обновим
  await new Promise(r => setTimeout(r, 2000));

  // 2) Обновление через findByIdAndUpdate (Mongoose timestamps обновит updated_at автоматически)
  const updated = await User.findByIdAndUpdate(created._id, { $set: { age: 30 } }, { new: true });
  console.log('\nAfter findByIdAndUpdate:\n', {
    _id: updated._id.toString(),
    created_at: updated.created_at,
    updated_at: updated.updated_at
  });

  // 3) Демонстрация $currentDate через нативный драйвер (чистый MongoDB способ)
  await mongoose.connection.db.collection('users').updateOne(
    { _id: created._id },
    { $set: { name: 'Тест $currentDate' }, $currentDate: { updated_at: true } }
  );
  const afterCurrentDate = await User.findById(created._id);
  console.log('\nAfter $currentDate update:\n', {
    _id: afterCurrentDate._id.toString(),
    created_at: afterCurrentDate.created_at,
    updated_at: afterCurrentDate.updated_at
  });

  await mongoose.disconnect();
  console.log('\nDisconnected');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
