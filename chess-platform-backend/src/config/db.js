// src/utils/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function saveGameToDB(gameData) {
  try {
    console.log("Пытаемся сохранить в БД:", gameData); // ← ВАЖНО!

    const query = `
      INSERT INTO games (
        room_id,
        white_user_id, white_rating,
        black_user_id, black_rating,
        result, reason, moves, final_fen,
        time_control, created_at, finished_at, duration_seconds
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11
      )
    `;

    const values = [
      gameData.roomId,
      null, // white_user_id — пока не знаем настоящий ID
      gameData.whiteRating,
      null, // black_user_id
      gameData.blackRating,
      gameData.result,
      gameData.reason || null,
      gameData.moves || '',
      gameData.finalFen,
      'blitz',
      gameData.duration || 0
    ];

    await pool.query(query, values);
    console.log("УСПЕШНО СОХРАНЕНО В БД!");
  } catch (err) {
    console.error("ОШИБКА СОХРАНЕНИЯ В БД:", err.message);
    console.error("Данные, которые пытались сохранить:", gameData);
  }
}

module.exports = { pool, saveGameToDB };