import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DisciplinaFormFields({ disciplina, index, onChange, onRemove }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-blue-200 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            Nome da Disciplina {index + 1}
          </label>
          <Input
            value={disciplina.nome || ''}
            onChange={(e) => onChange(index, 'nome', e.target.value)}
            placeholder="Ex: Gestão de Escritórios de Arquitetura"
            className="font-semibold"
          />
        </div>
        <Button
          onClick={() => onRemove(index)}
          size="icon"
          variant="ghost"
          className="text-red-600 hover:text-red-800 mt-5"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Modalidade</label>
          <Select
            value={disciplina.modalidade || 'Presencial'}
            onValueChange={(v) => onChange(index, 'modalidade', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Presencial">Presencial</SelectItem>
              <SelectItem value="EAD">EAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Carga Horária (h)</label>
          <Input
            type="number"
            value={disciplina.carga_horaria || ''}
            onChange={(e) => onChange(index, 'carga_horaria', e.target.value)}
            placeholder="20"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Ementa Sintética (Comercial - 1 a 2 frases)
        </label>
        <Textarea
          value={disciplina.ementa_sintetica || ''}
          onChange={(e) => onChange(index, 'ementa_sintetica', e.target.value)}
          rows={2}
          placeholder="Ementa curta e atrativa para exibição pública..."
          className="text-sm"
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-semibold"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Ocultar' : 'Mostrar'} Campos Detalhados
      </button>

      {expanded && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Ementa Detalhada</label>
            <Textarea
              value={disciplina.ementa_detalhada || ''}
              onChange={(e) => onChange(index, 'ementa_detalhada', e.target.value)}
              rows={4}
              placeholder="Descrição técnica completa da disciplina..."
              className="text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Conhecimento Adquirido</label>
            <Textarea
              value={disciplina.conhecimento_adquirido || ''}
              onChange={(e) => onChange(index, 'conhecimento_adquirido', e.target.value)}
              rows={3}
              placeholder="Conhecimentos e conceitos que o aluno irá adquirir..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Habilidade Técnica (Entregável)</label>
            <Textarea
              value={disciplina.habilidade_tecnica || ''}
              onChange={(e) => onChange(index, 'habilidade_tecnica', e.target.value)}
              rows={2}
              placeholder="Ex: Elaboração de um plano de negócios simplificado..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Habilidade Comportamental</label>
            <Input
              value={disciplina.habilidade_comportamental || ''}
              onChange={(e) => onChange(index, 'habilidade_comportamental', e.target.value)}
              placeholder="Ex: Visão estratégica, Raciocínio crítico"
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}