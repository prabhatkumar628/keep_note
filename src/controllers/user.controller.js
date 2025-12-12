import User from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateToken = async (user) => {
  const todoAccessToken = user.generateAccessToken();
  const todoRefreshToken = user.generateRefreshToken();
  user.todoRefreshToken = todoRefreshToken;
  await user.save({ validateBeforeSave: false });
  return { todoAccessToken, todoRefreshToken };
};

const generateUniqueUsername = async (prefix = "user") => {
  while (true) {
    const randomStr = crypto.randomBytes(4).toString("hex").slice(0, 8);
    const finalName = `${prefix}${randomStr}`;
    const existing = await User.findOne({ username: finalName });
    if (!existing) return finalName;
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = async (req, res) => {
  const errMessage = {};
  try {
    const { email, password } = req.body;
    if (!email) errMessage.email = "email is required";
    if (!password) errMessage.password = "password is required";
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "validation failed",
        data: errMessage,
      });
    }
    const prefix = email.slice(0, 4).toLowerCase();
    const createdUserName = await generateUniqueUsername(prefix);

    const user = await User.create({
      username: createdUserName,
      email,
      password,
    });

    const userData = user?.toObject();
    delete userData?.password;
    delete userData?.todoRefreshToken;

    const { todoAccessToken, todoRefreshToken } = await generateToken(user);
    res
      .status(201)
      .cookie("todoAccessToken", todoAccessToken, options)
      .cookie("todoRefreshToken", todoRefreshToken, options)
      .json({
        success: true,
        message: "register user successfull",
        data: { todoAccessToken, todoRefreshToken, user: userData },
      });
  } catch (error) {
    if (error.code == 11000) {
      if (error.keyValue.username) {
        errMessage.username = "username allready taken";
      } else if (error.keyValue.email) {
        errMessage.email = "email allready exists";
      }
    }

    if (Object.keys(errMessage).length == 0) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
        data: error,
      });
    }

    return res
      .status(500)
      .json({ success: false, message: "validation error", data: errMessage });
  }
};

const loginUser = async (req, res) => {
  const errMessage = {};
  try {
    const { username, password } = req.body;
    if (!username) errMessage.username = "username or email is required";
    if (!password) errMessage.password = "password is required";
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        data: errMessage,
      });
    }
    const user = await User.findOne({
      $or: [{ email: username }, { username: username }],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user does not exists",
        data: { message: "user does not exists" },
      });
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res.status(404).json({
        success: false,
        message: "invalid credentials",
        data: { message: "invalid credentials" },
      });
    }
    const userData = user.toObject();
    delete userData.password;
    delete userData.todoRefreshToken;

    const { todoAccessToken, todoRefreshToken } = await generateToken(user);

    res
      .status(200)
      .cookie("todoAccessToken", todoAccessToken, options)
      .cookie("todoRefreshToken", todoRefreshToken, options)
      .json({
        success: true,
        message: "login successfull",
        data: { todoAccessToken, todoRefreshToken, user: userData },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      data: { message: "internal server error" },
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user?._id, {
      $unset: { todoRefreshToken: 1 },
    });

    const userData = user.toObject();
    delete userData.password;
    delete userData.todoRefreshToken;

    res
      .status(200)
      .clearCookie("todoAccessToken", options)
      .clearCookie("todoRefreshToken", options)
      .json({ success: true, message: "logout successfull!", data: userData });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      const userData = user.toObject();
      delete userData.password;
      delete userData.todoRefreshToken;
      res.status(200).json({
        success: true,
        message: "current user fetched",
        data: userData,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
  } catch (error) {
    return res.status(404).json({ success: false, message: "user not found" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.todoRefreshToken || req.body?.todoRefreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (incomingRefreshToken !== user.todoRefreshToken) {
      return res.status(403).json({
        success: false,
        message: "Token is expired or already used",
      });
    }

    const { todoAccessToken, todoRefreshToken } = await generateToken(user);

    res
      .status(200)
      .cookie("todoAccessToken", todoAccessToken, options)
      .cookie("todoRefreshToken", todoRefreshToken, options)
      .json({
        success: true,
        message: "Token refreshed successfully!",
        data: { todoAccessToken, todoRefreshToken },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
};
