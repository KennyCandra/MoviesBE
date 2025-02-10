import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMovie extends Document {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    reviews: mongoose.Types.Array<Schema.Types.ObjectId>
}

const MovieSchema = new Schema<IMovie>({
    adult: {
        type: Boolean,
        required: true
    },
    backdrop_path: {
        type: String,
        required: true
    },
    genre_ids: {
        type: [Number],
        required: true,
    },
    id: {
        type: Number,
        required: true,
        unique: true
    },
    original_language: {
        type: String,
        required: true
    },
    original_title: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    popularity: {
        type: Number,
        required: true
    },
    poster_path: {
        type: String,
        required: true
    },
    release_date: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    video: {
        type: Boolean,
        required: true
    },
    vote_average: {
        type: Number,
        required: true
    },
    vote_count: {
        type: Number,
        required: true
    }
});

const Movie = mongoose.model<IMovie>('movies', MovieSchema);

export default Movie;