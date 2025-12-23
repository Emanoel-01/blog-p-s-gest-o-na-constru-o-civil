import { QueryClient } from '@tanstack/react-query';

// Configuração otimizada do React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados estáticos: cache por 1 hora
      staleTime: 60 * 60 * 1000, // 1 hora padrão
      cacheTime: 90 * 60 * 1000, // 1.5 hora
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Configurações específicas por tipo de dado
export const queryKeys = {
  // Dados estáticos (1 hora)
  professores: 'professores',
  especializacoes: 'especializacoes',
  ciclos: 'ciclos',
  parceiros: 'parceiros',
  tecnologias: 'tecnologias',
  
  // Dados semi-estáticos (30 minutos)
  posts: 'posts',
  depoimentos: 'depoimentos-publicos',
  cronograma: 'cronograma',
  
  // Dados voláteis (30 segundos)
  notificacoes: 'notificacoes',
  comentarios: 'comentarios',
  leads: 'leads',
};

// Opções de cache por tipo
export const cacheOptions = {
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    cacheTime: 90 * 60 * 1000,
  },
  semiStatic: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 45 * 60 * 1000,
  },
  volatile: {
    staleTime: 30 * 1000, // 30 segundos
    cacheTime: 60 * 1000,
  },
};