import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProjetoForm({ formData, setFormData, onSubmit, especializacoes, isEditing }) {
  const handleEspecChange = (index, value) => {
    const newEspecs = [...(formData.especializacoes || [])];
    newEspecs[index] = value;
    setFormData({ ...formData, especializacoes: newEspecs });
  };

  const addEspec = () => {
    setFormData({ ...formData, especializacoes: [...(formData.especializacoes || []), ''] });
  };

  const removeEspec = (index) => {
    const newEspecs = formData.especializacoes.filter((_, i) => i !== index);
    setFormData({ ...formData, especializacoes: newEspecs });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Nome do Projeto</label>
        <Input
          value={formData.nome_projeto || ''}
          onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ano do Projeto</label>
        <Input
          type="number"
          value={formData.ano_projeto || ''}
          onChange={(e) => setFormData({ ...formData, ano_projeto: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Data de Início</label>
          <Input
            type="date"
            value={formData.data_inicio || ''}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Data de Fim</label>
          <Input
            type="date"
            value={formData.data_fim || ''}
            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Número de Alunos</label>
          <Input
            type="number"
            value={formData.numero_alunos || ''}
            onChange={(e) => setFormData({ ...formData, numero_alunos: parseInt(e.target.value) })}
            placeholder="Ex: 30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Valor do Curso por Aluno (R$)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_curso || ''}
            onChange={(e) => setFormData({ ...formData, valor_curso: parseFloat(e.target.value) })}
            placeholder="Ex: 2490.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Coordenador</label>
        <Input
          value={formData.coordenador || ''}
          onChange={(e) => setFormData({ ...formData, coordenador: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Objetivo Geral</label>
        <Textarea
          value={formData.objetivo_geral || ''}
          onChange={(e) => setFormData({ ...formData, objetivo_geral: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Justificativa</label>
        <Textarea
          value={formData.justificativa || ''}
          onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Especializações Relacionadas</label>
        {(formData.especializacoes || []).map((espec, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Select value={espec} onValueChange={(value) => handleEspecChange(idx, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a especialização" />
              </SelectTrigger>
              <SelectContent>
                {especializacoes.map((esp) => (
                  <SelectItem key={esp.id} value={esp.id}>{esp.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="destructive" size="icon" onClick={() => removeEspec(idx)}>
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addEspec} className="mt-2">
          + Adicionar Especialização
        </Button>
      </div>

      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
        {isEditing ? 'Atualizar Projeto' : 'Criar Projeto'}
      </Button>
    </form>
  );
}