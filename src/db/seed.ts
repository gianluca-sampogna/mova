import { db } from "./database";
import bcrypt from "bcryptjs"; // 1. Importe o bcrypt

// Função utilitária para gerar um número de telefone simulado
const generatePhone = (start: string) => {
  const num = Math.floor(Math.random() * 90000000) + 10000000;
  // Retorna a string do número de telefone
  return `${start}${num}`;
};

// Array para armazenar os números de telefone gerados antes de rodar o db.exec
// Isso é necessário porque o template literal é avaliado ANTES do db.exec
const motoristaPhones = [
  generatePhone("119"),
  generatePhone("119"),
  generatePhone("219"),
  generatePhone("319"),
  generatePhone("419"),
  generatePhone("519"),
  generatePhone("619"),
  generatePhone("719"),
  generatePhone("819"),
  generatePhone("919"),
];

const passageiroPhones: string[] = [];
for (let i = 0; i < 30; i++) {
  passageiroPhones.push(generatePhone(i < 5 ? "119" : i < 8 ? "219" : "919")); // Distribuição de DDDs
}

export const seedDatabase = () => {
  // 2. Gere o hash para a senha '123' ANTES de executar o SQL
  // Usamos 'Sync' (síncrono) aqui pois é um script de seed,
  // não há problema em bloquear a thread principal momentaneamente.
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("123", salt);

  db.serialize(() => {
    console.log("🌱 Iniciando seed do banco de dados (COM NOME)...");

    db.exec(`
      -- Limpar tabelas (ordem reversa por causa das FKs)
      DELETE FROM Checkin;
      DELETE FROM Ponto_rota;
      DELETE FROM Viagem;
      DELETE FROM Veiculo;
      DELETE FROM Passageiro;
      DELETE FROM Motorista;
      DELETE FROM Pessoa;

      -- !!! CORREÇÃO ADICIONADA !!!
      -- Reseta o contador de auto-incremento (id_usuario) da tabela Pessoa
      DELETE FROM sqlite_sequence WHERE name = 'Pessoa';

      --------------------------------------------------
      -- 1. PESSOAS (Motoristas: 1-10 | Passageiros: 11-40) COM SENHA HASHED
      --------------------------------------------------

      -- 10 Motoristas
      INSERT INTO Pessoa (nome, endereco, email, num_telefone, senha) VALUES 
        ('Carlos Silva', 'Rua das Palmeiras, 10', 'motorista1@email.com', '${motoristaPhones[0]}', '${hashedPassword}'),
        ('Maria Santos', 'Av. Paulista, 1500', 'motorista2@email.com', '${motoristaPhones[1]}', '${hashedPassword}'),
        ('João Oliveira', 'Rua 7 de Setembro, 50', 'motorista3@email.com', '${motoristaPhones[2]}', '${hashedPassword}'),
        ('Ana Costa', 'Rua do Sol, 300', 'motorista4@email.com', '${motoristaPhones[3]}', '${hashedPassword}'),
        ('Pedro Rocha', 'Av. Brasil, 222', 'motorista5@email.com', '${motoristaPhones[4]}', '${hashedPassword}'),
        ('Sofia Almeida', 'Estrada Velha, 99', 'motorista6@email.com', '${motoristaPhones[5]}', '${hashedPassword}'),
        ('Lucas Souza', 'Praça da Sé, 1', 'motorista7@email.com', '${motoristaPhones[6]}', '${hashedPassword}'),
        ('Isabela Lima', 'Alameda dos Anjos, 101', 'motorista8@email.com', '${motoristaPhones[7]}', '${hashedPassword}'),
        ('Guilherme Melo', 'Rua da Saudade, 45', 'motorista9@email.com', '${motoristaPhones[8]}', '${hashedPassword}'),
        ('Laura Fernandes', 'Av. Atlântica, 500', 'motorista10@email.com', '${motoristaPhones[9]}', '${hashedPassword}');

      -- 30 Passageiros
      INSERT INTO Pessoa (nome, endereco, email, num_telefone, senha) VALUES 
        ('Ricardo Pires', 'Rua A, 1', 'passageiro1@email.com', '${passageiroPhones[0]}', '${hashedPassword}'),
        ('Camila Alves', 'Rua B, 2', 'passageiro2@email.com', '${passageiroPhones[1]}', '${hashedPassword}'),
        ('Felipe Gomes', 'Rua C, 3', 'passageiro3@email.com', '${passageiroPhones[2]}', '${hashedPassword}'),
        ('Gabriela Nogueira', 'Rua D, 4', 'passageiro4@email.com', '${passageiroPhones[3]}', '${hashedPassword}'),
        ('Rafael Barbosa', 'Rua E, 5', 'passageiro5@email.com', '${passageiroPhones[4]}', '${hashedPassword}'),
        ('Aline Dantas', 'Rua F, 6', 'passageiro6@email.com', '${passageiroPhones[5]}', '${hashedPassword}'),
        ('Bruno Queiroz', 'Rua G, 7', 'passageiro7@email.com', '${passageiroPhones[6]}', '${hashedPassword}'),
        ('Julia Martins', 'Rua H, 8', 'passageiro8@email.com', '${passageiroPhones[7]}', '${hashedPassword}'),
        ('Daniel Lins', 'Rua I, 9', 'passageiro9@email.com', '${passageiroPhones[8]}', '${hashedPassword}'),
        ('Vitória Rios', 'Rua J, 10', 'passageiro10@email.com', '${passageiroPhones[9]}', '${hashedPassword}'),
        ('Leonardo Vaz', 'Rua K, 11', 'passageiro11@email.com', '${passageiroPhones[10]}', '${hashedPassword}'),
        ('Patrícia Neves', 'Rua L, 12', 'passageiro12@email.com', '${passageiroPhones[11]}', '${hashedPassword}'),
        ('Thiago Fogaça', 'Rua M, 13', 'passageiro13@email.com', '${passageiroPhones[12]}', '${hashedPassword}'),
        ('Manuela Mendes', 'Rua N, 14', 'passageiro14@email.com', '${passageiroPhones[13]}', '${hashedPassword}'),
        ('Enzo Ferreira', 'Rua O, 15', 'passageiro15@email.com', '${passageiroPhones[14]}', '${hashedPassword}'),
        ('Helena Castro', 'Rua P, 16', 'passageiro16@email.com', '${passageiroPhones[15]}', '${hashedPassword}'),
        ('Caio Becker', 'Rua Q, 17', 'passageiro17@email.com', '${passageiroPhones[16]}', '${hashedPassword}'),
        ('Bianca Cruz', 'Rua R, 18', 'passageiro18@email.com', '${passageiroPhones[17]}', '${hashedPassword}'),
        ('André Rocha', 'Rua S, 19', 'passageiro19@email.com', '${passageiroPhones[18]}', '${hashedPassword}'),
        ('Clara Pinto', 'Rua T, 20', 'passageiro20@email.com', '${passageiroPhones[19]}', '${hashedPassword}'),
        ('Davi Guerra', 'Rua U, 21', 'passageiro21@email.com', '${passageiroPhones[20]}', '${hashedPassword}'),
        ('Eva Ribeiro', 'Rua V, 22', 'passageiro22@email.com', '${passageiroPhones[21]}', '${hashedPassword}'),
        ('Giovanni Telles', 'Rua W, 23', 'passageiro23@email.com', '${passageiroPhones[22]}', '${hashedPassword}'),
        ('Heloísa Cunha', 'Rua X, 24', 'passageiro24@email.com', '${passageiroPhones[23]}', '${hashedPassword}'),
        ('Igor Freitas', 'Rua Y, 25', 'passageiro25@email.com', '${passageiroPhones[24]}', '${hashedPassword}'),
        ('Janaína Moura', 'Rua Z, 26', 'passageiro26@email.com', '${passageiroPhones[25]}', '${hashedPassword}'),
        ('Kevin Viana', 'Av. Central, 30', 'passageiro27@email.com', '${passageiroPhones[26]}', '${hashedPassword}'),
        ('Larissa Godoi', 'Rua da Paz, 40', 'passageiro28@email.com', '${passageiroPhones[27]}', '${hashedPassword}'),
        ('Marcelo Evaristo', 'Rua Nova, 50', 'passageiro29@email.com', '${passageiroPhones[28]}', '${hashedPassword}'),
        ('Natália Sales', 'Travessa da Lua, 60', 'passageiro30@email.com', '${passageiroPhones[29]}', '${hashedPassword}');
    

      --------------------------------------------------
      -- 2. MOTORISTAS E PASSAGEIROS (Herança de Pessoa)
      --------------------------------------------------

      -- 10 Motoristas (IDs 1 a 10)
      INSERT INTO Motorista (id_motorista, saldo, cnh) VALUES 
        (1, 150.00, '12345678900'), (2, 500.00, '98765432100'),
        (3, 200.00, '45678912300'), (4, 350.00, '65432198700'),
        (5, 100.00, '78912345600'), (6, 400.00, '32165498700'),
        (7, 250.00, '15975348600'), (8, 300.00, '75315926400'),
        (9, 180.00, '95135725800'), (10, 550.00, '85245614700');

      -- 30 Passageiros (IDs 11 a 40)
      INSERT INTO Passageiro (id_passageiro) VALUES 
        (11), (12), (13), (14), (15), (16), (17), (18), (19), (20),
        (21), (22), (23), (24), (25), (26), (27), (28), (29), (30),
        (31), (32), (33), (34), (35), (36), (37), (38), (39), (40);

      --------------------------------------------------
      -- 3. VEÍCULOS (0 a 2 carros por motorista)
      --------------------------------------------------

      -- Motorista 1: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('AAA-0001', 'Onix', 'Prata', 4, 1);
      -- Motorista 2: 2 carros
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('BBB-0002', 'HB20', 'Branco', 4, 2);
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('BBB-0003', 'Celta', 'Vermelho', 4, 2);
      -- Motorista 3: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('CCC-0004', 'Voyage', 'Preto', 4, 3);
      -- Motorista 4: 0 carros (não participa de viagens como motorista)
      -- Motorista 5: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('EEE-0006', 'Kwid', 'Amarelo', 3, 5);
      -- Motorista 6: 2 carros
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('FFF-0007', 'Corolla', 'Cinza', 4, 6);
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('FFF-0008', 'Hilux', 'Preto', 4, 6);
      -- Motorista 7: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('GGG-0009', 'Golf', 'Azul', 4, 7);
      -- Motorista 8: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('HHH-0010', 'Punto', 'Verde', 4, 8);
      -- Motorista 9: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('III-0011', 'Uno', 'Branco', 4, 9);
      -- Motorista 10: 1 carro
      INSERT INTO Veiculo (placa, modelo, cor, passageiros_maximos, id_motorista) VALUES ('JJJ-0012', 'Civic', 'Prata', 4, 10);
      
      --------------------------------------------------
      -- 4. VIAGENS (6 viagens)
      --------------------------------------------------

      -- Viagem 1 (Motorista 1)
      INSERT INTO Viagem (id_viagem, horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES 
        (1, '2025-10-22T08:00:00', 2.5, 'Centro', 'Universidade', 3, 1, 'AAA-0001');

      -- Viagem 2 (Motorista 2)
      INSERT INTO Viagem (id_viagem, horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES 
        (2, '2025-10-22T09:30:00', 3.0, 'Bairro Nobre', 'Aeroporto', 3, 2, 'BBB-0002');

      -- Viagem 3 (Motorista 3)
      INSERT INTO Viagem (id_viagem, horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES 
        (3, '2025-10-23T17:00:00', 2.2, 'Terminal', 'Shopping', 4, 3, 'CCC-0004');

      -- Viagem 4 (Motorista 5 - carro pequeno)
      INSERT INTO Viagem (id_viagem, horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES 
        (4, '2025-10-24T06:45:00', 2.8, 'Zona Sul', 'Centro Empresarial', 2, 5, 'EEE-0006');

      -- Viagem 5 (Motorista 6 - carro confortável)
      INSERT INTO Viagem (id_viagem, horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES 
        (5, '2025-10-24T18:30:00', 3.5, 'Praia', 'Montanha', 3, 6, 'FFF-0007');

      -- Viagem 6 (Motorista 7 - para teste de mais checkins)
      INSERT INTO Viagem (id_viagem, horario_partida, valor_por_km, local_saida, local_chegada, vagas_maximas, id_motorista, placa_veiculo)
      VALUES 
        (6, '2025-10-25T10:00:00', 2.0, 'Centro Histórico', 'Estádio', 4, 7, 'GGG-0009');
        
      --------------------------------------------------
      -- 5. PONTOS DE ROTA
      --------------------------------------------------

      -- Rota Viagem 1 (3 pontos)
      INSERT INTO Ponto_rota (latitude, longitude, ordem, id_viagem) VALUES 
        (-23.55, -46.63, 1, 1), (-23.56, -46.64, 2, 1), (-23.57, -46.65, 3, 1);

      -- Rota Viagem 2 (2 pontos)
      INSERT INTO Ponto_rota (latitude, longitude, ordem, id_viagem) VALUES 
        (-23.60, -46.68, 1, 2), (-23.65, -46.70, 2, 2);

      -- Rota Viagem 3 (4 pontos)
      INSERT INTO Ponto_rota (latitude, longitude, ordem, id_viagem) VALUES 
        (-23.50, -46.55, 1, 3), (-23.51, -46.56, 2, 3), (-23.52, -46.57, 3, 3), (-23.53, -46.58, 4, 3);

      -- Rota Viagem 4 (3 pontos)
      INSERT INTO Ponto_rota (latitude, longitude, ordem, id_viagem) VALUES 
        (-23.70, -46.80, 1, 4), (-23.71, -46.81, 2, 4), (-23.72, -46.82, 3, 4);

      -- Rota Viagem 5 (2 pontos)
      INSERT INTO Ponto_rota (latitude, longitude, ordem, id_viagem) VALUES 
        (-23.80, -46.90, 1, 5), (-23.85, -46.95, 2, 5);
        
      -- Rota Viagem 6 (3 pontos)
      INSERT INTO Ponto_rota (latitude, longitude, ordem, id_viagem) VALUES 
        (-23.40, -46.50, 1, 6), (-23.41, -46.51, 2, 6), (-23.42, -46.52, 3, 6);


      --------------------------------------------------
      -- 6. CHECKIN (Passageiros entram nas viagens)
      --------------------------------------------------

      -- Viagem 1 (3 vagas, 3 checkins)
      INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque) VALUES 
        (11, 1, 'Rua A, perto do mercado'),
        (12, 1, 'Rua B, na esquina'),
        (13, 1, 'Rua C, em frente ao banco');

      -- Viagem 2 (3 vagas, 2 checkins)
      INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque) VALUES 
        (14, 2, 'Av. Principal, ponto 1'),
        (15, 2, 'Rua Secundária, ponto 2');

      -- Viagem 3 (4 vagas, 4 checkins)
      INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque) VALUES 
        (16, 3, 'Posto de gasolina X'),
        (17, 3, 'Rodoviária, plataforma 3'),
        (18, 3, 'Shopping, entrada principal'),
        (19, 3, 'Hotel Central');

      -- Viagem 4 (2 vagas, 2 checkins)
      INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque) VALUES 
        (20, 4, 'Ponto de ônibus Y'),
        (21, 4, 'Rua da Escola');
        
      -- Viagem 5 (3 vagas, 1 checkin)
      INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque) VALUES 
        (22, 5, 'Mirante da Praia');

      -- Viagem 6 (4 vagas, 4 checkins - lotada)
      INSERT INTO Checkin (id_passageiro, id_viagem, ponto_embarque) VALUES 
        (23, 6, 'Ponto 1'),
        (24, 6, 'Ponto 2'),
        (25, 6, 'Ponto 3'),
        (26, 6, 'Ponto 4');
    `);

    console.log(
      "✅ Banco populado com 10 motoristas, 30 passageiros e 6 viagens!"
    );
  });
};
