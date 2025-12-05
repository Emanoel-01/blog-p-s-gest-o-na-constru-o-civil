
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Linkedin, BookOpen, Globe, Instagram, ArrowRight } from 'lucide-react';

export default function ProfessoresPage() {
  const professores = [
    {
      nome: "Professor 1",
      titulo: "Doutor em Engenharia Civil",
      foto: "https://via.placeholder.com/150",
      instagram: "",
      linkedin: "https://linkedin.com",
      lattes: "https://lattes.cnpq.br",
      site: ""
    },
    {
      nome: "Professor 2",
      titulo: "Mestre em Arquitetura",
      foto: "https://via.placeholder.com/150",
      instagram: "https://instagram.com",
      linkedin: "",
      lattes: "https://lattes.cnpq.br",
      site: "https://exemplo.com"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Nossos Professores</h2>
      <p className="text-gray-600 mb-8 text-justify">
        Conheça o time de professores especialistas que compõem o corpo docente de nossas pós-graduações.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {professores.map((prof, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200 hover:shadow-xl transition-shadow">
            <img
              src={prof.foto}
              alt={prof.nome}
              className="w-32 h-32 rounded-full object-cover border-4 border-green-600 shadow-md mx-auto mb-4"
            />
            <h3 className="text-lg font-bold text-gray-800 mb-1">{prof.nome}</h3>
            <p className="text-sm text-gray-600 mb-4">{prof.titulo}</p>
            
            <div className="flex justify-center gap-2">
              <a href={prof.instagram} target="_blank" rel="noopener noreferrer" className={!prof.instagram ? 'pointer-events-none' : ''}>
                <Button size="icon" variant="ghost" className={prof.instagram ? 'text-blue-600' : 'text-gray-300'}>
                  <Instagram className="w-5 h-5" />
                </Button>
              </a>
              <a href={prof.linkedin} target="_blank" rel="noopener noreferrer" className={!prof.linkedin ? 'pointer-events-none' : ''}>
                <Button size="icon" variant="ghost" className={prof.linkedin ? 'text-blue-600' : 'text-gray-300'}>
                  <Linkedin className="w-5 h-5" />
                </Button>
              </a>
              <a href={prof.lattes} target="_blank" rel="noopener noreferrer" className={!prof.lattes ? 'pointer-events-none' : ''}>
                <Button size="icon" variant="ghost" className={prof.lattes ? 'text-blue-600' : 'text-gray-300'}>
                  <BookOpen className="w-5 h-5" />
                </Button>
              </a>
              <a href={prof.site} target="_blank" rel="noopener noreferrer" className={!prof.site ? 'pointer-events-none' : ''}>
                <Button size="icon" variant="ghost" className={prof.site ? 'text-blue-600' : 'text-gray-300'}>
                  <Globe className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
        <p className="text-gray-700 italic text-justify">
          Os dados completos dos professores serão adicionados em breve pelo administrador.
        </p>
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('CoordenadorPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('ParceirosPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Parceiros
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
