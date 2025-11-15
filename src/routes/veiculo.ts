import jwt from "jsonwebtoken";
import { db } from '../db/database'
import { Router } from "express";

const router = Router();
const JWT_SECRET = "supersecret";

router.post("/", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token ausente" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id_usuario, tipo } = decoded as any;

    if (tipo !== "motorista") {
      return res.status(403).json({ message: "Somente motoristas podem cadastrar veículos." });
    }

    const { tipo: tipo_veiculo, placa, modelo, cor, passageiros_maximos, chassi } = req.body;

    db.get("SELECT * FROM Veiculo WHERE placa = ?", [placa], (err, row) => {
      if (err) return res.status(500).json({ message: "Erro ao checar placa." });
      if (row) return res.status(400).json({ message: "Placa já cadastrada." });


      db.run(
        `INSERT INTO Veiculo (tipo, placa, modelo, cor, passageiros_maximos, chassi, id_motorista)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tipo_veiculo, placa, modelo, cor, passageiros_maximos, chassi, id_usuario],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Erro ao cadastrar veículo.", err });
          }

          res.status(201).json({ message: "Veículo cadastrado com sucesso!", id: this.lastID });
        }
      );
    });
    } catch {
      return res.status(403).json({ message: "Token inválido" });
    }
  });

router.get("/", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token ausente" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id_usuario } = decoded;

    db.all(
      "SELECT * FROM Veiculo WHERE id_motorista = ?",
      [id_usuario],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao buscar veículos.", err });
        }
        res.json(rows);
      }
    );
  } catch {
    return res.status(403).json({ message: "Token inválido" });
  }
});

export default router;