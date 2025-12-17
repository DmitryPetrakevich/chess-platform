const { generateClientId } = require("../utils/id");
const { saveGameToDB } = require('../config/db');
const { Chess } = require("chess.js");

const {
  rooms,
  addClientToRoom,
  removeClientFromRoom,
  broadcastToRoom,
} = require("./rooms");

const timerIntervals = new Map();

async function saveGameAndCleanup(roomId, reason, winner = null) {
  const room = rooms.get(roomId);
  if (!room) {
    console.log(`Комната ${roomId} не найдена для сохранения`);
    return;
  }

  console.log(`💾 Сохраняем партию ${roomId}, причина: ${reason}, победитель: ${winner}`);

  if (room.timer) {
    room.timer.stop();
    room.timer.isRunning = false;
  }

  if (timerIntervals.has(roomId)) {
    clearInterval(timerIntervals.get(roomId));
    timerIntervals.delete(roomId);
  }

  const white = room.white;
  const black = room.black;

  if (white && black) {
    const gameData = {
      roomId,
      whiteUserId: room.white?.userId || null,
      whiteUsername: room.white?.name || "Anonymous",
      whiteRating: white.rating || 1200,
      blackUserId: room.black?.userId || null,
      blackUsername: room.black?.name || "Anonymous",
      blackRating: black.rating || 1200,
      result: 
        reason === "agreed-draw" ? "draw" :
        winner === "w" ? "whiteWin" :
        winner === "b" ? "blackWin" : "draw",
      reason: reason || "unknown",
      moves: room.history.map(h => h.san).join(" ") || "",
      finalFen: room.game.fen(),
      duration: 0,
    };

    try {
      await saveGameToDB(gameData);
      console.log(`✅ Партия сохранена в БД: ${white.name || 'White'} vs ${black.name || 'Black'}`);
    } catch (err) {
      console.error("❌ Не удалось сохранить партию:", err);
    }
  } else {
    console.log("⚠️ Не могу сохранить: один из игроков отсутствует");
  }
}

