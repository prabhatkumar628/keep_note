import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createLabel,
  deleteLabel,
  getLabel,
  getLabelById,
  updateLabel,
  updateLabelsBulk,
} from "../controllers/label.controller.js";

const labelRoute = Router();

labelRoute.post("/create", verifyJWT, createLabel);
labelRoute.put("/update/:id", verifyJWT, updateLabel);
labelRoute.get("/get", verifyJWT, getLabel);
labelRoute.get("/get/:id", verifyJWT, getLabelById);
labelRoute.delete("/delete/:id", verifyJWT, deleteLabel);
labelRoute.put("/bulk-update", verifyJWT, updateLabelsBulk);


export default labelRoute;
