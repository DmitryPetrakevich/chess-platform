const { generateClientId } = require("../utils/id");
const { rooms, addClientToRoom, removeClientFromRoom, broadcastToRoom } = require("./rooms");

/**
 * Обработка подключения нового клиента
 */
function handleConnection(ws) {
  ws.id = generateClientId();
  console.log(`🟢 WS connected: ${ws.id}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Parsed data:", data);

      if (data.type === "join") {
        const { roomId, name, color: preferredColor } = data;
        const playersCount = addClientToRoom(roomId, ws, preferredColor);

        console.log(`👥 ${name} присоединился к комнате ${roomId}. Игроков: ${playersCount}`);

        ws.send(JSON.stringify({
          type: "joined",
          roomId,
          clientId: ws.id,
          color: ws.color,
          playersCount,
        }));

        broadcastToRoom(roomId, {
          type: "player_joined",
          clientId: ws.id,
          name,
          color: ws.color,
        }, ws);

        const room = rooms.get(roomId);
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
      }

      else if (data.type === "move") {
        const { roomId, move } = data;
        const room = rooms.get(roomId);
        if (!room) return;

        if ((room.turn === "w" && ws !== room.white) ||
            (room.turn === "b" && ws !== room.black)) {
          ws.send(JSON.stringify({ type: "error", message: "Not your turn" }));
          return;
        }

        console.log(`♟️ Ход в комнате ${roomId}:`, move);

        room.turn = room.turn === "w" ? "b" : "w";

        broadcastToRoom(roomId, {
          type: "move",
          move,
          nextTurn: room.turn,
        }, ws);
      }

      else {
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
