import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  randomString: string;
}

const RefreshToken = new Schema<IRefreshToken>({
  userId: {
    required: true,
    ref: "user",
    type: Schema.Types.ObjectId,
  },
  randomString: {
    required: true,
    type: String,
  },
});

const RefreshTokenModel = mongoose.model<IRefreshToken>(
  "refreshToken",
  RefreshToken
);

export default RefreshTokenModel;
