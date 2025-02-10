import Genre from "../models/Genres";
import { Request, Response, NextFunction } from 'express';

class GenreController {
    static async getGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const Genres = await Genre.find();
            res.status(200).json({ message: 'we got you some genres', genres: Genres });
        } catch (error) {
            next(error)
        }
    }
}

export default GenreController;