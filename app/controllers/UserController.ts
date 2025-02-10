import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "../models/User";
import { sign } from "jsonwebtoken";
import { validationResult } from "express-validator";
import Movie from "../models/Movies";
import crypto from "crypto";
import createHttpError from "http-errors";
import RefreshTokenModel from "../models/RefreshToken";
import { verifyToken } from "../helpers/verifyToken";
declare module "express-serve-static-core" {
  interface Request {
    sort_by: string;
    with_genres: string[];
    page: string;
    decodedToken: any;
  }
}

const refreshTokenString =
  "3ad024f6ed910bd47b35e132a4876f372d0031d2b0f2347cf4149547688c093a45bbe68bd34389beb02a8b8db104b002d59102606634754b1c877c4f63714d8c";
const accessTokenString =
  "a2b3294e0a740f21bb3d78021eaea67d0e2c09a7c4767f37baa689136a1081a4abab27f4b7fa0fdda2936a7bcc566cc45327c5cbb8da44144cdab687bd3b09a9";

class User {
  static async signUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(422)
          .json({ message: "Invalid Inputs", errors: errors.array() });
        return;
      }
      const { name, email, password } = req.body;
      const existingUser = await UserModel.findOne({ email: email });
      if (existingUser) {
        res.status(409).json({ message: "User Already Exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new UserModel({
        name,
        email,
        password: hashedPassword,
      });
      await user.save();
      res.status(201).json({ message: "User Created" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const user: IUser = await UserModel.findOne({ email });

      if (!user) {
        const error = new createHttpError.NotFound("User Not Found");
        throw error;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json({ message: "Invalid Password" });
        return;
      }

      const accessToken = sign(
        { userId: user._id },
        "veryverysuperhardsecretkeyyoucannotexpectit",
        { expiresIn: "15s" }
      );

      const randomString = crypto.randomBytes(40).toString("hex");

      const oldRefreshToken = await RefreshTokenModel.findOneAndDelete({ userId: user._id });

      const refreshToken = sign(
        { userId: user._id, randomString: randomString },
        "veryverysuperhardsecretkeyyoucannotexpectit",
        { expiresIn: "60d" }
      );

      const refreshTokenDocument = new RefreshTokenModel({
        userId: user._id,
        randomString: randomString,
      });

      await refreshTokenDocument.save();

      res.cookie("accessToken", accessToken, {
        secure: false,
        sameSite: "lax",
      });


      res.cookie("refreshToken", refreshToken, {
        secure: false,
        sameSite: "lax",
      });

      const userWithoutPassword: IUser = user.toObject();
      delete userWithoutPassword.password;
      delete userWithoutPassword.lists;
      delete userWithoutPassword.watchList;
      delete userWithoutPassword.ratedMovies;
      delete userWithoutPassword.reviwes;

      res.status(200).json({
        message: "User Logged In",
        user: userWithoutPassword,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addToWatchList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { movieId, userId } = req.body;
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        res.status(404).json({ message: "Movie Not Found" });
        return;
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      if (user.watchList.includes(movieId)) {
        res.status(409).json({ message: "Movie Already In WatchList" });
        return;
      }

      user.watchList.push(movieId);
      await user.save();
      res.status(200).json({ message: "Movie Added To WatchList", movie });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async removeFromWatchList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { movieId } = req.body;
    try {
      const user = await UserModel.findById(req.body.userId);
      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }
      user.watchList.pull(movieId);
      await user.save();
      res.status(200).json({ message: "Movie Removed From WatchList", user });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getWatchList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { userId } = req.params;
    try {
      const user: IUser = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }
      res
        .status(200)
        .json({ message: "User WatchList", watchList: user.watchList });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async checkToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.status(200).json({ message: "Token Is Valid", cookies: req.cookies });
  }

  static async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { userId } = req.body;
    try {
      const user: IUser = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      const userWithoutPassword: IUser = user.toObject();
      delete userWithoutPassword.password;
      delete userWithoutPassword.lists;
      delete userWithoutPassword.watchList;
      delete userWithoutPassword.ratedMovies;
      delete userWithoutPassword.reviwes;
      res
        .status(200)
        .json({ message: "User Found", user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async sendRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { refreshToken } = req.cookies;
    const { decodedToken, expired } = await verifyToken(refreshToken);

    if (expired) {
      res.status(401).json({ message: "Not Authenticated cuz expired" });
      return
    }

    const refreshTokenDoc = await RefreshTokenModel.findOne({ userId: decodedToken.userId });

    if (!refreshTokenDoc) {
      res.status(401).json({ message: "Not Authenticated" });
      return
    }

    if (refreshTokenDoc.randomString.toString() != decodedToken.randomString.toString()) {
      res.status(401).json({ message: "Not Authenticated cuz random string is not the same" });
      return
    }

    const accessToken = sign({ userId: decodedToken.userId }, 'veryverysuperhardsecretkeyyoucannotexpectit', { expiresIn: "15s" })
    const randomString = crypto.randomBytes(40).toString("hex");

    const newRefreshToken = sign({ userId: decodedToken.userId, randomString: randomString }, 'veryverysuperhardsecretkeyyoucannotexpectit', { expiresIn: "60d" })

    refreshTokenDoc.randomString = randomString;
    await refreshTokenDoc.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({ message: "Token Refreshed" })
    return

  }
}

export default User;
