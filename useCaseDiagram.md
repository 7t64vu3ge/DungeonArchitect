# Use Case Diagram – Dungeon Architect

```mermaid
graph TD

Player -->|Register/Login| Auth[Authentication System]
Player -->|Create/Join Game| Lobby[Lobby System]
Player -->|Play Cards| Game[Game Engine]
Player -->|View Dungeon| Game
Player -->|End Turn| Game
Player -->|View History| History[Game History]

Admin -->|Manage Cards| Cards[Card Management]
Admin -->|Manage Rules| Rules[Game Rules]
Admin -->|Ban Players| Moderation[User Moderation]

Game -->|Validate Moves| Validator[Move Validator]
Game -->|Update State| State[Game State Manager]
Game -->|Broadcast Updates| Socket[WebSocket Server]
