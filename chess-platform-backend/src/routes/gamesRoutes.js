const express = require("express");
const router = express.Router();
const { getGamesForUser, getGameById } = require("../config/db");

router.get("/", async (req, res) => {
  let userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  userId = Number(userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "userId must be a number" });
  }

  try {
    const gamesFromDB = await getGamesForUser(userId);

    const formattedGames = gamesFromDB.map(game => ({
      id: game.roomId,
      whiteUsername: game.whiteUsername || "Anonymous",
      blackUsername: game.blackUsername || "Anonymous",
      opponent: {
        username: game.whiteUserId === userId
          ? (game.blackUsername || "Anonymous")
          : (game.whiteUsername || "Anonymous"),
        rating: game.whiteUserId === userId
          ? game.blackRating
          : game.whiteRating
      },
      playerColor: game.whiteUserId === userId ? "white" : "black",  
      result: game.result,
      reason: game.reason,
      moves: game.moves ? game.moves.split(" ") : [],
      finalFen: game.finalFen,
      timeControl: game.timeControl || "10+0",
      date: game.createdAt
    }));

    res.json(formattedGames);
  } catch (err) {
    console.error("Ошибка при загрузке партий", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const gameId = req.params.id;
    console.log("Запрос игры по ID:", gameId);  // ← добавить лог
    
    const game = await getGameById(gameId);
    console.log("Данные из БД:", game);  // ← добавить лог

    if (!game) {
      console.log("Игра не найдена");  // ← добавить лог
      return res.status(404).json({ error: "Game not found" });
    }

    // Форматируем так же, как в списке
    const formattedGame = {
      id: game.roomId,
      whiteUsername: game.whiteUsername || "Anonymous",
      blackUsername: game.blackUsername || "Anonymous",
      whiteRating: game.whiteRating,
      blackRating: game.blackRating,
      result: game.result,
      reason: game.reason,
      moves: game.moves ? game.moves.split(" ") : [],
      finalFen: game.finalFen,
      timeControl: game.timeControl || "10+0",
      date: game.createdAt,
      whiteUserId: game.whiteUserId,
      blackUserId: game.blackUserId
    };

    console.log("Отправляю клиенту:", formattedGame);  // ← добавить лог
    res.json(formattedGame);
  } catch (err) {
    console.error("Ошибка при загрузке партии:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;