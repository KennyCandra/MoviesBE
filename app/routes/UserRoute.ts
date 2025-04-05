import { Router } from "express";
import UserController from "../controllers/UserController";
import { body } from "express-validator";
import Auth from "../MiddleWare/AuthMiddleWare";

const router = Router();

router.post(
  "/signup",
  body("name")
    .trim()
    .isString()
    .isLength({ min: 5, max: 50 })
    .withMessage("Name must be between 5 and 50 characters long"),
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be at least 6 characters long and contain at least one letter and one number"),
  UserController.signUp
);

router.post("/login", UserController.login);

router.post("/watchlist/add", Auth.checkToken, UserController.addToWatchList);

router.delete('/watchlist/remove', Auth.checkToken, UserController.removeFromWatchList)

router.get("/watchlist/:userId", UserController.fetchWatchList);

router.get("/refresh-token", UserController.sendRefreshToken);

router.delete("/logout", UserController.logout);

router.get("/", Auth.checkToken, UserController.getUser);

export default router;
