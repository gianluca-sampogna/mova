import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "supersecret";

router.get("/", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token ausente" });

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET); 

    const query = `
      SELECT 
        v.id_viagem,
        v.local_saida,
        v.local_chegada,
        v.horario_partida,
        v.valor_por_km,
        v.km,
        v.valor_total,
        v.vagas_maximas,
        v.placa_veiculo,
        ve.modelo
      FROM Viagem v
      JOIN Veiculo ve ON v.placa_veiculo = ve.placa
      ORDER BY v.id_viagem DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    });
  } catch {
    return res.status(403).json({ message: "Token inválido" });
  }
});

export default router;
