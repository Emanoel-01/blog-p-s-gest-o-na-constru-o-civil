import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SPREADSHEET_ID = '1VdfOYBmHV8RnveUmpGPgWTGkTxJmQAi5lWDPpquIU30';
const SHEET_NAME = 'listagem';
const RANGE = 'listagem!A:M';

// Função auxiliar para normalizar nome do curso
function normalizarNomeCurso(nome) {
  return nome
    .replace(/^PÓS-GRADUAÇÃO - /i, '')
    .replace(/^MBA - /i, '')
    .replace(/^ESPECIALIZAÇÃO EM /i, '')
    .trim()
    .toUpperCase();
}

// Função auxiliar para normalizar nome de pessoa
function normalizarNomePessoa(nome) {
  return nome
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

// Lista de alunos G1 isentos de pagamento
const ALUNOS_ISENTOS_G1 = [
  "LAVINEA SILVA NASCIMENTO",
  "LUANA GABRIELLA DE ARAÚJO GOMES",
  "MATEUS HENRIQUE SANTOS DE SOUZA",
  "RAYANNE SILVEIRA DE ARAÚJO",
  "SÂMELLA VARELA DE SOUZA"
].map(normalizarNomePessoa);

// Lista completa de cursos G1 (Cursos Atuais)
const CURRENT_COURSES = [
  "PÓS-GRADUAÇÃO - ACÚSTICA ARQUITETÔNICA E ILUMINAÇÃO",
  "PÓS-GRADUAÇÃO - DESIGN DE INTERIORES CONTEMPORÂNEO",
  "PÓS-GRADUAÇÃO - ENGENHARIA E GESTÃO DE MANUTENÇÃO PREDIAL NA CONSTRUÇÃO 4.0",
  "PÓS-GRADUAÇÃO - GESTÃO DE PROJETOS E OBRAS",
  "PÓS-GRADUAÇÃO - NEUROARQUITETURA",
  "PÓS-GRADUAÇÃO - NEUROARQUITETURA (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - TECNOLOGIA BIM NA CONSTRUÇÃO CIVIL",
  "PÓS-GRADUAÇÃO - Engenharia Legal e Perícias: Avaliações e Desempenho"
].map(normalizarNomeCurso);

// Lista completa de cursos G2 (Cursos Legacy)
const LEGACY_COURSES = [
  "PÓS-GRADUAÇÃO - ACÚSTICA ARQUITETÔNICA E ILUMINAÇÃO",
  "PÓS-GRADUAÇÃO - ACÚSTICA ARQUITETÔNICA E ILUMINAÇÃO (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - DESIGN DE INTERIORES CONTEMPORÂNEO",
  "PÓS-GRADUAÇÃO - ENERGIA SOLAR FOTOVOLTAICA (CONECTADA)",
  "PÓS-GRADUAÇÃO - ENERGIA SOLAR FOTOVOLTAICA (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE COMBATE A INCÊNDIO E PÂNICO",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE COMBATE A INCÊNDIO E PÂNICO (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE IRRIGAÇÃO E DRENAGEM (CONECTADA)",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE IRRIGAÇÃO E DRENAGEM (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE PRODUÇÃO, GESTÃO DA QUALIDADE E EFICIÊNCIA OPERACIONAL (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE SEGURANÇA NO TRABALHO",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE SEGURANÇA NO TRABALHO (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - ENGENHARIA DE SOFTWARE, INTELIGÊNCIA ARTIFICIAL E IOT",
  "PÓS-GRADUAÇÃO - ENGENHARIA E GESTÃO DAS ENERGIAS RENOVÁVEIS",
  "PÓS-GRADUAÇÃO - ENGENHARIA E GESTÃO DE MANUTENÇÃO PREDIAL NA CONSTRUÇÃO 4.0",
  "PÓS-GRADUAÇÃO - GESTÃO DA ENGENHARIA DE PRODUÇÃO E OPERAÇÕES",
  "PÓS-GRADUAÇÃO - GESTÃO DA ENGENHARIA DE SEGURANÇA DO TRABALHO (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - GESTÃO DE PROJETOS E OBRAS",
  "PÓS-GRADUAÇÃO - GESTÃO DE PROJETOS E OBRAS: ORÇAMENTO E PERÍCIA (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - GESTÃO DE PROJETOS E OBRAS: ORÇAMENTO E PERÍCIA - UNIDADE CARUARU",
  "PÓS-GRADUAÇÃO - GESTÃO E TRATAMENTO DE RESÍDUOS SÓLIDOS E EFLUENTES (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - NEUROARQUITETURA",
  "PÓS-GRADUAÇÃO - NEUROARQUITETURA (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - PAISAGISMO",
  "PÓS-GRADUAÇÃO - PERÍCIAS TÉCNICAS APLICADAS ÀS ENGENHARIAS (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - PROJETOS DE ARQUITETURA E DESIGN: DA EDIFICAÇÃO AO INTERIOR",
  "PÓS-GRADUAÇÃO - PROJETOS DE ARQUITETURA E DESIGN: DA EDIFICAÇÃO AO INTERIOR (CONVENCIONAL)",
  "PÓS-GRADUAÇÃO - TECNOLOGIA BIM NA CONSTRUÇÃO CIVIL"
].map(normalizarNomeCurso);

function sanitizePhone(phone) {
  if (!phone) return '';
  
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  if (cleaned.length === 10) {
    cleaned = cleaned.slice(0, 2) + '9' + cleaned.slice(2);
  }
  
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  } catch (error) {
    return null;
  }
}

// Função de retry com backoff exponencial (case-insensitive no erro)
async function executeWithRetry(operation, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRateLimit = error.message?.toLowerCase().includes('rate limit');
      if (attempt === maxRetries || !isRateLimit) {
        throw error;
      }
      const waitTime = Math.pow(2, attempt) * 1000; // backoff: 2s, 4s, 8s, 16s
      console.warn(`Rate limit atingido. Tentativa ${attempt}/${maxRetries}. Aguardando ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!sheetsResponse.ok) {
      throw new Error(`Erro ao buscar dados: ${sheetsResponse.statusText}`);
    }
    
    const data = await sheetsResponse.json();
    const rows = data.values || [];
    
    if (rows.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'Nenhum dado encontrado na planilha',
        stats: { total: 0, g1: 0, g2: 0, skipped: 0 }
      });
    }

    const cutoffDate = new Date('2024-08-01');
    const stats = { total: 0, g1: 0, g2: 0, skipped: 0, updated: 0, created: 0, deleted_duplicates: 0, debug_samples: [] };
    

    
    const toCreate = [];
    const toUpdate = [];

    // Map para deduplicação: key = email + nome_curso
    const processedLeads = new Map();
    
    // Variável para lembrar a última data válida (células mescladas)
    let lastValidDate = null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const ano = parseInt(row[0]) || null;
      const mes = parseInt(row[1]) || null;
      const dia = parseInt(row[2]) || null;
      
      // Tratar células de data mescladas
      let dataInscricao = parseDate(row[3]);
      if (!dataInscricao && lastValidDate) {
        dataInscricao = lastValidDate;
      } else if (dataInscricao) {
        lastValidDate = dataInscricao;
      }
      
      let nomeCurso = (row[4] || '').trim();
      const nomeCompleto = (row[5] || '').trim();
      const tel03 = row[6] || '';
      const tel01 = row[7] || '';
      const tel02 = row[8] || '';
      const email = (row[9] || '').trim().toLowerCase();
      const vinculoCurso = row[10] || '';
      const inscricaoPaga = row[12] === 'SIM';

      // Debug: guardar amostra dos primeiros 5 registros
      if (stats.debug_samples.length < 5) {
        stats.debug_samples.push({
          row: i,
          nomeCurso,
          nomeCompleto,
          email,
          dataInscricao,
          validations: {
            hasNome: !!nomeCompleto,
            hasData: !!dataInscricao,
            hasEmail: !!email,
            hasCurso: !!nomeCurso
          }
        });
      }

      // Validações básicas
      if (!nomeCompleto || !dataInscricao || !email || !nomeCurso) {
        stats.skipped++;
        continue;
      }

      const inscricaoDate = new Date(dataInscricao);

      // Normalizar o nome do curso da planilha para comparação
      const nomeCursoNormalizado = normalizarNomeCurso(nomeCurso);
      const nomeCompletoNormalizado = normalizarNomePessoa(nomeCompleto);

      const isCurrent = CURRENT_COURSES.includes(nomeCursoNormalizado);
      const isLegacy = LEGACY_COURSES.includes(nomeCursoNormalizado);

      let grupoMonitoramento = null;

      // Lógica de categorização G1 vs G2:
      // - Se o curso está em CURRENT_COURSES E a data >= 01/08/2024 -> G1
      // - Se o curso está em LEGACY_COURSES E a data < 01/08/2024 -> G2
      // - Cursos podem estar em ambas listas, a data é o fator decisivo
      
      if (isCurrent && inscricaoDate >= cutoffDate) {
        grupoMonitoramento = 'G1_Cursos_Atuais';
      } else if (isLegacy && inscricaoDate < cutoffDate) {
        grupoMonitoramento = 'G2_Cursos_Legacy_Pos_Ago2024';
      } else if (!isCurrent && !isLegacy) {
        // Curso não está em nenhuma lista
        stats.skipped++;
        if (stats.debug_samples.length < 10) {
          stats.debug_samples.push({
            row: i,
            nomeCurso,
            email,
            reason: `Curso não está nas listas. isCurrent: ${isCurrent}, isLegacy: ${isLegacy}, data: ${dataInscricao}`
          });
        }
        continue;
      } else {
        // Curso está numa lista mas não atende critério de data
        stats.skipped++;
        if (stats.debug_samples.length < 10) {
          stats.debug_samples.push({
            row: i,
            nomeCurso,
            email,
            reason: `Curso na lista mas fora do período. isCurrent: ${isCurrent}, isLegacy: ${isLegacy}, data: ${dataInscricao}, cutoff: 2024-08-01`
          });
        }
        continue;
      }

      // Chave única: email + curso normalizado (para evitar duplicações por diferenças de case/espaços)
      const uniqueKey = `${email}|${nomeCursoNormalizado}`;

      // Deduplicação: pegar apenas a inscrição mais recente
      if (processedLeads.has(uniqueKey)) {
        const existing = processedLeads.get(uniqueKey);
        const existingDate = new Date(existing.data_inscricao);

        // Manter apenas a inscrição mais recente
        if (inscricaoDate > existingDate) {
          processedLeads.set(uniqueKey, {
            ano,
            mes,
            dia,
            data_inscricao: dataInscricao,
            nome_curso: nomeCurso,
            nome_completo: nomeCompleto,
            telefone_principal: tel03,
            telefone_sanitizado: sanitizePhone(tel03),
            telefone_secundario: tel01,
            telefone_terciario: tel02,
            email,
            vinculo_curso: vinculoCurso,
            inscricao_paga: inscricaoPaga,
            grupo_monitoramento: grupoMonitoramento,
            curso_e_legacy: isLegacy,
            ultima_sincronizacao: new Date().toISOString(),
            status_crm: 'Novo'
          });
        }
        continue;
      }

      // Verificar se é aluno isento G1 (marcar como pago)
      const isIsentoG1 = grupoMonitoramento === 'G1_Cursos_Atuais' && 
                         ALUNOS_ISENTOS_G1.includes(nomeCompletoNormalizado);
      const inscricaoPagaFinal = isIsentoG1 ? true : inscricaoPaga;

      // Adicionar ao map
      processedLeads.set(uniqueKey, {
        ano,
        mes,
        dia,
        data_inscricao: dataInscricao,
        nome_curso: nomeCurso,
        nome_completo: nomeCompleto,
        telefone_principal: tel03,
        telefone_sanitizado: sanitizePhone(tel03),
        telefone_secundario: tel01,
        telefone_terciario: tel02,
        email,
        vinculo_curso: vinculoCurso,
        inscricao_paga: inscricaoPagaFinal,
        grupo_monitoramento: grupoMonitoramento,
        curso_e_legacy: isLegacy,
        ultima_sincronizacao: new Date().toISOString(),
        status_crm: 'Novo'
      });
    }

    // Buscar TODOS os inscritos de uma vez (evita centenas de chamadas individuais por email)
    console.log('Buscando todos os inscritos existentes...');
    const cleanedExisting = await executeWithRetry(() =>
      base44.asServiceRole.entities.Inscrito.list('-created_date', 5000)
    );
    console.log(`Total de inscritos existentes: ${cleanedExisting.length}`);
    
    // Processar leads deduplicados
    for (const inscritoData of processedLeads.values()) {
      const existing = cleanedExisting.find(e => 
        e.email?.toLowerCase() === inscritoData.email.toLowerCase() && 
        normalizarNomeCurso(e.nome_curso || '') === normalizarNomeCurso(inscritoData.nome_curso)
      );

      if (existing) {
        // Preservar status de "Matriculado" se já foi definido manualmente
        const status_crm = (existing.status_crm === 'Matriculado Turma Antiga' || existing.status_crm === 'Matriculado Turma Nova')
          ? existing.status_crm
          : inscritoData.status_crm;

        const inscricao_paga = inscritoData.inscricao_paga || existing.inscricao_paga;

        toUpdate.push({ id: existing.id, ...inscritoData, status_crm, inscricao_paga });
        stats.updated++;
      } else {
        toCreate.push(inscritoData);
        stats.created++;
      }

      // Incrementar contadores de grupo
      if (inscritoData.grupo_monitoramento === 'G1_Cursos_Atuais') {
        stats.g1++;
      } else if (inscritoData.grupo_monitoramento === 'G2_Cursos_Legacy_Pos_Ago2024') {
        stats.g2++;
      }

      stats.total++;
    }
    
    // Criações em lotes com delay entre lotes para evitar rate limit
    const CREATE_BATCH_SIZE = 50;
    if (toCreate.length > 0) {
      console.log(`Criando ${toCreate.length} novos inscritos em lotes de ${CREATE_BATCH_SIZE}...`);
      for (let i = 0; i < toCreate.length; i += CREATE_BATCH_SIZE) {
        const batch = toCreate.slice(i, i + CREATE_BATCH_SIZE);
        await executeWithRetry(() =>
          base44.asServiceRole.entities.Inscrito.bulkCreate(batch)
        );
        if (i + CREATE_BATCH_SIZE < toCreate.length) {
          await sleep(1500); // pausa entre lotes de criação
        }
      }
    }

    // Updates individuais com delay entre cada chamada para evitar rate limit
    if (toUpdate.length > 0) {
      console.log(`Atualizando ${toUpdate.length} inscritos...`);
      for (let i = 0; i < toUpdate.length; i++) {
        const { id, ...data } = toUpdate[i];
        await executeWithRetry(() =>
          base44.asServiceRole.entities.Inscrito.update(id, data)
        );
        await sleep(300); // 300ms entre cada update para respeitar rate limit
        if (i > 0 && i % 50 === 0) {
          console.log(`Atualizados ${i}/${toUpdate.length}...`);
          await sleep(2000); // pausa maior a cada 50 updates
        }
      }
    }
    
    return Response.json({
      success: true,
      message: `Sincronização concluída: ${stats.created} criados, ${stats.updated} atualizados, ${stats.deleted_duplicates} duplicatas removidas, ${stats.skipped} ignorados`,
      stats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});