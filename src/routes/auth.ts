import express from "express";
import { db } from "../db/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pessoa } from "../../types/models";

const router = express.Router();

// Segredo do JWT (em produção, use env variable)
const JWT_SECRET = "supersecret";

// POST /auth/login
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const sql = `SELECT * FROM Pessoa WHERE email = ?`;

  db.get(sql, [email], (err, user: Pessoa) => {
    if (err)
      return res.status(500).json({ message: "Erro no banco de dados", err });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    // Verifica senha (como no seed você colocou todas como '123', só pra exemplo simples)
    // Se estivesse usando hash, usaríamos bcrypt.compare(senha, user.senha)
    if (senha !== user.senha) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    // Gera JWT
    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email },
      JWT_SECRET
      // { expiresIn: "1h" }
    );

     res.status(200).json({ message: "Login realizado com sucesso!", token });
  });
});

export default router;
