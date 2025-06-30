import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteUserById,
  getAllUsers,
} from "../controllers/userController.js";
import { authorizeUser, requireAuth } from "../middlewares/roleMiddleware.js";
import { validateSignup, validateLogin, validateUpdateProfile, validateChangePassword } from "../middlewares/validationMiddleware.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/auth/signup", validateSignup, signup);
authRouter.post("/auth/login", validateLogin, login);

// Protected routes (require authentication)
authRouter.get("/auth/me", requireAuth, getMe);
authRouter.put("/auth/update-profile", requireAuth, validateUpdateProfile, updateProfile);
authRouter.put("/auth/change-password", requireAuth, validateChangePassword, changePassword);

// Admin only routes
authRouter.get("/auth/users", authorizeUser(["Admin"]), getAllUsers);
authRouter.delete("/auth/delete/:id", authorizeUser(["Admin"]), deleteUserById);

export { authRouter };
