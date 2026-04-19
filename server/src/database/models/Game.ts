import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  gameId: string;
  playerIds: string[];
  winnerId: string | null;
  phase: string;
  stateSnapshot: string;  // JSON stringified GameState
  createdAt: Date;
  endedAt: Date | null;
}

const GameSchema = new Schema<IGame>({
  gameId:     { type: String, required: true, unique: true },
  playerIds:  [{ type: String, required: true }],
  winnerId:   { type: String, default: null },
  phase:      { type: String, default: "waiting" },
  stateSnapshot: { type: String, default: "{}" },
  createdAt:  { type: Date, default: Date.now },
  endedAt:    { type: Date, default: null },
});

export const Game = mongoose.model<IGame>("Game", GameSchema);
