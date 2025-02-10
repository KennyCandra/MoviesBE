import express from "express";
import ReviewController from "../controllers/ReviewsController";
import Auth from "../MiddleWare/AuthMiddleWare";

const router = express.Router();


router.post('/add', Auth.checkToken, ReviewController.addReview)

router.delete('/:reviewId/delete', Auth.checkToken, ReviewController.deleteReview)

router.get('/:reviewId', ReviewController.fetchReview)

router.put('/edit-review', Auth.checkToken, ReviewController.editReview)


//add function to fetch all reveiws for single user

//add function to fetch all reviews for single movie





export default router