import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Instagram, Linkedin, Globe, FileText } from 'lucide-react';

export default function CorpoDiscentePage() {
  const { data: discentes = [], isLoading } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('ordem')
  });

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Corpo Discente
      </h2>
      <p className="text-gray-600 mb-6 text-justify">
        Conheça nossos alunos que fazem parte do programa de pós-graduação ESUDA.
      </p>

      {isLoading ? (
        <p className="text-gray-600">Carregando alunos...</p>
      ) : discentes.length === 0 ? (
        <p className="text-gray-500 italic text-justify">
          Os perfis dos alunos serão adicionados em breve pelo administrador.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {discentes.map((discente) => (
            <div key={discente.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              {discente.foto_url && (
                <img
                  src={discente.foto_url}
                  alt={discente.nome}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-200"
                />
              )}
              <h3 className="text-lg font-bold text-gray-800 text-center">{discente.nome}</h3>
              <p className="text-sm text-gray-600 text-center mb-4">{discente.titulo}</p>
              
              <div className="flex justify-center gap-3 mt-4">
                {discente.instagram && (
                  <a href={discente.instagram} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="hover:bg-pink-50">
                      <Instagram className="w-4 h-4 text-pink-600" />
                    </Button>
                  </a>
                )}
                {discente.linkedin && (
                  <a href={discente.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="hover:bg-blue-50">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                    </Button>
                  </a>
                )}
                {discente.lattes && (
                  <a href={discente.lattes} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="hover:bg-yellow-50">
                      <FileText className="w-4 h-4 text-yellow-700" />
                    </Button>
                  </a>
                )}
                {discente.site && (
                  <a href={discente.site} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="hover:bg-purple-50">
                      <Globe className="w-4 h-4 text-purple-700" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('ProfessoresPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('ParceirosPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Parceiros →
          </Button>
        </Link>
      </div>
    </div>
  );
}