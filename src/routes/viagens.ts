import express, { Request, Response } from 'express';
import { db } from '../db/database';

const router = express.Router();

// Define o tipo do veículo vindo do banco
type VeiculoDB = {
  id_motorista: number;
  vagas_maximas: number; // mapeado do passageiros_maximos
};

router.post('/', (req: Request, res: Response) => {
  const { local_saida, local_chegada, placa_veiculo } = req.body;

  if (!local_saida || !local_chegada || !placa_veiculo) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Buscar veículo no banco para pegar id_motorista e passageiros_maximos como vagas_maximas
  const queryVeiculo = `
    SELECT id_motorista, passageiros_maximos AS vagas_maximas 
    FROM Veiculo 
    WHERE placa = ?
  `;

  db.get<VeiculoDB>(queryVeiculo, [placa_veiculo], (err, veiculo) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });

    const { id_motorista, vagas_maximas } = veiculo;

    const valor_por_km = 1.5;
    const horario_partida = '08:00'; // fixo

    const insertQuery = `
      INSERT INTO Viagem 
      (horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Viagem criada com sucesso', id_viagem: this.lastID });
      }
    );
  });
});

// 🔹 Listar todas as viagens
router.get('/', (req: Request, res: Response) => {
  const query = `
    SELECT v.id_viagem, v.local_saida, v.local_chegada, v.horario_partida, 
           v.valor_por_km, v.vagas_maximas, v.placa_veiculo, ve.modelo
    FROM Viagem v
    JOIN Veiculo ve ON v.placa_veiculo = ve.placa
    ORDER BY v.id_viagem DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

export default router;
