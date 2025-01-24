import Genre from "../models/Genres";

class GenreController {
    static async getGenres(req, res) {
        const Genres = await Genre.find();

        if (Genres.length === 0) {
            return res.status(404).json({ message: 'No Genres Found' });
        }

        res.status(200).json({ message: 'we got you some genres', genres: Genres });
    }
}

export default GenreController;