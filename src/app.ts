import express from "express";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
