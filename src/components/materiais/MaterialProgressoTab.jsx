import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, BarChart2, Users, BookOpen } from 'lucide-react';

// Aba de progresso para ALUNO
function ProgressoAluno({ user, materiais }) {
  const { data: visualizacoes = [] } = useQuery({
    queryKey: ['visualizacoes-aluno', user?.email],
    queryFn: () => base44.entities.MaterialVisualizacao.filter({ aluno_email: user.email }),
    enabled: !!user?.email
  });

  const idsVisualizados = useMemo(() => new Set(visualizacoes.map(v => v.material_id)), [visualizacoes]);
  const total = materiais.length;
  const vistos = materiais.filter(m => idsVisualizados.has(m.id)).length;
  const pct = total > 0 ? Math.round((vistos / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Seu progresso</span>
            <span className="text-2xl font-extrabold text-emerald-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{vistos} de {total} materiais visualizados</p>
        </CardContent>
      </Card>

      {/* Lista de materiais */}
      <div className="space-y-2">
        {materiais.map(m => {
          const visto = idsVisualizados.has(m.id);
          return (
            <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border ${visto ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
              {visto
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.titulo}</p>
                <div className="flex gap-1 mt-0.5">
                  <Badge className="text-xs bg-gray-100 text-gray-600">{m.tipo}</Badge>
                  {m.turma && <Badge variant="outline" className="text-xs">{m.turma}</Badge>}
                </div>
              </div>
              <span className={`text-xs font-semibold ${visto ? 'text-emerald-600' : 'text-gray-400'}`}>
                {visto ? 'Visto' : 'Pendente'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Aba de engajamento para PROFESSOR/ADMIN
function EngajamentoAdmin({ materiais }) {
  const { data: visualizacoes = [] } = useQuery({
    queryKey: ['visualizacoes-todas'],
    queryFn: () => base44.entities.MaterialVisualizacao.list('-created_date', 500)
  });

  // Agrupa por material
  const porMaterial = useMemo(() => {
    const map = {};
    for (const v of visualizacoes) {
      if (!map[v.material_id]) map[v.material_id] = new Set();
      map[v.material_id].add(v.aluno_email);
    }
    return map;
  }, [visualizacoes]);

  // Agrupa por aluno
  const porAluno = useMemo(() => {
    const map = {};
    for (const v of visualizacoes) {
      if (!map[v.aluno_email]) map[v.aluno_email] = { nome: v.aluno_nome, turma: v.turma, count: 0 };
      map[v.aluno_email].count++;
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [visualizacoes]);

  // Agrupa por turma
  const porTurma = useMemo(() => {
    const map = {};
    for (const v of visualizacoes) {
      const t = v.turma || 'Sem turma';
      if (!map[t]) map[t] = new Set();
      map[t].add(v.aluno_email);
    }
    return Object.entries(map).sort((a, b) => b[1].size - a[1].size);
  }, [visualizacoes]);

  const totalAlunos = new Set(visualizacoes.map(v => v.aluno_email)).size;

  return (
    <div className="space-y-5">
      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 text-center">
            <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-700">{visualizacoes.length}</p>
            <p className="text-xs text-gray-600">Visualizações totais</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{totalAlunos}</p>
            <p className="text-xs text-gray-600">Alunos ativos</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-center">
            <BarChart2 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{materiais.length}</p>
            <p className="text-xs text-gray-600">Materiais</p>
          </CardContent>
        </Card>
      </div>

      {/* Engajamento por material */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" /> Engajamento por material
        </h3>
        <div className="space-y-2">
          {materiais.map(m => {
            const visualizadores = porMaterial[m.id]?.size || 0;
            const pct = totalAlunos > 0 ? Math.round((visualizadores / Math.max(totalAlunos, 1)) * 100) : 0;
            return (
              <div key={m.id} className="bg-white border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-800 truncate flex-1">{m.titulo}</p>
                  <span className="text-xs text-gray-500 ml-2">{visualizadores} aluno(s)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engajamento por turma */}
      {porTurma.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Alunos únicos por turma
          </h3>
          <div className="space-y-2">
            {porTurma.map(([turma, emails]) => (
              <div key={turma} className="flex items-center justify-between bg-white border rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">{turma}</span>
                <Badge className="bg-blue-100 text-blue-700">{emails.size} aluno(s)</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top alunos */}
      {porAluno.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" /> Alunos mais engajados
          </h3>
          <div className="space-y-2">
            {porAluno.slice(0, 10).map(([email, info]) => (
              <div key={email} className="flex items-center justify-between bg-white border rounded-lg p-3">
                <div>
                  <p className="text-xs font-medium text-gray-800">{info.nome || email}</p>
                  {info.turma && <p className="text-xs text-gray-400">{info.turma}</p>}
                </div>
                <Badge className="bg-purple-100 text-purple-700">{info.count} material(is)</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialProgressoTab({ user, materiais, isAdmin }) {
  return (
    <div className="space-y-4">
      {isAdmin ? (
        <EngajamentoAdmin materiais={materiais} />
      ) : (
        <ProgressoAluno user={user} materiais={materiais} />
      )}
    </div>
  );
}