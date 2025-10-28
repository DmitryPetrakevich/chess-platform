const { generateClientId } = require("../utils/id");
const {
  rooms,
  addClientToRoom,
  removeClientFromRoom,
  broadcastToRoom,
} = require("./rooms");

function handleConnection(ws) {
  ws.id = generateClientId();
  console.log(`🟢 WS connected: ${ws.id}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Parsed data:", data);

      if (data.type === "join") {
        const { roomId, name, color: preferredColor } = data;

        ws.name = name || "Player";
        ws.color = preferredColor;

        const playersCount = addClientToRoom(roomId, ws, preferredColor);

        ws.send(
          JSON.stringify({
            type: "joined",
            roomId,
            clientId: ws.id,
            color: ws.color,
            playersCount,
          })
        );

        const room = rooms.get(roomId);

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
              rating: Math.floor(1000 + Math.random() * 500), // временный рейтинг
            },
          },
          ws
        );

        if (room.white && room.black) {
          room.turn = "w";
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

        room.turn = room.turn === "w" ? "b" : "w";

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
      removeClientFromRoom(ws.roomId, ws);
      broadcastToRoom(ws.roomId, { type: "player_left", clientId: ws.id });
    }
  });

  ws.on("error", (err) => console.error(`⚠️ WS error (${ws.id}):`, err));
}

module.exports = { handleConnection };
