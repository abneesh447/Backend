import dotenv from "dotenv";
dotenv.config({ path: "../env" })

import express from "express";

const app=express();

app.listen(process.env.PORT,()=>{
    console.log("listening at port: ",`${process.env.PORT}`);
})

export default app;