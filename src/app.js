import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

const allowedOrigins = [
  process.env.CLIENT_URL_LOCAL, // Local web
  "http://localhost:3000", // Next.js (optional)
  process.env.EXPO_URL_LOCAL, // Expo
  "http://*", // Expo on device
  process.env.CLIENT_URL_PROD, // Production
];

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["POST", "PUT", "UPDATE", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

import rootRoute from "./routes/root.route.js";
app.use("/api/v1", rootRoute);

export default app;
