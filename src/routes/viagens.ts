import express, { Request, Response } from "express";
import { db } from "../db/database";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "supersecret";

type VeiculoDB = {
  vagas_maximas: number;
};

// =========================================================================
// ROTA 1: CRIAR VIAGEM (POST /)
// =========================================================================
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

// =========================================================================
// ROTA 2: LISTAR MINHAS VIAGENS (GET /) - FILTRADA
// =========================================================================
router.get("/", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Se não tiver token, retorna erro (ou lista vazia, dependendo da regra de negócio)
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  let decoded: any;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Token inválido." });
  }

  const id_usuario = decoded.id_usuario;
  const tipo_usuario = decoded.tipo; // 'motorista' ou 'passageiro'

  let query = "";
  let params: any[] = [];

  if (tipo_usuario === "motorista") {
    // MOTORISTA: Vê as viagens que ele criou
    query = `
      SELECT v.id_viagem, v.local_saida, v.local_chegada, v.horario_partida, 
             v.valor_por_km, v.km, v.valor_total, v.vagas_maximas, 
             v.placa_veiculo, ve.modelo
      FROM Viagem v
      JOIN Veiculo ve ON v.placa_veiculo = ve.placa
      WHERE v.id_motorista = ?
      ORDER BY v.id_viagem DESC
    `;
    params = [id_usuario];
  } else {
    // PASSAGEIRO: Vê as viagens onde ele fez check-in
    query = `
      SELECT v.id_viagem, v.local_saida, v.local_chegada, v.horario_partida, 
             v.valor_por_km, v.km, v.valor_total, v.vagas_maximas, 
             v.placa_veiculo, ve.modelo
      FROM Checkin c
      JOIN Viagem v ON c.id_viagem = v.id_viagem
      JOIN Veiculo ve ON v.placa_veiculo = ve.placa
      WHERE c.id_passageiro = ?
      ORDER BY v.id_viagem DESC
    `;
    params = [id_usuario];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// =========================================================================
// ROTA 3: LISTAR CHECK-INS DE UMA VIAGEM ESPECÍFICA (GET /:id_viagem/checkins)
// =========================================================================
router.get("/:id_viagem/checkins", (req: Request, res: Response) => {
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

  const id_viagem = req.params.id_viagem;
  const id_usuario_logado = decoded.id_usuario;
  const tipo_usuario = decoded.tipo;

  // Consulta para verificar a viagem e pegar os detalhes
  const checkViagemQuery = `
      SELECT id_motorista FROM Viagem WHERE id_viagem = ?
  `;

  db.get(checkViagemQuery, [id_viagem], (err, viagem: any) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!viagem)
      return res.status(404).json({ message: "Viagem não encontrada." });

    // Verificação de Permissão:
    // Apenas o motorista dono da viagem deve ver os passageiros.
    if (
      tipo_usuario === "motorista" &&
      viagem.id_motorista !== id_usuario_logado
    ) {
      return res.status(403).json({
        message: "Acesso negado. Você não é o motorista desta viagem.",
      });
    }

    // Busca os passageiros E o horário da viagem
    const queryCheckins = `
        SELECT c.id_checkin, c.ponto_embarque, 
               p.nome as nome_passageiro, p.num_telefone,
               v.horario_partida 
        FROM Checkin c
        JOIN Passageiro pass ON c.id_passageiro = pass.id_passageiro
        JOIN Pessoa p ON pass.id_passageiro = p.id_usuario
        JOIN Viagem v ON c.id_viagem = v.id_viagem
        WHERE c.id_viagem = ?
    `;

    db.all(queryCheckins, [id_viagem], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });

      if (rows.length === 0) {
        // Se não tem passageiros, buscamos apenas os dados da viagem para o front não quebrar
        db.get(
          `SELECT horario_partida FROM Viagem WHERE id_viagem = ?`,
          [id_viagem],
          (err, dadosViagem: any) => {
            if (err) return res.json([]);
            res.json([
              {
                horario_partida: dadosViagem.horario_partida,
                sem_passageiros: true,
              },
            ]);
          }
        );
      } else {
        res.json(rows);
      }
    });
  });
});

// =========================================================================
// ROTA 4: FEED - LISTAR TODAS AS VIAGENS DISPONÍVEIS (GET /todas)
// =========================================================================
router.get("/todas", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Token inválido." });
  }

  // Query que busca a viagem + dados do carro + nome do motorista
  const query = `
    SELECT v.id_viagem, 
           v.local_saida, 
           v.local_chegada, 
           v.horario_partida, 
           v.valor_por_km, 
           v.km, 
           v.valor_total, 
           v.vagas_maximas, 
           v.placa_veiculo, 
           ve.modelo AS modelo_veiculo,
           ve.cor AS cor_veiculo,
           p.nome AS nome_motorista
    FROM Viagem v
    JOIN Veiculo ve ON v.placa_veiculo = ve.placa
    JOIN Pessoa p ON v.id_motorista = p.id_usuario
    ORDER BY v.horario_partida DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

export default router;
