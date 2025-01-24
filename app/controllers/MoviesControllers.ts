import Movie from "../models/Movies"

const Movies_Per_Page = 20;

class Movies {

    static async fetchMoives(req, res, next) {
        const page: number = req.query.page || 1;
        const movies = await Movie.find().limit(Movies_Per_Page).skip((page - 1) * Movies_Per_Page);
        if (!movies) {
            return res.status(404).json({ message: 'No Movies Found' })
        }

        res.status(200).json({ message: 'we got you some movies', movies: movies });
    }
}


export default Movies;