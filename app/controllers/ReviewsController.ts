import { Request, Response, NextFunction } from "express";
import User, { IUser } from '../models/User'
import Movie, { IMovie } from "../models/Movies";
import mongoose, { Types } from "mongoose";
import createHttpError from 'http-errors'
import Reviews, { IReviews } from "../models/Reviews";

type Review = string

class ReviewController {

    static async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId, movieId, review }: { review: Review, userId: string, movieId: string } = req.body
        let { rating }: { rating: number } = req.body

        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(movieId)) {
                const error = new createHttpError.BadRequest("Not Valid")
                throw error
            }

            const user: IUser = await User.findById(userId);

            if (!user) {
                const error = new createHttpError.NotFound('You need to be authorized')
                throw error
            }

            const movie: IMovie = await Movie.findById(movieId)

            if (!movie) {
                const error = new createHttpError[404]('movie not found')
                throw error
            }

            if (!review || review === '') {
                const error = new createHttpError.NotAcceptable('please enter your review description')
                throw error
            }

            if (!rating) {
                const error = new createHttpError.NotAcceptable('please enter your review rating')
                throw error
            }

            if (rating > 10) {
                rating = 10
            }

            const newReview: IReviews = new Reviews({
                movieId: movieId,
                review: review,
                userId: userId,
                rating: rating
            })

            await newReview.save()
            user.reviwes.push(newReview._id);
            await user.save()

            res.status(201).json({ message: "review added succefully", review: newReview })

        } catch (error) {
            next(error)
        }
    }

    static async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(reviewId)) {
                const error = new createHttpError.NotAcceptable('Not Valid Review Details')
                throw error
            }


            const review = await Reviews.findById(reviewId)

            if (req.body.userId.toString() !== review.userId.toString()) {
                const error = new createHttpError.Forbidden('Not Authorized')
                throw error
            }

            if (!review) {
                const error = new createHttpError.NotFound("we can't find this review")
                throw error
            }

            const response = await Reviews.deleteOne({ _id: review._id })
            console.log(response)

            res.status(200).json({ message: 'review deleted successfully' })
            return

        }
        catch (error) {
            next(error)
        }
    }

    static async editReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { reviewId, rating, review, userId }: { reviewId: string, rating: number, review: string, userId: string } = req.body;

            if (!mongoose.Types.ObjectId.isValid(reviewId)) {
                const error = new createHttpError.NotAcceptable('please enter valid details')
                throw error
            }

            const reviewToEdit = await Reviews.findById(reviewId);

            if (reviewToEdit.userId.toString() !== userId.toString()) {
                const error = new createHttpError.Forbidden('you are not allowed to edit this')
                throw error
            }

            reviewToEdit.rating = rating || reviewToEdit.rating;
            reviewToEdit.review = review || reviewToEdit.review;

            await reviewToEdit.save()

            res.status(200).json({ message: 'review updated' })

        } catch (error) {
            next(error)
        }
    }

    static async fetchReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(reviewId)) {
                const error = new createHttpError.NotFound('Invalid data')
                throw error
            }

            const review = await Reviews.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(reviewId) } },
                { $lookup: { from: 'users', localField: 'userId', as: 'user', foreignField: '_id' } },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: 1,
                        review: 1,
                        rating: 1,
                        createdAt: 1,
                        author: {
                            name: '$user.name',
                            email: '$user.email'
                        },
                    }
                }
            ])

            if (!review) {
                const error = new createHttpError.NotFound('Not Found')
                throw error
            }


            res.status(200).json({ message: 'here is your review', review })
        } catch (error) {
            next(error)
        }
    }
}


export default ReviewController