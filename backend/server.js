import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Database connected"))
.catch((err) => console.log("DB Error:", err));

const app = express();

app.get('/', (req, res) => {
  res.send("Server is running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});