import express from "express";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import veiculoRoutes from "./routes/veiculo";
import { setupSwagger } from "../swagger";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

setupSwagger(app);

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/veiculo", veiculoRoutes);

app.get("/", (_, res) => res.send("🚀 API está rodando!"));

console.log("Swagger: http://localhost:3000/api-docs");

export default app;
