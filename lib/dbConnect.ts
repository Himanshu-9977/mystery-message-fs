import mongoose from 'mongoose'

interface ConnectionObject {
    isConnected?: number
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if(connection.isConnected) {
        console.log('Databse already connected');
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI!);

        connection.isConnected = db.connections[0].readyState;
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Failed to connect to database : ", error);
        process.exit(1);
    }
}

export default dbConnect;