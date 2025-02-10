import mongoose, { Schema, model } from "mongoose";


interface Ilist extends Document {
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
        ref: 'Movies',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export default model<Ilist>('List', List);
