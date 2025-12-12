import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import dbConnect from "./dbConnect.js";
import app from "./app.js";

const port = process.env.PORT || 8001;
dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(`DB connection ERROR:`, error);
  });
