import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { processaMatriculasPDF } from '@/functions/processaMatriculasPDF';

export default function ProcessadorMatriculasPDF() {
  const [arquivo, setArquivo] = useState(null);
  const [cursoGrupo, setCursoGrupo] = useState('');
  const [dataReferencia, setDataReferencia] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const handleUploadPDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Por favor, envie apenas arquivos PDF');
      return;
    }

    setUploadingFile(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
      setArquivo(file);
      toast.success('Arquivo PDF enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar arquivo: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleProcessar = async () => {
    if (!fileUrl) {
      toast.error('Envie o arquivo PDF primeiro');
      return;
    }

    if (!cursoGrupo) {
      toast.error('Selecione o curso/grupo');
      return;
    }

    setProcessando(true);
    setResultado(null);

    try {
      const { data: response } = await processaMatriculasPDF({
        file_url: fileUrl,
        curso_grupo: cursoGrupo,
        data_referencia: dataReferencia
      });

      if (response.success) {
        setResultado(response.resultado);
        toast.success('Processamento concluído!');
      } else {
        toast.error('Erro no processamento: ' + (response.error || 'Erro desconhecido'));
      }
    } catch (error) {
      toast.error('Erro ao processar: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleReset = () => {
    setArquivo(null);
    setFileUrl('');
    setCursoGrupo('');
    setDataReferencia('');
    setResultado(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300">
        <CardHeader>
          <CardTitle className="text-xl text-teal-900 flex items-center gap-3">
            <FileText className="w-6 h-6" />
            Processar Matrículas via PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2">ℹ️ Como funciona</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal ml-4">
              <li>Faça o upload do PDF de relatório de matrículas da ESUDA</li>
              <li>Selecione o curso/grupo correspondente (ex: Engenharia Legal)</li>
              <li>O sistema extrairá os dados e atualizará automaticamente:</li>
            </ol>
            <div className="ml-8 mt-2 text-sm text-blue-700 space-y-1">
              <p>• <strong>Status "Aceito"</strong>: Contrato Aceito = SIM + Pagou Matrícula = NÃO</p>
              <p>• <strong>Status "Matriculado Turma Nova"</strong>: Contrato Aceito = SIM + Pagou Matrícula = SIM</p>
              <p className="text-xs mt-2 italic">* Apenas alunos com inscrição paga (Google Sheets) serão atualizados</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              1. Upload do Arquivo PDF
            </label>
            <div className="flex gap-3 items-center">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleUploadPDF}
                disabled={uploadingFile || processando}
                className="flex-1"
              />
              {arquivo && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-300">
                  <CheckCircle className="w-4 h-4" />
                  {arquivo.name}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              2. Selecione o Curso/Grupo
            </label>
            <Select
              value={cursoGrupo}
              onValueChange={setCursoGrupo}
              disabled={processando}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha o curso..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engenharia Legal">Engenharia Legal e Perícias</SelectItem>
                <SelectItem value="BIM">BIM - Building Information Modeling</SelectItem>
                <SelectItem value="GPO">Gestão de Projetos e Obras</SelectItem>
                <SelectItem value="Manutenção">Manutenção Predial 4.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              3. Data de Referência (Opcional)
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <Input
                type="date"
                value={dataReferencia}
                onChange={(e) => setDataReferencia(e.target.value)}
                disabled={processando}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para usar a data atual
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleProcessar}
              disabled={!fileUrl || !cursoGrupo || processando}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3"
            >
              {processando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Processar e Atualizar Inscritos
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={processando}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado do Processamento */}
      {resultado && (
        <Card className="bg-white border-2 border-gray-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Resultado do Processamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resumo Geral */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-700">{resultado.total_no_pdf}</p>
                <p className="text-xs text-gray-600">Total no PDF</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-700">{resultado.atualizados_matriculado}</p>
                <p className="text-xs text-gray-600">Matriculados</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <p className="text-2xl font-bold text-yellow-700">{resultado.atualizados_aceito}</p>
                <p className="text-xs text-gray-600">Aceitos</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-2xl font-bold text-gray-700">{resultado.ja_estavam_atualizados}</p>
                <p className="text-xs text-gray-600">Já Atualizados</p>
              </div>
            </div>

            {/* Alertas */}
            {resultado.nao_encontrados > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-semibold text-orange-800">
                    {resultado.nao_encontrados} aluno(s) não encontrado(s) no sistema
                  </p>
                </div>
              </div>
            )}

            {resultado.inscricao_nao_paga > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-800">
                    {resultado.inscricao_nao_paga} aluno(s) sem inscrição paga (verificar Google Sheets)
                  </p>
                </div>
              </div>
            )}

            {/* Lista de Erros Detalhada */}
            {resultado.erros.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Detalhes dos Erros e Avisos ({resultado.erros.length})
                </h4>
                <div className="bg-gray-50 rounded-lg border border-gray-300 max-h-80 overflow-y-auto">
                  {resultado.erros.map((erro, idx) => (
                    <div key={idx} className="p-3 border-b border-gray-200 last:border-b-0">
                      <p className="text-sm font-semibold text-gray-800">{erro.nome}</p>
                      {erro.email && (
                        <p className="text-xs text-gray-600">Email: {erro.email}</p>
                      )}
                      <p className="text-xs text-red-700 mt-1">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {erro.erro}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}