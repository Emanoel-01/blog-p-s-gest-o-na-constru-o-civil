import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Upload } from 'lucide-react';

export default function DiscenteForm({
  discenteForm, setDiscenteForm, editingDiscente,
  onSave, onCancel, uploadingFotoDiscente, onUploadFoto,
  especializacoes, parceiros,
  handleDiscenteEspecCheckboxChange, handleDiscenteParceiroCheckboxChange
}) {
  return (
    <Card className="mb-6 bg-teal-50 border-teal-200">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingDiscente ? 'Editar Aluno' : 'Novo Aluno'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
            <Input value={discenteForm.nome} onChange={(e) => setDiscenteForm({...discenteForm, nome: e.target.value})} placeholder="Ex: Maria Silva" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email (para login)</label>
            <Input type="email" value={discenteForm.email} onChange={(e) => setDiscenteForm({...discenteForm, email: e.target.value})} placeholder="Ex: maria@esuda.edu.br" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">WhatsApp</label>
            <Input value={discenteForm.whatsapp} onChange={(e) => setDiscenteForm({...discenteForm, whatsapp: e.target.value})} placeholder="Ex: 5581999999999" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Número da Turma</label>
            <Input value={discenteForm.numero_turma} onChange={(e) => setDiscenteForm({...discenteForm, numero_turma: e.target.value})} placeholder="Ex: T01/2026" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Formação/Título</label>
            <Input value={discenteForm.titulo} onChange={(e) => setDiscenteForm({...discenteForm, titulo: e.target.value})} placeholder="Ex: Arquiteta" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Cargo Atual</label>
            <Input value={discenteForm.cargo_atual} onChange={(e) => setDiscenteForm({...discenteForm, cargo_atual: e.target.value})} placeholder="Ex: Coordenadora BIM" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Empresa Atual</label>
          <Input value={discenteForm.empresa} onChange={(e) => setDiscenteForm({...discenteForm, empresa: e.target.value})} placeholder="Ex: Construtora XYZ" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status de Carreira</label>
          <Select value={discenteForm.status_carreira} onValueChange={(v) => setDiscenteForm({...discenteForm, status_carreira: v})}>
            <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Nenhum</SelectItem>
              <SelectItem value="Open to Work">🟢 Open to Work</SelectItem>
              <SelectItem value="Contratado">🔵 Contratado</SelectItem>
              <SelectItem value="Freelancer">🟣 Freelancer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Sobre (Bio Profissional)</label>
          <Textarea value={discenteForm.sobre} onChange={(e) => setDiscenteForm({...discenteForm, sobre: e.target.value})} rows={3} placeholder="Resumo profissional do aluno..." />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Competências/Skills (separadas por vírgula)</label>
          <Input
            value={discenteForm.tags_competencia.join(', ')}
            onChange={(e) => setDiscenteForm({...discenteForm, tags_competencia: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
            placeholder="Ex: BIM, Revit, MS Project"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Foto do Aluno</label>
          {discenteForm.foto_url && (
            <div className="mb-2"><img src={discenteForm.foto_url} alt="Foto" loading="lazy" className="w-32 h-32 object-cover rounded-lg border" /></div>
          )}
          <div className="flex gap-2">
            <Input type="file" accept="image/*" onChange={onUploadFoto} disabled={uploadingFotoDiscente} className="flex-1" />
            <Button disabled={uploadingFotoDiscente} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              {uploadingFotoDiscente ? 'Enviando...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Instagram</label>
            <Input value={discenteForm.instagram} onChange={(e) => setDiscenteForm({...discenteForm, instagram: e.target.value})} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">LinkedIn</label>
            <Input value={discenteForm.linkedin} onChange={(e) => setDiscenteForm({...discenteForm, linkedin: e.target.value})} placeholder="https://linkedin.com/..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Lattes</label>
            <Input value={discenteForm.lattes} onChange={(e) => setDiscenteForm({...discenteForm, lattes: e.target.value})} placeholder="http://lattes.cnpq.br/..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Site/Portfólio</label>
            <Input value={discenteForm.site} onChange={(e) => setDiscenteForm({...discenteForm, site: e.target.value})} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Especializações Cursadas</label>
          <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
            {especializacoes.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhuma especialização cadastrada.</p>
            ) : (
              especializacoes.map((espec) => (
                <label key={espec.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={discenteForm.especializacoes.includes(espec.id)} onChange={() => handleDiscenteEspecCheckboxChange(espec.id)} />
                  <span className="text-sm">{espec.nome}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Parceiros Vinculados</label>
          <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
            {parceiros.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum parceiro cadastrado.</p>
            ) : (
              parceiros.map((parceiro) => (
                <label key={parceiro.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={discenteForm.parceiros.includes(parceiro.id)} onChange={() => handleDiscenteParceiroCheckboxChange(parceiro.id)} />
                  <span className="text-sm">{parceiro.nome}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
          <Input type="number" value={discenteForm.ordem} onChange={(e) => setDiscenteForm({...discenteForm, ordem: e.target.value})} placeholder="0" />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave} className="bg-teal-600 hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />Salvar
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4 mr-2" />Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}