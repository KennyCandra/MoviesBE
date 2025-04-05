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
import mongoose from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    sort_by: string;
    with_genres: string[];
    page: string;
    decodedToken: any;
  }
}

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
          .status(400)
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
        { userId: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const randomString = crypto.randomBytes(40).toString("hex");

      await RefreshTokenModel.findOneAndDelete({ userId: user._id });

      const refreshToken = sign(
        { userId: user._id, randomString: randomString },
        process.env.JWT_SECRET,
        { expiresIn: "60d" }
      );

      const refreshTokenDocument = new RefreshTokenModel({
        userId: user._id,
        randomString: randomString,
      });

      await refreshTokenDocument.save();

      res.cookie("refreshToken", refreshToken, {
        secure: true,
        sameSite: "lax",
        httpOnly: true,
      });

      const userWithoutPassword: IUser = user.toObject();
      userWithoutPassword.id = user._id;
      delete userWithoutPassword._id;
      delete userWithoutPassword.password;

      res.status(200).json({
        message: "User Logged In",
        user: userWithoutPassword,
        accessToken: accessToken
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

    console.log(movieId)
    try {

      if (!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(userId)) {
        const error = new createHttpError.NotAcceptable('not valid request')
        throw error
      }

      const movie = await Movie.findById(movieId);

      if (!movie) {
        const error = createHttpError[404]('movie not found')
        throw (error)
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        const error = new createHttpError[404]('user not found')
        throw error
      }

      if (user.watchList.includes(movieId)) {
        res.status(409).json({ message: "Movie Already In WatchList" });
        return;
      }

      user.watchList.push(movieId);
      await user.save();
      res.status(200).json({ message: "Movie Added To WatchList", movie });
    } catch (error) {
      next(error)
    }
  }

  static async removeFromWatchList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { movieId, userId } = req.body;
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        const error = new createHttpError[404]('user not found')
        throw error
      }

      const movie = await Movie.findById(movieId)

      if (!movie) {
        const error = new createHttpError[404]('movie not found')
        throw error
      }

      if(!user.watchList.includes(movieId)){
        const error = new createHttpError[409]("movie isn't in the list")
      }

      user.watchList.pull(movieId);
      await user.save();
      res.status(200).json({ message: "Movie Removed From WatchList", user });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async fetchWatchList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { userId } = req.params;
    try {

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new createHttpError.NotAcceptable('Not Authenticated')
        throw error
      }
      const userWithPopulatedWatchList = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },

        {
          $lookup: {
            from: "movies",
            localField: "watchList",
            foreignField: "_id",
            as: "watchList"
          }
        },

        { $unwind: "$watchList" },

        {
          $lookup: {
            from: "genres",
            localField: "watchList.genre_ids",
            foreignField: "id",
            as: "watchList.genres"
          }
        },

        {
          $addFields: {
            "watchList.genres": {
              $map: {
                input: "$watchList.genres",
                as: "genre",
                in: "$$genre.name"
              }
            }
          }
        },

        {
          $group: {
            _id: "$_id",
            watchList: { $push: "$watchList" }
          }
        },

        {
          $project: {
            _id: 0,
            watchList: 1
          }
        }
      ]);



      const userWithWatchList: IUser = userWithPopulatedWatchList[0];

      if (!userWithWatchList) {
        const error = new createHttpError[404]('user not found')
        throw error
      }

      res
        .status(200)
        .json({ message: "User WatchList", watchList: userWithWatchList.watchList });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
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
      userWithoutPassword.id = userWithoutPassword._id;
      delete userWithoutPassword._id
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

    const user: IUser = await UserModel.findById(decodedToken.userId)

    if (!user) {
      res.status(401).json({ message: "Not Found" });
      return
    }

    const accessToken = sign({ userId: decodedToken.userId }, process.env.JWT_SECRET, { expiresIn: "15m" })
    const randomString = crypto.randomBytes(40).toString("hex");

    const newRefreshToken = sign({ userId: decodedToken.userId, randomString: randomString }, process.env.JWT_SECRET, { expiresIn: "60d" })

    refreshTokenDoc.randomString = randomString;
    await refreshTokenDoc.save();

    const userWithoutPassword: IUser = user.toObject();
    userWithoutPassword.id = user._id;
    delete userWithoutPassword._id;
    delete userWithoutPassword.password;

    res.cookie("refreshToken", newRefreshToken, {
      secure: true,
      sameSite: "lax",
      httpOnly: true,
    });

    res.status(200).json({
      message: "Token Refreshed",
      accessToken: accessToken,
      user: user
    })
    return
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "Logged Out" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default User;
