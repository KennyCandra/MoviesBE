import mongoose from "mongoose";
import Genre from "../models/Genres";
import Movie from "../models/Movies"
import { Request, Response, NextFunction } from 'express';

const Movies_Per_Page = 20;

declare module "express-serve-static-core" {
    interface Request {
        sort_by: string;
        with_genres: string[];
        page: string;
    }
}
class Movies {
    static async fetchMoives(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page || 1;
            const movies = await Movie.find().limit(Movies_Per_Page).skip((+page - 1) * Movies_Per_Page);
            if (!movies) {
                res.status(404).json({ message: 'No Movies Found' })
            }
            res.status(200).json({ message: 'we got you some movies', movies: movies });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async searchMovies(req: Request, res: Response, next: NextFunction) {
        try {

            const { with_genres } = req.query;
            let movies: Movies[] = [];
            const convertedGenres = Array.isArray(with_genres) ? with_genres.map((genre: string) => +genre) : [];
            movies = await Movie.find({ genre_ids: { $all: convertedGenres } });

            res.status(200).json({ message: 'we got you some movies', movies: movies });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async getMovieById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const movie = await Movie.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
                { $lookup: { from: 'genres', localField: 'genre_ids', foreignField: 'id', as: 'genres' } }
            ]);
            if (!movie) {
                res.status(404).json({ message: 'Movie Not Found' });
            }
            res.status(200).json({ message: 'we got you the movie', movie: movie });
        } catch (error) {
            console.log(error);
        }
    }


    static async searchMoviesHeader(req: Request, res: Response, next: NextFunction) {
        try {
            const { value } = req.query;
            const movies: Movies =  await Movie.find({ title: { $regex: value, $options: 'i' } });
            res.status(200).json({ message: 'we got you some movies', movies: movies });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}


export default Movies;