import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, UserPlus, GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { inviteAndEnrollDiscente } from '@/functions/inviteAndEnrollDiscente';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ConvidarDiscente() {
  const [email, setEmail] = useState('');
  const [numeroTurma, setNumeroTurma] = useState('');
  const [especializacoesSelecionadas, setEspecializacoesSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const handleEspecChange = (id) => {
    setEspecializacoesSelecionadas(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleConvidar = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Informe um email válido.');
      return;
    }
    if (!numeroTurma) {
      toast.error('Informe o número da turma.');
      return;
    }

    setLoading(true);
    setResultado(null);

    const res = await inviteAndEnrollDiscente({
      email: email.trim().toLowerCase(),
      numero_turma: numeroTurma.trim(),
      especializacoes: especializacoesSelecionadas
    });

    setLoading(false);

    if (res.data?.success) {
      setResultado(res.data);
      toast.success(res.data.message);
      if (res.data.action === 'created') {
        setEmail('');
        setNumeroTurma('');
        setEspecializacoesSelecionadas([]);
      }
    } else {
      toast.error(res.data?.error || 'Erro ao processar convite.');
    }
  };

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <UserPlus className="w-5 h-5" />
          Convidar Aluno por Email Institucional
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          O aluno receberá um convite por email e já será associado à turma selecionada. Ao fazer login, poderá completar seu perfil.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-3.5 h-3.5 inline mr-1" />
              Email Institucional *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aluno@esuda.edu.br"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
              Número da Turma *
            </label>
            <Input
              value={numeroTurma}
              onChange={(e) => setNumeroTurma(e.target.value)}
              placeholder="Ex: T01/2026"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especializações (opcional)
          </label>
          <div className="bg-white rounded-md border p-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {especializacoes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhuma especialização cadastrada.</p>
            ) : (
              especializacoes.map(espec => (
                <button
                  key={espec.id}
                  onClick={() => handleEspecChange(espec.id)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    especializacoesSelecionadas.includes(espec.id)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                  }`}
                >
                  {espec.nome}
                </button>
              ))
            )}
          </div>
          {especializacoesSelecionadas.length > 0 && (
            <p className="text-xs text-green-700 mt-1">
              {especializacoesSelecionadas.length} especialização(ões) selecionada(s)
            </p>
          )}
        </div>

        <Button
          onClick={handleConvidar}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Enviar Convite e Matricular na Turma
            </>
          )}
        </Button>

        {resultado && (
          <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
            resultado.action === 'created'
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-blue-50 border-blue-400 text-blue-800'
          }`}>
            {resultado.action === 'created'
              ? <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            }
            <div>
              <p className="font-semibold text-sm">
                {resultado.action === 'created' ? 'Convite enviado!' : 'Aluno atualizado'}
              </p>
              <p className="text-sm mt-0.5">{resultado.message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}