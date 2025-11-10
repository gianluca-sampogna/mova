import express, { Request, Response } from 'express';
import { db } from '../db/database'; 

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  db.all('SELECT * FROM Viagem', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req: Request, res: Response) => {
  const {
    horario_partida,
    valor_por_km,
    local_saida,
    local_chegada,
    vagas_maximas,
    id_motorista,
    placa_veiculo,
  } = req.body;

  if (
    !horario_partida ||
    !valor_por_km ||
    !local_saida ||
    !local_chegada ||
    !vagas_maximas ||
    !id_motorista ||
    !placa_veiculo
  ) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

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

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM Viagem WHERE id_viagem = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Viagem não encontrada' });
    res.json({ message: 'Viagem excluída com sucesso' });
  });
});

export default router;
