import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import { startReminderCron } from "./jobs/reminderCron.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", chatRoutes);
app.use("/api", taskRoutes);
app.use("/api", memoryRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SAKHA backend is alive 🚀" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🔥 SAKHA server running on port ${PORT}`);
    startReminderCron();
  });
});