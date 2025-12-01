const { generateClientId } = require("../utils/id");
const { Chess } = require("chess.js");

const {
  rooms,
  addClientToRoom,
  removeClientFromRoom,
  broadcastToRoom,
} = require("./rooms");

const timerIntervals = new Map();

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

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Parsed data:", data);

      if (data.type === "join") {
        const { roomId, name, color: preferredColor } = data;

        ws.name = name || "Player";
        ws.color = preferredColor;

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

        if (room.white && room.black) {
          // room.turn = "w";

          const hasMoves = room.game.history().length > 0;

          if (room.timer && !hasMoves) {
            room.timer.startPreStart(() => {
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
      } else if (data.type === "make_move" || data.type === "move") {
        const { roomId, move } = data;
        const room = rooms.get(roomId);
        if (!room) return;

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
          promotion: move.promotion || "q" // авто-промо в ферзя
        });

        room.history.push({
          from: chessMove.from,
          to: chessMove.to,
          san: chessMove.san,
          fen: room.game.fen()
      });

        if (!chessMove) {
          ws.send(JSON.stringify({ type: "error", message: "Illegal move" }));
          return;
        }

        const newTurn = room.turn === "w" ? "b" : "w";
        room.turn = newTurn;

      if (room.timer) {
        room.timer.stopPreStart();
        room.timer.start();

        if (!timerIntervals.has(roomId)) {
          const interval = setInterval(() => {
            if (!room.timer) return;

            const timeCheck = room.timer.tick();
            sendTimerUpdate(roomId);

            if (timeCheck?.timeOut) {
              console.log(`⏰ [${roomId}] Игра завершена по таймеру, победитель: ${timeCheck.winner}`);

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


        if (room.timer) {
          room.timer.switchTurn(newTurn);
        }

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
      } else if (data.type === "game_over") {
          const { roomId } = data;
          const room = rooms.get(roomId);
          if (!room) return;

          if (room.timer) {
            room.timer.stop();
            room.timer.isRunning = false;
          }

          if (timerIntervals.has(roomId)) {
            clearInterval(timerIntervals.get(roomId));
            timerIntervals.delete(roomId);
          }

          broadcastToRoom(roomId, {
            type: "gameOver",
            reason: data.reason,
            winner: data.winner || null,
          });
        } else {
        ws.send(JSON.stringify({ type: "error", message: "Unknown type" }));
      }
    } catch (err) {
      console.error("❌ Ошибка обработки сообщения:", err);
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
    }
  });

  ws.on("close", () => {
    console.log(`🔴 WS disconnected: ${ws.id}`);
    if (ws.roomId) {
      const room = rooms.get(ws.roomId);

      // Останавливаем таймер если комната пустая
      if (room && room.players.size === 1) {
        // этот игрок последний
        if (room.timer) {
          room.timer.stop();
        }
        if (timerIntervals.has(ws.roomId)) {
          clearInterval(timerIntervals.get(ws.roomId));
          timerIntervals.delete(ws.roomId);
        }
      }

      removeClientFromRoom(ws.roomId, ws);
      broadcastToRoom(ws.roomId, { type: "player_left", clientId: ws.id });
    }
  });

  ws.on("error", (err) => console.error(`⚠️ WS error (${ws.id}):`, err));
}

module.exports = { handleConnection };
