import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft, RefreshCw, Printer, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import PortalAcademico from '../components/admin/PortalAcademico';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export default function CalendarioDeAula() {
  const contentRef = useRef(null);
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

  // Ações de Exportação
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!contentRef.current) return;
    
    try {
      toast.info("Gerando imagem de alta resolução...", { duration: 2000 });
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1400
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `cronograma-esuda-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      
      toast.success("Imagem baixada com sucesso!");
    } catch (error) {
      console.error("Erro na exportação:", error);
      toast.error("Erro ao gerar a imagem.");
    }
  };

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
    <div className="min-h-screen bg-gray-50/50 pb-10">
      {/* Barra de Ferramentas (Topo) */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm print:hidden">
        <div className="max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-3">
            
            <div className="flex items-center gap-2">
                <Link to={createPageUrl('EmAcaoPage')}>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                        <ArrowLeft className="w-4 h-4 mr-2" /> 
                        <span className="hidden sm:inline">Voltar</span>
                    </Button>
                </Link>
                <h1 className="text-lg font-bold text-gray-800 border-l pl-3 ml-1 border-gray-300">
                    Calendário Acadêmico
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Imprimir</span>
                </Button>
                <Button variant="default" size="sm" onClick={handleDownloadImage} className="gap-2 bg-green-700 hover:bg-green-800">
                    <Download className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Baixar Imagem</span>
                </Button>
            </div>
        </div>
      </div>

      {/* Área de Conteúdo (Capturável) */}
      <div className="p-2 sm:p-4 md:p-6 max-w-[1600px] mx-auto print:p-0 print:w-full" ref={contentRef}>
        <PortalAcademico 
          rawData={cronograma} 
          professores={professores}
          currentUser={currentUser}
        />
        
        {/* Rodapé visível apenas na imagem/impressão */}
        <div className="hidden print:flex justify-between items-center mt-4 pt-4 border-t text-sm text-gray-500">
            <span>Gerado via Portal ESUDA</span>
            <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Estilos para Impressão */}
      <style>{`
        @media print {
            @page { margin: 0.5cm; size: landscape; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
            .print\\:hidden { display: none !important; }
            .max-w-\\[1600px\\] { max-width: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}