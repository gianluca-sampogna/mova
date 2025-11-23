import express from "express";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import veiculoRoutes from "./routes/veiculo";
import viagensRoutes from "./routes/viagens";
import deleteVeiculoRoutes from "./routes/deleteVeiculo";
import deleteViagensRoutes from "./routes/deleteViagem"
import todasViagensRoutes from "./routes/todasViagens";
import checkInRoutes from "./routes/check-in";
import getCheckinRoutes from "./routes/getCheckin";
import { setupSwagger } from "../swagger";
import deletarCheckinRoutes from "./routes/deletarCheckin";
import getSaldoRoutes from "./routes/getSaldo";
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
app.use("/viagens", viagensRoutes);
app.use("/deleteVeiculo", deleteVeiculoRoutes);
app.use("/deleteViagem", deleteViagensRoutes);
app.use("/todasViagens", todasViagensRoutes);
app.use("/check-in", checkInRoutes);
app.use("/getCheckin", getCheckinRoutes);
app.use("/deletarCheckin", deletarCheckinRoutes);
app.use("/getSaldo", getSaldoRoutes);

app.get("/", (_, res) => res.send("🚀 API está rodando!"));

console.log("Swagger: http://192.168.100.10:3000/api-docs");

export default app;
