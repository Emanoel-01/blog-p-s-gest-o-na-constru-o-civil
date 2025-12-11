import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Linkedin, Globe, Instagram, ArrowRight, CheckCircle, Handshake } from 'lucide-react';
import AdvancedFilters from '@/components/filters/AdvancedFilters';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function ParceirosPage() {
  const [filters, setFilters] = useState({
    tipo_parceria: '',
    busca: ''
  });

  const { data: parceiros = [], isLoading } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('ordem')
  });

  const filterOptions = [
    {
      key: 'tipo_parceria',
      label: 'Tipo de Parceria',
      type: 'select',
      placeholder: 'Selecione o tipo',
      options: [
        { value: 'Canteiros Didáticos', label: 'Canteiros Didáticos' },
        { value: 'Workshops', label: 'Workshops' },
        { value: 'Masterclasses', label: 'Masterclasses' },
        { value: 'Contratação de Alunos', label: 'Contratação de Alunos' },
        { value: 'Incubadora Profissional', label: 'Incubadora Profissional' },
        { value: 'Licença Educacional', label: 'Licença Educacional' },
        { value: 'Convênios Corporativos', label: 'Convênios Corporativos' }
      ]
    },
    {
      key: 'busca',
      label: 'Buscar por Nome',
      type: 'text',
      placeholder: 'Digite o nome do parceiro'
    }
  ];

  const filteredParceiros = parceiros.filter(parceiro => {
    const matchesTipo = !filters.tipo_parceria || 
      parceiro.tipos_parceria?.some(tp => tp.tipo === filters.tipo_parceria);
    const matchesBusca = !filters.busca || 
      parceiro.nome.toLowerCase().includes(filters.busca.toLowerCase());
    return matchesTipo && matchesBusca;
  });

  return (
    <div className="px-2 sm:px-4">
      <Breadcrumb />
      
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Nossos Parceiros</h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-center text-sm sm:text-base max-w-3xl mx-auto">
        Conheça as empresas e instituições que são parceiras estratégicas de nossas pós-graduações.
      </p>

      <AdvancedFilters
        pageName="ParceirosPage"
        filterOptions={filterOptions}
        currentFilters={filters}
        onFiltersChange={setFilters}
      />

      {isLoading ? (
        <p className="text-gray-600 text-center">Carregando parceiros...</p>
      ) : filteredParceiros.length === 0 ? (
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200 text-center">
          <p className="text-gray-700 italic text-sm sm:text-base">
            Os dados dos parceiros serão adicionados em breve pelo administrador.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8 mt-6">
          {filteredParceiros.map((parceiro) => (
            <div key={parceiro.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col items-center">
              {parceiro.logo_url && (
                <img
                  src={parceiro.logo_url}
                  alt={parceiro.nome}
                  loading="lazy"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border-2 border-gray-200 mb-3"
                />
              )}
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2 text-center line-clamp-2">{parceiro.nome}</h3>
              
              {parceiro.tipos_parceria && parceiro.tipos_parceria.length > 0 && (
                <div className="mb-3 w-full">
                  <p className="text-[10px] text-gray-600 text-center mb-1">Parcerias:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {parceiro.tipos_parceria.slice(0, 2).map((tp, idx) => (
                      <span key={idx} className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200">
                        {tp.tipo.split(' ')[0]}
                      </span>
                    ))}
                    {parceiro.tipos_parceria.length > 2 && (
                      <span className="text-[9px] bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded-full border border-gray-200">
                        +{parceiro.tipos_parceria.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-1 mt-auto">
                {parceiro.instagram && (
                  <a href={parceiro.instagram} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="text-pink-600 hover:text-pink-700 h-7 w-7">
                      <Instagram className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
                {parceiro.linkedin && (
                  <a href={parceiro.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="text-blue-600 hover:text-blue-700 h-7 w-7">
                      <Linkedin className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
                {parceiro.site && (
                  <a href={parceiro.site} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="text-gray-600 hover:text-gray-700 h-7 w-7">
                      <Globe className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seção Quero ser Parceiro */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 border-2 border-green-300 mt-8 sm:mt-12">
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Handshake className="w-7 h-7 text-green-600" />
            Quero ser Parceiro
          </h3>
          <p className="text-gray-700 text-sm sm:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
            Conecte-se com o Coordenador e a ESUDA. Descubra oportunidades de parceria, receba análises personalizadas e inicie colaborações estratégicas.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-green-200 mb-6">
          <h4 className="font-bold text-gray-800 mb-4 text-center text-base sm:text-lg">
            Tipos de Parceria Disponíveis:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Canteiros Didáticos</p>
                <p className="text-xs text-gray-600">Espaços práticos de aprendizado</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Workshops</p>
                <p className="text-xs text-gray-600">Eventos técnicos especializados</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Masterclasses</p>
                <p className="text-xs text-gray-600">Aulas com especialistas renomados</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Contratação de Alunos</p>
                <p className="text-xs text-gray-600">Acesso ao nosso talento qualificado</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-teal-50 p-3 rounded-lg border border-teal-200">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Incubadora Profissional</p>
                <p className="text-xs text-gray-600">Projetos práticos com alunos</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Licença Educacional</p>
                <p className="text-xs text-gray-600">Softwares e ferramentas</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-pink-50 p-3 rounded-lg border border-pink-200">
              <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Convênios Corporativos</p>
                <p className="text-xs text-gray-600">Descontos para colaboradores</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Seja Professor</p>
                <p className="text-xs text-gray-600">Compartilhe seu conhecimento</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="https://parcerias-esuda-amorimtech.base44.app" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 text-base sm:text-lg">
              <Handshake className="w-5 h-5 mr-2" />
              Iniciar Parceria
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link to={createPageUrl('ProfessoresPage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('EmAcaoPage')} className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
            Ver Em Ação
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}