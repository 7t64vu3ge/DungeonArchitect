```mermaid
erDiagram
    USERS ||--o{ PLAYERS : has
    GAMES ||--o{ PLAYERS : includes
    GAMES ||--|| DECKS : has
    DECKS ||--o{ DECK_CARDS : contains
    CARDS ||--o{ DECK_CARDS : used_in
    PLAYERS ||--|| DUNGEONS : owns
    DUNGEONS ||--o{ DUNGEON_ELEMENTS : contains
    GAMES ||--o{ GAME_LOGS : generates

    USERS {
        int id PK
        string username
        string email
        string password_hash
    }

    GAMES {
        int id PK
        string status
        datetime created_at
        datetime ended_at
    }

    PLAYERS {
        int id PK
        int user_id FK
        int game_id FK
        int health
    }

    CARDS {
        int id PK
        string name
        string type
        int cost
    }

    DECKS {
        int id PK
        int game_id FK
    }

    DECK_CARDS {
        int id PK
        int deck_id FK
        int card_id FK
    }

    DUNGEONS {
        int id PK
        int player_id FK
        int health
    }

    DUNGEON_ELEMENTS {
        int id PK
        int dungeon_id FK
        string type
        int card_id FK
    }

    GAME_LOGS {
        int id PK
        int game_id FK
        string action
        datetime created_at
    }
