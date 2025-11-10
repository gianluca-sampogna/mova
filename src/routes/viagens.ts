import express, { Request, Response } from 'express';
import { db } from '../db/database';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  const { horario_partida, local_saida, local_chegada, placa_veiculo } = req.body;

  if (!horario_partida || !local_saida || !local_chegada || !placa_veiculo) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Dados fixos por enquanto
  const valor_por_km = 1.5;
  const vagas_maximas = 4;
  const id_motorista = 1;

  const query = `
    INSERT INTO Viagem 
    (horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Viagem criada com sucesso', id_viagem: this.lastID });
    }
  );
});

export default router;
