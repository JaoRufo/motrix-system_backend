// Tipos globais do sistema Motrix

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'ativo' | 'inativo';
export type OrdemStatus = 'Aberta' | 'Em Andamento' | 'Aguardando Orçamento' | 'Finalizada' | 'Cancelada';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      BCRYPT_ROUNDS: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
