import { Router } from "express";
import userRoute from "./user.route.js";
import labelRoute from "./label.route.js";
import todoRoute from "./todo.route.js";

const rootRoute = Router();

rootRoute.use("/user", userRoute);
rootRoute.use("/label", labelRoute);
rootRoute.use("/todo", todoRoute)

export default rootRoute;
