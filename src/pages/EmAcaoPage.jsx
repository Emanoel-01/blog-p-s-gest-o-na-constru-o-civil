
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Calendar, ArrowRight } from 'lucide-react';

export default function EmAcaoPage() {
  const posts = [
    {
      titulo: "Workshop de BIM e IA",
      data: "15 de Março de 2025",
      descricao: "Participamos de um workshop exclusivo sobre as mais recentes tecnologias em BIM e Inteligência Artificial aplicadas à construção civil.",
      imagem: "https://via.placeholder.com/600x300"
    },
    {
      titulo: "Visita Técnica ao Palácio Joaquim Nabuco",
      data: "10 de Março de 2025",
      descricao: "Alunos da pós-graduação participaram de uma visita técnica ao canteiro de obras do restauro histórico.",
      imagem: "https://via.placeholder.com/600x300"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Em Ação</h2>
      <p className="text-gray-600 mb-8 text-justify">
        Acompanhe as atividades, eventos e conquistas de nossos alunos e professores.
      </p>

      <div className="space-y-6 mb-8">
        {posts.map((post, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <img src={post.imagem} alt={post.titulo} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{post.data}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{post.titulo}</h3>
              <p className="text-gray-700 text-justify">{post.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
        <p className="text-gray-700 italic text-justify">
          Mais posts e atualizações serão adicionados em breve pelo administrador.
        </p>
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('ProfessoresPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('InscricoesMatriculasPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Inscrições
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