function handleConnection(ws) {
  ws.id = generateClientId();
  console.log(`🟢 WS connected: ${ws.id}`);

  function sendTimerUpdate(roomId) {
    const room = rooms.get(roomId);
    if (!room || !room.timer) return;

    const timerData = room.timer.getCurrentTime();

    const simpleTimerData = {
      whiteTime: timerData.whiteTime,
      blackTime: timerData.blackTime,
      currentTurn: timerData.currentTurn,
      isRunning: timerData.isRunning,
    };

    broadcastToRoom(roomId, {
      type: "timerUpdate",
      ...simpleTimerData,
    });
  }

  function handleJoin(data, ws) {
    const { roomId, name, color: preferredColor, userId  } = data;

    ws.name = name || "Player";
    ws.color = preferredColor;
    ws.userId = userId || null;

    const playersCount = addClientToRoom(roomId, ws, preferredColor);
    const room = rooms.get(roomId);

    ws.send(
      JSON.stringify({
        type: "joined",
        roomId,
        clientId: ws.id,
        color: ws.color,
        playersCount,
      })
    );

    ws.send(JSON.stringify({
      type: "history",
      history: room.history
    }));

    ws.send(JSON.stringify({
      type: "position",
      fen: room.game.fen(),
      turn: room.turn
    }));

    // Отправляем состояние таймера
    if (room && room.timer) {
      const timerData = room.timer.getCurrentTime();
      const simpleTimerData = {
        whiteTime: timerData.whiteTime,
        blackTime: timerData.blackTime,
        currentTurn: timerData.currentTurn,
        isRunning: timerData.isRunning,
      };

      ws.send(
        JSON.stringify({
          type: "timerUpdate",
          ...simpleTimerData,
        })
      );
    }

    // Если в комнате уже есть другой игрок — отправляем новому его данные
    if (room) {
      const opponent =
        room.white && room.white !== ws
          ? room.white
          : room.black && room.black !== ws
          ? room.black
          : null;

      if (opponent) {
        ws.send(
          JSON.stringify({
            type: "player_joined",
            player: {
              id: opponent.id,
              username: opponent.name,
              color: opponent.color,
            },
          })
        );
      }
    }

    broadcastToRoom(
      roomId,
      {
        type: "player_joined",
        player: {
          id: ws.id,
          username: ws.name,
          color: ws.color,
          rating: Math.floor(1000 + Math.random() * 500),
        },
      },
      ws
    );

    if (room.isGameOver) {
      ws.send(JSON.stringify({
        type: "gameOver",
        reason: room.result.reason,
        winner: room.result.winner
      }));
    }

    // Если оба игрока на месте — начинаем игру
    if (room.white && room.black && !room.isGameOver) {
      const hasMoves = room.game.history().length > 0;

      if (room.timer && !hasMoves) {
        room.timer.startPreStart(() => {
          room.isGameOver = true;
          room.result = { reason: "no_first_move", winner: null };

          broadcastToRoom(roomId, {
            type: "gameOver",
            reason: "no_first_move",
          });
        });

        room.timer.broadcastPreStartUpdate = () => {
          const preStartData = room.timer.getPreStartData();
          broadcastToRoom(roomId, {
            type: "preStartUpdate",
            ...preStartData,
          });
        };
      }

      broadcastToRoom(roomId, {
        type: "start_game",
        roomId,
        whiteId: room.white.id,
        blackId: room.black.id,
        turn: room.turn,
      });
    }
  }

function handleMove(data, ws) {
  const { roomId, move } = data;
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.isGameOver) {
    ws.send(JSON.stringify({ type: "error", message: "Game is over" }));
    return;
  }

  if (
    (room.turn === "w" && ws !== room.white) ||
    (room.turn === "b" && ws !== room.black)
  ) {
    ws.send(JSON.stringify({ type: "error", message: "Not your turn" }));
    return;
  }

  if (room.game.isGameOver()) {
    ws.send(JSON.stringify({ type: "error", message: "Game is over" }));
    return;
  }

  const chessMove = room.game.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion || "q"
  });

  if (!chessMove) {
    ws.send(JSON.stringify({ type: "error", message: "Illegal move" }));
    return;
  }

  room.history.push({
    from: chessMove.from,
    to: chessMove.to,
    san: chessMove.san,
    fen: room.game.fen()
  });

  const newTurn = room.turn === "w" ? "b" : "w";
  room.turn = newTurn;

  ws.send(
    JSON.stringify({
      type: "moveMade",
      from: move.from,
      to: move.to,
      turn: room.turn,
    })
  );

  broadcastToRoom(
    roomId,
    {
      type: "move",
      move,
      turn: room.turn,
    },
    ws
  );

  broadcastToRoom(roomId, {
    type: "position",
    fen: room.game.fen(),
    turn: room.turn,
    history: room.history
  });

  if (room.game.isGameOver()) {
    console.log(`🎮 Игра завершена после хода ${move.from}-${move.to}`);
    
    let reason, winner = null;
    
    switch (true) {
      case room.game.isCheckmate():
        reason = "checkMate";
        winner = room.turn === "w" ? "b" : "w";
        break;
        
      case room.game.isStalemate():
        reason = "stalemate";
        break;
        
      case room.game.isThreefoldRepetition():
        reason = "threefold-repetition";
        break;
        
      case room.game.isInsufficientMaterial():
        reason = "insufficient-material";
        break;
        
      case room.game.isDraw():
        reason = "50-move-rule";
        break;
        
      default:
        reason = "unknown";
        break;
    }
    
    console.log(`🏁 Причина окончания: ${reason}, победитель: ${winner}`);

    room.isGameOver = true;
    room.result = { reason, winner };
        
    if (room.timer) {
      room.timer.stop();
    }
    
    if (timerIntervals.has(roomId)) {
      clearInterval(timerIntervals.get(roomId));
      timerIntervals.delete(roomId);
    }
    
    saveGameAndCleanup(roomId, reason, winner);
    
    broadcastToRoom(roomId, {
      type: "gameOver",
      reason,
      winner,
    });
    
    return; // Прекращаем дальнейшую обработку таймера
  }

  // Если игра не завершена, запускаем/обновляем таймер
  if (room.timer) {
    room.timer.stopPreStart();
    room.timer.start();
    room.timer.switchTurn(newTurn);

    // Запускаем интервал таймера, если ещё не запущен
    if (!timerIntervals.has(roomId)) {
      const interval = setInterval(() => {
        if (!room.timer) return;

        const timeCheck = room.timer.tick();
        sendTimerUpdate(roomId);

        if (timeCheck?.timeOut) {
          console.log(`⏰ [${roomId}] Игра завершена по таймеру, победитель: ${timeCheck.winner}`);

          room.isGameOver = true;
          room.result = { reason: "timeOut", winner: timeCheck.winner };

          saveGameAndCleanup(roomId, "timeOut", timeCheck.winner);
          
          broadcastToRoom(roomId, {
            type: "gameOver",
            reason: "timeOut",
            winner: timeCheck.winner,
          });

          room.timer.stop();
          clearInterval(interval);
          timerIntervals.delete(roomId);
        }
      }, 1000);

      timerIntervals.set(roomId, interval);
    }
  }
}

  function handleOfferDraw(data, ws) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.isGameOver) {
      ws.send(JSON.stringify({ type: "error", message: "Game is over" }));
      return;
    }

    broadcastToRoom(roomId, {
      type: "offer-draw",
    }, ws);
  }

  function handleOfferUndo(data, ws) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.isGameOver) {
      ws.send(JSON.stringify({ type: "error", message: "Game is over" }));
      return;
    }

    broadcastToRoom(roomId, {
      type: "offer-undo",
    }, ws);
  }

  function handleAcceptUndo(data, ws) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    console.log("🔄 Запрос на отмену хода в комнате:", roomId);
    console.log("История ходов на сервере:", room.game.history());
    console.log("Длина истории:", room.game.history().length);

    if (room.game.history().length === 0) {
      console.warn("❌ Нет ходов для отмены на сервере");
      ws.send(JSON.stringify({
        type: "error",
        message: "No moves to undo"
      }));
      return;
    }

    // Отменяем ход
    const undoneMove = room.game.undo();
    if (!undoneMove) {
      console.warn("❌ Не удалось отменить ход на сервере");
      ws.send(JSON.stringify({
        type: "error",
        message: "Failed to undo move"
      }));
      return;
    }

    console.log("✅ Ход отменен на сервере:", undoneMove);

    if (room.history.length > 0) {
      room.history.pop();
    }

    room.turn = room.game.turn();

    if (room.timer) {
      room.timer.switchTurn(room.turn);
    }

    broadcastToRoom(roomId, {
      type: "position",
      fen: room.game.fen(),
      turn: room.turn,
      history: room.history,
    });

    broadcastToRoom(roomId, {
      type: "undo-accepted",
    });

    console.log("📢 Разослано обновление позиции после отмены хода");
  }

