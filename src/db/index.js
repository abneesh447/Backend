import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
        );

        // console.log(
        //     `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        // );

        console.log(`\nMongoDB connected successfully !!`)
        console.log(`DB HOST: http://localhost:${process.env.PORT}`)
        console.log(`${connectionInstance.connection.host}`);        
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB;