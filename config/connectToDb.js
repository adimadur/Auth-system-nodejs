import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const connectToDB = async () => {
  try {
    const url = process.env.MONGOURL;
    const mongo = await mongoose.connect(url);
    console.log("Database Connected Successfully!");
    
  } catch (error) {
    console.log("Connection Failed " + error);
  }
};

export { connectToDB };