function handleGameOver(data, ws) {
  const { roomId, reason, winner } = data;
  const room = rooms.get(roomId);
  if (!room) return;

  console.log(`🏁 Получен game_over от клиента: ${reason}, winner: ${winner}`);

  room.isGameOver = true;
  room.result = { reason, winner };

  saveGameAndCleanup(roomId, reason, winner);

  broadcastToRoom(roomId, {
    type: "gameOver",
    reason: reason,
    winner: winner || null,
  });
}

function handleAcceptDraw(data, ws) {
  const { roomId } = data;
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.isGameOver) {
    ws.send(JSON.stringify({ type: "error", message: "Game is over" }));
    return;
  }

  console.log("🤝 Ничья принята — завершаем игру");

  room.isGameOver = true;
  room.result = { reason: "agreed-draw", winner: null };
  
  saveGameAndCleanup(roomId, "agreed-draw", null);

  broadcastToRoom(roomId, {
    type: "gameOver",
    reason: "agreed-draw",
    winner: null,
  });
}

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Parsed data:", data);

      switch (data.type) {
        case "join":
          handleJoin(data, ws);
          break;

        case "make_move":
        case "move":
          handleMove(data, ws);
          break;

        case "offer-draw":
          handleOfferDraw(data, ws);
          break;

        case "offer-undo":
          handleOfferUndo(data, ws);
          break;

        case "accept-undo":
          handleAcceptUndo(data, ws);
          break;
        
        case "accept-draw":          
          handleAcceptDraw(data, ws);
          break;

        case "game_over":
          handleGameOver(data, ws);
          break;
      
        default:
          console.warn(`⚠️ Неизвестный тип сообщения: ${data.type}`);
          ws.send(JSON.stringify({
            type: "error",
            message: "Unknown message type"
          }));
      }
    } catch (err) {
      console.error("❌ Ошибка обработки сообщения:", err);
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid JSON"
      }));
    }
  });

  ws.on("close", () => {
    console.log(`🔴 WS disconnected: ${ws.id}`);

    if (ws.roomId) {
      const room = rooms.get(ws.roomId);

      // Останавливаем таймер, если комната станет пустой
      if (room && room.players.size === 1) {
        if (room.timer) {
          room.timer.stop();
        }

        if (timerIntervals.has(ws.roomId)) {
          clearInterval(timerIntervals.get(ws.roomId));
          timerIntervals.delete(ws.roomId);
        }
      }

      removeClientFromRoom(ws.roomId, ws);
      broadcastToRoom(ws.roomId, {
        type: "player_left",
        clientId: ws.id
      });
    }
  });

  ws.on("error", (err) => {
    console.error(`⚠️ WS error (${ws.id}):`, err);
  });
}

module.exports = { handleConnection };