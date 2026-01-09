import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Download, Send, FileText, Upload, Eye, X, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BulkActions({ inscritos, currentUser }) {
  const [filtros, setFiltros] = useState({
    grupo_monitoramento: '',
    status_crm: '',
    inscricao_paga: '',
    nome_curso: ''
  });
  const [emailForm, setEmailForm] = useState({
    assunto: '',
    conteudo: ''
  });
  const [imagemAnexo, setImagemAnexo] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const inscritosFiltrados = inscritos.filter(inscrito => {
    const matchesGrupo = !filtros.grupo_monitoramento || inscrito.grupo_monitoramento === filtros.grupo_monitoramento;
    const matchesStatus = !filtros.status_crm || inscrito.status_crm === filtros.status_crm;
    const matchesPago = filtros.inscricao_paga === '' || inscrito.inscricao_paga === (filtros.inscricao_paga === 'true');
    const matchesCurso = !filtros.nome_curso || inscrito.nome_curso?.toLowerCase().includes(filtros.nome_curso.toLowerCase());
    
    return matchesGrupo && matchesStatus && matchesPago && matchesCurso;
  });

  const cursosUnicos = [...new Set(inscritos.map(i => i.nome_curso).filter(Boolean))].sort();

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Converter para Base64 para anexo
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setImagemAnexo({
          filename: file.name,
          content: base64,
          type: file.type,
          url: file_url
        });
        toast.success('Imagem carregada!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploadingImage(false);
    }
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

      const attachments = [];
      if (imagemAnexo) {
        attachments.push({
          filename: imagemAnexo.filename,
          content: imagemAnexo.content,
          type: imagemAnexo.type,
          disposition: 'attachment'
        });
      }

      const { data } = await base44.functions.invoke('sendBulkEmail', {
        destinatarios,
        assunto: emailForm.assunto,
        conteudo_html: emailForm.conteudo.replace(/\n/g, '<br>'),
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
              com_anexo: attachments.length > 0
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
        setImagemAnexo(null);
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
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #61b376 0%, #4a9960 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .content { margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #61b376; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${emailForm.assunto || 'Assunto do Email'}</h1>
    </div>
    <div class="content">
      ${emailForm.conteudo.replace(/\n/g, '<br>') || 'Conteúdo do email...'}
    </div>
    ${imagemAnexo ? `
    <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; border-left: 4px solid #61b376;">
      <p style="margin: 0; font-size: 14px; color: #666;">📎 Anexo: ${imagemAnexo.filename}</p>
    </div>
    ` : ''}
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Grupo</label>
              <Select value={filtros.grupo_monitoramento} onValueChange={(v) => setFiltros({...filtros, grupo_monitoramento: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
                  <SelectItem value="G1_Cursos_Atuais">G1 - Atuais</SelectItem>
                  <SelectItem value="G2_Cursos_Legacy_Pos_Ago2024">G2 - Legacy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status CRM</label>
              <Select value={filtros.status_crm} onValueChange={(v) => setFiltros({...filtros, status_crm: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
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
            
            <Textarea
              placeholder="Conteúdo do Email (quebras de linha serão convertidas automaticamente)"
              value={emailForm.conteudo}
              onChange={(e) => setEmailForm({...emailForm, conteudo: e.target.value})}
              rows={8}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Imagem Anexa (opcional)</label>
              {imagemAnexo ? (
                <div className="bg-green-50 p-3 rounded-lg border border-green-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{imagemAnexo.filename}</p>
                      <p className="text-xs text-gray-600">Pronto para envio</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setImagemAnexo(null)}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  <Button disabled={uploadingImage} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>
              )}
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