import app from "./app";
import { initDatabase } from "./db/migrations";
import { seedDatabase } from "./db/seed";

const PORT = process.env.PORT || 3000;

// Inicializa o banco antes de rodar o servidor
initDatabase();
seedDatabase();

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});
