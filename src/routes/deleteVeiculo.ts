import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken"; 

const router = express.Router();
const JWT_SECRET = "supersecret";

router.delete("/:placa", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token ausente" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id_usuario, tipo } = decoded;

    if (tipo !== "motorista") {
      return res.status(403).json({ message: "Somente motoristas podem excluir veículos." });
    }

    const { placa } = req.params;

    db.run(
      "DELETE FROM Veiculo WHERE placa = ? AND id_motorista = ?",
      [placa, id_usuario], 
      function (err) {
        if (err) return res.status(500).json({ message: "Erro ao excluir veículo.", err });
        if (this.changes === 0) return res.status(404).json({ message: "Veículo não encontrado ou não pertence ao motorista." });
        res.json({ message: "Veículo excluído com sucesso." });
      }
    );

  } catch {
    return res.status(403).json({ message: "Token inválido" });
  }
});

export default router;
