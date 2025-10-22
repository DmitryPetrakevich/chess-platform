const rooms = new Map();

/**
 * Добавляет клиента в указанную комнату и назначает цвет фигур
 */
function addClientToRoom(roomId, ws, preferredColor = "random") {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      players: new Set(),
      white: null,
      black: null,
      turn: "w",
    });
  }

  const room = rooms.get(roomId);
  room.players.add(ws);
  ws.roomId = roomId;

  const size = room.players.size;

  if (size === 1) {
    if (preferredColor === "b") {
      room.black = ws;
      ws.color = "b";
    } else {
      room.white = ws;
      ws.color = "w";
    }
  } else if (size === 2) {
    if (room.white && !room.black) {
      room.black = ws;
      ws.color = "b";
    } else if (room.black && !room.white) {
      room.white = ws;
      ws.color = "w";
    } else {
      ws.color = room.white ? "b" : "w";
      ws.color === "w" ? (room.white = ws) : (room.black = ws);
    }
  }
  return size;
}

/**
 * Удаляет клиента из комнаты
 */
function removeClientFromRoom(roomId, ws) {
  if (!roomId || !rooms.has(roomId)) return;
  const room = rooms.get(roomId);
  room.players.delete(ws);
  delete ws.roomId;

  if (room.white === ws) room.white = null;
  if (room.black === ws) room.black = null;

  if (room.players.size === 0) rooms.delete(roomId);
}

/**
 * Рассылает сообщение всем клиентам комнаты
 */
function broadcastToRoom(roomId, data, excludeWs = null) {
  if (!rooms.has(roomId)) return;
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  rooms.get(roomId).players.forEach(client => {
    if (client.readyState === 1 && client !== excludeWs) {
      client.send(payload);
    }
  });
}

module.exports = {
  rooms,
  addClientToRoom,
  removeClientFromRoom,
  broadcastToRoom,
};

