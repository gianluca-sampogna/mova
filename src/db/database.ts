import sqlite3 from "sqlite3";
import path from "path";

sqlite3.verbose();

const dbPath = path.resolve(__dirname, "database.sqlite");

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco:", err.message);
  } else {
    console.log("✅ Banco de dados conectado com sucesso!");
  }
});
