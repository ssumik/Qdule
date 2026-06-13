export interface Agendamento {
  time: string;
  name: string;
  service: string;
  status: "confirmed" | "pending";
}

export const mockAgenda: Record<number, Agendamento[]> = {
  13: [
    { time: "08:30", name: "Ana Souza", service: "Corte feminino", status: "confirmed" },
    { time: "09:30", name: "Beatriz Lima", service: "Coloração", status: "confirmed" },
    { time: "10:30", name: "Carla Mendes", service: "Hidratação", status: "pending" },
    { time: "14:00", name: "Diana Rocha", service: "Escova progressiva", status: "confirmed" },
    { time: "16:00", name: "Elisa Martins", service: "Corte feminino", status: "pending" },
  ],
  17: [
    { time: "09:00", name: "Fernanda Costa", service: "Coloração", status: "confirmed" },
    { time: "11:00", name: "Gabriela Nunes", service: "Hidratação", status: "pending" },
  ],
  20: [
    { time: "10:00", name: "Helena Dias", service: "Escova progressiva", status: "confirmed" },
  ],
  21: [
    { time: "08:30", name: "Isabela Ferreira", service: "Corte feminino", status: "confirmed" },
    { time: "10:15", name: "Juliana Alves", service: "Coloração", status: "confirmed" },
    { time: "14:00", name: "Karen Santos", service: "Hidratação", status: "pending" },
  ],
  23: [
    { time: "14:00", name: "Laura Oliveira", service: "Corte masculino", status: "confirmed" },
  ],
};

export interface Servico {
  id: number;
  nome: string;
  duracao: number;
  preco: number;
}

export const mockServicos: Servico[] = [
  { id: 1, nome: "Corte feminino", duracao: 60, preco: 80 },
  { id: 2, nome: "Escova progressiva", duracao: 120, preco: 180 },
  { id: 3, nome: "Coloração", duracao: 90, preco: 150 },
  { id: 4, nome: "Hidratação", duracao: 45, preco: 60 },
  { id: 5, nome: "Corte masculino", duracao: 30, preco: 45 },
];
