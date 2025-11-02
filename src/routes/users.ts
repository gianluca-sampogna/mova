import { Router } from "express";
import { db } from "../db/database";
import { authenticate } from "@src/middlewares/auth";
import { Request, Response } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de pessoas cadastradas
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todas as pessoas cadastradas
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []      # Requer token JWT
 *     responses:
 *       200:
 *         description: Lista de pessoas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_usuario:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: João Silva
 *                   email:
 *                     type: string
 *                     example: joao@email.com
 *                   num_telefone:
 *                     type: string
 *                     example: "(27) 99999-0000"
 *                   endereco:
 *                     type: string
 *                     example: "Rua das Flores, 123"
 *       401:
 *         description: Token inválido ou ausente
 *       500:
 *         description: Erro no banco de dados
 */
router.get("/", authenticate, (_, res) => {
  db.all(
    `SELECT id_usuario, nome, email, num_telefone, endereco FROM Pessoa`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * @swagger
 * components:
 *   schemas:
 *     NovoUsuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - endereco
 *         - num_telefone
 *       properties:
 *         nome:
 *           type: string
 *           example: "Maria Souza"
 *         email:
 *           type: string
 *           example: "maria@email.com"
 *         senha:
 *           type: string
 *           example: "123"
 *         endereco:
 *           type: string
 *           example: "Rua das Palmeiras, 456"
 *         num_telefone:
 *           type: string
 *           example: "(11) 91234-5678"
 */

/**
 * @swagger
 * /users/passageiro:
 *   post:
 *     summary: Cadastra um novo passageiro
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoUsuario'
 *     responses:
 *       201:
 *         description: Passageiro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                   example: 5
 *                 nome:
 *                   type: string
 *                   example: "Maria Souza"
 *                 email:
 *                   type: string
 *                   example: "maria@email.com"
 *                 tipo:
 *                   type: string
 *                   example: "passageiro"
 *       400:
 *         description: Campos obrigatórios ausentes
 *       500:
 *         description: Erro no banco de dados
 */

/**
 * @swagger
 * /users/motorista:
 *   post:
 *     summary: Cadastra um novo motorista
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoUsuario'
 *     responses:
 *       201:
 *         description: Motorista criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                   example: 10
 *                 nome:
 *                   type: string
 *                   example: "Carlos Oliveira"
 *                 email:
 *                   type: string
 *                   example: "carlos@email.com"
 *                 tipo:
 *                   type: string
 *                   example: "motorista"
 *       400:
 *         description: Campos obrigatórios ausentes
 *       500:
 *         description: Erro no banco de dados
 */

const cadastrarUsuario =
  (tipo: "passageiro" | "motorista") => (req: Request, res: Response) => {
    const { nome, endereco, email, num_telefone, senha, cnh } = req.body;

    if (!nome || !email || !senha || !num_telefone || !endereco || (tipo === "motorista" && !cnh)) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    db.run(
      `INSERT INTO Pessoa (nome, endereco, email, num_telefone, senha) VALUES (?, ?, ?, ?, ?)`,
      [nome, endereco, email, num_telefone, senha],
      function (err) {
        if (err) {
          if ((err as any).code === "SQLITE_CONSTRAINT") {
            return res.status(409).json({ message: "Usuário já existe" });
          }
          return res.status(500).json({ error: err.message });
        }
        const id_usuario = this.lastID;

        const subclasseQuery =
          tipo === "motorista"
            ? `INSERT INTO Motorista (id_motorista, saldo, cnh) VALUES (?, 0, ?)`
            : `INSERT INTO Passageiro (id_passageiro) VALUES (?)`;
        const params = tipo === "motorista" ? [id_usuario, req.body.cnh] : [id_usuario];

        db.run(subclasseQuery, params, (err2) => {
          if (err2) {
            if ((err2 as any).code === "SQLITE_CONSTRAINT") {
              return res.status(409).json({ message: "Subclasse já existe" });
            }
            return res.status(500).json({ error: err2.message });
          }

          res.status(201).json({
            id_usuario,
            nome,
            email,
            tipo,
          });
        });
      }
    );
  };

router.post("/passageiro", cadastrarUsuario("passageiro"));
router.post("/motorista", cadastrarUsuario("motorista"));

export default router;
