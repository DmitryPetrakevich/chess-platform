const rooms = new Map();
const { Chess } = require("chess.js");

/**
 * Класс для управления шахматным таймером в игровой комнате.
 * Обеспечивает синхронизированный отсчет времени для обоих игроков.
 */
class RoomTimer {
  constructor(initialTime = 300, initialIncrement = 0) { // 10 минут по умолчанию
    this.whiteTime = initialTime;
    this.blackTime = initialTime;
    this.increment = initialIncrement;
    this.lastUpdate = Date.now();
    this.currentTurn = 'w';
    this.isRunning = false;
    this.intervalId = null;
    this.preStartTime = 15; 
    this.preStartIntervalId = null;
    this.gameStarted = false;
    this.broadcastPreStartUpdate = null;
  }

  startPreStart(onExpired) {
    this.preStartIntervalId = setInterval(() => {
      this.preStartTime -= 1;
      
      if (this.broadcastPreStartUpdate) {
        this.broadcastPreStartUpdate();
      }
      
      if (this.preStartTime <= 0) {
        this.stopPreStart();
        onExpired?.(); 
      }
    }, 1000);
  }

  /**
   * Останавливает претаймер (когда сделан первый ход)
   */
  stopPreStart() {
    if (this.preStartIntervalId) {
      clearInterval(this.preStartIntervalId);
      this.preStartIntervalId = null;
    }
    this.gameStarted = true;
  }

  /**
   * Возвращает данные претаймера
   */
  getPreStartData() {
    return {
      preStartTime: this.preStartTime,
      gameStarted: this.gameStarted
    };
  }

  /**
   * Запускает таймер и начинает отсчет времени для активного игрока.
   * Если таймер уже запущен, метод ничего не делает.
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdate = Date.now();
  }

  /**
   * Основной метод обновления времени. Вызывается каждую секунду.
   * Уменьшает время активного игрока и проверяет окончание времени.
   * @returns {Object|null} Объект с информацией об окончании времени или null, если время еще есть.
   * @property {boolean} timeOut - true, если время у кого-то закончилось.
   * @property {string} winner - Цвет победителя ('w' или 'b').
   */
  tick() {
  if (!this.isRunning) {
      const winner = this.whiteTime <= 0 ? 'b' : 'w';
      this.stop();
      return { timeOut: true, winner };
  }

  const now = Date.now();
  const elapsedSeconds = Math.floor((now - this.lastUpdate) / 1000);

  if (elapsedSeconds > 0) {
    if (this.currentTurn === 'w') {
      this.whiteTime = Math.max(0, this.whiteTime - elapsedSeconds);
    } else {
      this.blackTime = Math.max(0, this.blackTime - elapsedSeconds);
    }

    this.lastUpdate = now;

    if (this.whiteTime <= 0 || this.blackTime <= 0) {
      const winner = this.whiteTime <= 0 ? 'b' : 'w';
      this.stop();
      return { timeOut: true, winner };
    }
  }

  return null;
}

  /**
   * Переключает активного игрока и сбрасывает отсчет времени для нового хода.
   * @param {string} newTurn - Новый активный игрок ('w' или 'b').
   */
  switchTurn(newTurn) {
    this.currentTurn = newTurn;
    this.lastUpdate = Date.now();

    if (newTurn === 'w') {
      this.blackTime += this.increment;
    } else {
      this.whiteTime += this.increment;
    }
  }

  /**
   * Останавливает таймер и очищает интервал.
   */
  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      this.intervalId = null;
    }
  }

  /**
   * Возвращает текущее состояние времени с учетом прошедшего времени с последнего обновления.
   * @returns {Object} Объект с актуальным временем игроков и состоянием таймера.
   * @property {number} whiteTime - Оставшееся время белых в секундах.
   * @property {number} blackTime - Оставшееся время черных в секундах.
   * @property {string} currentTurn - Текущий активный игрок ('w' или 'b').
   * @property {boolean} isRunning - Запущен ли таймер.
   */
  getCurrentTime() {
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
function addClientToRoom(roomId, ws, preferredColor = "random", timeString = null) {
    if (!rooms.has(roomId)) {
      let initialTime = 600; 
      let increment = 0;     

      if (timeString) {
        const [minutes, inc] = timeString.split('+').map(Number);
        if (!isNaN(minutes) && !isNaN(inc)) {
          initialTime = minutes * 60; 
          increment = inc;           
        }
      }

      rooms.set(roomId, {
        players: new Set(),
        white: null,
        black: null,
        turn: "w",
        timer: new RoomTimer(initialTime, increment), 
        timeControl: timeString || "10+0", 
        game: new Chess(),
        history: [],
        fen: new Chess().fen(),
        isGameOver: false,      
        result: null,
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

