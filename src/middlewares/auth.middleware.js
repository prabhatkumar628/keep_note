import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.todoAccessToken;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.splite(" ")[1];
    }
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select(
      "-password -todoRefreshToken"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "token validation error" });
  }
};

export { verifyJWT };
