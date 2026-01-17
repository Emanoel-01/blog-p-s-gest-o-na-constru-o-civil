import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mail, Download, Send, FileText, Upload, Eye, X, Image as ImageIcon, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/editor/RichTextEditor';

export default function BulkActions({ inscritos, currentUser }) {
  const [filtros, setFiltros] = useState({
    grupo_monitoramento: [],
    status_crm: [],
    inscricao_paga: '',
    nome_curso: ''
  });
  const [emailForm, setEmailForm] = useState({
    assunto: '',
    conteudo: ''
  });
  const [anexos, setAnexos] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const inscritosFiltrados = inscritos.filter(inscrito => {
    const matchesGrupo = filtros.grupo_monitoramento.length === 0 || filtros.grupo_monitoramento.includes(inscrito.grupo_monitoramento);
    const matchesStatus = filtros.status_crm.length === 0 || filtros.status_crm.includes(inscrito.status_crm);
    const matchesPago = filtros.inscricao_paga === '' || inscrito.inscricao_paga === (filtros.inscricao_paga === 'true');
    const matchesCurso = !filtros.nome_curso || inscrito.nome_curso?.toLowerCase().includes(filtros.nome_curso.toLowerCase());
    
    return matchesGrupo && matchesStatus && matchesPago && matchesCurso;
  });

  const cursosUnicos = [...new Set(inscritos.map(i => i.nome_curso).filter(Boolean))].sort();

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (anexos.length + files.length > 10) {
      toast.error('Máximo de 10 anexos permitidos');
      return;
    }

    setUploadingImage(true);
    try {
      const novosAnexos = [];
      
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Converter para Base64 para anexo
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            novosAnexos.push({
              filename: file.name,
              content: base64,
              type: file.type,
              url: file_url
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      
      setAnexos([...anexos, ...novosAnexos]);
      toast.success(`${novosAnexos.length} arquivo(s) carregado(s)!`);
    } catch (error) {
      toast.error('Erro ao carregar arquivos');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeAnexo = (index) => {
    setAnexos(anexos.filter((_, i) => i !== index));
  };

  const handleExportCSV = async () => {
    try {
      const { data } = await base44.functions.invoke('exportWhatsAppCSV', { filtros });
      
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_whatsapp_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleEnviarEmails = async () => {
    if (!emailForm.assunto || !emailForm.conteudo) {
      toast.error('Preencha assunto e conteúdo do email');
      return;
    }

    if (inscritosFiltrados.length === 0) {
      toast.error('Nenhum lead selecionado com os filtros aplicados');
      return;
    }

    if (!window.confirm(`Enviar email para ${inscritosFiltrados.length} lead(s)?`)) {
      return;
    }

    setSending(true);
    try {
      const destinatarios = inscritosFiltrados
        .filter(i => i.email)
        .map(i => ({ email: i.email, nome: i.nome_completo }));

      const attachments = anexos.map(a => ({
        filename: a.filename,
        content: a.content,
        type: a.type,
        disposition: 'attachment'
      }));

      const carimbo = `
<hr style="border: none; border-top: 2px solid #61b376; margin: 20px 0;">
<p style="font-size: 8px; color: #666; line-height: 1.5; margin-bottom: 15px;">
  <strong>Emanoel Silva de Amorim</strong><br>
  Mestre em Engenharia Civil / Arquiteto e Urbanista<br>
  Coordenação das Especializações em Gestão e Tecnologias da Construção Civil:<br><br>
  <a href="https://esuda.edu.br/posgraduacao/especializacao-em-gestao-de-manutencao-predial-na-construcao-4-0/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Engenharia e Gestão da Manutenção Predial na Construção 4.0</a><br>
  <a href="https://esuda.edu.br/posgraduacao/especializacao-em-gestao-de-projetos-e-obras-orcamento-e-pericia/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Gestão de Projetos e Obras</a><br>
  <a href="https://esuda.edu.br/posgraduacao/especializacao-em-tecnologia-bim-na-construcao-civil/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Tecnologia Bim na Construção Civil</a><br>
  <a href="https://esuda.edu.br/posgraduacao/engenharia-legal-e-pericias-avaliacoes-e-desempenho/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Engenharia Legal: Perícias, Avaliações e Desempenho</a><br><br>
  e-mail: <a href="mailto:emanoel@esuda.edu.br" style="color: #007bff; text-decoration: none;">emanoel@esuda.edu.br</a><br>
  Contato: (081) 9.9129-8803 / (081) 9.928-4160<br>
  <a href="https://blogpos.base44.app/Homepage" target="_blank" style="color: #007bff; text-decoration: none;">Conheça o Nosso Blog: Clique aqui</a>
</p>
<table style="width: 100%; margin-top: 15px;">
  <tr>
    <td style="vertical-align: top; width: 100px;">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e635f18ac82c0861df74bb/5b895a496_logo.png" alt="Faculdade ESUDA" style="width: 90px; height: auto;">
    </td>
    <td style="vertical-align: top; padding-left: 15px;">
      <p style="font-size: 8px; color: #666; line-height: 1.6; margin: 0;">
        <strong>Faculdade ESUDA</strong><br>
        Especializações nas áreas de Gestão e Tecnologias na Construção Civil<br>
        <a href="https://www.esuda.edu.br" target="_blank" style="color: #007bff; text-decoration: none;">www.esuda.edu.br</a>
      </p>
    </td>
  </tr>
</table>`;

      const conteudoComCarimbo = `<div style="font-size: 12px;">${emailForm.conteudo}</div>${carimbo}`;

      const { data } = await base44.functions.invoke('sendBulkEmail', {
        destinatarios,
        assunto: emailForm.assunto,
        conteudo_html: conteudoComCarimbo,
        attachments
      });

      if (data.success) {
        try {
          await base44.entities.CRMActivityLog.create({
            user_email: currentUser?.email,
            user_name: currentUser?.full_name,
            action_type: 'email_em_massa',
            details: {
              destinatarios: `${data.stats.enviados} lead(s)`,
              assunto: emailForm.assunto,
              com_anexos: attachments.length
            },
            timestamp: new Date().toISOString()
          });
        } catch (logError) {
          console.error('Erro ao registrar log:', logError);
        }
        
        toast.success(`${data.stats.enviados} email(s) enviado(s) com sucesso!`);
        if (data.stats.falhas > 0) {
          toast.warning(`${data.stats.falhas} email(s) falharam`);
        }
        setEmailForm({ assunto: '', conteudo: '' });
        setAnexos([]);
      } else {
        toast.error('Erro no envio');
      }
    } catch (error) {
      toast.error('Erro: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const getEmailPreviewHTML = () => {
    const carimbo = `
<hr style="border: none; border-top: 2px solid #61b376; margin: 20px 0;">
<p style="font-size: 8px; color: #666; line-height: 1.5; margin-bottom: 15px;">
  <strong>Emanoel Silva de Amorim</strong><br>
  Mestre em Engenharia Civil / Arquiteto e Urbanista<br>
  Coordenação das Especializações em Gestão e Tecnologias da Construção Civil:<br><br>
  <a href="https://esuda.edu.br/posgraduacao/especializacao-em-gestao-de-manutencao-predial-na-construcao-4-0/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Engenharia e Gestão da Manutenção Predial na Construção 4.0</a><br>
  <a href="https://esuda.edu.br/posgraduacao/especializacao-em-gestao-de-projetos-e-obras-orcamento-e-pericia/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Gestão de Projetos e Obras</a><br>
  <a href="https://esuda.edu.br/posgraduacao/especializacao-em-tecnologia-bim-na-construcao-civil/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Tecnologia Bim na Construção Civil</a><br>
  <a href="https://esuda.edu.br/posgraduacao/engenharia-legal-e-pericias-avaliacoes-e-desempenho/" target="_blank" style="color: #007bff; text-decoration: none;">Especialização em Engenharia Legal: Perícias, Avaliações e Desempenho</a><br><br>
  e-mail: <a href="mailto:emanoel@esuda.edu.br" style="color: #007bff; text-decoration: none;">emanoel@esuda.edu.br</a><br>
  Contato: (081) 9.9129-8803 / (081) 9.928-4160<br>
  <a href="https://blogpos.base44.app/Homepage" target="_blank" style="color: #007bff; text-decoration: none;">Conheça o Nosso Blog: Clique aqui</a>
</p>
<table style="width: 100%; margin-top: 15px;">
  <tr>
    <td style="vertical-align: top; width: 100px;">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e635f18ac82c0861df74bb/5b895a496_logo.png" alt="Faculdade ESUDA" style="width: 90px; height: auto;">
    </td>
    <td style="vertical-align: top; padding-left: 15px;">
      <p style="font-size: 8px; color: #666; line-height: 1.6; margin: 0;">
        <strong>Faculdade ESUDA</strong><br>
        Especializações nas áreas de Gestão e Tecnologias na Construção Civil<br>
        <a href="https://www.esuda.edu.br" target="_blank" style="color: #007bff; text-decoration: none;">www.esuda.edu.br</a>
      </p>
    </td>
  </tr>
</table>`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #61b376 0%, #4a9960 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .content { margin: 20px 0; font-size: 12px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #61b376; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${emailForm.assunto || 'Assunto do Email'}</h1>
    </div>
    <div class="content">
      ${emailForm.conteudo || 'Conteúdo do email...'}
    </div>
    ${anexos.length > 0 ? `
    <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; border-left: 4px solid #61b376;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; font-weight: bold;">📎 Anexos (${anexos.length}):</p>
      ${anexos.map(a => `<p style="margin: 5px 0; font-size: 13px; color: #666;">• ${a.filename}</p>`).join('')}
    </div>
    ` : ''}
    ${carimbo}
    <div class="footer">
      <p><strong>ESUDA - Pós-Graduação</strong></p>
      <p>Escola Superior de Desenvolvimento e Aperfeiçoamento</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Ações em Massa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between w-full">
                  {filtros.grupo_monitoramento.length === 0 ? (
                    'Todos Grupos'
                  ) : filtros.grupo_monitoramento.length === 1 ? (
                    filtros.grupo_monitoramento[0] === 'G1_Cursos_Atuais' ? 'G1 - Atuais' : 'G2 - Legacy'
                  ) : (
                    `${filtros.grupo_monitoramento.length} grupos`
                  )}
                  <Filter className="ml-2 h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">Filtrar por Grupos</label>
                    {filtros.grupo_monitoramento.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiltros({...filtros, grupo_monitoramento: []})}
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
                          id={`bulk-grupo-${grupo.id}`}
                          checked={filtros.grupo_monitoramento.includes(grupo.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiltros({...filtros, grupo_monitoramento: [...filtros.grupo_monitoramento, grupo.id]});
                            } else {
                              setFiltros({...filtros, grupo_monitoramento: filtros.grupo_monitoramento.filter(g => g !== grupo.id)});
                            }
                          }}
                        />
                        <label
                          htmlFor={`bulk-grupo-${grupo.id}`}
                          className="text-sm text-gray-700 cursor-pointer leading-none"
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
                <Button variant="outline" className="justify-between w-full">
                  {filtros.status_crm.length === 0 ? (
                    'Todos Status'
                  ) : filtros.status_crm.length === 1 ? (
                    filtros.status_crm[0]
                  ) : (
                    `${filtros.status_crm.length} status`
                  )}
                  <Filter className="ml-2 h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">Filtrar por Status</label>
                    {filtros.status_crm.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiltros({...filtros, status_crm: []})}
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
                          id={`bulk-status-${status}`}
                          checked={filtros.status_crm.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiltros({...filtros, status_crm: [...filtros.status_crm, status]});
                            } else {
                              setFiltros({...filtros, status_crm: filtros.status_crm.filter(s => s !== status)});
                            }
                          }}
                        />
                        <label
                          htmlFor={`bulk-status-${status}`}
                          className="text-sm text-gray-700 cursor-pointer leading-none"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Pagamento</label>
              <Select value={filtros.inscricao_paga} onValueChange={(v) => setFiltros({...filtros, inscricao_paga: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
                  <SelectItem value="true">Pagos</SelectItem>
                  <SelectItem value="false">Não Pagos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Curso</label>
              <Select value={filtros.nome_curso} onValueChange={(v) => setFiltros({...filtros, nome_curso: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
                  {cursosUnicos.map(curso => (
                    <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm font-medium text-gray-700 mb-2">Leads Selecionados:</p>
            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
              {inscritosFiltrados.length} lead(s)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handleExportCSV}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV WhatsApp
            </Button>
            <Button
              onClick={async () => {
                if (!window.confirm('⚠️ ATENÇÃO: Esta ação importará TODOS os dados históricos (pré-Agosto/2024) da planilha Google Sheets. Execute apenas UMA VEZ. Continuar?')) {
                  return;
                }
                
                toast.info('Importando histórico... Isso pode levar alguns minutos.');
                try {
                  const { data } = await base44.functions.invoke('importLegacyHistory');
                  if (data.success) {
                    toast.success(`Histórico importado! ${data.stats.imported} registros adicionados`);
                  }
                } catch (error) {
                  toast.error('Erro na importação');
                }
              }}
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-50"
            >
              📚 Importar Histórico (Única Vez)
            </Button>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-bold text-gray-800">Envio de Email em Massa</h4>
            
            <Input
              placeholder="Assunto do Email"
              value={emailForm.assunto}
              onChange={(e) => setEmailForm({...emailForm, assunto: e.target.value})}
            />
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Conteúdo do Email</label>
              <RichTextEditor
                value={emailForm.conteudo}
                onChange={(value) => setEmailForm({...emailForm, conteudo: value})}
                placeholder="Escreva o conteúdo do email..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Anexos (opcional, máx. 10 arquivos)
              </label>
              
              {anexos.length > 0 && (
                <div className="mb-3 space-y-2">
                  {anexos.map((anexo, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{anexo.filename}</p>
                          <p className="text-xs text-gray-600">Pronto para envio</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeAnexo(index)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {anexos.length < 10 && (
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*, application/pdf, .doc, .docx"
                    multiple
                    onChange={handleUploadImages}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  <Button disabled={uploadingImage} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                {anexos.length}/10 anexos • Selecione múltiplos arquivos de uma vez
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="flex-1"
                disabled={!emailForm.assunto || !emailForm.conteudo}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar Email
              </Button>
              <Button
                onClick={handleEnviarEmails}
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para {inscritosFiltrados.length} Lead(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Pré-visualização */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Email</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white rounded-lg shadow-lg" dangerouslySetInnerHTML={{ __html: getEmailPreviewHTML() }} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setShowPreview(false)} variant="outline">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}