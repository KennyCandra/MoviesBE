import mongoose from "mongoose";
import express, { Request, Response, NextFunction } from 'express';
import http from 'http'
import bodyParser from "body-parser";
import genreRoute from './routes/genre'
import MoviesRoute from './routes/MoviesRoute'
import TopMovies from "./models/TopMovies";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET , POST , PUT , DELETE , PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Authorization')
    next()
})

app.use(bodyParser.json())
app.use('/genre', genreRoute)
app.use('/movies', MoviesRoute)
app.get('/top-movies', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const topMovies = await TopMovies.find().populate('movieId')
    if (!topMovies) {
        res.status(404).json({ message: 'No Movies Found' })
    }
    res.status(200).json({ message: 'Top Movies', movies: topMovies })
})

const server = http.createServer(app)
mongoose.connect('mongodb+srv://ahmedabdelepsfmti:gOFpFDCjChgW3Lbp@cluster0.h9ogb.mongodb.net/movies?retryWrites=true&w=majority&appName=Cluster0').then(result => {
    server.listen(8001)
})