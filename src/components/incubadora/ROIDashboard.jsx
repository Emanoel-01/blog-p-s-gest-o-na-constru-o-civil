import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  Award,
  FileText,
  Briefcase,
  Cpu,
  Building2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ROIDashboard({ 
  projetos, 
  eventos, 
  artigos, 
  canteiros, 
  freelancers, 
  relatorios, 
  producoes 
}) {
  const calculateROI = (projeto) => {
    const numeroAlunos = projeto.numero_alunos || 0;
    const valorCurso = projeto.valor_curso || 0;
    
    // Investimento Total = (Número de Alunos × Valor do Curso) + 20% de despesas
    const investimentoTotal = (numeroAlunos * valorCurso) * 1.2;
    
    // Ganho Total Agregado = soma dos valores das atividades freelancer do projeto
    const freelancersProjeto = freelancers.filter(f => f.projeto_id === projeto.id);
    const ganhoTotal = freelancersProjeto.reduce((sum, f) => sum + (f.valor || 0), 0);
    
    // ROI = ((Ganho - Investimento) / Investimento) × 100
    const roiPercentual = investimentoTotal > 0 
      ? ((ganhoTotal - investimentoTotal) / investimentoTotal) * 100 
      : 0;
    
    // Métricas não financeiras
    const totalEventos = eventos.filter(e => e.projeto_id === projeto.id).length;
    const totalArtigos = artigos.filter(a => a.projeto_id === projeto.id).length;
    const totalCanteiros = canteiros.filter(c => c.projeto_id === projeto.id).length;
    const totalRelatorios = relatorios.filter(r => r.projeto_id === projeto.id).length;
    const totalProducoes = producoes.filter(p => p.projeto_id === projeto.id).length;
    const totalFreelancers = freelancersProjeto.length;
    
    // Calcular progresso temporal
    let progressoTemporal = 100;
    let diasDecorridos = 0;
    let diasTotais = 0;
    
    if (projeto.data_inicio && projeto.data_fim) {
      const inicio = new Date(projeto.data_inicio);
      const fim = new Date(projeto.data_fim);
      const hoje = new Date();
      
      diasTotais = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
      diasDecorridos = Math.ceil((hoje - inicio) / (1000 * 60 * 60 * 24));
      progressoTemporal = Math.min(Math.max((diasDecorridos / diasTotais) * 100, 0), 100);
    }
    
    return {
      investimentoTotal,
      ganhoTotal,
      roiPercentual,
      totalEventos,
      totalArtigos,
      totalCanteiros,
      totalRelatorios,
      totalProducoes,
      totalFreelancers,
      progressoTemporal,
      diasDecorridos,
      diasTotais
    };
  };

  const dadosGrafico = projetos.map(projeto => {
    const roi = calculateROI(projeto);
    return {
      ano: projeto.ano_projeto,
      nome: projeto.nome_projeto,
      roi: roi.roiPercentual.toFixed(1),
      ganho: roi.ganhoTotal,
      investimento: roi.investimentoTotal
    };
  }).sort((a, b) => a.ano - b.ano);

  const roiMedio = dadosGrafico.length > 0
    ? (dadosGrafico.reduce((sum, d) => sum + parseFloat(d.roi), 0) / dadosGrafico.length).toFixed(1)
    : 0;

  const ganhoTotalGeral = dadosGrafico.reduce((sum, d) => sum + d.ganho, 0);

  return (
    <div className="space-y-8">
      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              ROI Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-700">{roiMedio}%</div>
            <p className="text-sm text-gray-600 mt-2">Retorno sobre investimento médio</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <DollarSign className="w-5 h-5" />
              Ganho Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-700">
              R$ {ganhoTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600 mt-2">Gerado por todos os projetos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              <Target className="w-5 h-5" />
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-700">{projetos.length}</div>
            <p className="text-sm text-gray-600 mt-2">Edições da Incubadora</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Comparação */}
      {dadosGrafico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              Comparação de ROI Financeiro por Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ano" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'roi') return `${value}%`;
                    return `R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                  }}
                  labelFormatter={(label) => `Ano ${label}`}
                />
                <Legend />
                <Bar dataKey="roi" fill="#10b981" name="ROI (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detalhamento por Projeto */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-7 h-7 text-teal-600" />
          Detalhamento por Projeto
        </h3>

        {projetos.map((projeto) => {
          const roi = calculateROI(projeto);
          const isEmAndamento = projeto.data_inicio && projeto.data_fim && 
                                roi.progressoTemporal < 100 && roi.progressoTemporal > 0;

          return (
            <Card key={projeto.id} className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{projeto.nome_projeto}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Ano {projeto.ano_projeto}</p>
                  </div>
                  <Badge className="bg-teal-600 text-white text-lg px-4 py-2">
                    ROI: {roi.roiPercentual.toFixed(1)}%
                  </Badge>
                </div>

                {/* Barra de Progresso Temporal */}
                {projeto.data_inicio && projeto.data_fim && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Fim: {new Date(projeto.data_fim).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          isEmAndamento ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-teal-500'
                        }`}
                        style={{ width: `${roi.progressoTemporal}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      {isEmAndamento 
                        ? `Em andamento: ${roi.diasDecorridos} de ${roi.diasTotais} dias (${roi.progressoTemporal.toFixed(0)}%)`
                        : roi.progressoTemporal >= 100 
                          ? 'Projeto Concluído' 
                          : 'Aguardando início'}
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6">
                {/* ROI Financeiro */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    ROI Financeiro
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">Investimento Total</p>
                      <p className="text-2xl font-bold text-gray-800">
                        R$ {roi.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {projeto.numero_alunos || 0} alunos × R$ {(projeto.valor_curso || 0).toLocaleString('pt-BR')} + 20%
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 mb-1">Ganho Total Agregado</p>
                      <p className="text-2xl font-bold text-green-700">
                        R$ {roi.ganhoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Soma das atividades freelancer
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      roi.roiPercentual >= 0 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-xs mb-1 ${roi.roiPercentual >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        ROI Financeiro
                      </p>
                      <p className={`text-3xl font-bold ${roi.roiPercentual >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {roi.roiPercentual.toFixed(1)}%
                      </p>
                      <p className={`text-xs mt-1 ${roi.roiPercentual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {roi.roiPercentual >= 0 ? 'Retorno positivo' : 'Retorno negativo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ROI Não Financeiro */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    ROI Não Financeiro
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-700">{roi.totalEventos}</p>
                      <p className="text-xs text-gray-600">Eventos</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                      <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-purple-700">{roi.totalArtigos}</p>
                      <p className="text-xs text-gray-600">Artigos</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                      <Building2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-700">{roi.totalCanteiros}</p>
                      <p className="text-xs text-gray-600">Canteiros</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                      <Briefcase className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-orange-700">{roi.totalFreelancers}</p>
                      <p className="text-xs text-gray-600">Freelancers</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center">
                      <FileText className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-cyan-700">{roi.totalRelatorios}</p>
                      <p className="text-xs text-gray-600">Relatórios</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 text-center">
                      <Cpu className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-pink-700">{roi.totalProducoes}</p>
                      <p className="text-xs text-gray-600">Produções</p>
                    </div>
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