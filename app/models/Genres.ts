import mongoose, { Schema } from "mongoose";

const genreSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true,
        unique: true
    }
});

const Genre = mongoose.model('Genre', genreSchema);

export default Genre;