import { db } from "./database";

export const initDatabase = () => {
  db.serialize(() => {
    db.exec(`
      -- =======================================
      -- Pessoa (superclasse)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Pessoa (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,   
        senha TEXT NOT NULL,   
        email TEXT UNIQUE NOT NULL,
        num_telefone TEXT NOT NULL,
        endereco TEXT NOT NULL
      );

      -- =======================================
      -- Motorista (subclasse)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Motorista (
        id_motorista INTEGER PRIMARY KEY,
        saldo REAL DEFAULT 0,
        cnh TEXT NOT NULL,
        FOREIGN KEY (id_motorista) REFERENCES Pessoa(id_usuario)
      );

      -- =======================================
      -- Passageiro (subclasse)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Passageiro (
        id_passageiro INTEGER PRIMARY KEY,
        FOREIGN KEY (id_passageiro) REFERENCES Pessoa(id_usuario)
      );

      -- =======================================
      -- Veículo (1 motorista → n veículos)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Veiculo (
        placa TEXT PRIMARY KEY,
        modelo TEXT NOT NULL,
        cor TEXT NOT NULL,
        passageiros_maximos INTEGER NOT NULL,
        id_motorista INTEGER NOT NULL,
        FOREIGN KEY (id_motorista) REFERENCES Motorista(id_motorista)
      );

      -- =======================================
      -- Viagem (1 motorista → n viagens, 1 veículo → 1 viagem)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Viagem (
        id_viagem INTEGER PRIMARY KEY AUTOINCREMENT,
        horario_partida TEXT NOT NULL,
        valor_por_km REAL NOT NULL,
        local_saida TEXT NOT NULL,
        local_chegada TEXT NOT NULL,
        vagas_maximas INTEGER NOT NULL,
        id_motorista INTEGER NOT NULL,
        placa_veiculo TEXT UNIQUE NOT NULL,
        FOREIGN KEY (id_motorista) REFERENCES Motorista(id_motorista),
        FOREIGN KEY (placa_veiculo) REFERENCES Veiculo(placa)
      );

      -- =======================================
      -- Ponto de Rota (1 viagem → n pontos)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Ponto_rota (
        id_ponto_rota INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        ordem INTEGER NOT NULL,
        id_viagem INTEGER NOT NULL,
        FOREIGN KEY (id_viagem) REFERENCES Viagem(id_viagem)
      );

      -- =======================================
      -- Checkin (relação Passageiro ↔ Viagem)
      -- =======================================
      CREATE TABLE IF NOT EXISTS Checkin (
        id_checkin INTEGER PRIMARY KEY AUTOINCREMENT,
        id_passageiro INTEGER NOT NULL,
        id_viagem INTEGER NOT NULL,
        ponto_embarque TEXT NOT NULL,
        FOREIGN KEY (id_passageiro) REFERENCES Passageiro(id_passageiro),
        FOREIGN KEY (id_viagem) REFERENCES Viagem(id_viagem)
      );
    `);

    console.log("📦 Todas as tabelas foram criadas ou já existiam.");
  });

  db.run(`
    ALTER TABLE Motorista ADD COLUMN cnh TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar colunas:', err.message);
    }
  });
  db.run(`
    ALTER TABLE Veiculo ADD COLUMN tipo TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar colunas:', err.message);
    }
  });
  db.run(`
    ALTER TABLE Veiculo ADD COLUMN chassi TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar colunas:', err.message);
    }
  });
  db.run(`
    ALTER TABLE Viagem ADD COLUMN km REAL;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar colunas:', err.message);
    }
  });
  db.run(`
    ALTER TABLE Viagem ADD COLUMN valor_total REAL;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar colunas:', err.message);
    }
  });
};
