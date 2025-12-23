import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Trophy, TrendingUp, Target, Zap, BookOpen, Briefcase } from 'lucide-react';
import { cacheOptions } from '@/components/utils/queryClient';

export default function UserProgressCard({ userEmail }) {
  const { data: ciclos = [] } = useQuery({
    queryKey: ['ciclos-progress'],
    queryFn: () => base44.entities.Ciclo.list('ordem'),
    ...cacheOptions.static,
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes-progress'],
    queryFn: () => base44.entities.Especializacao.list('ordem'),
    ...cacheOptions.static,
  });

  const { data: discente } = useQuery({
    queryKey: ['discente-profile', userEmail],
    queryFn: async () => {
      const discentes = await base44.entities.Discente.filter({ email: userEmail });
      return discentes[0];
    },
    enabled: !!userEmail,
    ...cacheOptions.semiStatic,
  });

  const { data: atividadesIncubadora = [] } = useQuery({
    queryKey: ['atividades-incubadora', discente?.id],
    queryFn: async () => {
      if (!discente?.id) return [];
      const [freelancer, relatorios, producoes, eventos, canteiros, artigos] = await Promise.all([
        base44.entities.FreelancerNetwork.filter({ aluno_id: discente.id }),
        base44.entities.RelatorioTecnico.filter({ aluno_id: discente.id }),
        base44.entities.ProducaoTecnologica.filter({ aluno_id: discente.id }),
        base44.entities.Evento.filter({ aluno_id: discente.id }),
        base44.entities.CanteiroDidatico.filter({ aluno_id: discente.id }),
        base44.entities.ArtigoCientifico.filter({ aluno_id: discente.id }),
      ]);
      return [...freelancer, ...relatorios, ...producoes, ...eventos, ...canteiros, ...artigos];
    },
    enabled: !!discente?.id,
    ...cacheOptions.semiStatic,
  });

  const progressData = useMemo(() => {
    if (!discente) return null;

    // Progresso Acadêmico
    const totalCiclos = ciclos.length;
    const especializacoesMatriculadas = discente.especializacoes?.length || 0;
    const progressoAcademico = totalCiclos > 0 
      ? Math.min(100, (especializacoesMatriculadas / totalCiclos) * 100) 
      : 0;

    // Progresso Profissional (Incubadora)
    const totalAtividades = atividadesIncubadora.length;
    const progressoProfissional = Math.min(100, totalAtividades * 10);

    // Competências
    const competencias = discente.tags_competencia || [];
    const progressoCompetencias = Math.min(100, competencias.length * 8);

    // ROI Estimado (baseado em atividades da incubadora)
    const roiTotal = atividadesIncubadora.reduce((sum, ativ) => {
      return sum + (ativ.valor || 0);
    }, 0);

    return {
      academico: Math.round(progressoAcademico),
      profissional: Math.round(progressoProfissional),
      competencias: Math.round(progressoCompetencias),
      roiTotal,
      totalAtividades,
      totalCompetencias: competencias.length,
    };
  }, [discente, ciclos, atividadesIncubadora]);

  const chartData = useMemo(() => {
    if (!progressData) return [];
    return [
      {
        name: 'Acadêmico',
        value: progressData.academico,
        fill: '#ef4444',
      },
      {
        name: 'Profissional',
        value: progressData.profissional,
        fill: '#10b981',
      },
      {
        name: 'Competências',
        value: progressData.competencias,
        fill: '#3b82f6',
      },
    ];
  }, [progressData]);

  if (!discente || !progressData) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 text-sm">Carregando seu progresso...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-6 h-6 text-yellow-600" />
          Seu Progresso e Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico Radial */}
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              barSize={15}
              data={chartData}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                cornerRadius={10}
              />
              <Legend
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Acadêmico */}
          <div className="bg-white p-4 rounded-lg border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-gray-800">Acadêmico</span>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {progressData.academico}%
              </Badge>
            </div>
            <Progress value={progressData.academico} className="h-2 bg-red-100" />
            <p className="text-xs text-gray-600 mt-2">
              {discente.especializacoes?.length || 0} especialização(ões) ativa(s)
            </p>
          </div>

          {/* Profissional */}
          <div className="bg-white p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-800">Profissional</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {progressData.profissional}%
              </Badge>
            </div>
            <Progress value={progressData.profissional} className="h-2 bg-green-100" />
            <p className="text-xs text-gray-600 mt-2">
              {progressData.totalAtividades} atividade(s) na Incubadora
            </p>
          </div>

          {/* Competências */}
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Competências</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {progressData.competencias}%
              </Badge>
            </div>
            <Progress value={progressData.competencias} className="h-2 bg-blue-100" />
            <p className="text-xs text-gray-600 mt-2">
              {progressData.totalCompetencias} competência(s) desenvolvida(s)
            </p>
          </div>

          {/* ROI */}
          <div className="bg-white p-4 rounded-lg border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-gray-800">ROI Acumulado</span>
              </div>
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-700">
              R$ {progressData.roiTotal.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Gerado através da Incubadora
            </p>
          </div>
        </div>

        {/* Mensagem Motivacional */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border-2 border-purple-300">
          <p className="text-sm font-semibold text-purple-900 mb-1">
            🎯 Continue Evoluindo!
          </p>
          <p className="text-xs text-purple-800">
            {progressData.academico < 50 && "Complete mais especializações para avançar academicamente."}
            {progressData.profissional < 50 && " Registre mais atividades na Incubadora para crescer profissionalmente."}
            {progressData.competencias < 70 && " Adicione mais competências ao seu perfil."}
            {progressData.academico >= 50 && progressData.profissional >= 50 && progressData.competencias >= 70 && 
              "Você está no caminho certo! Continue assim e inspire outros alunos."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}