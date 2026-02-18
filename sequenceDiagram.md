
<!-- ## 📄 `sequenceDiagram.md` -->


# Sequence Diagram – Main Game Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend
    participant B as Backend
    participant G as GameEngine
    participant DB as Database

    P->>F: Create / Join Game
    F->>B: API Request
    B->>DB: Create / Join Game Session
    DB-->>B: Success
    B-->>F: Game Created / Joined

    B->>G: Start Game
    G-->>B: Game Started
    B-->>F: Notify Players

    loop Each Turn
        P->>F: Play Card
        F->>B: POST /play-card
        B->>G: validateMove()
        G-->>B: Valid Move
        B->>DB: Update Game State
        B-->>F: Broadcast State Update
    end

    G-->>B: Game Over
    B->>DB: Save Results
    B-->>F: Announce Winner
