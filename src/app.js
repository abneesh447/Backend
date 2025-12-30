import dotenv from "dotenv";
dotenv.config({ path: "../env" })

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

app.listen(process.env.PORT,()=>{
    console.log("listening at port: ",`${process.env.PORT}`);
})

export default app;