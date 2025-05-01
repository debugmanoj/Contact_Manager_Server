import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routeIndex from "./src/routes/index.js"

dotenv.config();

const app = express();
app.use(cors({
  // origin: 'http://localhost:5173', // your frontend origin
  origin: 'https://contact-manager-client-seven.vercel.app/', // your frontend origin
  credentials: true, // allow sending cookies
}));

app.use(express.json());
app.use(cookieParser());

app.use("/",routeIndex)


app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});

