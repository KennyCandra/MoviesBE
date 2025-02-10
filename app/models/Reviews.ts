import mongoose, { Schema, Document } from "mongoose";

export interface IReviews extends Document {
    movieId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    review: string;
    rating: number;
}


const reviewSchema = new Schema<IReviews>({
    movieId: {
        type: Schema.Types.ObjectId,
        ref: 'Movies',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

export default mongoose.model<IReviews>('reviews', reviewSchema);