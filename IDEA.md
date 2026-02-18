# Dungeon Architect – Project Idea

## Overview
Dungeon Architect is a real-time / turn-based multiplayer card game where players design and expand their own dungeon using strategic cards while sabotaging opponents. Players place rooms, traps, and monsters to strengthen their dungeon and use disaster cards to damage rival dungeons. The last dungeon standing wins.

## Scope
This is a full-stack application with backend as the main focus. The backend will manage:
- Authentication & authorization
- Multiplayer game sessions
- Real-time game state updates
- Card logic & validation
- Matchmaking & lobby system
- Turn management
- Game logs & replays

Frontend will handle:
- Game UI
- Dungeon visualization
- Player actions
- Live updates via WebSockets

## Key Features
- User registration & login
- Lobby & matchmaking
- Multiplayer matches
- Turn-based / real-time gameplay
- Card system (rooms, traps, monsters, disasters)
- Dungeon health & win condition
- Realtime sync
- Leaderboard & stats

## Tech Stack (Proposed)
Backend:
- Node.js (Express / NestJS)
- WebSockets (Socket.IO)
- PostgreSQL / MongoDB
- JWT Auth

Frontend:
- React
- TailwindCSS

## Architecture Principles
- Layered architecture (controllers, services, repositories)
- OOP principles
- Factory Pattern for card creation
- Observer Pattern for game state updates
- Singleton Game Engine

## Future Scope
- AI bots
- Ranked matches
- Spectator mode
- Card marketplace
