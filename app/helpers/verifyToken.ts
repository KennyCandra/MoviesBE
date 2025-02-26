import pkg from "jsonwebtoken";

const { verify } = pkg;

export const verifyToken = async (
  token: string
): Promise<{ decodedToken: any; expired: boolean }> => {
  try {
    const decodedToken = verify(
      token,
      process.env.JWT_SECRET
    );
    return { decodedToken, expired: false };
  } catch (error) {
    return { decodedToken: null, expired: true };
  }
};
