import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken"; // 1. Importar JWT

const router = express.Router();
const JWT_SECRET = "supersecret"; // 2. Adicionar Secret (mesmo do auth.js)

type VeiculoDB = {
  // 3. id_motorista não é mais necessário aqui
  vagas_maximas: number;
};

// Rota POST (AGORA COM AUTENTICAÇÃO)
router.post("/", (req: Request, res: Response) => {
  // --- 4. INICIAR AUTENTICAÇÃO ---
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // 5. Mudar 'error' para 'message'
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Token inválido." }); // 5. Mudar 'error' para 'message'
  }

  // 6. Pegar o ID do motorista que está logado (do token)
  const id_motorista_token = decodedToken.id_usuario;
  // --- FIM AUTENTICAÇÃO ---

  const { horario_partida, local_saida, local_chegada, placa_veiculo } =
    req.body;

  if (!horario_partida || !local_saida || !local_chegada || !placa_veiculo) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." }); // 5. Mudar 'error' para 'message'
  }

  // valida se o formato da data é válido
  const dataValida = !isNaN(Date.parse(horario_partida));
  if (!dataValida) {
    return res.status(400).json({
      message: "Horário de partida inválido. Use o formato YYYY-MM-DDTHH:MM:SS",
    }); // 5. Mudar 'error' para 'message'
  }

  // --- 7. CORRIGIR QUERY DO VEÍCULO ---
  // A query agora verifica se a placa E o id_motorista (do token) batem
  const queryVeiculo = `
    SELECT passageiros_maximos AS vagas_maximas 
    FROM Veiculo 
    WHERE placa = ? AND id_motorista = ?
  `;

  db.get<VeiculoDB>(
    queryVeiculo,
    [placa_veiculo, id_motorista_token], // 7. Passar os dois parâmetros
    (err, veiculo) => {
      if (err) return res.status(500).json({ message: err.message }); // 5. Mudar 'error' para 'message'
      if (!veiculo)
        return res.status(404).json({
          message: "Veículo não encontrado ou não pertence a este motorista.", // 5. Mudar 'error' para 'message'
        });

      const { vagas_maximas } = veiculo;
      const valor_por_km = 1.5; // fixo
      const km = 5; // fixo
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
          id_motorista_token, // 8. Usar o ID do token
          placa_veiculo,
          km,
          valor_total,
        ],
        function (err) {
          if (err) return res.status(500).json({ message: err.message }); // 5. Mudar 'error' para 'message'
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

// A ROTA GET ESTÁ CORRETA, MAS VAMOS PADRONIZAR O ERRO
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
    if (err) return res.status(500).json({ message: err.message }); // 5. Mudar 'error' para 'message'
    res.json(rows);
  });
});

export default router;
