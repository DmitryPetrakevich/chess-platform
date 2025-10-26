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

  // Определяем, какие цвета уже заняты
  const whiteTaken = !!room.white;
  const blackTaken = !!room.black;

  // 1Попытка назначить по желанию игрока
  if (preferredColor === "w" && !whiteTaken) {
    room.white = ws;
    ws.color = "w";
  } 
  else if (preferredColor === "b" && !blackTaken) {
    room.black = ws;
    ws.color = "b";
  } 
  else {
    // Если цвет random или желаемый уже занят — назначаем автоматически
    if (!whiteTaken) {
      room.white = ws;
      ws.color = "w";
    } else if (!blackTaken) {
      room.black = ws;
      ws.color = "b";
    } else {
      // комната полная
      ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
      return room.players.size;
    }
  }

  console.log(`🎨 Игроку ${ws.id} назначен цвет: ${ws.color} (room: ${roomId})`);
  return room.players.size;
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

