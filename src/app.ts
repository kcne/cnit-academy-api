import express from "express";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes"
import profileRoutes from "./routes/profileRoutes";
import programRoutes from "./routes/programRoutes"

const app = express();

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", courseRoutes)
app.use("/api/programs", programRoutes)

app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
