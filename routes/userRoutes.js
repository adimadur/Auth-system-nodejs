import express from "express";
import {
  signup,
  login,
  deleteUserById,
} from "../controllers/userController.js";
import { authorizeUser } from "../middlewares/roleMiddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.delete("/delete/:id", authorizeUser(["Admin"]), deleteUserById);

export { authRouter };
