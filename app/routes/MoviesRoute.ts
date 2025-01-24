import { Router } from "express";
import MoviesController from "../controllers/MoviesControllers";
const router = Router()

router.get('/', MoviesController.fetchMoives)


export default router;