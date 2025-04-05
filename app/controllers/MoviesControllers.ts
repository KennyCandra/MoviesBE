import mongoose from "mongoose";
import Genre from "../models/Genres";
import Movie, { IMovie } from "../models/Movies"
import { Request, Response, NextFunction } from 'express';
import { title } from "process";

const Movies_Per_Page = 20;

declare module "express-serve-static-core" {
    interface Request {
        sort_by: string;
        with_genres: string[];
        page: string;
        decodedToken: any;
    }
}
class Movies {
    static async fetchMoives(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page || 1;
            const movies = await Movie.aggregate([
                { $skip: (+page - 1) * Movies_Per_Page },
                { $limit: Movies_Per_Page },
                {
                    $lookup: {
                        foreignField: 'id',
                        localField: "genre_ids",
                        as: 'genres',
                        from: 'genres'
                    }
                }, {
                    $addFields: {
                        genres: {
                            $map: {
                                input: "$genres",
                                as: "genre",
                                in: "$$genre.name"
                            }
                        }
                    }
                }, {
                    $project: {
                        genre_ids: 0,
                        adult: 0,
                        popularity: 0,
                        __v: 0,
                        vote_count: 0,
                        vote_average: 0,
                        video: 0,
                        poster_path: 0,
                        original_language: 0,
                        id: 0,
                        overview: 0,
                        original_title: 0
                    }
                }
            ])
            if (!movies) {
                res.status(404).json({ message: 'No Movies Found' })
            }
            res.status(200).json({ message: 'we got you some movies', movies: movies, pageNumber: page });
        } catch (error) {
            next(error)
        }
    }

    static async searchMovies(req: Request, res: Response, next: NextFunction) {
        try {

            const { with_genres } = req.query;
            let movies: Movies[] = [];
            const convertedGenres = Array.isArray(with_genres) ? with_genres.map((genre: string) => +genre) : [];
            movies = await Movie.find({ genre_ids: { $all: with_genres } });

            res.status(200).json({ message: 'we got you some movies', movies: movies });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async getMovieById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const [movie] = await Movie.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
                { $lookup: { from: 'genres', localField: 'genre_ids', foreignField: 'id', as: 'genres' } },
                {
                    $addFields: {
                        genres: { $map: { input: "$genres", as: "genre", in: "$$genre.name" } }
                    }
                }, {
                    $project: {
                        genre_ids: 0,
                        id: 0,
                        video: 0
                    }
                }
            ]) as IMovie[];


            if (!movie) {
                res.status(404).json({ message: 'Movie Not Found' });
            }

            res.status(200).json({ message: 'we got you the movie', movie });
        } catch (error) {
            next(error)
        }
    }


    static async searchMoviesHeader(req: Request, res: Response, next: NextFunction) {
        try {
            const { value } = req.query;
            const movies: Movies = await Movie.find({ title: { $regex: value, $options: 'i' } });
            res.status(200).json({ message: 'we got you some movies', movies: movies });
        } catch (error) {
            next(error)
        }
    }
}


export default Movies;