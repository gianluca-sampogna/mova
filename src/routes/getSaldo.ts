import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "supersecret";

router.get("/saldo", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token não fornecido." });

  const token = authHeader.split(" ")[1];
  let decoded: any;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Token inválido." });
  }

  const id_motorista = decoded.id_usuario;

  const query = `
    SELECT SUM(v.valor_total) AS saldo
    FROM Viagem v
    JOIN Checkin c ON c.id_viagem = v.id_viagem
    WHERE v.id_motorista = ? AND c.status != 'cancelado'
  `;

  db.get(query, [id_motorista], (err, row: { saldo: number } | undefined) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ saldo: row?.saldo ?? 0 });
  });
});

export default router;
