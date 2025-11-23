import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken";
import "dotenv/config";
import axios from "axios";

const router = express.Router();
const JWT_SECRET = "supersecret";

function validarToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return { erro: true, status: 401, msg: "Token ausente." };

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { erro: false, data: decoded };
  } catch {
    return { erro: true, status: 401, msg: "Token inválido." };
  }
}

router.post("/", async (req: Request, res: Response) => {
  const tokenCheck = validarToken(req, res);
  if (tokenCheck.erro)
    return res.status(tokenCheck.status ?? 400).json({ message: tokenCheck.msg });


  const id_motorista_token = tokenCheck.data.id_usuario;

  const {
    horario_partida,
    local_saida,
    local_chegada,
    placa_veiculo,
    origemCoords,
    destinoCoords,
  } = req.body;

  if (
    !Array.isArray(origemCoords) ||
    origemCoords.length !== 2 ||
    !Array.isArray(destinoCoords) ||
    destinoCoords.length !== 2
  ) {
    return res.status(400).json({
      message: "Coordenadas inválidas. Use arrays no formato [lon, lat].",
    });
  }

  if (!horario_partida || !local_saida || !local_chegada || !placa_veiculo) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  if (isNaN(Date.parse(horario_partida))) {
    return res.status(400).json({
      message: "Horário inválido. Use o formato YYYY-MM-DDTHH:mm.",
    });
  }

  const queryVeiculo = `
    SELECT passageiros_maximos AS vagas_maximas
    FROM Veiculo
    WHERE placa = ? AND id_motorista = ?
  `;

  const veiculo: any = await new Promise((resolve, reject) => {
    db.get(queryVeiculo, [placa_veiculo, id_motorista_token], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!veiculo)
    return res.status(404).json({
      message: "Veículo não encontrado ou não pertence ao motorista.",
    });

  const { vagas_maximas } = veiculo;

  const ORS_API_KEY = process.env.ORS_API_KEY;

  if (!ORS_API_KEY) {
    return res.status(500).json({ message: "ORS_API_KEY não configurada." });
  }

  let km = 0;

  try {
    const resp = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [origemCoords, destinoCoords],
      },
      {
        headers: {
          Authorization: ORS_API_KEY, 
          "Content-Type": "application/json",
        },
      }
    );

    const distancia = resp.data?.routes?.[0]?.summary?.distance;
    if (!distancia) {
      return res
        .status(400)
        .json({ message: "Não foi possível calcular a distância da rota." });
    }

    km = distancia / 1000;
  } catch (err: any) {
    console.log("Erro ORS:", err?.response?.data || err);
    return res.status(500).json({ message: "Erro ao calcular rota." });
  }

  const valor_por_km = 1.5;
  const valor_total = km * valor_por_km;

  const insertQuery = `
    INSERT INTO Viagem
    (horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo, km, valor_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result: any = await new Promise((resolve, reject) => {
      db.run(
        insertQuery,
        [
          horario_partida,
          valor_por_km,
          local_saida,
          local_chegada,
          vagas_maximas,
          id_motorista_token,
          id_motorista_token,
          placa_veiculo,
          km,
          valor_total,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    return res.status(201).json({
      message: "Viagem criada com sucesso!",
      id_viagem: result.lastID,
      km,
      valor_total,
      valor_por_km,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// ROTA 2: LISTAR MINHAS VIAGENS (GET /) - FILTRADA
// =========================================================================
router.get("/", (req: Request, res: Response) => {
  const tokenCheck = validarToken(req, res);
  if (tokenCheck.erro)
    return res.status(tokenCheck.status ?? 400).json({ message: tokenCheck.msg });


  const { id_usuario, tipo } = tokenCheck.data;

  if (tipo !== "motorista") {
    return res.status(403).json({ message: "Acesso negado." });
  }

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
    WHERE v.id_motorista = ?
    ORDER BY v.id_viagem DESC
  `;

  db.all(query, [id_usuario], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });

    res.json(rows);
  });
});

export default router;
