import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import PortalAcademico from '../components/admin/PortalAcademico';

export default function CalendarioDeAula() {
  // 1. Busca Dados (Conectado ao Base44)
  const { data: cronograma = [], isLoading: loadingSchedule, isError, refetch } = useQuery({
    queryKey: ['cronograma-aulas'],
    queryFn: async () => {
      try {
        return await base44.entities.CronogramaAula.list('data'); 
      } catch (e) {
        console.warn("Entidade 'CronogramaAula' não encontrada ou vazia.", e);
        return []; 
      }
    },
    staleTime: 1000 * 60 * 5
  });

  const { data: professores = [] } = useQuery({
    queryKey: ['professores-lista'],
    queryFn: () => base44.entities.Professor.list('nome'),
    staleTime: 1000 * 60 * 30
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (e) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 10
  });

  // 2. Loading State
  if (loadingSchedule) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-12 h-12 text-green-700 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Sincronizando portal acadêmico...</p>
      </div>
    );
  }

  // 3. Error State
  if (isError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-600">Erro ao carregar cronograma</h2>
        <Button onClick={() => refetch()} variant="outline"><RefreshCw className="w-4 h-4 mr-2"/> Tentar Novamente</Button>
      </div>
    );
  }

  // 4. Renderização do Portal
  return (
    <div className="relative">
      {/* Botão de Voltar Flutuante */}
      <div className="fixed bottom-4 left-4 z-50 print:hidden">
         <Link to={createPageUrl('EmAcaoPage')}>
            <Button variant="secondary" size="sm" className="shadow-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700">
               <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Blog
            </Button>
         </Link>
      </div>

      {/* Componente Principal */}
      <PortalAcademico 
        rawData={cronograma} 
        professores={professores}
        currentUser={currentUser}
      />
    </div>
  );
}