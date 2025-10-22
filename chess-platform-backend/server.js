const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const pool = require("./src/config/db");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Шахматный сервер работает!" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- Map<roomId, { players: Set<WebSocket>, white: WebSocket|null, black: WebSocket|null, turn: "w"|"b" }> ---
const rooms = new Map();

/**
 * Генерирует уникальный идентификатор для клиента WebSocket
 */
function generateClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Добавляет клиента в указанную комнату и назначает цвет фигур
 * @param {string} roomId - Идентификатор комнаты
 * @param {WebSocket} ws - WebSocket соединение клиента
 * @param {"w"|"b"|"random"} preferredColor - Предпочтительный цвет игрока
 * @returns {number} Текущее количество игроков в комнате после добавления
 * @throws {Error} Если комната переполнена (больше 2 игроков)
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
 * Удаляет клиента из комнаты и очищает связанные данные
 * Если комната становится пустой - удаляет её из коллекции
 * @param {string} roomId - Идентификатор комнаты
 * @param {WebSocket} ws - WebSocket соединение клиента
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
 * Рассылает сообщение всем клиентам в указанной комнате
 * @param {string} roomId - Идентификатор комнаты для рассылки
 * @param {Object|string} data - Данные для отправки (объект или строка)
 * @param {WebSocket} [excludeWs=null] - Клиент, которому НЕ отправлять сообщение
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

wss.on("connection", (ws) => {
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
          playersCount
        }));

        broadcastToRoom(roomId, {
          type: "player_joined",
          clientId: ws.id,
          name,
          color: ws.color
        }, ws);

        const room = rooms.get(roomId);
        if (room.white && room.black) {
          room.turn = "w"; 

          broadcastToRoom(roomId, {
            type: "start_game",
            roomId,
            whiteId: room.white.id,
            blackId: room.black.id,
            turn: room.turn
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
          nextTurn: room.turn
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
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:3000`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || "development"}`);
});
