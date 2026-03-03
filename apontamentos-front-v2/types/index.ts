export type Department =
  | "Financeiro"
  | "RH"
  | "TI"
  | "DP"
  | "Engenharia"
  | "Suprimentos"
  | "Facilities"
  | "Comercial"
  | "Projetos";

export type UserRole = "admin" | "manager" | "user";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";

export interface FileAttachment {
  id: any;
  fileName: string;
  fileSize: number;
  fileType: "pdf" | "image" | "other";
  fileUrl: string;
  createdAt: Date;
  uploadedByName: string;
}

// // List of all available departments
export const DEPARTMENTS: Department[] = [
  "Financeiro",
  "RH",
  "TI",
  "DP",
  "Engenharia",
  "Suprimentos",
  "Facilities",
  "Comercial",
  "Projetos",
];

// User interface
export interface ClientUser {
  id: number;
  nome: string;
  email: string;
  avatar?: string | null;
  alterarProximoLogin?: boolean;
  departamento: {
    id: number;
    descricao: string;
    codccusto: string;
  };
  funcao: {
    id: number;
    descricao: string;
  };
}

export interface ClientTicket {
  id: number;
  titulo: string;
  descricao: string;
  // criadoPor: number;
  // resolvidoPor: number | null;
  createdAt: Date;
  updatedAt: Date;
  criado: {
    id: number;
    departamentoId: number;
    createdAt: Date;
    updatedAt: Date;
    nome: string;
    email: string;
    password: string;
    avatar?: string | null;
    funcaoId: number;
  } | null;
  resolvido: {
    id: number;
    departamentoId: number;
    createdAt: Date;
    updatedAt: Date;
    nome: string;
    email: string;
    password: string;
    avatar?: string | null;
    funcaoId: number;
  } | null;
  departamento: {
    id: number;
    codccusto: string;
    descricao: string;
    createdAt: Date;
    updatedAt: Date;
  };
  prioridade: {
    id: number;
    descricao: string;
    createdAt: Date;
    updatedAt: Date;
  };
  status: {
    id: number;
    descricao: string;
    createdAt: Date;
    updatedAt: Date;
  };
  comentarios?: ClientComentario[];
}

export interface ClientComentario {
  id: number;
  conteudo: string;
  createdAt: Date;
  updatedAt: Date;
  anexo: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    nome: string;
    tamanho: string;
    tipo: string;
    anexoPorId: number;
    comentarioId: number | null;
  }[];
  usuario: ClientUser;
  ticket: ClientTicket;
}

export interface MensagemChat {
  id: number;
  conteudo: string;
  createdAt: Date;
  autor: {
    id: number;
    nome: string;
    avatar?: string | null;
    departamento: string;
  };
  isTecnico: boolean;
}

export interface ChatTicket {
  ticketId: number;
  titulo: string;
  criador: ClientUser;
  responsavel?: ClientUser | null;
  mensagens: MensagemChat[];
  status: string;
}
