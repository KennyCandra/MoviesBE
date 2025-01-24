import { Router } from "express";
import GenreController from "../controllers/GenreController";


const router = Router();


router.get('/' , GenreController.getGenres)


export default router;