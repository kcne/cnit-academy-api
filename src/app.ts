import express from "express";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import profileRoutes from "./routes/profileRoutes";
import cors from "cors";
import programRoutes from "./routes/programRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
