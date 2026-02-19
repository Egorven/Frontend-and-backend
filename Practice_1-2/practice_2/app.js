const express = require('express');
const app = express();
const port = 3000;
let goods = [
{id: 1, name: 'Флейта'
, price: 30000},
{id: 2, name: 'Гитара'
, price: 10000},
{id: 3, name: 'Пианино'
, price: 50000},
{id: 4, name: 'Балалайка'
, price: 27500},
{id: 5, name: 'Скрипка'
, price: 150000},
]
// Middleware для парсинга JSON
app.use(express.json());
// Главная страница
app.get('/'
, (req, res) => {
res.send('Главная страница');
});
// CRUD
app.post('/goods'
, (req, res) => {
const { name, price } = req.body;
const newGoods = {
id: Date.now(),
name,
price
};
goods.push(newGoods);
res.status(201).json(newGoods);
});
app.get('/goods'
, (req, res) => {
res.send(JSON.stringify(goods));
});
app.get('/goods/:id'
, (req, res) => {
let user = goods.find(u => u.id == req.params.id);
res.send(JSON.stringify(user));
});
app.patch('/goods/:id'
, (req, res) => { const user = goods.find(u => u.id == req.params.id);
const { name, price } = req.body;
if (name !== undefined) user.name = name;
if (price !== undefined) user.price = price;
res.json(user);
});
app.delete('/goods/:id'
, (req, res) => {
goods = goods.filter(u => u.id != req.params.id);
res.send('Ok');
});
// Запуск сервера
app.listen(port, () => {
console.log(`Сервер запущен на http://localhost:${port}`);
});