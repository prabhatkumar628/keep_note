import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
  uploadAvatar,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  multerErrorMiddle,
  uploader,
} from "../middlewares/multer.middleware.js";

const userRoute = Router();

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/refresh", refreshAccessToken);
userRoute.get("/logout", verifyJWT, logoutUser);
userRoute.get("/current", verifyJWT, getCurrentUser);
userRoute.post(
  "/avatar",
  verifyJWT,
  uploader().single("avatar"),
  multerErrorMiddle,
  uploadAvatar
);
userRoute.post(
  "/update",
  verifyJWT,
  uploader().single("avatar"),
  multerErrorMiddle,
  updateUser
);

export default userRoute;
