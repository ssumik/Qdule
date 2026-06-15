export interface Agendamento {
  time: string;
  name: string;
  service: string;
  status: "confirmed" | "pending";
}

export const mockAgenda: Record<number, Agendamento[]> = {
  13: [
    {
      time: "08:30",
      name: "Ana Souza",
      service: "Limpeza de Pele",
      status: "confirmed",
    },
    {
      time: "10:00",
      name: "Beatriz Lima",
      service: "Massagem Relaxante",
      status: "confirmed",
    },
    {
      time: "14:00",
      name: "Carla Mendes",
      service: "Drenagem Linfática",
      status: "pending",
    },
    {
      time: "16:00",
      name: "Diana Rocha",
      service: "Radiofrequência Facial",
      status: "confirmed",
    },
  ],

  17: [
    {
      time: "09:00",
      name: "Fernanda Costa",
      service: "Massagem Modeladora",
      status: "confirmed",
    },
    {
      time: "11:00",
      name: "Gabriela Nunes",
      service: "Peeling Facial",
      status: "pending",
    },
    {
      time: "15:00",
      name: "Helena Dias",
      service: "Ventosaterapia",
      status: "confirmed",
    },
  ],

  20: [
    {
      time: "10:00",
      name: "Isabela Ferreira",
      service: "Microagulhamento Facial",
      status: "confirmed",
    },
    {
      time: "14:30",
      name: "Juliana Alves",
      service: "Massagem Relaxante",
      status: "pending",
    },
  ],

  21: [
    {
      time: "08:30",
      name: "Karen Santos",
      service: "Limpeza de Pele",
      status: "confirmed",
    },
    {
      time: "10:15",
      name: "Laura Oliveira",
      service: "Drenagem Linfática",
      status: "confirmed",
    },
    {
      time: "14:00",
      name: "Mariana Costa",
      service: "Massagem Modeladora",
      status: "pending",
    },
    {
      time: "16:00",
      name: "Natália Rocha",
      service: "Peeling Facial",
      status: "confirmed",
    },
  ],

  23: [
    {
      time: "09:00",
      name: "Olivia Martins",
      service: "Ventosaterapia",
      status: "confirmed",
    },
    {
      time: "14:00",
      name: "Paula Ferreira",
      service: "Radiofrequência Facial",
      status: "pending",
    },
  ],
};

export interface Servico {
  id: number;
  nome: string;
  duracao: number;
  preco: number;
}

export const mockServicos: Servico[] = [
  {
    id: 1,
    nome: "Limpeza de Pele",
    duracao: 60,
    preco: 120,
  },
  {
    id: 2,
    nome: "Peeling Facial",
    duracao: 50,
    preco: 150,
  },
  {
    id: 3,
    nome: "Microagulhamento Facial",
    duracao: 90,
    preco: 280,
  },
  {
    id: 4,
    nome: "Radiofrequência Facial",
    duracao: 60,
    preco: 180,
  },
  {
    id: 5,
    nome: "Drenagem Linfática",
    duracao: 60,
    preco: 110,
  },
  {
    id: 6,
    nome: "Massagem Relaxante",
    duracao: 60,
    preco: 100,
  },
  {
    id: 7,
    nome: "Massagem Modeladora",
    duracao: 75,
    preco: 140,
  },
  {
    id: 8,
    nome: "Ventosaterapia",
    duracao: 45,
    preco: 90,
  },
];
