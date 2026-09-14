const mongoose=require('mongoose');

const mongoDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("CRITICAL ERROR: MONGO_URI environment variable is missing!");
            console.error("Please add your MongoDB connection string in your .env or Render Environment Variables.");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connection Successful");
    } catch (error) {
        console.error("DB Connection Failed:", error.message);
    }
};

module.exports = mongoDB;
