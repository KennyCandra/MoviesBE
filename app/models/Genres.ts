import mongoose, { Document, Schema } from "mongoose";

interface IGenre extends Document {
    name: string
    id: number
}

const genreSchema = new Schema<IGenre>({
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

const Genre = mongoose.model<IGenre>('genres', genreSchema);

export default Genre;