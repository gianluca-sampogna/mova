import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "supersecret";

router.get("/", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token não fornecido." });

//   const token = authHeader.split(" ")[1];
//   let decoded: any;

//   try {
//     decoded = jwt.verify(token, JWT_SECRET);
//   } catch {
//     return res.status(401).json({ message: "Token inválido." });
//   }

//   const id_passageiro = decoded.id_usuario;

//   const query = `
//     SELECT c.id_checkin, c.id_viagem, c.ponto_embarque,
//            v.local_saida, v.local_chegada, v.horario_partida,
//            v.valor_por_km, v.km, v.valor_total, v.placa_veiculo
//     FROM Checkin c
//     JOIN Viagem v ON c.id_viagem = v.id_viagem
//     WHERE c.id_passageiro = ?
//     ORDER BY c.id_checkin DESC
//   `;

  db.all(query, [id_passageiro], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

export default router;
