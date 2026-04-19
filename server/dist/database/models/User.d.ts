import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    wins: number;
    losses: number;
    createdAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map