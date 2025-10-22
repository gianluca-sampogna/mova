// Pessoa é a superclasse (Motorista e Passageiro herdam dela)
export interface Pessoa {
  id_usuario?: number; // ? porque pode ser criado automaticamente
  endereco: string;
  email: string;
  num_telefone: string;
  nome: string;
  senha: string;
}

// Subclasse Motorista
export interface Motorista extends Pessoa {
  id_motorista?: number;
  saldo: number;
}

// Subclasse Passageiro
export interface Passageiro extends Pessoa {
  id_passageiro?: number;
}

// Veículo
export interface Veiculo {
  placa: string;
  modelo: string;
  cor: string;
  passageiros_maximos: number;
  id_motorista: number;
}

// Viagem
export interface Viagem {
  id_viagem?: number;
  horario_partida: string;
  valor_por_km: number;
  local_saida: string;
  local_chegada: string;
  vagas_maximas: number;
  id_motorista: number;
  placa_veiculo: string;
}

// Ponto de rota
export interface PontoRota {
  id_ponto_rota?: number;
  latitude: number;
  longitude: number;
  ordem: number;
  id_viagem: number;
}

// Check-in (relação Passageiro ↔ Viagem)
export interface Checkin {
  id_checkin?: number;
  id_passageiro: number;
  id_viagem: number;
  ponto_embarque: string;
}
