import mongoose, { Schema } from "mongoose";


const TheTopMovies = new Schema({
    movieId: {
        type: Schema.Types.ObjectId,
        ref: 'movies',
        required: true,
    }
})

const TopMovies = mongoose.model('TopMovies', TheTopMovies);

export default TopMovies;