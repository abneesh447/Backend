import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express();

app.use(cors({                         //middlewares me hum----AAP.USE()----krte h mostly times
    origin: process.env.CORS_ORIGIN,              // kha se access allow krna h
    credentials:true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended: true,limit:
    "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter)


// https://localhost:8000/api/v1/users/register


app.listen(process.env.PORT,()=>{
    console.log("listening at port: ",`${process.env.PORT}`);
})

export default app;