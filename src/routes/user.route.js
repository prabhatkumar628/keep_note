import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRoute = Router();

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/refresh", refreshAccessToken);
userRoute.get("/logout", verifyJWT, logoutUser);
userRoute.get("/current", verifyJWT, getCurrentUser);

export default userRoute;
