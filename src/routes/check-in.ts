import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/database";

const router = express.Router();
const JWT_SECRET = "supersecret";

router.post("/checkin", (req: Request, res: Response) => {
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
  const { id_viagem, ponto_embarque } = req.body;

  if (!id_viagem || !ponto_embarque) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  // Verifica se a viagem existe
  const checkViagemQuery = `SELECT * FROM Viagem WHERE id_viagem = ?`;
  
  db.get(checkViagemQuery, [id_viagem], (err, viagem) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!viagem)
      return res.status(404).json({ message: "Viagem não encontrada." });

    // Verifica se o passageiro já fez check-in
    const checkDuplicadoQuery = `
      SELECT * FROM Checkin
      WHERE id_passageiro = ? AND id_viagem = ?
    `;

    db.get(checkDuplicadoQuery, [id_passageiro, id_viagem], (err, existente) => {
      if (err) return res.status(500).json({ message: err.message });
      if (existente)
        return res.status(400).json({
          message: "Passageiro já fez check-in nesta viagem.",
        });

      const insertQuery = `
        INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque)
        VALUES (?, ?, ?)
      `;

      db.run(
        insertQuery,
        [id_passageiro, id_viagem, ponto_embarque],
        function (err) {
          if (err) return res.status(500).json({ message: err.message });

          res.status(201).json({
            message: "Check-in realizado com sucesso.",
            id_checkin: this.lastID,
          });
        }
      );
    });
  });
});

export default router;
