import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User"; "./UserController";
import List, { Ilist } from "../models/List";
import createHttpError from 'http-errors'
import Movie from "../models/Movies";
import mongoose from "mongoose";


class ListController {

    static async getLists(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                const error = new createHttpError.NotFound('not found')
                throw error
            }

            if (!userId) {
                const error = new createHttpError.BadRequest('Invalid Request')
                throw error
            }

            const [user] = await User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'lists',
                        localField: 'lists',
                        foreignField: '_id',
                        pipeline:
                            [
                                {
                                    $project: {
                                        userId: 0
                                    }
                                }, {
                                    $lookup: {
                                        from: 'movies',
                                        localField: 'movies',
                                        foreignField: '_id',
                                        as: 'movies',
                                        pipeline: [
                                            {
                                                $lookup: {
                                                    from: 'genres',
                                                    localField: 'genre_ids',
                                                    foreignField: 'id',
                                                    as: 'genres'
                                                }
                                            },
                                            {
                                                $addFields: {
                                                    genres: {
                                                        $map: {
                                                            input: "$genres",
                                                            as: "genre",
                                                            in: "$$genre.name"
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                }],
                        as: 'lists'
                    }
                },

            ]) as IUser[]

            if (!user) {
                const error = new createHttpError.NotFound('Invalid Request')
                throw error
            }
            res.status(200).json({ message: 'got you your lists', lists: user.lists })
        } catch (error) {
            return next(error)
        }
    }

    static async createList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, description, userId } = req.body;
            if (!name) {
                const error = new createHttpError.NotAcceptable('Invalid Request')
                throw error
            }

            const user = await User.findById(userId)

            if (!user) {
                const error = new createHttpError.NotFound('User Not Found')
                throw error
            }

            const list = new List({
                name,
                description: description || '',
                userId,
            })
            await list.save()
            user.lists.push(list._id)
            await user.save()

            res.status(201).json({ message: 'List Created', list })
            return
        } catch (error) {
            return next(error)
        }
    }

    static async removeList(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { listId, userId } = req.body;
        try {
            if (!userId || !listId) {
                const error = new createHttpError[400]('Invalid Request')
                throw error
            }

            const user = await User.findById(userId)

            if (!user) {
                const error = new createHttpError.NotFound('User Not Found')
                throw error
            }

            user.lists.pull(listId)
            await user.save()

            await List.findByIdAndDelete(listId)

            res.status(200).json({ message: 'List Deleted' })
            return

        }
        catch (error) {
            return next(error)
        }
    }

    static async updateList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, listId, name, description } = req.body;

            if (!userId || !listId) {
                const error = new createHttpError.BadRequest('Invalid Request')
                throw error
            }

            const list = await List.findById(listId);

            if (list.userId.toString() != userId.toString()) {
                const error = new createHttpError[401]('Unauthorized')
                throw error
            }

            if (!list) {
                const error = new createHttpError.NotFound('List Not Found')
                throw error
            }

            list.name = name || list.name
            list.description = description || list.description
            await list.save()

            res.status(200).json({ message: 'List Updated', list })
            return

        } catch (error) {
            return next(error)
        }
    }

    static async addMovieToList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { movieId, userId } = req.body
            const { listId } = req.params;
            const list = await List.findById(listId);

            if (!list) {
                const error = new createHttpError.NotFound('List Not Found')
                throw error
            }

            if (userId.toString() !== list.userId.toString() || !userId) {
                const error = new createHttpError.Unauthorized('Unauthorized')
                throw error
            }

            const movie = await Movie.findById(movieId)

            if (!movie) {
                const error = new createHttpError.NotFound('Movie Not Found')
                throw error

            }

            if (list.movies.includes(movieId)) {
                const error = new createHttpError.Conflict('Movie Already In List')
                throw error
            }

            list.movies.push(movieId)
            await list.save()

            res.status(200).json({ message: 'Movie Added To List', list: list })

        } catch (error) {
            return next(error)
        }
    }

    static async removeFromList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { movieId, userId } = req.body;
            const { listId } = req.params;

            const list = await List.findById(listId);
            if (!list) {
                const error = new createHttpError.NotFound('List Not Found')
                throw error
            }

            if (userId.toString() !== list.userId.toString() || !userId) {
                const error = new createHttpError.Unauthorized('Unauthorized')
                throw error
            }

            if (!list.movies.includes(movieId)) {
                const error = new createHttpError.NotFound('Movie Not In List')
                throw error
            }

            list.movies.pull(movieId)
            await list.save()

            res.status(200).json({ message: 'Movie Removed From List', list: list })



        } catch (error) {
            return next(error)
        }
    }

    static async fetchList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { listId } = req.params

            if (!mongoose.Types.ObjectId.isValid(listId)) {
                const error = new createHttpError.NotFound('List Not Found')
                throw error
            }

            const [list] = await List.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(listId) } },
                {
                    $lookup: {
                        localField: 'movies',
                        foreignField: '_id',
                        from: 'movies',
                        as: 'movies',
                        pipeline: [{
                            $lookup: {
                                from: 'genres',
                                localField: 'genre_ids',
                                foreignField: 'id',
                                as: 'genres'
                            },
                        }, {
                            $addFields: {
                                genres: {
                                    $map: {
                                        input: "$genres",
                                        as: "genre",
                                        in: "$$genre.name"
                                    }
                                }
                            }
                        }],
                    }
                }
            ]) as Ilist[];

            if (!list) {
                const error = new createHttpError.NotFound('List Not Found')
                throw error
            }

            res.status(200).json({ message: 'List Fetched', list: list })

        } catch (error) {
            next(error)
        }
    }
}


export default ListController