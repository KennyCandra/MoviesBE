import mongoose, { Schema, model } from "mongoose";


export interface Ilist extends Document {
    name: string;
    description: string;
    movies: mongoose.Types.Array<Schema.Types.ObjectId>;
    userId: Schema.Types.ObjectId;
}


const List = new Schema<Ilist>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    movies: {
        type: [Schema.Types.ObjectId],
        ref: 'movies',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export default model<Ilist>('List', List);
