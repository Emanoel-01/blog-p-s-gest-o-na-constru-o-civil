import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, TrendingUp, Users, Building2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIReportGenerator() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  const { data: projetos = [] } = useQuery({
    queryKey: ['projetos-all'],
    queryFn: () => base44.entities.Projeto.list()
  });

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes-all'],
    queryFn: () => base44.entities.Discente.list()
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes-all'],
    queryFn: () => base44.entities.Especializacao.list()
  });

  const { data: atividades = [] } = useQuery({
    queryKey: ['atividades-incubadora'],
    queryFn: async () => {
      const [freelancers, eventos, artigos, canteiros] = await Promise.all([
        base44.entities.FreelancerNetwork.list(),
        base44.entities.Evento.list(),
        base44.entities.ArtigoCientifico.list(),
        base44.entities.CanteiroDidatico.list()
      ]);
      return [...freelancers, ...eventos, ...artigos, ...canteiros];
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportType) => {
      let prompt = '';
      let context = {};

      if (reportType === 'projetos') {
        context = { projetos, atividades };
        prompt = `Gere um relatório executivo detalhado sobre o desempenho dos projetos da Incubadora Profissional.

Dados dos Projetos:
${JSON.stringify(projetos, null, 2)}

Atividades Relacionadas:
${JSON.stringify(atividades.slice(0, 20), null, 2)}

O relatório deve incluir:
1. Resumo Executivo
2. Análise de Desempenho por Projeto (número de atividades, valores gerados, alunos envolvidos)
3. Tendências e Padrões Identificados
4. Recomendações Estratégicas
5. Próximos Passos

Use markdown para formatação.`;
      } else if (reportType === 'alunos') {
        context = { discentes, especializacoes };
        prompt = `Gere um relatório analítico sobre o progresso e desempenho dos alunos.

Dados dos Alunos:
${JSON.stringify(discentes, null, 2)}

Especializações:
${JSON.stringify(especializacoes, null, 2)}

O relatório deve incluir:
1. Visão Geral do Corpo Discente
2. Distribuição por Especializações e Turmas
3. Análise de Status de Carreira (Open to Work, Contratado, Freelancer)
4. Competências e Tags Mais Comuns
5. Insights e Recomendações para Melhorar Empregabilidade
6. Perfil de Aluno Ideal por Especialização

Use markdown para formatação.`;
      } else if (reportType === 'mercado') {
        prompt = `Gere um relatório de tendências de mercado relevantes para as especializações oferecidas pela ESUDA:

Especializações Oferecidas:
${especializacoes.map(e => `- ${e.nome}`).join('\n')}

O relatório deve incluir:
1. Tendências Tecnológicas Atuais (BIM, Manutenção 4.0, Gestão de Projetos)
2. Demandas do Mercado de Trabalho
3. Tecnologias Emergentes Relevantes
4. Oportunidades de Expansão de Cursos
5. Previsões para os Próximos 2-3 Anos
6. Recomendações de Atualização Curricular

Use markdown para formatação e seja específico para o mercado brasileiro de construção civil e engenharia.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: reportType === 'mercado'
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('Relatório gerado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao gerar relatório: ' + error.message);
    }
  });

  const reportTypes = [
    {
      id: 'projetos',
      title: 'Desempenho de Projetos',
      description: 'Análise detalhada do desempenho dos projetos da Incubadora Profissional',
      icon: Building2,
      color: 'blue'
    },
    {
      id: 'alunos',
      title: 'Progresso de Alunos',
      description: 'Relatório completo sobre o desenvolvimento e progresso dos discentes',
      icon: Users,
      color: 'green'
    },
    {
      id: 'mercado',
      title: 'Tendências de Mercado',
      description: 'Análise de tendências relevantes para as especializações oferecidas',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedReport}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Gerador de Relatórios com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-6">
            Selecione o tipo de relatório que deseja gerar. A IA analisará os dados e criará um relatório detalhado e personalizado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedReport === report.id
                      ? `border-${report.color}-500 bg-${report.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-lg bg-${report.color}-100 flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 text-${report.color}-600`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button
            onClick={() => generateReportMutation.mutate(selectedReport)}
            disabled={!selectedReport || generateReportMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {generateReportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedReport && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Relatório Gerado</CardTitle>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download (Markdown)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border">
              <ReactMarkdown>{generatedReport}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}