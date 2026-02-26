import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    const payload = await req.json();
    const { file_url, curso_grupo, data_referencia } = payload;

    if (!file_url || !curso_grupo) {
      return Response.json({ 
        error: 'Parâmetros obrigatórios: file_url e curso_grupo' 
      }, { status: 400 });
    }

    // Schema para extração de dados do PDF
    const pdfSchema = {
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
    };

    // Extrair dados do PDF
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: file_url,
      json_schema: pdfSchema
    });

    if (extractResult.status === 'error') {
      return Response.json({ 
        error: 'Erro ao extrair dados do PDF: ' + extractResult.details 
      }, { status: 400 });
    }

    const alunosPDF = extractResult.output || [];

    // Buscar inscritos da Google Sheet
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

    // Processar cada aluno do PDF
    for (const alunoPDF of alunosPDF) {
      try {
        resultado.processados++;

        // Normalizar email
        const emailNormalizado = alunoPDF.EMAIL?.trim().toLowerCase();
        if (!emailNormalizado) {
          resultado.erros.push({
            nome: alunoPDF.NOME,
            erro: 'Email não encontrado no PDF'
          });
          continue;
        }

        // Buscar inscrito no banco de dados
        const inscrito = inscritos.find(i => 
          i.email?.toLowerCase() === emailNormalizado &&
          i.nome_curso?.toLowerCase().includes(curso_grupo.toLowerCase())
        );

        if (!inscrito) {
          resultado.nao_encontrados++;
          resultado.erros.push({
            nome: alunoPDF.NOME,
            email: emailNormalizado,
            erro: `Não encontrado no sistema com curso ${curso_grupo}`
          });
          continue;
        }

        // Verificar se tem inscrição paga
        if (!inscrito.inscricao_paga) {
          resultado.inscricao_nao_paga++;
          resultado.erros.push({
            nome: alunoPDF.NOME,
            email: emailNormalizado,
            erro: 'Inscrição não paga (verificar planilha Google Sheets)'
          });
          continue;
        }

        // Verificar status de matrícula e contrato do PDF
        const pagouMatricula = alunoPDF.PAGOU_MATRICULA?.toUpperCase() === 'SIM';
        const contratoAceito = alunoPDF.CONTRATO_ACEITO?.toUpperCase() === 'SIM';

        // Determinar novo status
        let novoStatus = inscrito.status_crm;
        
        if (contratoAceito && pagouMatricula) {
          novoStatus = 'Matriculado Turma Nova';
        } else if (contratoAceito && !pagouMatricula) {
          novoStatus = 'Aceito';
        }

        // Verificar se já está com o status correto
        if (inscrito.status_crm === novoStatus && 
            inscrito.pagou_matricula === pagouMatricula && 
            inscrito.contrato_aceito === contratoAceito) {
          resultado.ja_estavam_atualizados++;
          continue;
        }

        // Atualizar inscrito
        await base44.asServiceRole.entities.Inscrito.update(inscrito.id, {
          status_crm: novoStatus,
          pagou_matricula: pagouMatricula,
          contrato_aceito: contratoAceito,
          turma_matricula: alunoPDF.TURMA || curso_grupo,
          data_atualizacao_matricula: new Date().toISOString(),
          observacoes: inscrito.observacoes 
            ? `${inscrito.observacoes}\n[${new Date().toLocaleDateString('pt-BR')}] Status atualizado via PDF para: ${novoStatus}`
            : `[${new Date().toLocaleDateString('pt-BR')}] Status atualizado via PDF para: ${novoStatus}`
        });

        if (novoStatus === 'Aceito') {
          resultado.atualizados_aceito++;
        } else if (novoStatus === 'Matriculado Turma Nova') {
          resultado.atualizados_matriculado++;
        }

      } catch (error) {
        resultado.erros.push({
          nome: alunoPDF.NOME,
          email: alunoPDF.EMAIL,
          erro: error.message
        });
      }
    }

    return Response.json({
      success: true,
      resultado: resultado
    });

  } catch (error) {
    console.error('Erro ao processar matrículas:', error);
    return Response.json({ 
      error: 'Erro ao processar arquivo: ' + error.message 
    }, { status: 500 });
  }
});