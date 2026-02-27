import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Search, Filter, CheckCircle2, CalendarIcon, X, MessageCircle, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LeadsTable({ inscritos, onUpdate, onDelete, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [grupoFilter, setGrupoFilter] = useState([]);
  const [cursoFilter, setCursoFilter] = useState([]);
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Extrair lista única de cursos
  const cursosUnicos = useMemo(() => {
    const cursos = new Set(inscritos.map(i => i.nome_curso).filter(Boolean));
    return Array.from(cursos).sort();
  }, [inscritos]);

  const filtered = inscritos.filter(inscrito => {
    const matchesSearch = !searchTerm || 
      inscrito.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inscrito.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inscrito.nome_curso?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(inscrito.status_crm);
    const matchesGrupo = grupoFilter.length === 0 || grupoFilter.includes(inscrito.grupo_monitoramento);
    const matchesCurso = cursoFilter.length === 0 || cursoFilter.includes(inscrito.nome_curso);
    
    // Filtro de data
    const inscricaoDate = inscrito.data_inscricao ? new Date(inscrito.data_inscricao) : null;
    const matchesDataInicio = !dataInicio || !inscricaoDate || inscricaoDate >= dataInicio;
    const matchesDataFim = !dataFim || !inscricaoDate || inscricaoDate <= dataFim;
    
    return matchesSearch && matchesStatus && matchesGrupo && matchesCurso && matchesDataInicio && matchesDataFim;
  });

  const handleEdit = (inscrito) => {
    setEditingId(inscrito.id);
    setEditForm({
      status_crm: inscrito.status_crm,
      observacoes: inscrito.observacoes || '',
      tags: inscrito.tags || []
    });
  };

  const handleSave = async (id) => {
    const inscrito = inscritos.find(i => i.id === id);
    await onUpdate(id, editForm);
    
    // Registrar no log de atividades
    try {
      await base44.entities.CRMActivityLog.create({
        user_email: currentUser?.email,
        user_name: currentUser?.full_name,
        action_type: 'lead_atualizado',
        lead_id: id,
        lead_nome: inscrito?.nome_completo,
        details: {
          campo: 'status_crm',
          de: inscrito?.status_crm,
          para: editForm.status_crm
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
    
    setEditingId(null);
    toast.success('Lead atualizado!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'Contatado': return 'bg-yellow-100 text-yellow-800';
      case 'Em Negociação': return 'bg-orange-100 text-orange-800';
      case 'Matriculado Turma Antiga': return 'bg-indigo-100 text-indigo-800';
      case 'Matriculado Turma Nova': return 'bg-green-100 text-green-800';
      case 'Desistente': return 'bg-red-100 text-red-800';
      case 'Sem Resposta': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrupoColor = (grupo) => {
    switch(grupo) {
      case 'G1_Cursos_Atuais': return 'bg-emerald-100 text-emerald-800';
      case 'G2_Cursos_Legacy_Pos_Ago2024': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const exportToPDF = () => {
    // Landscape para mais espaço horizontal
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();   // 297mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
    const margin = 14;
    const now = new Date().toLocaleDateString('pt-BR');

    // --- Cabeçalho ---
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Leads - CRM ESUDA', margin, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${now}   |   Total: ${filtered.length} lead(s)`, margin, 23);

    // Filtros aplicados
    const filtrosAplicados = [];
    if (searchTerm) filtrosAplicados.push(`Busca: "${searchTerm}"`);
    if (statusFilter.length > 0) filtrosAplicados.push(`Status: ${statusFilter.join(', ')}`);
    if (grupoFilter.length > 0) filtrosAplicados.push(`Grupos: ${grupoFilter.map(getGrupoLabel).join(', ')}`);
    if (cursoFilter.length > 0) filtrosAplicados.push(`Cursos: ${cursoFilter.join(', ')}`);
    if (dataInicio || dataFim) filtrosAplicados.push(`Período: ${dataInicio ? format(dataInicio, 'dd/MM/yyyy') : '*'} - ${dataFim ? format(dataFim, 'dd/MM/yyyy') : '*'}`);

    let headerY = 30;
    if (filtrosAplicados.length > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(90, 90, 90);
      const filtroText = 'Filtros: ' + filtrosAplicados.join('   |   ');
      const filtroLines = doc.splitTextToSize(filtroText, pageWidth - margin * 2);
      doc.text(filtroLines, margin, headerY);
      headerY += filtroLines.length * 4 + 3;
      doc.setTextColor(0, 0, 0);
    }

    // --- Definição das colunas ---
    // Nome | Contato (Email + WhatsApp) | Curso | Status | Inscrição
    const colX    = [margin, 75,  160, 225, 258, 278];
    const colW    = [59,     83,   63,  31,   18,  14]; // larguras máx para splitText
    const headers = ['Nome', 'Email / WhatsApp', 'Curso', 'Status', 'Inscrição', 'Pago'];

    // Linha de cabeçalho da tabela
    const headerRowH = 8;
    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, headerY, pageWidth - margin * 2, headerRowH, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(h, colX[i] + 1, headerY + 5.5));
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    let y = headerY + headerRowH + 1;

    // --- Linhas de dados ---
    filtered.forEach((inscrito, idx) => {
      // Preparar conteúdo multi-linha de cada célula
      const nomeLines    = doc.splitTextToSize(inscrito.nome_completo || '-', colW[0]);
      const emailLines   = doc.splitTextToSize(`Email: ${inscrito.email || '-'}`, colW[1]);
      const waLine       = inscrito.telefone_sanitizado
        ? doc.splitTextToSize(`WhatsApp: ${inscrito.telefone_sanitizado}`, colW[1])
        : [];
      const contatoLines = [...emailLines, ...waLine];
      const cursoLines   = doc.splitTextToSize(inscrito.nome_curso || '-', colW[2]);
      const statusLines  = doc.splitTextToSize(inscrito.status_crm || '-', colW[3]);
      const dataStr      = inscrito.data_inscricao
        ? new Date(inscrito.data_inscricao).toLocaleDateString('pt-BR')
        : '-';

      const lineH   = 4.2; // altura de cada linha de texto
      const padding = 2;   // padding vertical interno
      const maxLines = Math.max(nomeLines.length, contatoLines.length, cursoLines.length, statusLines.length, 1);
      const rowH = maxLines * lineH + padding * 2;

      // Nova página se necessário
      if (y + rowH > pageHeight - 10) {
        doc.addPage();
        y = 15;
        // Replicar cabeçalho
        doc.setFillColor(41, 128, 185);
        doc.setTextColor(255, 255, 255);
        doc.rect(margin, y, pageWidth - margin * 2, headerRowH, 'F');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => doc.text(h, colX[i] + 1, y + 5.5));
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        y += headerRowH + 1;
      }

      // Fundo alternado
      if (idx % 2 === 0) {
        doc.setFillColor(245, 248, 252);
        doc.rect(margin, y, pageWidth - margin * 2, rowH, 'F');
      }

      // Borda leve
      doc.setDrawColor(220, 220, 220);
      doc.rect(margin, y, pageWidth - margin * 2, rowH, 'S');

      // Texto das células
      doc.setFontSize(7.5);
      const textY = y + padding + lineH;

      doc.setFont('helvetica', 'bold');
      doc.text(nomeLines, colX[0] + 1, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(contatoLines, colX[1] + 1, textY);
      doc.text(cursoLines,   colX[2] + 1, textY);
      doc.text(statusLines,  colX[3] + 1, textY);
      doc.text(dataStr,      colX[4] + 1, textY);

      y += rowH;
    });

    doc.save(`leads-crm-${now.replace(/\//g, '-')}.pdf`);
  };

  const getGrupoLabel = (grupo) => {
    switch(grupo) {
      case 'G1_Cursos_Atuais': return 'G1 - Atual';
      case 'G2_Cursos_Legacy_Pos_Ago2024': return 'G2 - Legacy';
      default: return 'N/A';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40 justify-between">
              {statusFilter.length === 0 ? (
                'Todos Status'
              ) : statusFilter.length === 1 ? (
                statusFilter[0]
              ) : (
                `${statusFilter.length} status`
              )}
              <Filter className="ml-2 h-4 w-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Filtrar por Status</label>
                {statusFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter([])}
                    className="h-6 px-2 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {['Novo', 'Contatado', 'Em Negociação', 'Matriculado Turma Antiga', 'Matriculado Turma Nova', 'Desistente', 'Sem Resposta'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status]);
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== status));
                        }
                      }}
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="text-sm text-gray-700 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40 justify-between">
              {grupoFilter.length === 0 ? (
                'Todos Grupos'
              ) : grupoFilter.length === 1 ? (
                grupoFilter[0] === 'G1_Cursos_Atuais' ? 'G1 - Atuais' : 'G2 - Legacy'
              ) : (
                `${grupoFilter.length} grupos`
              )}
              <Filter className="ml-2 h-4 w-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Filtrar por Grupos</label>
                {grupoFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGrupoFilter([])}
                    className="h-6 px-2 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {[
                  { id: 'G1_Cursos_Atuais', label: 'G1 - Atuais' },
                  { id: 'G2_Cursos_Legacy_Pos_Ago2024', label: 'G2 - Legacy' }
                ].map(grupo => (
                  <div key={grupo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grupo-${grupo.id}`}
                      checked={grupoFilter.includes(grupo.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGrupoFilter([...grupoFilter, grupo.id]);
                        } else {
                          setGrupoFilter(grupoFilter.filter(g => g !== grupo.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`grupo-${grupo.id}`}
                      className="text-sm text-gray-700 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {grupo.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-56 justify-between">
              {cursoFilter.length === 0 ? (
                'Todos Cursos'
              ) : cursoFilter.length === 1 ? (
                cursoFilter[0]
              ) : (
                `${cursoFilter.length} cursos selecionados`
              )}
              <Filter className="ml-2 h-4 w-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Filtrar por Cursos</label>
                {cursoFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCursoFilter([])}
                    className="h-6 px-2 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {cursosUnicos.map(curso => (
                  <div key={curso} className="flex items-center space-x-2">
                    <Checkbox
                      id={curso}
                      checked={cursoFilter.includes(curso)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCursoFilter([...cursoFilter, curso]);
                        } else {
                          setCursoFilter(cursoFilter.filter(c => c !== curso));
                        }
                      }}
                    />
                    <label
                      htmlFor={curso}
                      className="text-sm text-gray-700 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {curso}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-64">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataInicio && dataFim ? (
                `${format(dataInicio, 'dd/MM/yyyy')} - ${format(dataFim, 'dd/MM/yyyy')}`
              ) : dataInicio ? (
                `A partir de ${format(dataInicio, 'dd/MM/yyyy')}`
              ) : dataFim ? (
                `Até ${format(dataFim, 'dd/MM/yyyy')}`
              ) : (
                'Filtrar por período'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Data Início</label>
                <Calendar
                  mode="single"
                  selected={dataInicio}
                  onSelect={setDataInicio}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Data Fim</label>
                <Calendar
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setDataInicio(null); setDataFim(null); }}
                className="w-full"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar período
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Badge variant="outline" className="text-sm">
          {filtered.length} lead(s)
        </Badge>

        <Button
          onClick={exportToPDF}
          disabled={filtered.length === 0}
          variant="outline"
          className="gap-2 text-red-700 border-red-300 hover:bg-red-50"
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 italic">Nenhum lead encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(inscrito => (
            <Card key={inscrito.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {editingId === inscrito.id ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{inscrito.nome_completo}</h4>
                        <p className="text-sm text-gray-600">{inscrito.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(inscrito.id)} className="bg-green-600">
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Status CRM</label>
                      <Select value={editForm.status_crm} onValueChange={(v) => setEditForm({...editForm, status_crm: v})}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Novo">Novo</SelectItem>
                          <SelectItem value="Contatado">Contatado</SelectItem>
                          <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                          <SelectItem value="Matriculado Turma Antiga">Matriculado Turma Antiga</SelectItem>
                          <SelectItem value="Matriculado Turma Nova">Matriculado Turma Nova</SelectItem>
                          <SelectItem value="Desistente">Desistente</SelectItem>
                          <SelectItem value="Sem Resposta">Sem Resposta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Observações</label>
                      <Input
                        value={editForm.observacoes}
                        onChange={(e) => setEditForm({...editForm, observacoes: e.target.value})}
                        placeholder="Adicione notas sobre este lead..."
                        className="text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-800">{inscrito.nome_completo}</h4>
                        <Badge className={getStatusColor(inscrito.status_crm)}>
                          {inscrito.status_crm}
                        </Badge>
                        <Badge className={getGrupoColor(inscrito.grupo_monitoramento)}>
                          {getGrupoLabel(inscrito.grupo_monitoramento)}
                        </Badge>
                        {inscrito.inscricao_paga && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Pago
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Curso:</strong> {inscrito.nome_curso}</p>
                        <p><strong>Email:</strong> {inscrito.email}</p>
                        {inscrito.telefone_sanitizado && (
                          <p><strong>WhatsApp:</strong> {inscrito.telefone_sanitizado}</p>
                        )}
                        <p><strong>Inscrição:</strong> {new Date(inscrito.data_inscricao).toLocaleDateString('pt-BR')}</p>
                        {inscrito.observacoes && (
                          <p className="italic text-gray-500">💬 {inscrito.observacoes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {inscrito.telefone_sanitizado && (
                        <a
                          href={`https://wa.me/${inscrito.telefone_sanitizado}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(inscrito)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm('Remover este lead?')) {
                            onDelete(inscrito.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}