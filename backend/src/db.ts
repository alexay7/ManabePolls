import mongoose from "mongoose";

export default function connectDB() {
    const url = process.env.MONGO_URI as string;
   
    try {
        mongoose.connect(url, );
    } catch (err) {
        const error = err as Error;

        console.error(error.message);
        process.exit(1);
    }
    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database connected: ${url}`);
    });
   
    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });
    return;
}