import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Valida se o inscrito (vindo da Google Sheets) tem inscrição paga
function validarInscricaoPaga(inscrito) {
  return inscrito.inscricao_paga === true;
}

// Determina os novos valores de matrícula com base nos dados do PDF
function calcularStatusMatricula(alunoPDF, inscrito) {
  const pagouMatricula = alunoPDF.PAGOU_MATRICULA?.toUpperCase() === 'SIM';
  const contratoAceito = alunoPDF.CONTRATO_ACEITO?.toUpperCase() === 'SIM';

  let novoStatus = inscrito.status_crm;
  if (contratoAceito && pagouMatricula) {
    novoStatus = 'Matriculado Turma Nova';
  } else if (contratoAceito && !pagouMatricula) {
    novoStatus = 'Aceito';
  }

  return { pagouMatricula, contratoAceito, novoStatus };
}

// Verifica se o inscrito já está atualizado com os dados do PDF
function jaEstaAtualizado(inscrito, pagouMatricula, contratoAceito, novoStatus) {
  return (
    inscrito.status_crm === novoStatus &&
    inscrito.pagou_matricula === pagouMatricula &&
    inscrito.contrato_aceito === contratoAceito
  );
}

// Atualiza o inscrito no banco com os dados de matrícula do PDF
async function atualizarMatriculaInscrito(base44, inscrito, alunoPDF, curso_grupo, pagouMatricula, contratoAceito, novoStatus) {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const novaObservacao = `[${dataHoje}] Status atualizado via PDF para: ${novoStatus}`;

  await base44.asServiceRole.entities.Inscrito.update(inscrito.id, {
    status_crm: novoStatus,
    pagou_matricula: pagouMatricula,
    contrato_aceito: contratoAceito,
    turma_matricula: alunoPDF.TURMA || curso_grupo,
    data_atualizacao_matricula: new Date().toISOString(),
    observacoes: inscrito.observacoes
      ? `${inscrito.observacoes}\n${novaObservacao}`
      : novaObservacao
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    const payload = await req.json();
    const { file_url, curso_grupo } = payload;

    if (!file_url || !curso_grupo) {
      return Response.json({ error: 'Parâmetros obrigatórios: file_url e curso_grupo' }, { status: 400 });
    }

    // Extrair dados do PDF
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            RA: { type: "string" },
            NOME: { type: "string" },
            EMAIL: { type: "string" },
            TELEFONE: { type: "string" },
            SITUACAO: { type: "string" },
            PAGOU_MATRICULA: { type: "string" },
            CONTRATO_ACEITO: { type: "string" },
            PARCELAS: { type: "string" },
            TIPO: { type: "string" }
          },
          required: ["NOME", "EMAIL"]
        }
      }
    });

    if (extractResult.status === 'error') {
      return Response.json({ error: 'Erro ao extrair dados do PDF: ' + extractResult.details }, { status: 400 });
    }

    const alunosPDF = extractResult.output || [];
    const inscritos = await base44.asServiceRole.entities.Inscrito.list();

    const resultado = {
      total_no_pdf: alunosPDF.length,
      processados: 0,
      atualizados_aceito: 0,
      atualizados_matriculado: 0,
      ja_estavam_atualizados: 0,
      nao_encontrados: 0,
      inscricao_nao_paga: 0,
      erros: []
    };

    for (const alunoPDF of alunosPDF) {
      try {
        resultado.processados++;

        const emailNormalizado = alunoPDF.EMAIL?.trim().toLowerCase();
        if (!emailNormalizado) {
          resultado.erros.push({ nome: alunoPDF.NOME, erro: 'Email não encontrado no PDF' });
          continue;
        }

        const inscrito = inscritos.find(i =>
          i.email?.toLowerCase() === emailNormalizado &&
          i.nome_curso?.toLowerCase().includes(curso_grupo.toLowerCase())
        );

        if (!inscrito) {
          resultado.nao_encontrados++;
          resultado.erros.push({ nome: alunoPDF.NOME, email: emailNormalizado, erro: `Não encontrado no sistema com curso ${curso_grupo}` });
          continue;
        }

        // Validação da inscrição paga via Google Sheets
        if (!validarInscricaoPaga(inscrito)) {
          resultado.inscricao_nao_paga++;
          resultado.erros.push({ nome: alunoPDF.NOME, email: emailNormalizado, erro: 'Inscrição não paga (verificar planilha Google Sheets)' });
          continue;
        }

        // Calcular novo status com base nos dados do PDF
        const { pagouMatricula, contratoAceito, novoStatus } = calcularStatusMatricula(alunoPDF, inscrito);

        if (jaEstaAtualizado(inscrito, pagouMatricula, contratoAceito, novoStatus)) {
          resultado.ja_estavam_atualizados++;
          continue;
        }

        // Atualizar matrícula
        await atualizarMatriculaInscrito(base44, inscrito, alunoPDF, curso_grupo, pagouMatricula, contratoAceito, novoStatus);

        if (novoStatus === 'Aceito') resultado.atualizados_aceito++;
        else if (novoStatus === 'Matriculado Turma Nova') resultado.atualizados_matriculado++;

      } catch (error) {
        resultado.erros.push({ nome: alunoPDF.NOME, email: alunoPDF.EMAIL, erro: error.message });
      }
    }

    return Response.json({ success: true, resultado });

  } catch (error) {
    console.error('Erro ao processar matrículas:', error);
    return Response.json({ error: 'Erro ao processar arquivo: ' + error.message }, { status: 500 });
  }
});