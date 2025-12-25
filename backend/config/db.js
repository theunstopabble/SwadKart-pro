import mongoose from "mongoose"; // 👈 require हटाया

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Ye options connection ko stable banate hain
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// 👇 CHANGE: module.exports की जगह export default
export default connectDB;
