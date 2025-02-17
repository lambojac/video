import mongoose from "mongoose";
import cors from  "cors";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { connectDB } from "./Config/Dbconn.js";
import userRouter from "./Routes/userRoutes.js";
import errorHandler from "./Middlewares/errorMiddleWare.js";
import uploadRoutes from "./Routes/uploadRoutes.js"
import videoRoutes from "./Routes/videoRoutes.js"
const app = express();
dotenv.config();
const PORT = process.env.PORT;

//connect to db
connectDB();

//app middleware
app.use(cors({
    origin: ['http://localhost:3000',"https://video-annotatio.vercel.app"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Add this
  }));


  
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

// routes middleware
app.use("/api/users", userRouter);
app.use("/api/upload",uploadRoutes)
app.use("/api/video",videoRoutes)


//route
app.get("/", (req, res) => {
    res.send("Home Page!");
});

//error handler
app.use(errorHandler);


//start server
mongoose.connection.once('open', () => {
    console.log('DB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
});
