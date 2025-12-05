import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function CiclosPage() {
  const accordionContainerRef = useRef(null);

  const { data: ciclos = [], isLoading } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const boxColors = [
    'bg-blue-50 border-blue-200', 'bg-green-50 border-green-200', 'bg-indigo-50 border-indigo-200',
    'bg-pink-50 border-pink-200', 'bg-yellow-50 border-yellow-200', 'bg-purple-50 border-purple-200'
  ];

  const handleAccordionToggle = (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;

    const item = header.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const isOpen = header.classList.contains('open');

    accordionContainerRef.current.querySelectorAll('.accordion-header').forEach(h => {
      if (h !== header) {
        h.classList.remove('open');
        h.nextElementSibling.style.maxHeight = null;
        h.querySelector('.chevron-icon')?.classList.remove('rotate-180');
      }
    });

    if (!isOpen) {
      header.classList.add('open');
      content.style.maxHeight = content.scrollHeight + "px";
      header.querySelector('.chevron-icon')?.classList.add('rotate-180');
    } else {
      header.classList.remove('open');
      content.style.maxHeight = null;
      header.querySelector('.chevron-icon')?.classList.remove('rotate-180');
    }
  };

  return (
    <div>
      <style>{`
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-in-out;
        }
        .accordion-header.open + .accordion-content {
          overflow: visible;
        }
      `}</style>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Nossos Ciclos de Conhecimento
      </h2>
      <p className="text-gray-600 mb-6 text-justify">
        Clique em um ciclo para ver as disciplinas oferecidas.
      </p>

      {isLoading ? (
        <p className="text-gray-600">Carregando ciclos...</p>
      ) : ciclos.length === 0 ? (
        <p className="text-gray-500 italic text-justify">
          Nenhum ciclo disponível no momento. Por favor, aguarde enquanto atualizamos o conteúdo.
        </p>
      ) : (
        <div ref={accordionContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" onClick={handleAccordionToggle}>
          {ciclos.map((ciclo, index) => {
            const colorClass = boxColors[index % boxColors.length];

            return (
              <div key={ciclo.id} className={`accordion-item rounded-xl shadow-lg border ${colorClass}`} data-index={index}>
                <button
                  className={`accordion-header w-full text-left p-4 flex justify-between items-center transition duration-300 rounded-t-xl hover:bg-black/5`}
                >
                  <span className="font-semibold text-gray-800 flex-1 pr-2">{ciclo.nome} ({ciclo.carga_horaria}h)</span>
                  <ChevronDown className={`chevron-icon w-5 h-5 transform transition-transform duration-300 shrink-0`} />
                </button>
                <div className="accordion-content bg-white rounded-b-xl">
                  <ul className="p-4 pt-2 text-gray-700 list-disc list-inside space-y-2 text-sm">
                    {ciclo.disciplinas && ciclo.disciplinas.length > 0 ? (
                      ciclo.disciplinas.map((d, i) => <li key={i}>{d}</li>)
                    ) : (
                      <p className="p-4 pt-2 text-sm text-gray-500 italic text-justify">Nenhuma disciplina lançada.</p>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('DiferenciaisPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('EspecializacoesPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Especializações
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}