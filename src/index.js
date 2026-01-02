import dotenv from "dotenv";
dotenv.config();

//cloudinary config idhr kiya kyuki cloudinary.js me krne se pta nhi
// kyu config nhi ho rha tha to error a rha tha ,cloudinary pe upload hi hi ho rha tha

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });


import app from "./app.js";

import connectDB from "./db/index.js";

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log(`ERROR: ${error}`);
        throw error;
    })
    app.listen(process.env.PORT || 5000,()=>{
    console.log("listening at port: ",`${process.env.PORT}`);
})
})
.catch((error)=>{
    console.log("MONGO db connection failed !!! ", error);
})
/*

import express from "express";
const app= express();

;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/
        ${DB_NAME}`)
        app.on("error", (error)=> {
            console.log("ERROR: ",error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening at port $
            {process.env.PORT}`);
        })

    } catch (error) {
        console.log("ERROR: ",error)
        throw error;
    }
} )()

*/

