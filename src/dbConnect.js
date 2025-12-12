import mongoose from "mongoose";
import constants from "./constants.js";

const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${constants.DB_NAME}`
    );
    console.log(
      `MongoDB connected !!! HOST DB:`,
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log(`MongoDB connection ERROR:`, error);
    process.exit(1);
  }
};

export default dbConnect;
