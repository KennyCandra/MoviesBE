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
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use("/genre", genreRoute);
app.use("/movies", MoviesRoute);
app.use("/user", UserRoute);

app.use("/list", ListsRoute);
app.use("/reviews", ReviewsRoute);
app.get(
  "/top-movies",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const topMovies = await TopMovies.find().populate("movieId");
    if (!topMovies) {
      res.status(404).json({ message: "No Movies Found" });
    }
    res.status(200).json({ message: "Top Movies", movies: topMovies });
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
  .connect(
    "mongodb+srv://ahmedabdelepsfmti:gOFpFDCjChgW3Lbp@cluster0.h9ogb.mongodb.net/movies?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    server.listen(8001);
  });
