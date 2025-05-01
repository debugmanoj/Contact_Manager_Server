import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

console.log('`${process.env.DB_URL}/${process.env.DB_NAME}`: ', `${process.env.DB_URL}/${process.env.DB_NAME}`)
mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);

export default mongoose;