import mongoose, { Schema } from "mongoose";
export interface IUser extends mongoose.Document {
    name: string,
    email: string,
    password: string
    lists: mongoose.Types.Array<Schema.Types.ObjectId>,
    watchList: mongoose.Types.Array<Schema.Types.ObjectId>,
    ratedMovies: mongoose.Types.Array<Schema.Types.ObjectId>,
    reviwes: mongoose.Types.Array<Schema.Types.ObjectId>,
    role : "user" | "admin";
}

const userScehma = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lists: {
        type: [Schema.Types.ObjectId],
        ref: 'List',
    },
    watchList: {
        type: [Schema.Types.ObjectId],
        ref: 'movies',
        default: []
    },
    ratedMovies: {
        type: [Schema.Types.ObjectId],
        ref: 'movies'
    },
    reviwes: {
        type: [Schema.Types.ObjectId],
        ref: 'reviews'
    },
    role:{
        default: 'user',
        type: String
    }
})


const user = mongoose.model<IUser>('User', userScehma)

export default user