import { Router } from "express";
import ListController from "../controllers/ListController";
import Auth from "../MiddleWare/AuthMiddleWare";

const router = Router()

router.post('/create-list', Auth.checkToken, ListController.createList)

router.delete('/remove-list', Auth.checkToken, ListController.removeList)

router.put('/update-list', Auth.checkToken, ListController.updateList)

router.post('/:listId', Auth.checkToken, ListController.addMovieToList)

router.delete('/:listId', Auth.checkToken, ListController.removeFromList)


router.get('/:listId', ListController.fetchList)

router.get('/:userId/lists', ListController.getLists)



export default router