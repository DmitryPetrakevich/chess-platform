const express = require("express");
const app = express();
const pool = require("./src/config/db");

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Шахматный сервер работает!" });
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users"
    );
    res.json({
      success: true,
      users: result.rows,
    });
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
    res.status(500).json({
      success: false,
      error: "Ошибка сервера",
    });
  }
});

app.post("/register", async (req, res) => {
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

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
             VALUES ($1, $2, $3) 
             RETURNING id, username, email, created_at`,
      [username, email, password]
    );

    res.status(201).json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
      user: result.rows[0], // Возвращаем созданного пользователя (без пароля)
    });
  } catch (err) {
    console.error("❌ Ошибка при регистрации:", err);

    res.status(500).json({
      success: false,
      error: "Внутренняя ошибка сервера",
    });
  }
});

app.post('/login', async (req, res) => {    
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

        // проверка пароля, пока простое сравнение, потом заменим на bcrypt)
        if (password !== user.password_hash) {
            return res.status(401).json({
                success: false,
                error: 'Неверный пароль'
            });
        }

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            token: 'temp-token-' + user.id, // Временный токен, потом заменим на JWT
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating,
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:3000`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || "development"}`);
});
