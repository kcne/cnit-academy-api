import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import lectureRoutes from "./routes/lectureRoutes";
import profileRoutes from "./routes/profileRoutes";
import programRoutes from "./routes/programRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";
import errorHandler from "./middlewares/errorHandler";
import authMiddleware from "./middlewares/authMiddleware";
import blogRoutes from "./routes/blogRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/course", authMiddleware(), courseRoutes);
app.use("/api/lecture", authMiddleware(), lectureRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/program", authMiddleware(), programRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/pfp", express.static("files/pfp"));

app.use(errorHandler);
app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
