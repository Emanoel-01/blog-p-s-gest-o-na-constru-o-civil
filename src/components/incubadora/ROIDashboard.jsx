import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  Award,
  FileText,
  Briefcase,
  Cpu,
  Building2,
  Info
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
  const [openTooltips, setOpenTooltips] = useState({});
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
                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-xs text-gray-600">Investimento Total</p>
                          <TooltipUI>
                           <TooltipTrigger asChild>
                             <button className="w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors">
                               <Info className="w-3 h-3 text-white" />
                             </button>
                           </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                <strong>Cálculo:</strong> (Número de Alunos × Valor do Curso) + 20% de despesas operacionais.
                                <br/><br/>
                                <strong>Exemplo:</strong> 10 alunos × R$ 2.500,00 = R$ 25.000,00 + 20% = R$ 30.000,00
                              </p>
                            </TooltipContent>
                          </TooltipUI>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">
                          R$ {roi.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {projeto.numero_alunos || 0} alunos × R$ {(projeto.valor_curso || 0).toLocaleString('pt-BR')} + 20%
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-xs text-green-700">Ganho Total Agregado</p>
                          <TooltipUI>
                            <TooltipTrigger asChild>
                              <button className="w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors">
                                <Info className="w-3 h-3 text-white" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                <strong>Cálculo:</strong> Soma de todos os valores de trabalhos realizados pelos alunos durante o projeto.
                                <br/><br/>
                                <strong>Inclui:</strong>
                                <br/>• Freelancers: valor do trabalho realizado
                                <br/>• Contratados: salário mensal × meses restantes até o fim do curso
                                <br/>• Empregados: salário mensal × meses restantes até o fim do curso
                                <br/><br/>
                                <strong>Exemplo:</strong> Aluno contratado com salário de R$ 3.000/mês faltando 8 meses = R$ 24.000 agregados ao ROI
                              </p>
                            </TooltipContent>
                          </TooltipUI>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-green-700">
                          R$ {roi.ganhoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {roi.totalFreelancers} atividade{roi.totalFreelancers !== 1 ? 's' : ''} (Freelancer/Empregado/Contratado)
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg border ${
                        roi.roiPercentual >= 0 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-1 mb-1">
                          <p className={`text-xs ${roi.roiPercentual >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            ROI Financeiro
                          </p>
                          <TooltipUI>
                            <TooltipTrigger asChild>
                              <button className="w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors">
                                <Info className="w-3 h-3 text-white" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                <strong>Cálculo:</strong> ((Ganho Total - Investimento Total) / Investimento Total) × 100
                                <br/><br/>
                                <strong>Exemplo:</strong>
                                <br/>• Investimento: R$ 30.000,00
                                <br/>• Ganho: R$ 45.000,00
                                <br/>• ROI: ((45.000 - 30.000) / 30.000) × 100 = 50%
                                <br/><br/>
                                <strong>Interpretação:</strong>
                                <br/>• ROI positivo: O projeto gerou mais valor do que o investido
                                <br/>• ROI negativo: O investimento ainda não foi recuperado
                              </p>
                            </TooltipContent>
                          </TooltipUI>
                        </div>
                        <p className={`text-2xl sm:text-3xl font-bold ${roi.roiPercentual >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {roi.roiPercentual.toFixed(1)}%
                        </p>
                        <p className={`text-xs mt-1 ${roi.roiPercentual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {roi.roiPercentual >= 0 ? 'Retorno positivo' : 'Retorno negativo'}
                        </p>
                      </div>
                    </div>
                  </TooltipProvider>
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
                      <p className="text-xs text-gray-600">Network</p>
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