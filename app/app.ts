import mongoose from "mongoose";
import express from 'express';
import http from 'http'
import bodyParser from "body-parser";

const app = express();


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET , POST , PUT , DELETE , PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Authorization')
    next()
})


app.use(bodyParser.json())

const server = http.createServer(app)

mongoose.connect('mongodb+srv://ahmedabdelepsfmti:gOFpFDCjChgW3Lbp@cluster0.h9ogb.mongodb.net/movies?retryWrites=true&w=majority&appName=Cluster0').then(result => {
    server.listen(8001)
})