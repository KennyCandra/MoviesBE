import bcrypt from "bcrypt";
import RefreshToken from "../models/RefreshToken";
import mongoose from "mongoose";

const storeRefreshToken = async (
  userId: mongoose.Types.ObjectId,
  randomString: string
): Promise<boolean> => {
  try {
    const hashedString = await bcrypt.hash(randomString, 10);
    const refreshTokenDoc = new RefreshToken({
      userId,
      randomString: hashedString,
    });
    await refreshTokenDoc.save();
    return true;
  } catch (error) {
    return false;
  }
};

export default storeRefreshToken;
