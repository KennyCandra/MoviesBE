import { Router } from "express";
import UserController from "../controllers/UserController";
import Auth from "../MiddleWare/AuthMiddleWare";
import { body } from "express-validator";

const router = Router();

router.post(
  "/signup",
  [
    body("name").isString().isLength({ min: 10 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  UserController.signUp
);

router.post("/login", UserController.login);

router.post("/watchlist/add", Auth.checkToken, UserController.addToWatchList);

router.get("/watchlist/:userId", Auth.checkToken, UserController.getWatchList);

router.get("/check-token", UserController.checkToken);

router.get("/user", Auth.checkToken, UserController.getUser);

router.get("/refresh-token", UserController.sendRefreshToken);

export default router;
