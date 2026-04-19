import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./modules/auth/auth.routes";
import { initSocketGateway } from "./realtime/socket-gateway";
import { DEFENSE_CARDS, ATTACK_CARDS } from "./engine/cards/unit-registry";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ── Middleware ─────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve card assets statically ──────────────
app.use("/assets", express.static(path.join(__dirname, "../../client/assets")));

// ── REST routes ───────────────────────────────
app.use("/api/auth", authRoutes);

// Card catalog endpoint (no auth required)
app.get("/api/cards/defense", (_req, res) => {
  res.json(DEFENSE_CARDS);
});

app.get("/api/cards/attack", (_req, res) => {
  res.json(ATTACK_CARDS);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── Socket.IO ─────────────────────────────────
initSocketGateway(io);

// ── Connect to MongoDB & start server ─────────
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dungeonarchitect";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("[DB] Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[DB] MongoDB connection failed:", err.message);
    // Start server anyway (game works in-memory)
    server.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT} (no DB)`);
    });
  });
