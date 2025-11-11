import express, { Request, Response } from 'express';
import { db } from '../db/database';

const router = express.Router();

type VeiculoDB = {
  id_motorista: number;
  vagas_maximas: number;
};

router.post('/', (req: Request, res: Response) => {
  const { horario_partida, local_saida, local_chegada, placa_veiculo } = req.body;

  if (!horario_partida || !local_saida || !local_chegada || !placa_veiculo) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // valida se o formato da data é válido
  const dataValida = !isNaN(Date.parse(horario_partida));
  if (!dataValida) {
    return res.status(400).json({ error: 'Horário de partida inválido. Use o formato YYYY-MM-DDTHH:MM:SS' });
  }

  const queryVeiculo = `
    SELECT id_motorista, passageiros_maximos AS vagas_maximas 
    FROM Veiculo 
    WHERE placa = ?
  `;

  db.get<VeiculoDB>(queryVeiculo, [placa_veiculo], (err, veiculo) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });

    const { id_motorista, vagas_maximas } = veiculo;

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
      [horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo, km, valor_total],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          message: 'Viagem criada com sucesso',
          id_viagem: this.lastID,
          valor_por_km,
          km,
          valor_total,
        });
      }
    );
  });
});

router.get('/', (req: Request, res: Response) => {
  const query = `
    SELECT v.id_viagem, v.local_saida, v.local_chegada, v.horario_partida, 
           v.valor_por_km, v.km, v.valor_total, v.vagas_maximas, 
           v.placa_veiculo, ve.modelo
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
