import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, GitMerge, AlertCircle, TrendingUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ManagerialReport({ especializacoes, ciclos, professores, parceiros, tecnologias }) {
  console.log('ManagerialReport renderizado com props:', { especializacoes, ciclos, professores, parceiros, tecnologias });

  const getCicloById = (id) => ciclos.find(c => c.id === id);

  const exportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const sections = document.querySelectorAll('#managerial-report-content > .border-2');
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const canvas = await html2canvas(section, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      if (i > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
    }
    
    pdf.save('relatorio-gerencial-posgraduacoes.pdf');
  };

  // Função para identificar se um ciclo é técnico
  const isCicloTecnico = (ciclo) => {
    if (!ciclo || !ciclo.disciplinas || ciclo.disciplinas.length === 0) return false;
    
    // Um ciclo é técnico se pelo menos uma disciplina tem habilidade_tecnica definida
    return ciclo.disciplinas.some(d => {
      if (!d || typeof d === 'string') return false;
      return d.habilidade_tecnica && d.habilidade_tecnica.trim().length > 0;
    });
  };

  // Análise de similaridade de CICLOS TÉCNICOS entre especializações
  const analyzeEspecializacaoSimilarity = () => {
    const similarities = [];

    for (let i = 0; i < especializacoes.length; i++) {
      for (let j = i + 1; j < especializacoes.length; j++) {
        const espec1 = especializacoes[i];
        const espec2 = especializacoes[j];

        // Obter apenas os ciclos técnicos de cada especialização
        const ciclosTecnicos1 = new Set();
        (espec1.ciclos || []).forEach(cicloId => {
          const ciclo = getCicloById(cicloId);
          if (ciclo && isCicloTecnico(ciclo)) {
            ciclosTecnicos1.add(ciclo.nome.toLowerCase().trim());
          }
        });

        const ciclosTecnicos2 = new Set();
        (espec2.ciclos || []).forEach(cicloId => {
          const ciclo = getCicloById(cicloId);
          if (ciclo && isCicloTecnico(ciclo)) {
            ciclosTecnicos2.add(ciclo.nome.toLowerCase().trim());
          }
        });

        // Encontrar ciclos técnicos comuns
        const ciclosComunsTecnicos = [...ciclosTecnicos1].filter(c => ciclosTecnicos2.has(c));

        if (ciclosComunsTecnicos.length >= 1) {
          similarities.push({
            espec1: espec1.nome,
            espec2: espec2.nome,
            ciclosTecnicosComuns: ciclosComunsTecnicos,
            count: ciclosComunsTecnicos.length
          });
        }
      }
    }

    return similarities;
  };

  // Análise de ciclos compartilhados
  const analyzeCiclosCompartilhados = () => {
    const cicloUsage = {};

    especializacoes.forEach(espec => {
      (espec.ciclos || []).forEach(cicloId => {
        if (!cicloUsage[cicloId]) {
          const ciclo = getCicloById(cicloId);
          cicloUsage[cicloId] = {
            ciclo: ciclo,
            especializacoes: []
          };
        }
        cicloUsage[cicloId].especializacoes.push(espec.nome);
      });
    });

    return Object.values(cicloUsage).filter(item => item.especializacoes.length > 1);
  };

  const similarities = analyzeEspecializacaoSimilarity();
  const ciclosCompartilhados = analyzeCiclosCompartilhados();

  // Estatísticas gerais
  const totalProfessores = new Set(especializacoes.flatMap(e => e.professores || [])).size;
  const totalParceiros = new Set(especializacoes.flatMap(e => e.parceiros || [])).size;
  const totalTecnologias = new Set(especializacoes.flatMap(e => e.tecnologias || [])).size;
  const totalCargaHoraria = especializacoes.reduce((sum, e) => sum + (e.carga_horaria_total || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Relatório Gerencial e Análise de Relações</h3>
        <Button onClick={exportToPDF} className="bg-purple-600 hover:bg-purple-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar para PDF
        </Button>
      </div>

      <div id="managerial-report-content" className="space-y-6 bg-white p-8">
        {/* Estatísticas Gerais */}
        <Card className="border-2 border-purple-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Visão Geral do Portfólio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{especializacoes.length}</div>
                <div className="text-sm text-gray-600 mt-1">Especializações</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{ciclos.length}</div>
                <div className="text-sm text-gray-600 mt-1">Ciclos Totais</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{totalCargaHoraria}h</div>
                <div className="text-sm text-gray-600 mt-1">Carga Horária Total</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">{totalProfessores}</div>
                <div className="text-sm text-gray-600 mt-1">Professores Únicos</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">{totalParceiros}</div>
                <div className="text-sm text-gray-600 mt-1">Parceiros Únicos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{totalTecnologias}</div>
                <div className="text-sm text-gray-600 mt-1">Tecnologias Únicas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mapa Visual de Relações */}
        <Card className="border-2 border-blue-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardTitle className="text-xl flex items-center gap-2">
              <GitMerge className="w-6 h-6" />
              Mapa de Relações: Especializações e Recursos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {especializacoes.map((espec, index) => {
                const ciclosData = (espec.ciclos || []).map(id => getCicloById(id)).filter(Boolean);
                const numProfessores = (espec.professores || []).length;
                const numParceiros = (espec.parceiros || []).length;
                const numTecnologias = (espec.tecnologias || []).length;

                return (
                  <div key={espec.id} className="relative">
                    {/* Especialização Central */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg shadow-md mb-4">
                      <h4 className="font-bold text-lg">{index + 1}. {espec.nome}</h4>
                      <p className="text-sm mt-1">{espec.carga_horaria_total}h • {ciclosData.length} ciclos</p>
                    </div>

                    {/* Conexões Visuais */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-8 border-l-4 border-blue-300 ml-4">
                      {/* Ciclos */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">CICLOS ({ciclosData.length})</div>
                        <div className="space-y-2">
                          {ciclosData.map((ciclo) => (
                            <div key={ciclo.id} className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded text-xs">
                              <div className="font-semibold text-indigo-900">{ciclo.nome}</div>
                              <div className="text-indigo-600">{ciclo.carga_horaria}h</div>
                              <div className="text-indigo-500 text-[10px] mt-1">
                                {ciclo.disciplinas ? `${ciclo.disciplinas.length} disciplinas` : 'Sem disciplinas'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Professores */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">PROFESSORES ({numProfessores})</div>
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                          <div className="text-2xl font-bold text-purple-600">{numProfessores}</div>
                          <div className="text-xs text-purple-700">vinculados</div>
                        </div>
                      </div>

                      {/* Parceiros */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">PARCEIROS ({numParceiros})</div>
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                          <div className="text-2xl font-bold text-orange-600">{numParceiros}</div>
                          <div className="text-xs text-orange-700">vinculados</div>
                        </div>
                      </div>

                      {/* Tecnologias */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">TECNOLOGIAS ({numTecnologias})</div>
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                          <div className="text-2xl font-bold text-green-600">{numTecnologias}</div>
                          <div className="text-xs text-green-700">vinculadas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Análise de Ciclos Compartilhados */}
        <Card className="border-2 border-green-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardTitle className="text-xl">Ciclos Compartilhados Entre Especializações</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {ciclosCompartilhados.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum ciclo é compartilhado entre especializações.</p>
            ) : (
              <div className="space-y-4">
                {ciclosCompartilhados.map((item, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h5 className="font-bold text-green-900">{item.ciclo.nome}</h5>
                    <p className="text-sm text-green-700 mt-1">{item.ciclo.carga_horaria}h</p>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Usado em {item.especializacoes.length} especializações:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.especializacoes.map((nome, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-800 text-xs">
                            {nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análise de Similaridade de Ciclos Técnicos */}
        <Card className="border-2 border-red-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Análise de Similaridade: Ciclos Técnicos Compartilhados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Foco em Ciclos Técnicos:</strong> Esta análise identifica apenas ciclos técnicos compartilhados entre especializações (ciclos com disciplinas que possuem "habilidade técnica" definida). Ciclos comuns ou de gestão não são incluídos.
              </p>
            </div>
            {similarities.length === 0 ? (
              <p className="text-gray-500 italic">
                Nenhuma especialização compartilha ciclos técnicos em comum.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
                  <span className="font-semibold text-yellow-800">
                    Atenção: Encontradas {similarities.length} combinação(ões) de especializações com ciclos técnicos em comum.
                  </span>
                  <p className="text-sm text-yellow-700 mt-2">
                    Considere avaliar se a abertura simultânea dessas especializações pode causar confusão ou canibalização de público-alvo.
                  </p>
                </div>

                {similarities.map((sim, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-red-900">
                        {sim.espec1} ↔ {sim.espec2}
                      </h5>
                      <Badge className="bg-red-600 text-white">
                        {sim.count} ciclo{sim.count > 1 ? 's' : ''} técnico{sim.count > 1 ? 's' : ''} comum{sim.count > 1 ? 'ns' : ''}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Ciclos Técnicos em Comum:</p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {sim.ciclosTecnicosComuns.map((ciclo, idx) => (
                          <li key={idx} className="capitalize">{ciclo}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 bg-yellow-100 p-3 rounded text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">💡 Recomendação:</p>
                      <p className="text-yellow-700">
                        Considere abrir estas especializações em períodos diferentes ou revisar os ciclos técnicos para maior diferenciação de mercado.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}