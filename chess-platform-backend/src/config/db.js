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
    console.log("Пытаемся сохранить в БД:", gameData); 

    const query = `
      INSERT INTO games (
        room_id,
        white_user_id, white_rating, white_username,
        black_user_id, black_rating, black_username,
        result, reason, moves, final_fen,
        time_control, created_at, finished_at, duration_seconds
      ) VALUES (
        $1, $2, $3, $4,   
        $5, $6, $7,    
        $8, $9, $10, $11,
        $12, NOW(), NOW(), $13  
      )
    `;

    const values = [
      gameData.roomId,
      gameData.whiteUserId || null,
      gameData.whiteRating || 1200,
      gameData.whiteUsername || "Anonymous",   
      gameData.blackUserId || null,
      gameData.blackRating || 1200,
      gameData.blackUsername || "Anonymous",   
      gameData.result,
      gameData.reason || null,
      gameData.moves || "",
      gameData.finalFen,
      gameData.timeControl || "10+0",
      gameData.duration || 0
    ];

    await pool.query(query, values);
    console.log("УСПЕШНО СОХРАНЕНО В БД!");
  } catch (err) {
    console.error("ОШИБКА СОХРАНЕНИЯ В БД:", err.message);
    console.error("Данные, которые пытались сохранить:", gameData);
  }
}

async function getGamesForUser (userId) {
  const query = `
  SELECT 
      room_id AS "roomId",
      white_user_id AS "whiteUserId",
      black_user_id AS "blackUserId",
      white_username AS "whiteUsername",
      black_username AS "blackUsername",
      white_rating AS "whiteRating",
      black_rating AS "blackRating",
      result,
      reason,
      moves,
      final_fen AS "finalFen",
      created_at AS "createdAt",
      time_control AS "timeControl"
    FROM games
    WHERE white_user_id = $1 OR black_user_id = $1
    ORDER BY created_at DESC
    LIMIT 30
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch(err) {
    console.error("Ошибка запроса партий из БД", err);
    throw err;
  }
}

module.exports = { 
  pool, 
  saveGameToDB,
  getGamesForUser 
};