const express = require('express');
const app = express();
const pool = require('./src/config/db');

app.use(express.json());

// Простые маршруты
app.get('/', (req, res) => {
  res.json({ message: 'Шахматный сервер работает!' });
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});