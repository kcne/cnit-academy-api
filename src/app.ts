import express from "express";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
