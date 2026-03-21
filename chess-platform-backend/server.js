const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const pool = require("./src/config/db");

const corsMiddleware = require("./src/middleware/cors");
const { handleConnection } = require("./src/ws/handlers");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const gamesRoutes = require("./src/routes/gamesRoutes")
const usersRoutes = require("./src/routes/usersRoutes");
const app = express();
app.use(express.json());
app.use(corsMiddleware);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/games", gamesRoutes)
app.use('/api/users', usersRoutes)

app.get("/", (req, res) => {
  res.json({ message: "Шахматный сервер работает!" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wss.on("connection", handleConnection);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || "development"}`);
});
