import { Router } from "express";
import MoviesController from "../controllers/MoviesControllers";
const router = Router()


router.get('/search', MoviesController.searchMovies)

router.get('/search-header', MoviesController.searchMoviesHeader)

router.get('/:id', MoviesController.getMovieById)

router.get('/', MoviesController.fetchMoives)


export default router;