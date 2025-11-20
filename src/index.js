import dotenv from "dotenv";
dotenv.config({ path: "../.env" });



import connectDB from "./db/index.js";

connectDB()
.then(()=>{
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
        app.on("error", ()=> {
            console.log("ERROR: ",error);
            throw error
        })

        app.listen(process.listen(process.env.PORT, () => {
            console.log(`App is listening at port $
            {process.env.PORT}`);
        }))

    } catch (error) {
        console.log("ERROR: ",error)
        throw error;
    }
} )()

*/