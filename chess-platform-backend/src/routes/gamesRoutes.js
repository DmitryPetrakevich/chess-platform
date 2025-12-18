const express = require("express");
const router = express.Router();
const { getGamesForUser } = require("../config/db");

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
      playerColor: game.whiteUserId === userId ? "white" : "black",  // Теперь сравнение число === число
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

module.exports = router;