"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const socket_gateway_1 = require("./realtime/socket-gateway");
const unit_registry_1 = require("./engine/cards/unit-registry");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});
// ── Middleware ─────────────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ── Serve card assets statically ──────────────
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "../../client/assets")));
// ── REST routes ───────────────────────────────
app.use("/api/auth", auth_routes_1.default);
// Card catalog endpoint (no auth required)
app.get("/api/cards/defense", (_req, res) => {
    res.json(unit_registry_1.DEFENSE_CARDS);
});
app.get("/api/cards/attack", (_req, res) => {
    res.json(unit_registry_1.ATTACK_CARDS);
});
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});
// ── Socket.IO ─────────────────────────────────
(0, socket_gateway_1.initSocketGateway)(io);
// ── Connect to MongoDB & start server ─────────
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dungeonarchitect";
mongoose_1.default
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
//# sourceMappingURL=index.js.map