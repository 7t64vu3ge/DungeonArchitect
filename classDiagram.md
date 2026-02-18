


```mermaid
classDiagram

class User {
  +id
  +username
  +email
  +passwordHash
  +login()
  +register()
}

class Player {
  +id
  +health
  +hand
  +drawCard()
  +playCard()
}

class GameSession {
  +id
  +status
  +currentTurn
  +startGame()
  +endGame()
}

class GameEngine {
  -activeGames
  +validateMove()
  +applyMove()
  +checkWinCondition()
}

class Card {
  <<abstract>>
  +id
  +name
  +cost
  +applyEffect()
}

class RoomCard
class TrapCard
class MonsterCard
class DisasterCard

class Deck {
  +cards
  +shuffle()
  +draw()
}

class Dungeon {
  +health
  +rooms
  +traps
  +monsters
  +applyDamage()
}

User --> Player
Player --> Dungeon
GameSession --> Player
GameSession --> Deck
GameEngine --> GameSession
Card <|-- RoomCard
Card <|-- TrapCard
Card <|-- MonsterCard
Card <|-- DisasterCard
