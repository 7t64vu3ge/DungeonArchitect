# Server Structure

- `src/app`: application bootstrap
- `src/config`: environment and runtime configuration
- `src/common`: shared backend utilities, DTOs, guards, and middleware
- `src/database`: entities, repositories, migrations, and seeds
- `src/modules`: business modules grouped by feature
- `src/realtime`: WebSocket gateway and room coordination
- `src/engine`: game engine, rules, and state transitions
- `src/types`: backend domain types

The server owns validation, state transitions, persistence, and broadcasts.
