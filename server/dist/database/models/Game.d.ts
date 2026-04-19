import mongoose, { Document } from "mongoose";
export interface IGame extends Document {
    gameId: string;
    playerIds: string[];
    winnerId: string | null;
    phase: string;
    stateSnapshot: string;
    createdAt: Date;
    endedAt: Date | null;
}
export declare const Game: mongoose.Model<IGame, {}, {}, {}, mongoose.Document<unknown, {}, IGame, {}, {}> & IGame & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Game.d.ts.map