# Dungeon Architect Architecture

## Workspace Layout

- `client/`: React frontend for lobby, matchmaking, game board, and live updates
- `server/`: backend API, WebSocket gateway, game engine, and persistence layer

## Client Model

The client is responsible for:

- Authentication flows and session bootstrap
- Lobby and matchmaking screens
- Rendering dungeon state, hand, turn controls, and combat feedback
- Sending player actions to the server
- Receiving real-time state updates over WebSockets

Suggested client flow:

1. Fetch authenticated user and active session data from REST endpoints
2. Connect to the game socket once the player enters a lobby or match
3. Store normalized game state for the active match
4. Render game UI from server-authoritative state
5. Send actions such as `play-card`, `end-turn`, or `leave-game`

## Server Model

The server is responsible for:

- Authentication and authorization
- Lobby creation and matchmaking
- Validating moves and enforcing turn order
- Running the game engine and card effects
- Persisting game state, logs, and results
- Broadcasting authoritative updates to clients

Suggested backend flow:

1. REST API creates or joins a game session
2. Realtime gateway subscribes players to a game room
3. Game engine validates and applies actions
4. Repositories persist the updated game state
5. WebSocket layer broadcasts the new state and logs

## Shared Domain Concepts

- `User`: authenticated account holder
- `Player`: a user's in-game representation inside one game session
- `GameSession`: lifecycle of a multiplayer match
- `Deck`: draw pile for a game or player, depending on final rules
- `Card`: base type for room, trap, monster, and disaster cards
- `Dungeon`: a player's board state and durability
- `GameLog`: event history for replay and audit
