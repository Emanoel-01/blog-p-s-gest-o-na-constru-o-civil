import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Award, FileText, Users, User } from 'lucide-react';

export default function FeedSucesso({ activities }) {
  const getIcon = (type) => {
    switch(type) {
      case 'Empregado': return <Briefcase className="w-5 h-5 text-green-600" />;
      case 'Contratado': return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'Freelancer': return <Users className="w-5 h-5 text-teal-600" />;
      default: return <Award className="w-5 h-5 text-purple-600" />;
    }
  };

  const getColorClass = (type) => {
    switch(type) {
      case 'Empregado': return 'border-green-300 bg-green-50';
      case 'Contratado': return 'border-blue-300 bg-blue-50';
      case 'Freelancer': return 'border-teal-300 bg-teal-50';
      default: return 'border-purple-300 bg-purple-50';
    }
  };

  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-600" />
        Feed de Sucesso da Comunidade
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activities.map((activity, idx) => {
          const title = activity.nome_evento || activity.titulo_artigo || activity.nome_canteiro || 
                       activity.nome_atividade || activity.titulo_relatorio || activity.titulo_producao;
          
          return (
            <Card key={idx} className={`${getColorClass(activity.type)} border-2 hover:shadow-lg transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {activity.aluno_foto ? (
                    <img 
                      src={activity.aluno_foto} 
                      alt={activity.aluno_nome}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(activity.type)}
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    {activity.aluno_nome && (
                      <p className="font-bold text-sm text-gray-900 mb-1">{activity.aluno_nome}</p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}