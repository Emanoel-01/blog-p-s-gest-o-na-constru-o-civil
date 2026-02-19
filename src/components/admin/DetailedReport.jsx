import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  Handshake, 
  Cpu, 
  Clock, 
  Calendar,
  Video,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function DetailedReport({ especializacoes, ciclos, professores, parceiros, tecnologias }) {
  console.log('DetailedReport renderizado com props:', { especializacoes, ciclos, professores, parceiros, tecnologias });

  const getCicloById = (id) => ciclos.find(c => c.id === id);
  const getProfessorById = (id) => professores.find(p => p.id === id);
  const getParceiroById = (id) => parceiros.find(p => p.id === id);
  const getTecnologiaById = (id) => tecnologias.find(t => t.id === id);

  const exportToPDF = async () => {
    const element = document.getElementById('detailed-report-content');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('relatorio-detalhado-posgraduacoes.pdf');
  };

  const renderFieldStatus = (value, label) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
          <AlertTriangle className="w-4 h-4" />
          <span><strong>{label}:</strong> Não preenchido</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
        <CheckCircle className="w-4 h-4" />
        <span><strong>{label}:</strong> Preenchido</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Relatório Detalhado de Pós-Graduações</h3>
        <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar para PDF
        </Button>
      </div>

      <div id="detailed-report-content" className="space-y-8 bg-white p-8">
        {especializacoes.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">Nenhuma especialização cadastrada para gerar relatório.</p>
        ) : (
          especializacoes.map((espec, index) => {
            const ciclosData = (espec.ciclos || []).map(id => getCicloById(id)).filter(Boolean);
            const professoresData = (espec.professores || []).map(id => getProfessorById(id)).filter(Boolean);
            const parceirosData = (espec.parceiros || []).map(id => getParceiroById(id)).filter(Boolean);
            const tecnologiasData = (espec.tecnologias || []).map(id => getTecnologiaById(id)).filter(Boolean);

            return (
              <Card key={espec.id} className="border-2 border-blue-300 shadow-xl page-break">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="text-2xl">
                    {index + 1}. Especialização em {espec.nome}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-white text-blue-600 font-bold">
                      {espec.carga_horaria_total || 0}h
                    </Badge>
                    {espec.status_inscricao && (
                      <Badge className="bg-white text-indigo-600">
                        {espec.status_inscricao}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Informações Gerais */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Informações Gerais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {renderFieldStatus(espec.resumo, "Resumo Publicitário")}
                      {renderFieldStatus(espec.descricao_completa_ia, "Descrição Completa")}
                      {renderFieldStatus(espec.periodo_inscricao, "Período de Inscrição")}
                      {renderFieldStatus(espec.data_inicio, "Data de Início")}
                      {renderFieldStatus(espec.formato_aulas, "Formato das Aulas")}
                      {renderFieldStatus(espec.dias_aulas, "Dias das Aulas")}
                      {renderFieldStatus(espec.horario_inicio, "Horário de Início")}
                      {renderFieldStatus(espec.horario_fim, "Horário de Fim")}
                      {renderFieldStatus(espec.duracao_meses, "Duração em Meses")}
                      {renderFieldStatus(espec.condicoes_pagamento, "Condições de Pagamento")}
                    </div>
                  </div>

                  {/* Resumo */}
                  {espec.resumo && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-gray-800 mb-2">Resumo Publicitário:</h5>
                      <p className="text-gray-700 text-justify leading-relaxed">{espec.resumo}</p>
                    </div>
                  )}

                  {/* Links */}
                  {(espec.link_externo || espec.link_inscricao || espec.link_matricula) && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Links Externos:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {espec.link_externo && (
                          <Badge variant="outline" className="text-blue-600">Página ESUDA ✓</Badge>
                        )}
                        {espec.link_inscricao && (
                          <Badge variant="outline" className="text-green-600">Inscrição ✓</Badge>
                        )}
                        {espec.link_matricula && (
                          <Badge variant="outline" className="text-orange-600">Matrícula ✓</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  {(espec.formato_aulas || espec.dias_aulas || espec.horario_inicio) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      {espec.formato_aulas && especializacoes.formato_aulas && espec.formato_aulas.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Formato</p>
                            <p className="font-semibold text-gray-800 text-sm">{espec.formato_aulas.join(', ')}</p>
                          </div>
                        </div>
                      )}
                      {espec.dias_aulas && especializacoes.dias_aulas && espec.dias_aulas.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500">Dias</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {espec.dias_aulas.map(d => d.substring(0, 3)).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                      {espec.horario_inicio && espec.horario_fim && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-500">Horário</p>
                            <p className="font-semibold text-gray-800">{espec.horario_inicio} - {espec.horario_fim}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Condições de Pagamento */}
                  {espec.condicoes_pagamento && especializacoes.condicoes_pagamento && espec.condicoes_pagamento.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Condições de Pagamento:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {espec.condicoes_pagamento.map((cond, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg text-sm font-semibold ${
                              cond.destaque
                                ? 'bg-green-100 border-2 border-green-500 text-green-900'
                                : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                          >
                            {cond.descricao}
                            {cond.destaque && <span className="block text-xs mt-1">⭐ Melhor Condição</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ciclos de Conhecimento */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Ciclos de Conhecimento ({ciclosData.length})
                    </h4>
                    {ciclosData.length === 0 ? (
                      <div className="text-amber-600 bg-amber-50 px-4 py-3 rounded-md border border-amber-200">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Nenhum ciclo vinculado a esta especialização.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ciclosData.map((ciclo) => (
                          <Card key={ciclo.id} className="border-l-4 border-l-indigo-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-gray-800">{ciclo.nome}</h5>
                                <Badge className="bg-indigo-100 text-indigo-800">{ciclo.carga_horaria}h</Badge>
                              </div>
                              {ciclo.disciplinas && ciclo.disciplinas.length > 0 ? (
                                <div>
                                  <p className="text-xs text-gray-500 mb-2">Disciplinas ({ciclo.disciplinas.length}):</p>
                                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {ciclo.disciplinas.map((disc, idx) => (
                                      <li key={idx}>{typeof disc === 'string' ? disc : disc.nome}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <div className="text-amber-600 bg-amber-50 px-3 py-2 rounded-md text-sm">
                                  <AlertTriangle className="w-3 h-3 inline mr-2" />
                                  Disciplinas não lançadas ainda
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Professores */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Corpo Docente ({professoresData.length}):
                    </h5>
                    {professoresData.length === 0 ? (
                      <div className="text-amber-600 bg-amber-50 px-4 py-2 rounded-md text-sm">
                        <AlertTriangle className="w-3 h-3 inline mr-2" />
                        Nenhum professor vinculado
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {professoresData.map((prof) => (
                          <Badge key={prof.id} className="bg-purple-100 text-purple-800 border border-purple-300">
                            {prof.nome}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Parceiros */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-orange-600" />
                      Parceiros ({parceirosData.length}):
                    </h5>
                    {parceirosData.length === 0 ? (
                      <div className="text-amber-600 bg-amber-50 px-4 py-2 rounded-md text-sm">
                        <AlertTriangle className="w-3 h-3 inline mr-2" />
                        Nenhum parceiro vinculado
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {parceirosData.map((parc) => (
                          <Badge key={parc.id} className="bg-orange-100 text-orange-800 border border-orange-300">
                            {parc.nome}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tecnologias */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-green-600" />
                      Tecnologias ({tecnologiasData.length}):
                    </h5>
                    {tecnologiasData.length === 0 ? (
                      <div className="text-amber-600 bg-amber-50 px-4 py-2 rounded-md text-sm">
                        <AlertTriangle className="w-3 h-3 inline mr-2" />
                        Nenhuma tecnologia vinculada
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tecnologiasData.map((tec) => (
                          <Badge key={tec.id} className="bg-green-100 text-green-800 border border-green-300">
                            {tec.nome}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <style>{`
        @media print {
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}