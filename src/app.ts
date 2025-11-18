import express from "express";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import veiculoRoutes from "./routes/veiculo";
import viagensRoutes from "./routes/viagens";
// 1. IMPORTANTE: Importe o arquivo de rotas do check-in aqui
import checkInRoutes from "./routes/check-in";

import { setupSwagger } from "../swagger";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

setupSwagger(app);

// Definição das Rotas
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/veiculo", veiculoRoutes);
// app.use("/veiculo", veiculoRoutes); // <-- Você tinha essa linha duplicada, pode apagar uma.
app.use("/viagens", viagensRoutes);

// 2. IMPORTANTE: Adicione a rota aqui
// Usamos "/" porque dentro do arquivo check-in.ts você já definiu como router.post("/checkin")
// Se colocássemos app.use("/checkin", ...), a URL final ficaria /checkin/checkin
app.use("/", checkInRoutes);

app.get("/", (_, res) => res.send("🚀 API está rodando!"));

console.log("Swagger: http://localhost:3000/api-docs");

export default app;
