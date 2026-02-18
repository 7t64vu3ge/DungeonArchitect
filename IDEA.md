# 🏰 Dungeon Architect – Multiplayer Card-Based Strategy Game

## Concept
Dungeon Architect is a real-time / turn-based multiplayer card game where players build their own dungeon using cards while sabotaging opponents.

Players strategically place rooms, traps, and monsters while deploying disaster cards to damage rival dungeons. The last dungeon standing wins.

---

## Core Mechanics
- Multiplayer game rooms (2–4 players)
- Turn-based card play
- Dungeon building using Room Cards
- Player sabotage using Trap / Monster / Disaster cards
- Health-based dungeon destruction
- Real-time updates via WebSockets

---

## Tech Stack
### Frontend
- React + TypeScript
- WebSockets for real-time updates
- Game board UI
- Lobby system

### Backend
- Express + TypeScript
- WebSocket server
- Game engine (server authoritative)
- Matchmaking service
- In-memory game state (Redis later)

---

## OOP Architecture
- Abstract Card base class
- Specialized card types (Trap, Monster, Disaster, Room)
- GameRoom manages state & turn order
- Dungeon composed of DungeonRooms
- Effect pipeline for resolving card effects

---

## Advanced Features
- Match replays (event sourcing)
- Reconnection handling
- Anti-cheat validation (server authority)
- Bot players
- Ranked matchmaking
- Spectator mode

---

## Future Improvements
- Deck building system
- Player progression & XP
- Card rarity & upgrades
- AI dungeon defenders
- Tournament mode

---

## Learning Outcomes
- Multiplayer architecture
- WebSocket protocol design
- OOP design patterns
- Game state synchronization
- Backend-heavy system design
- Clean architecture with TypeScript

---

## UML & Diagrams
See `/docs/diagrams.md` for:
- Class Diagram
- Sequence Diagram
- Use Case Diagram
- ER Diagram
