import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, CalendarDays, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AtalhosComunidade({ profileType }) {
  const atalhos = [
    {
      title: 'Meu Perfil',
      description: 'Atualize suas informações',
      icon: UserCircle,
      path: profileType === 'docente' ? 'MeuPerfilDocente' : 'MeuPerfilDiscente',
      color: 'blue'
    },
    {
      title: 'Calendário de Aulas',
      description: 'Veja o cronograma completo',
      icon: CalendarDays,
      path: 'CalendarioDeAula',
      color: 'green'
    },
    {
      title: 'Diretório de Alunos',
      description: 'Conecte-se com a comunidade',
      icon: Users,
      path: 'CorpoDiscentePage',
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {atalhos.map((atalho) => {
        const Icon = atalho.icon;
        const bgColor = `bg-${atalho.color}-50`;
        const borderColor = `border-${atalho.color}-200`;
        const iconColor = `text-${atalho.color}-600`;
        
        return (
          <Link key={atalho.path} to={createPageUrl(atalho.path)}>
            <Card className={`${bgColor} ${borderColor} border-2 hover:shadow-lg transition-all cursor-pointer h-full`}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 ${iconColor} mx-auto mb-2`} />
                <h4 className="font-bold text-gray-900 text-sm mb-1">{atalho.title}</h4>
                <p className="text-xs text-gray-600">{atalho.description}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}