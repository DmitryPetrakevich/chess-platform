const express = require("express");
const app = express();
const pool = require("./src/config/db");

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:3000`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || "development"}`);
});