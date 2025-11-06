import jwt from "jsonwebtoken";
import { db } from '../db/database'
import { Router } from "express";

const router = Router();
const JWT_SECRET = "supersecret";

router.post("/", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token ausente" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { id_usuario, tipo } = decoded as any;

        if (tipo !== "motorista") {
            return res.status(403).json({ message: "Somente motoristas podem cadastrar veículos." });
        }

        const { tipo: tipo_veiculo, placa, modelo, cor, passageiros_maximos, chassi } = req.body;

        db.run(
            `INSERT INTO Veiculo (tipo, placa, modelo, cor, passageiros_maximos, chassi, id_motorista)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tipo_veiculo, placa, modelo, cor, passageiros_maximos, chassi, id_usuario],
            function (err) {
                if (err) {
                    return res.status(500).json({ message: "Erro ao cadastrar veículo.", err });
                }

                res.status(201).json({ message: "Veículo cadastrado com sucesso!", id: this.lastID });
            }
        );
    } catch {
        return res.status(403).json({ message: "Token inválido" });
    }
});

export default router;