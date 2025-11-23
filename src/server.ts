import app from "./app";
import { initDatabase } from "./db/migrations";
import { seedDatabase } from "./db/seed";
import "dotenv/config";

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await initDatabase();
    await seedDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Servidor rodando em http://192.168.100.10:${PORT}`);
    });

    console.log("✅ Banco de dados conectado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
}

start();
