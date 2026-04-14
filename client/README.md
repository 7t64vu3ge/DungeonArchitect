# Client Structure

- `src/app`: app bootstrap and providers
- `src/api`: HTTP clients and request helpers
- `src/components`: shared presentational components
- `src/features`: feature modules such as auth, lobby, and game
- `src/hooks`: reusable React hooks
- `src/layouts`: page shells
- `src/pages`: route-level screens
- `src/socket`: WebSocket setup and event handlers
- `src/store`: client state management
- `src/types`: frontend-facing domain models
- `src/utils`: helpers and formatters

The client should treat the server as the source of truth for game state.
