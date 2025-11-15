import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken"; 

const router = express.Router();
const JWT_SECRET = "supersecret";

type VeiculoDB = {
  vagas_maximas: number;
};

router.post("/", (req: Request, res: Response) => {
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

  const { horario_partida, local_saida, local_chegada, placa_veiculo } =
    req.body;

  if (!horario_partida || !local_saida || !local_chegada || !placa_veiculo) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." }); 
  }

  const dataValida = !isNaN(Date.parse(horario_partida));
  if (!dataValida) {
    return res.status(400).json({
      message: "Horário de partida inválido. Use o formato YYYY-MM-DDTHH:MM:SS",
    });
  }

  const queryVeiculo = `
    SELECT passageiros_maximos AS vagas_maximas 
    FROM Veiculo 
    WHERE placa = ? AND id_motorista = ?
  `;

  db.get<VeiculoDB>(
    queryVeiculo,
    [placa_veiculo, id_motorista_token], 
    (err, veiculo) => {
      if (err) return res.status(500).json({ message: err.message }); 
      if (!veiculo)
        return res.status(404).json({
          message: "Veículo não encontrado ou não pertence a este motorista.", 
        });

      const { vagas_maximas } = veiculo;
      const valor_por_km = 1.5;
      const km = 5;
      const valor_total = km * valor_por_km;

      const insertQuery = `
        INSERT INTO Viagem 
        (horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo, km, valor_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        insertQuery,
        [
          horario_partida,
          valor_por_km,
          local_saida,
          local_chegada,
          vagas_maximas,
          id_motorista_token, 
          placa_veiculo,
          km,
          valor_total,
        ],
        function (err) {
          if (err) return res.status(500).json({ message: err.message }); 
          res.status(201).json({
            message: "Viagem criada com sucesso",
            id_viagem: this.lastID,
            valor_por_km,
            km,
            valor_total,
          });
        }
      );
    }
  );
});

router.get("/", (req: Request, res: Response) => {
  const query = `
    SELECT v.id_viagem, v.local_saida, v.local_chegada, v.horario_partida, 
           v.valor_por_km, v.km, v.valor_total, v.vagas_maximas, 
           v.placa_veiculo, ve.modelo
    FROM Viagem v
    JOIN Veiculo ve ON v.placa_veiculo = ve.placa
    ORDER BY v.id_viagem DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message }); 
    res.json(rows);
  });
});

export default router;
