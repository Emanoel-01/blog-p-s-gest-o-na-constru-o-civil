import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowRight, ChevronDown, ChevronUp, BookOpen, Clock, GraduationCap, Maximize2, Minimize2, FileText, Settings } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function CiclosPage() {
  const [expandedCiclo, setExpandedCiclo] = useState(null);
  const [expandedDisciplina, setExpandedDisciplina] = useState(null);
  const [allExpanded, setAllExpanded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedCicloForPDF, setSelectedCicloForPDF] = useState('todos');
  const [showPDFConfig, setShowPDFConfig] = useState(false);
  const contentRef = useRef(null);
  
  // Estados para opções do PDF
  const [includeEmentaDetalhada, setIncludeEmentaDetalhada] = useState(true);
  const [includeConhecimento, setIncludeConhecimento] = useState(true);
  const [includeHabilidadeTecnica, setIncludeHabilidadeTecnica] = useState(true);
  const [includeHabilidadeComportamental, setIncludeHabilidadeComportamental] = useState(true);

  const { data: ciclos = [], isLoading } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const toggleCiclo = (cicloId) => {
    setExpandedCiclo(expandedCiclo === cicloId ? null : cicloId);
    setExpandedDisciplina(null);
  };

  const toggleDisciplina = (discIndex) => {
    setExpandedDisciplina(expandedDisciplina === discIndex ? null : discIndex);
  };

  const expandAll = () => {
    if (allExpanded) {
      // Colapsar todos
      setExpandedCiclo(null);
      setExpandedDisciplina(null);
      setAllExpanded(false);
    } else {
      // Expandir todos os ciclos (as disciplinas expandem automaticamente quando o ciclo está expandido)
      setAllExpanded(true);
    }
  };

  const handlePrintPDF = async () => {
    if (selectedCicloForPDF === 'escolher') {
      setShowPDFConfig(true);
      return;
    }

    setIsGeneratingPDF(true);
    
    // Expandir tudo antes de gerar o PDF
    const wasExpanded = allExpanded;
    if (!wasExpanded) {
      setAllExpanded(true);
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let element = contentRef.current;
    
    // Se um ciclo específico foi selecionado, criar elemento temporário apenas com esse ciclo
    if (selectedCicloForPDF !== 'todos') {
      const cicloSelecionado = ciclos.find(c => c.id === selectedCicloForPDF);
      if (cicloSelecionado) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 2px solid #16a34a;">
              <img src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" alt="ESUDA Logo" style="height: 48px;" />
              <div style="text-align: right;">
                <h1 style="font-size: 20px; font-weight: bold; margin: 0;">Ciclos de Conhecimento</h1>
                <p style="font-size: 14px; color: #666; margin: 0;">Pós-Graduação ESUDA</p>
              </div>
            </div>
            ${document.querySelector(`[data-ciclo-id="${selectedCicloForPDF}"]`)?.outerHTML || ''}
          </div>
        `;
        element = tempDiv;
      }
    }

    const filename = selectedCicloForPDF === 'todos' 
      ? 'ciclos-de-conhecimento-esuda.pdf'
      : `ciclo-${ciclos.find(c => c.id === selectedCicloForPDF)?.nome.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
      setShowPDFConfig(false);
      // Restaurar estado anterior
      if (!wasExpanded) {
        setAllExpanded(false);
      }
    }
  };

  const gradientColors = [
    'from-green-100 to-green-200',
    'from-green-200 to-green-300',
    'from-gray-100 to-gray-200',
    'from-green-100 to-gray-200',
    'from-gray-200 to-green-200',
    'from-green-50 to-green-100'
  ];

  return (
    <>
      <style>{`
        @media print {
          .card-ciclo {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .disciplina-detalhes {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .pdf-header {
            display: block !important;
            position: running(header);
          }
          .pdf-footer {
            display: block !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
          }
          body {
            padding-bottom: 60px;
          }
          /* Ocultar elementos desnecessários na impressão */
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
      <Helmet>
        <title>Ciclos de Conhecimento ESUDA | Arquitetura Curricular Modular em Construção Civil</title>
        <meta name="description" content="Arquitetura curricular modular ESUDA: ciclos de conhecimento que você combina para formar sua especialização. BIM, Gestão, Manutenção, Legal e Tecnologias 4.0." />
        <meta name="keywords" content="ciclos de conhecimento, currículo modular construção civil, disciplinas BIM, gestão de obras, ESUDA" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/CiclosPage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ciclos de Conhecimento ESUDA | Arquitetura Curricular Modular" />
        <meta property="og:description" content="Sistema modular inovador: combine ciclos de conhecimento e construa sua especialização sob medida." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/CiclosPage" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Ciclos de Conhecimento ESUDA",
            "description": "Ciclos modulares de conhecimento em Construção Civil",
            "itemListElement": ciclos.map((ciclo, index) => ({
              "@type": "Course",
              "position": index + 1,
              "name": ciclo.nome,
              "description": `Ciclo de ${ciclo.carga_horaria} horas`,
              "provider": {
                "@type": "Organization",
                "name": "ESUDA"
              },
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseWorkload": `PT${ciclo.carga_horaria}H`
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Ciclos de Conhecimento
          </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
          Nossa arquitetura curricular modular permite que você construa sua especialização de forma inteligente e estratégica
        </p>
        
        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Button
            onClick={expandAll}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            {allExpanded ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Recolher Todos
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Expandir Todos
              </>
            )}
          </Button>
          
          <Button
            onClick={() => setShowPDFConfig(true)}
            disabled={isGeneratingPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        
        {/* Modal de Configuração do PDF */}
        {showPDFConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-700" />
                  Configurar PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Selecionar Ciclo</label>
                  <select
                    value={selectedCicloForPDF}
                    onChange={(e) => setSelectedCicloForPDF(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="todos">Todos os Ciclos</option>
                    {ciclos.map(ciclo => (
                      <option key={ciclo.id} value={ciclo.id}>{ciclo.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo a Incluir</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeEmentaDetalhada}
                        onChange={(e) => setIncludeEmentaDetalhada(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">Ementa Detalhada</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeConhecimento}
                        onChange={(e) => setIncludeConhecimento(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">Conhecimento Adquirido</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeHabilidadeTecnica}
                        onChange={(e) => setIncludeHabilidadeTecnica(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">Habilidade Técnica</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeHabilidadeComportamental}
                        onChange={(e) => setIncludeHabilidadeComportamental(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">Habilidade Comportamental</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePrintPDF}
                    disabled={isGeneratingPDF}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar PDF
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setShowPDFConfig(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Ciclos Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando ciclos...</p>
        </div>
      ) : ciclos.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 italic">
              Nenhum ciclo disponível no momento. Aguarde atualizações.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6" ref={contentRef}>
          {/* Cabeçalho do PDF - visível apenas na impressão */}
          <div className="pdf-header hidden print:block">
            <div className="flex justify-between items-center pb-4 mb-6 border-b-2 border-green-600">
              <img 
                src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" 
                alt="ESUDA Logo" 
                className="h-12"
              />
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">Ciclos de Conhecimento</h1>
                <p className="text-sm text-gray-600">Pós-Graduação ESUDA</p>
              </div>
            </div>
          </div>
          
          {ciclos.map((ciclo, index) => {
            const isExpanded = allExpanded || expandedCiclo === ciclo.id;
            const gradientClass = gradientColors[index % gradientColors.length];
            const disciplinasArray = Array.isArray(ciclo.disciplinas) ? ciclo.disciplinas : [];
            const hasDisciplinas = disciplinasArray.length > 0;
            
            // Verificar se as disciplinas são objetos ou strings
            const isObjectDisciplinas = hasDisciplinas && typeof disciplinasArray[0] === 'object';

            // Determinar se é ciclo comum ou específico
            const isCicloComum = ciclo.nome.toLowerCase().includes('comum') || 
                                 ciclo.nome.toLowerCase().includes('base') ||
                                 ciclo.nome.toLowerCase().includes('estratégias') ||
                                 ciclo.nome.toLowerCase().includes('liderança');

            // Buscar especialização vinculada (se for ciclo específico)
            const especializacaoVinculada = !isCicloComum 
              ? especializacoes.find(e => e.ciclos?.includes(ciclo.id))
              : null;

            return (
              <Card 
                key={ciclo.id}
                data-ciclo-id={ciclo.id}
                className="card-ciclo overflow-hidden border-2 border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${gradientClass} p-4 sm:p-6 text-gray-800`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg">
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">{ciclo.nome}</h2>
                          <div className="flex flex-col gap-2 mt-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-white border-green-600 text-gray-900 text-xs sm:text-sm font-semibold">
                                {ciclo.carga_horaria}h
                              </Badge>
                              {hasDisciplinas && (
                                <Badge className="bg-white border-green-600 text-gray-900 text-xs sm:text-sm font-semibold">
                                  {disciplinasArray.length} Disciplinas
                                </Badge>
                              )}
                              <Badge className={`text-xs sm:text-sm font-bold ${
                                isCicloComum 
                                  ? 'bg-blue-600 text-white border-blue-700' 
                                  : 'bg-orange-600 text-white border-orange-700'
                              }`}>
                                {isCicloComum ? 'Ciclo Comum' : 'Ciclo Específico'}
                              </Badge>
                            </div>
                            {!isCicloComum && especializacaoVinculada && (
                              <div className="text-xs sm:text-sm text-gray-700 font-semibold bg-white/60 px-3 py-1.5 rounded-md border border-gray-300">
                                Especialização em {especializacaoVinculada.nome}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleCiclo(ciclo.id)}
                      variant="outline"
                      className="text-gray-800 hover:bg-white border-2 border-green-600 w-full sm:w-auto text-sm sm:text-base"
                    >
                      {isExpanded ? (
                        <>
                          Ocultar <ChevronUp className="ml-2 w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Ver Disciplinas <ChevronDown className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
                    {!hasDisciplinas ? (
                      <p className="text-center text-gray-500 italic py-6 sm:py-8 text-sm sm:text-base">
                        Nenhuma disciplina cadastrada para este ciclo ainda.
                      </p>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {disciplinasArray.map((disciplina, discIndex) => {
                          const isDiscExpanded = allExpanded || expandedDisciplina === `${ciclo.id}-${discIndex}`;
                          const discKey = `${ciclo.id}-${discIndex}`;
                          
                          // Se for string (formato antigo), mostrar apenas o nome
                          if (typeof disciplina === 'string') {
                            return (
                              <div key={discIndex} className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-green-600 shadow-sm">
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">{disciplina}</p>
                              </div>
                            );
                          }

                          // Se for objeto (formato novo com ementa)
                          return (
                            <div 
                              key={discIndex} 
                              className="disciplina-detalhes bg-white rounded-lg border-2 border-gray-200 hover:border-green-600 transition-all shadow-md"
                            >
                              <div className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                  <div className="flex-1 w-full">
                                    <div className="flex items-start gap-2 sm:gap-3 mb-2">
                                      <div className="bg-green-100 text-green-700 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                                        {discIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-tight">
                                          {disciplina.nome}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                          {disciplina.modalidade && (
                                           <Badge variant="outline" className={`text-xs sm:text-sm ${
                                             disciplina.modalidade === 'Presencial' 
                                               ? 'border-green-600 text-green-700 bg-green-50' 
                                               : 'border-blue-600 text-blue-700 bg-blue-50'
                                           }`}>
                                             {disciplina.modalidade}
                                           </Badge>
                                          )}
                                          {disciplina.carga_horaria && (
                                            <Badge variant="outline" className="border-gray-400 text-gray-700 text-xs sm:text-sm">
                                              {disciplina.carga_horaria}h
                                            </Badge>
                                          )}
                                        </div>
                                        {disciplina.ementa_sintetica && (
                                          <p className="text-gray-700 leading-relaxed text-justify text-xs sm:text-sm md:text-base">
                                            {disciplina.ementa_sintetica}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {(disciplina.ementa_detalhada || disciplina.conhecimento_adquirido || disciplina.habilidade_tecnica || disciplina.habilidade_comportamental) && (
                                    <Button
                                      onClick={() => toggleDisciplina(discKey)}
                                      variant="outline"
                                      size="sm"
                                      className="flex-shrink-0 w-full sm:w-auto text-xs sm:text-sm"
                                    >
                                      {isDiscExpanded ? (
                                        <>
                                          <ChevronUp className="w-4 h-4" />
                                        </>
                                      ) : (
                                        <>
                                          Detalhes <ChevronDown className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>

                                {isDiscExpanded && (
                                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-3 sm:space-y-4">
                                    {includeEmentaDetalhada && disciplina.ementa_detalhada && (
                                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          📖 Ementa Detalhada
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.ementa_detalhada}
                                        </p>
                                      </div>
                                    )}

                                    {includeConhecimento && disciplina.conhecimento_adquirido && (
                                      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                                        <h4 className="text-xs sm:text-sm font-bold text-green-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          🎓 Conhecimento Adquirido
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.conhecimento_adquirido}
                                        </p>
                                      </div>
                                    )}

                                    {includeHabilidadeTecnica && disciplina.habilidade_tecnica && (
                                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <h4 className="text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          🔧 Habilidade Técnica (Entregável)
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.habilidade_tecnica}
                                        </p>
                                      </div>
                                    )}

                                    {includeHabilidadeComportamental && disciplina.habilidade_comportamental && (
                                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          💡 Habilidade Comportamental
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800">
                                          {disciplina.habilidade_comportamental}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
          
          {/* Rodapé do PDF - visível apenas na impressão */}
          <div className="pdf-footer hidden print:block">
            <div className="mt-6 pt-4 border-t-2 border-green-600">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <p className="font-semibold">ESUDA - Pós-Graduação</p>
                  <p>contato@esuda.edu.br | (81) 3413-3939</p>
                </div>
                <div className="text-right">
                  <p>Rua Frei Cassimiro, 91 - Santo Amaro</p>
                  <p>Recife - PE | www.esuda.edu.br</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-6 sm:pt-8">
          <Link to={createPageUrl('DiferenciaisPage')} className="w-full sm:w-auto">
            <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
              ← Voltar
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
              Ver Especializações
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}