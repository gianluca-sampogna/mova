import express from "express";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import { setupSwagger } from "../swagger";

const app = express();
app.use(express.json());

setupSwagger(app);

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);

app.get("/", (_, res) => res.send("🚀 API está rodando!"));

console.log("Swagger: http://localhost:3000/api-docs");

export default app;
