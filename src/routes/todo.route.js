import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addTodo, deleteTodo, getTodo, updateTodo } from "../controllers/todo.controller.js";

const todoRoute = Router();

todoRoute.post("/create", verifyJWT, addTodo);
todoRoute.put("/update/:id", verifyJWT, updateTodo);
todoRoute.get("/get", verifyJWT, getTodo);
todoRoute.delete("/delete/:id", verifyJWT, deleteTodo);

export default todoRoute;
