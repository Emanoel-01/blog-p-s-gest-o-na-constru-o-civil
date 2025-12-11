import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Linkedin, Globe, Instagram, ArrowRight, CheckCircle, Handshake } from 'lucide-react';

export default function ParceirosPage() {
  const { data: parceiros = [], isLoading } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('ordem')
  });

  return (
    <div className="px-2 sm:px-4">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Nossos Parceiros</h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-justify text-sm sm:text-base">
        Conheça as empresas e instituições que são parceiras estratégicas de nossas pós-graduações.
      </p>

      {isLoading ? (
        <p className="text-gray-600">Carregando parceiros...</p>
      ) : parceiros.length === 0 ? (
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200 text-center">
          <p className="text-gray-700 italic text-justify text-sm sm:text-base">
            Os dados dos parceiros serão adicionados em breve pelo administrador.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {parceiros.map((parceiro) => (
            <div key={parceiro.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start mb-3 sm:mb-4">
                {parceiro.logo_url && (
                  <img
                    src={parceiro.logo_url}
                    alt={parceiro.nome}
                    loading="lazy"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border-4 border-green-600 shadow-md mx-auto sm:mx-0"
                  />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{parceiro.nome}</h3>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    {parceiro.instagram && (
                      <a href={parceiro.instagram} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="text-pink-600 hover:text-pink-700 h-8 w-8">
                          <Instagram className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    {parceiro.linkedin && (
                      <a href={parceiro.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="text-blue-600 hover:text-blue-700 h-8 w-8">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    {parceiro.site && (
                      <a href={parceiro.site} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="text-gray-600 hover:text-gray-700 h-8 w-8">
                          <Globe className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Tipos de Parceria:
                </h4>
                <div className="space-y-2">
                  {parceiro.tipos_parceria?.map((tp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-green-600 mt-0.5">▸</span>
                      <div>
                        <strong className="text-gray-800 text-xs sm:text-sm">{tp.tipo}</strong>
                        {tp.quantidade > 0 && (
                          <span className="text-gray-600 text-xs sm:text-sm"> - {tp.quantidade} unidade(s)</span>
                        )}
                        {tp.desconto > 0 && (
                          <span className="text-gray-600 text-xs sm:text-sm"> - {tp.desconto}% de desconto</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!parceiro.tipos_parceria || parceiro.tipos_parceria.length === 0) && (
                    <p className="text-xs sm:text-sm text-gray-500 italic">Nenhum tipo de parceria especificado.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seção Quero ser Parceiro */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 border-2 border-green-300 mt-8 sm:mt-12 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Quero ser Parceiro
        </h3>
        <p className="text-gray-700 text-sm sm:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
          Conecte-se com o Coordenador e a ESUDA. Descubra oportunidades de parceria, receba análises personalizadas e inicie colaborações estratégicas.
        </p>
        <a href="https://parcerias-esuda-amorimtech.base44.app" target="_blank" rel="noopener noreferrer">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 text-lg">
            <Handshake className="w-5 h-5 mr-2" />
            Iniciar Parceria
          </Button>
        </a>
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