const rooms = new Map();


/**
 * Таймер сервис для управления временем
 */
class RoomTimer {
  constructor(initialTime = 300) { // 10 минут по умолчанию
    this.whiteTime = initialTime;
    this.blackTime = initialTime;
    this.lastUpdate = Date.now();
    this.currentTurn = 'w';
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdate = Date.now();
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    if (!this.isRunning) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastUpdate) / 1000);
    
    if (elapsedSeconds > 0) {
      if (this.currentTurn === 'w') {
        this.whiteTime = Math.max(0, this.whiteTime - elapsedSeconds);
      } else {
        this.blackTime = Math.max(0, this.blackTime - elapsedSeconds);
      }
      
      this.lastUpdate = now;

      // Проверка на окончание времени
      if (this.whiteTime <= 0 || this.blackTime <= 0) {
        this.stop();
        return { timeOut: true, winner: this.whiteTime <= 0 ? 'b' : 'w' };
      }
    }

    return null;
  }

  switchTurn(newTurn) {
    this.currentTurn = newTurn;
    this.lastUpdate = Date.now();
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getCurrentTime() {
    // Рассчитываем актуальное время
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastUpdate) / 1000);
    
    let whiteTime = this.whiteTime;
    let blackTime = this.blackTime;

    if (this.isRunning) {
      if (this.currentTurn === 'w') {
        whiteTime = Math.max(0, whiteTime - elapsedSeconds);
      } else {
        blackTime = Math.max(0, blackTime - elapsedSeconds);
      }
    }

    return {
      whiteTime,
      blackTime,
      currentTurn: this.currentTurn,
      isRunning: this.isRunning
    };
  }
}

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
      timer: new RoomTimer(60) // 10 минут на игрока 
    });
  }

  const room = rooms.get(roomId);
  room.players.add(ws);
  ws.roomId = roomId;

  const whiteTaken = !!room.white;
  const blackTaken = !!room.black;

  if (preferredColor === "w" && !whiteTaken) {
    room.white = ws;
    ws.color = "w";
  } 
  else if (preferredColor === "b" && !blackTaken) {
    room.black = ws;
    ws.color = "b";
  } 
  else {
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

