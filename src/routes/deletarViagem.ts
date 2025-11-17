import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken"; 

const router = express.Router();
const JWT_SECRET = "supersecret";

router.delete("/:id_viagem", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Token inválido." });
  }

  const id_motorista_token = decodedToken.id_usuario;
  const { id_viagem } = req.params;

  // Verifica se a viagem existe e pertence ao motorista
  const checkQuery = `
    SELECT * FROM Viagem 
    WHERE id_viagem = ? AND id_motorista = ?
  `;

  db.get(checkQuery, [id_viagem, id_motorista_token], (err, viagem) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!viagem)
      return res.status(404).json({
        message: "Viagem não encontrada ou não pertence a este motorista.",
      });

    const deleteQuery = `
      DELETE FROM Viagem WHERE id_viagem = ?
    `;

    db.run(deleteQuery, [id_viagem], function (err) {
      if (err) return res.status(500).json({ message: err.message });

      res.json({ message: "Viagem cancelada com sucesso." });
    });
  });
});
