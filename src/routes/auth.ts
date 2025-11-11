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

  const sql = `
  SELECT p.*, m.id_motorista, pa.id_passageiro
  FROM Pessoa p
  LEFT JOIN Motorista m ON p.id_usuario = m.id_motorista
  LEFT JOIN Passageiro pa ON p.id_usuario = pa.id_passageiro
  WHERE p.email = ?
`;

  db.get(sql, [email], async (err, user: any) => {
    if (err)
      return res.status(500).json({ message: "Erro no banco de dados", err });
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado." });

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    const tipo = user.id_motorista ? "motorista" : "passageiro";

    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email, tipo },
      JWT_SECRET
    );

    // --- CORREÇÃO AQUI ---
    // Adicione id_usuario: user.id_usuario ao JSON
    res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      tipo,
      id_usuario: user.id_usuario, // Adicionado
      user: user, // Adicionado
    });
    // -----------------------
  });
});

export default router;
