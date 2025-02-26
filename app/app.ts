import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import http from "http";
import bodyParser from "body-parser";
import genreRoute from "./routes/genreRoute";
import MoviesRoute from "./routes/MoviesRoute";
import ReviewsRoute from "./routes/ReviewRoute";
import TopMovies from "./models/TopMovies";
import UserRoute from "./routes/UserRoute";
import cors from "cors";
import ListsRoute from "./routes/ListsRoute";
import createHttpError from "http-errors";
import cookieParser from "cookie-parser";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use("/genre", genreRoute);
app.use("/movies", MoviesRoute);
app.use("/user", UserRoute);

app.use("/list", ListsRoute);
app.use("/reviews", ReviewsRoute);
app.get(
  "/top-movies",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const topMovies = await TopMovies.aggregate([
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: "movies"
        }
      },
      { $unwind: '$movies' },
      {
        $lookup: {
          from: "genres",
          localField: "movies.genre_ids",
          foreignField: "id",
          as: "movies.genres"
        }
      },
      {
        $addFields: {
          "movies.genres": {
            $map: {
              input: "$movies.genres",
              as: "genre",
              in: "$$genre.name"
            }
          }
        },
      },
      {
        $group: {
          _id: "$_id",
          topMovies: { $push: "$movies" }
        }
      },
      {
        $unwind: "$topMovies"
      },
      {
        $replaceRoot: { newRoot: "$topMovies" }
      }
    ])
    if (!topMovies) {
      res.status(404).json({ message: "No Movies Found" });
    }
    res.status(200).json({ message: "Top Movies", topMovies });
  }
);

app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let status: number = 500;
    let message: string = "Internal Server Error";

    if (createHttpError.isHttpError(err)) {
      status = err.statusCode;
      message = err.message;
    }
    res.status(status).json({ message: message });
  }
);

const server = http.createServer(app);
mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    server.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });
