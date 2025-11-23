import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken"; 

const router = express.Router();
const JWT_SECRET = "supersecret";

router.patch("/check-in/:id_checkin/cancelar", (req, res) => {
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

  const id_passageiro = decoded.id_usuario;
  const { id_checkin } = req.params;

  const checkQuery = `
    SELECT * FROM Checkin 
    WHERE id_checkin = ? AND id_passageiro = ?
  `;

  db.get(checkQuery, [id_checkin, id_passageiro], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row)
      return res
        .status(404)
        .json({ message: "Check-in não encontrado." });

    const updateQuery = `
      UPDATE Checkin SET status = 'cancelado'
      WHERE id_checkin = ?
    `;

    db.run(updateQuery, [id_checkin], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Check-in cancelado com sucesso." });
    });
  });
});

export default router;
