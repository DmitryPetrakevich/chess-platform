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

app.use("/auth", authRoutes)
app.use("/users", userRoutes)

app.get("/", (req, res) => {
  res.json({ message: "Шахматный сервер работает!" });
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

// --- rooms: Map<roomId, Set<WebSocket>> ---
const rooms = new Map();

function generateClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function addClientToRoom(roomId, ws) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  const set = rooms.get(roomId);
  set.add(ws);
  ws.roomId = roomId;
  return set.size;
}

function removeClientFromRoom(roomId, ws) {
  if (!roomId || !rooms.has(roomId)) return;
  const set = rooms.get(roomId);
  set.delete(ws);
  delete ws.roomId;
  if (set.size === 0) rooms.delete(roomId);
}

function broadcastToRoom(roomId, data, excludeWs = null) {
  if (!rooms.has(roomId)) return;
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  rooms.get(roomId).forEach((client) => {
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
      const text = message.toString();
      console.log("📨 RAW message:", text);

      const data = JSON.parse(text);
      console.log("📩 Parsed data:", data);

      // --- клиент подключается к комнате ---
      if (data.type === "join") {
        const { roomId, name } = data;
        const playersCount = addClientToRoom(roomId, ws);
        console.log(`👥 ${name} присоединился к комнате ${roomId}. Игроков в комнате: ${playersCount}`);

        ws.send(JSON.stringify({
          type: "joined",
          roomId,
          clientId: ws.id,
          playersCount
        }));

        broadcastToRoom(roomId, {
          type: "player_joined",
          clientId: ws.id,
          name
        }, ws);
      }

      // --- ход игрока ---
      else if (data.type === "move") {
        const { roomId, move } = data;
        console.log(`♟️ Ход в комнате ${roomId}:`, move);

        // рассылаем ход всем, кроме отправителя
        broadcastToRoom(roomId, {
          type: "move",
          move
        }, ws);
      }

      else {
        console.warn("❌ Unknown type:", data.type);
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

  ws.on("error", (err) => {
    console.error(`⚠️ WS error (${ws.id}):`, err);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:3000`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || "development"}`);
});
