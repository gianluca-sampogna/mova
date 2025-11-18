import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/database";

const router = express.Router();
const JWT_SECRET = "supersecret";

// ==================================================
// ROTA 1: FAZER CHECK-IN (POST)
// ==================================================
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
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  const checkViagemQuery = `SELECT * FROM Viagem WHERE id_viagem = ?`;

  db.get(checkViagemQuery, [id_viagem], (err, viagem) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!viagem)
      return res.status(404).json({ message: "Viagem não encontrada." });

    // Verifica se já existe checkin ATIVO ou CANCELADO
    const checkDuplicadoQuery = `
      SELECT * FROM Checkin
      WHERE id_passageiro = ? AND id_viagem = ? AND status != 'cancelado'
    `;

    db.get(
      checkDuplicadoQuery,
      [id_passageiro, id_viagem],
      (err, existente) => {
        if (err) return res.status(500).json({ message: err.message });
        if (existente)
          return res.status(400).json({
            message: "Passageiro já fez check-in nesta viagem.",
          });

        const insertQuery = `
        INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque, status)
        VALUES (?, ?, ?, 'ativo')
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
      }
    );
  });
});

// ==================================================
// ROTA 2: LISTAR MEUS CHECK-INS (GET)
// ==================================================
router.get("/checkin", (req: Request, res: Response) => {
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

  // ALTERAÇÃO: Adicionado "AND c.status != 'cancelado'" para esconder os cancelados
  const query = `
    SELECT c.id_checkin, c.id_viagem, c.ponto_embarque, c.status,
           v.local_saida, v.local_chegada, v.horario_partida,
           v.valor_por_km, v.km, v.valor_total, v.placa_veiculo,
           ve.modelo -- Adicionando modelo do veículo
    FROM Checkin c
    JOIN Viagem v ON c.id_viagem = v.id_viagem
    JOIN Veiculo ve ON v.placa_veiculo = ve.placa
    WHERE c.id_passageiro = ? AND c.status != 'cancelado'
    ORDER BY c.id_checkin DESC
  `;

  db.all(query, [id_passageiro], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// ==================================================
// ROTA 3: CANCELAR CHECK-IN (PATCH)
// ==================================================
router.patch("/checkin/:id_checkin/cancelar", (req: Request, res: Response) => {
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

  // Verifica se o check-in pertence ao usuário antes de cancelar
  const checkQuery = `
    SELECT * FROM Checkin 
    WHERE id_checkin = ? AND id_passageiro = ?
  `;

  db.get(checkQuery, [id_checkin, id_passageiro], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row)
      return res
        .status(404)
        .json({ message: "Check-in não encontrado ou não pertence a você." });

    const updateQuery = `
      UPDATE Checkin SET status = 'cancelado'
      WHERE id_checkin = ?
    `;

    db.run(updateQuery, [id_checkin], function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Check-in cancelado com sucesso." });
    });
  });
});

export default router;
