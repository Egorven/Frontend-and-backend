const { Sequelize,  DataTypes } = require('sequelize');
const express = require('express');
const app = express();


const sequelize = new Sequelize('mydatabase', 'postgres', 'postgres',
    {
        host: 'localhost', dialect: 'postgres',
    });

// Проверка подключения
sequelize.authenticate({ force: true })
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error:', err));

app.use(express.json());


const User = sequelize.define('User', {
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
});

sequelize.sync({ force: true })
    .then(() => {
        console.log('Database synchronized');
        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    })
    .catch(err => console.error('Sync error:', err));

app.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.update(req.body, {
            where: { id: req.params.id },
            returning: true,
        });
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});
app.delete('/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.send({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});