import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, TrendingUp, MessageSquare, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PainelDocente({ professorEmail }) {
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    async function loadProfessor() {
      const profs = await base44.entities.Professor.list();
      const prof = profs.find(p => p.email === professorEmail);
      setProfessor(prof);
    }
    loadProfessor();
  }, [professorEmail]);

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes-docente'],
    queryFn: () => base44.entities.Especializacao.list()
  });

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes-all'],
    queryFn: () => base44.entities.Discente.list()
  });

  const { data: cronograma = [] } = useQuery({
    queryKey: ['cronograma-docente', professor?.id],
    queryFn: () => base44.entities.CronogramaAula.filter({ professor_id: professor?.id }),
    enabled: !!professor
  });

  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes-docente', professorEmail],
    queryFn: () => base44.entities.Notificacao.filter({ destinatario_email: professorEmail, lida: false }),
    enabled: !!professorEmail
  });

  // Minhas especializações
  const minhasEspecializacoes = especializacoes.filter(e => 
    e.professores?.includes(professor?.id)
  );

  // Meus alunos (de minhas especializações)
  const meusAlunos = discentes.filter(d => 
    d.especializacoes?.some(espId => minhasEspecializacoes.map(e => e.id).includes(espId))
  );

  // Próximas aulas
  const proximasAulas = cronograma
    .filter(aula => new Date(aula.data.split('/').reverse().join('-')) >= new Date())
    .sort((a, b) => {
      const dateA = new Date(a.data.split('/').reverse().join('-'));
      const dateB = new Date(b.data.split('/').reverse().join('-'));
      return dateA - dateB;
    })
    .slice(0, 5);

  if (!professor) {
    return <div className="text-center py-8">Carregando painel do docente...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Minhas Especializações */}
        <Card className="border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Especializações</p>
                <p className="text-3xl font-bold text-blue-600">{minhasEspecializacoes.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card: Meus Alunos */}
        <Card className="border-green-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alunos</p>
                <p className="text-3xl font-bold text-green-600">{meusAlunos.length}</p>
              </div>
              <Users className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card: Próximas Aulas */}
        <Card className="border-purple-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximas Aulas</p>
                <p className="text-3xl font-bold text-purple-600">{proximasAulas.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card: Notificações */}
        <Card className="border-orange-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notificações</p>
                <p className="text-3xl font-bold text-orange-600">{notificacoes.length}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Aulas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Minhas Próximas Aulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximasAulas.length === 0 ? (
            <p className="text-gray-500 italic">Nenhuma aula agendada</p>
          ) : (
            <div className="space-y-3">
              {proximasAulas.map(aula => (
                <div key={aula.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{aula.disciplina_nome}</p>
                    <p className="text-sm text-gray-600">{aula.data} • {aula.horario_inicio} - {aula.horario_fim}</p>
                    <Badge className="mt-1">{aula.tipo}</Badge>
                  </div>
                  {aula.cursos?.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {aula.cursos.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link to={createPageUrl('CalendarioDeAula')}>
            <Button variant="outline" className="w-full mt-4">
              Ver Calendário Completo
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Meus Alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Meus Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meusAlunos.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum aluno vinculado</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {meusAlunos.slice(0, 6).map(aluno => (
                <Link key={aluno.id} to={createPageUrl(`PerfilDiscente?id=${aluno.id}`)}>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {aluno.foto_url ? (
                      <img src={aluno.foto_url} alt={aluno.nome} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {aluno.nome.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{aluno.nome}</p>
                      <p className="text-xs text-gray-600">{aluno.numero_turma}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {meusAlunos.length > 6 && (
            <Link to={createPageUrl('CorpoDiscentePage')}>
              <Button variant="outline" className="w-full mt-4">
                Ver Todos os Alunos
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link to={createPageUrl('CalendarioDeAula')}>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Ver Calendário
              </Button>
            </Link>
            <Link to={createPageUrl('CorpoDiscentePage')}>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Alunos
              </Button>
            </Link>
            <Link to={createPageUrl('MeuPerfilDocente')}>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Meu Perfil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}