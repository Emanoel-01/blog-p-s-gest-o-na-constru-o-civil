import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Download, Send, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BulkActions({ inscritos, currentUser }) {
  const [filtros, setFiltros] = useState({
    grupo_monitoramento: '',
    status_crm: '',
    inscricao_paga: ''
  });
  const [emailForm, setEmailForm] = useState({
    assunto: '',
    conteudo: ''
  });
  const [sending, setSending] = useState(false);

  const inscritosFiltrados = inscritos.filter(inscrito => {
    const matchesGrupo = !filtros.grupo_monitoramento || inscrito.grupo_monitoramento === filtros.grupo_monitoramento;
    const matchesStatus = !filtros.status_crm || inscrito.status_crm === filtros.status_crm;
    const matchesPago = filtros.inscricao_paga === '' || inscrito.inscricao_paga === (filtros.inscricao_paga === 'true');
    
    return matchesGrupo && matchesStatus && matchesPago;
  });

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

      const { data } = await base44.functions.invoke('sendBulkEmail', {
        destinatarios,
        assunto: emailForm.assunto,
        conteudo_html: emailForm.conteudo.replace(/\n/g, '<br>')
      });

      if (data.success) {
        // Registrar no log de atividades
        try {
          await base44.entities.CRMActivityLog.create({
            user_email: currentUser?.email,
            user_name: currentUser?.full_name,
            action_type: 'email_em_massa',
            details: {
              destinatarios: `${data.stats.enviados} lead(s)`,
              assunto: emailForm.assunto
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
      } else {
        toast.error('Erro no envio');
      }
    } catch (error) {
      toast.error('Erro: ' + error.message);
    } finally {
      setSending(false);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  <SelectItem value="Matriculado">Matriculado</SelectItem>
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
              rows={6}
            />
            <Button
              onClick={handleEnviarEmails}
              disabled={sending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
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
        </CardContent>
      </Card>
    </div>
  );
}