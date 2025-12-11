const express = require("express");
const router = express.Router();
const { pool } = require('../config/db.js');

router.get("/", async (req, res) => {
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

module.exports = router;