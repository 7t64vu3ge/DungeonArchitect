"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../database/models/User");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ error: "username, email, and password are required" });
            return;
        }
        const existingUser = await User_1.User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            res.status(409).json({ error: "Username or email already exists" });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({ username, email, passwordHash });
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" });
        res.status(201).json({
            token,
            user: { id: user._id, username: user.username, email: user.email, wins: user.wins, losses: user.losses },
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "email and password are required" });
            return;
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" });
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email, wins: user.wins, losses: user.losses },
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map