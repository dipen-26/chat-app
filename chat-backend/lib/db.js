import mongoose from "mongoose";

export const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database Connected'))
        
        const mongoUri = process.env.MONGODB_URI;
        let connectionString;
        
        if (mongoUri.endsWith('/')) {
            connectionString = `${mongoUri}chatApp`;
        } else {
            connectionString = `${mongoUri}/chatApp`;
        }
        
        console.log('Connecting to MongoDB:', connectionString.replace(/:[^:]*@/, ':****@'));  
        await mongoose.connect(connectionString)
    } catch (error) {
        console.log('MongoDB connection error:', error.message);
    }
}
