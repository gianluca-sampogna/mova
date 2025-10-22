import { Router } from "express";
import { db } from "../db/database";
import { authenticate } from "@src/middlewares/auth";

const router = Router();

// GET /users
router.get("/", authenticate, (_, res) => {
  db.all("SELECT nome, endereco, email FROM Pessoa", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /users
router.post("/", (req, res) => {
  const { nome, endereco, email, num_telefone } = req.body;
  const query = `INSERT INTO Pessoa (nome, endereco, email, num_telefone) VALUES (?, ?, ?)`;

  db.run(query, [nome, endereco, email, num_telefone], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res
      .status(201)
      .json({ id_usuario: this.lastID, endereco, email, num_telefone });
  });
});

export default router;
