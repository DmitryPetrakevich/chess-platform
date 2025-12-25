const express = require("express");
const router = express.Router();
const { pool } = require('../config/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-this-in-production-2025'; // Вынеси в .env!
const JWT_EXPIRES_IN = '7d'; 

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Все поля обязательны для заполнения",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Имя пользователя должно быть не менее 3 символов",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Пароль должен быть не менее 8 символов",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Пользователь с таким именем или email уже существует",
      });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, bullet_rating, blitz_rating, rapid_rating) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, bullet_rating, blitz_rating, rapid_rating, created_at`,
      [username, email, password_hash, 1200, 1200, 1200]
    );

    const user = result.rows[0];

    // Генерация настоящего JWT
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
      user: user,
      token: token
    });
  } catch (err) {
    console.error("❌ Ошибка при регистрации:", err);
    res.status(500).json({
      success: false,
      error: "Внутренняя ошибка сервера",
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Заполните все поля'
      });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [identifier]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Неверный пароль'
      });
    }

    // Генерация настоящего JWT
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bullet_rating: user.bullet_rating,
        blitz_rating: user.blitz_rating,
        rapid_rating: user.rapid_rating,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Проверка авторизации (для стора/клиента)
router.get('/auth/check', async (req, res) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Токен не предоставлен'
      });
    }

    // Поддержка формата "Bearer <token>"
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    // Проверка и декодирование JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    const userResult = await pool.query(
      'SELECT id, username, email, bullet_rating, blitz_rating, rapid_rating, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      user: user
    });

  } catch (err) {
    console.error('Ошибка при проверке токена:', err);
    return res.status(401).json({
      success: false,
      error: 'Неверный или просроченный токен'
    });
  }
});

module.exports = router;