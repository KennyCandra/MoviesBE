import mongoose, { Schema } from "mongoose";

interface ITopMovie {
    movieId: mongoose.Types.ObjectId
}


const TheTopMovies = new Schema<ITopMovie>({
    movieId: {
        type: Schema.Types.ObjectId,
        ref: 'movies',
        required: true,
    }
})

const TopMovies = mongoose.model('TopMovies', TheTopMovies);

export default TopMovies;