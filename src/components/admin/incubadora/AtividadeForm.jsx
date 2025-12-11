import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function AtividadeForm({ tipo, projetos, onSuccess }) {
  const [formData, setFormData] = useState({
    projeto_id: '',
    comprovacao_urls: []
  });
  const [uploading, setUploading] = useState(false);

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('nome')
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      setFormData({ ...formData, comprovacao_urls: [...formData.comprovacao_urls, ...urls] });
      toast.success(`${files.length} arquivo(s) enviado(s)`);
    } catch (error) {
      toast.error('Erro ao enviar arquivos');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newUrls = formData.comprovacao_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, comprovacao_urls: newUrls });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await base44.entities[tipo].create(formData);
      toast.success('Atividade registrada com sucesso!');
      setFormData({ projeto_id: '', comprovacao_urls: [] });
      onSuccess();
    } catch (error) {
      toast.error('Erro ao registrar atividade');
    }
  };

  const renderFields = () => {
    switch (tipo) {
      case 'Evento':
        return (
          <>
            <Input placeholder="Nome do Evento" value={formData.nome_evento || ''} 
              onChange={(e) => setFormData({ ...formData, nome_evento: e.target.value })} required />
            <Select value={formData.aluno_id || ''} onValueChange={(value) => setFormData({ ...formData, aluno_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Aluno Responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {discentes.map((discente) => (
                  <SelectItem key={discente.id} value={discente.id}>{discente.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={formData.valor || ''} 
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} required />
            <Input type="date" value={formData.data || ''} 
              onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            <Textarea placeholder="Resumo" value={formData.resumo || ''} 
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })} />
            <Textarea placeholder="Descrição Completa" value={formData.descricao_completa || ''} 
              onChange={(e) => setFormData({ ...formData, descricao_completa: e.target.value })} rows={4} />
          </>
        );
      case 'ArtigoCientifico':
        return (
          <>
            <Input placeholder="Título do Artigo" value={formData.titulo_artigo || ''} 
              onChange={(e) => setFormData({ ...formData, titulo_artigo: e.target.value })} required />
            <Input placeholder="Autores" value={formData.autores || ''} 
              onChange={(e) => setFormData({ ...formData, autores: e.target.value })} />
            <Select value={formData.aluno_id || ''} onValueChange={(value) => setFormData({ ...formData, aluno_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Aluno Responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {discentes.map((discente) => (
                  <SelectItem key={discente.id} value={discente.id}>{discente.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={formData.valor || ''} 
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} required />
            <Input type="date" value={formData.data_publicacao || ''} 
              onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })} required />
            <Input placeholder="Revista/Conferência" value={formData.revista_conferencia || ''} 
              onChange={(e) => setFormData({ ...formData, revista_conferencia: e.target.value })} />
            <Textarea placeholder="Resumo" value={formData.resumo || ''} 
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })} />
          </>
        );
      case 'CanteiroDidatico':
        return (
          <>
            <Input placeholder="Nome do Canteiro" value={formData.nome_canteiro || ''} 
              onChange={(e) => setFormData({ ...formData, nome_canteiro: e.target.value })} required />
            <Select value={formData.aluno_id || ''} onValueChange={(value) => setFormData({ ...formData, aluno_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Aluno Responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {discentes.map((discente) => (
                  <SelectItem key={discente.id} value={discente.id}>{discente.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={formData.valor || ''} 
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} required />
            <Input type="date" value={formData.data || ''} 
              onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            <Input placeholder="Local" value={formData.local || ''} 
              onChange={(e) => setFormData({ ...formData, local: e.target.value })} />
            <Textarea placeholder="Resumo" value={formData.resumo || ''} 
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })} />
            <Textarea placeholder="Descrição Completa" value={formData.descricao_completa || ''} 
              onChange={(e) => setFormData({ ...formData, descricao_completa: e.target.value })} rows={4} />
          </>
        );
      case 'FreelancerNetwork':
        return (
          <>
            <Input placeholder="Nome da Atividade / Cargo" value={formData.nome_atividade || ''} 
              onChange={(e) => setFormData({ ...formData, nome_atividade: e.target.value })} required />
            <Select value={formData.tipo || 'Freelancer'} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Vínculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Empregado">Empregado</SelectItem>
                <SelectItem value="Contratado">Contratado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.aluno_id || ''} onValueChange={(value) => setFormData({ ...formData, aluno_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Aluno Responsável" />
              </SelectTrigger>
              <SelectContent>
                {discentes.map((discente) => (
                  <SelectItem key={discente.id} value={discente.id}>{discente.nome} - {discente.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Empresa Parceira" value={formData.empresa_parceira || ''} 
              onChange={(e) => setFormData({ ...formData, empresa_parceira: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={formData.valor || ''} 
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} required />
            <Input type="date" value={formData.data || ''} 
              onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            <Textarea placeholder="Resumo" value={formData.resumo || ''} 
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })} />
            <Textarea placeholder="Descrição Completa" value={formData.descricao_completa || ''} 
              onChange={(e) => setFormData({ ...formData, descricao_completa: e.target.value })} rows={4} />
          </>
        );
      case 'RelatorioTecnico':
        return (
          <>
            <Input placeholder="Título do Relatório" value={formData.titulo_relatorio || ''} 
              onChange={(e) => setFormData({ ...formData, titulo_relatorio: e.target.value })} required />
            <Input placeholder="Autor" value={formData.autor || ''} 
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })} />
            <Select value={formData.aluno_id || ''} onValueChange={(value) => setFormData({ ...formData, aluno_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Aluno Responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {discentes.map((discente) => (
                  <SelectItem key={discente.id} value={discente.id}>{discente.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={formData.valor || ''} 
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} required />
            <Input type="date" value={formData.data || ''} 
              onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            <Textarea placeholder="Resumo" value={formData.resumo || ''} 
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })} />
            <Textarea placeholder="Descrição Completa" value={formData.descricao_completa || ''} 
              onChange={(e) => setFormData({ ...formData, descricao_completa: e.target.value })} rows={4} />
          </>
        );
      case 'ProducaoTecnologica':
        return (
          <>
            <Input placeholder="Título da Produção" value={formData.titulo_producao || ''} 
              onChange={(e) => setFormData({ ...formData, titulo_producao: e.target.value })} required />
            <Select value={formData.tipo || ''} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Produção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Protótipo">Protótipo</SelectItem>
                <SelectItem value="Modelo BIM">Modelo BIM</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.aluno_id || ''} onValueChange={(value) => setFormData({ ...formData, aluno_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Aluno Responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {discentes.map((discente) => (
                  <SelectItem key={discente.id} value={discente.id}>{discente.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={formData.valor || ''} 
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} required />
            <Input type="date" value={formData.data || ''} 
              onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            <Textarea placeholder="Resumo" value={formData.resumo || ''} 
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })} />
            <Textarea placeholder="Descrição Completa" value={formData.descricao_completa || ''} 
              onChange={(e) => setFormData({ ...formData, descricao_completa: e.target.value })} rows={4} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={formData.projeto_id} onValueChange={(value) => setFormData({ ...formData, projeto_id: value })} required>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o Projeto" />
        </SelectTrigger>
        <SelectContent>
          {projetos.map((proj) => (
            <SelectItem key={proj.id} value={proj.id}>{proj.nome_projeto}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderFields()}

      <div>
        <label className="block text-sm font-medium mb-2">Comprovações (Fotos, Vídeos, PDFs)</label>
        <Input type="file" multiple accept="image/*,video/*,.pdf" onChange={handleFileUpload} disabled={uploading} />
        {uploading && <p className="text-sm text-gray-500 mt-1">Enviando arquivos...</p>}
        
        {formData.comprovacao_urls.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.comprovacao_urls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
                <span className="flex-1 truncate">{url.split('/').pop()}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(idx)}>✕</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
        Registrar {tipo}
      </Button>
    </form>
  );
}