import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus, Upload } from 'lucide-react';
import ConvidarDiscente from './ConvidarDiscente';

export default function BulkEnrollStudents() {
  const [studentList, setStudentList] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedEspecializacoes, setSelectedEspecializacoes] = useState([]);
  const queryClient = useQueryClient();

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const bulkEnrollMutation = useMutation({
    mutationFn: async (students) => {
      const results = [];
      for (const student of students) {
        try {
          const result = await base44.entities.Discente.create(student);
          results.push({ success: true, data: result });
        } catch (error) {
          results.push({ success: false, error: error.message, student });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['discentes'] });
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      if (failCount === 0) {
        toast.success(`✅ ${successCount} aluno(s) cadastrado(s) com sucesso!`);
      } else {
        toast.warning(`⚠️ ${successCount} sucesso(s), ${failCount} erro(s). Verifique os dados.`);
      }
      setStudentList('');
      setSelectedTurma('');
      setSelectedEspecializacoes([]);
    },
    onError: () => {
      toast.error('Erro ao cadastrar alunos em massa.');
    }
  });

  const handleBulkEnroll = () => {
    if (!studentList.trim()) {
      toast.error('Por favor, insira a lista de alunos.');
      return;
    }
    if (!selectedTurma) {
      toast.error('Por favor, selecione a turma.');
      return;
    }
    if (selectedEspecializacoes.length === 0) {
      toast.error('Por favor, selecione pelo menos uma especialização.');
      return;
    }

    const lines = studentList.split('\n').filter(line => line.trim());
    const students = [];

    for (const line of lines) {
      const parts = line.split(';').map(p => p.trim());
      if (parts.length >= 2) {
        const nome = parts[0];
        const email = parts[1];
        if (nome && email) {
          students.push({
            nome,
            email,
            numero_turma: selectedTurma,
            especializacoes: selectedEspecializacoes,
            titulo: 'Aluno(a)',
            ordem: 0
          });
        }
      }
    }

    if (students.length === 0) {
      toast.error('Nenhum aluno válido encontrado. Verifique o formato: Nome ; email@dominio.com');
      return;
    }

    bulkEnrollMutation.mutate(students);
  };

  const toggleEspecializacao = (especId) => {
    setSelectedEspecializacoes(prev =>
      prev.includes(especId) ? prev.filter(id => id !== especId) : [...prev, especId]
    );
  };

  return (
    <div className="space-y-6">
      <ConvidarDiscente />
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <UserPlus className="w-6 h-6" />
            Cadastro em Massa de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lista de Alunos (um por linha no formato: Nome ; email@dominio.com)
            </label>
            <Textarea
              value={studentList}
              onChange={(e) => setStudentList(e.target.value)}
              placeholder={"Henrique Macedo dos Santos ; PG250862@esuda.edu.br\nMaria Silva Santos ; PG250863@esuda.edu.br"}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-gray-600 mt-1">
              Cada linha deve conter: <strong>Nome Completo ; Email</strong> (separados por ponto e vírgula)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Turma</label>
            <Input
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              placeholder="Ex: T01/2026"
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Especializações (selecione uma ou mais)
            </label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
              {especializacoes.map(espec => (
                <label key={espec.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedEspecializacoes.includes(espec.id)}
                    onChange={() => toggleEspecializacao(espec.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{espec.nome}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleBulkEnroll}
            disabled={bulkEnrollMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            {bulkEnrollMutation.isPending ? (
              <>Processando...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Cadastrar Alunos em Massa
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}