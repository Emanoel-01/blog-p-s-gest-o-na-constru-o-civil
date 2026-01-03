import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SPREADSHEET_ID = '1VdfOYBmHV8RnveUmpGPgWTGkTxJmQAi5lWDPpquIU30';
const SHEET_NAME = 'listagem';
const RANGE = 'listagem!A:M';

const CURRENT_COURSES = [
  "Tecnologia BIM na Construção Civil",
  "Neuroarquitetura",
  "Gestão de Projetos e Obras",
  "Engenharia e Gestão de Manutenção Predial na Construção 4.0",
  "Acústica Arquitetônica e Iluminação",
  "Design de Interiores Contemporâneo",
  "Engenharia Legal e Perícias: Avaliações e Desempenho"
];

const LEGACY_COURSES = [
  "Acústica Arquitetônica e Iluminação",
  "Design de Interiores Contemporâneo",
  "Energia Solar Fotovoltaica",
  "Engenharia de Combate a Incêndio e Pânico",
  "Engenharia de Irrigação e Drenagem",
  "Engenharia de Produção, Gestão da Qualidade e Eficiência Operacional",
  "Engenharia de Segurança no Trabalho",
  "Gestão da Engenharia de Segurança do Trabalho",
  "Engenharia e Gestão das Energias Renováveis",
  "Engenharia e Gestão de Manutenção Predial na Construção 4.0",
  "Gestão da Engenharia de Produção e Operações",
  "Gestão de Projetos e Obras",
  "Gestão de Projetos e Obras: Orçamento e Perícia",
  "Gestão e Tratamento de Resíduos Sólidos e Efluentes",
  "MBA em Gestão da Mobilidade Urbana",
  "Neuroarquitetura",
  "Paisagismo",
  "Perícias Técnicas Aplicadas às Engenharias",
  "Projetos de Arquitetura e Design: Da Edificação ao Interior",
  "Tecnologia BIM na Construção Civil"
];

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado. Apenas admins podem executar.' }, { status: 403 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
    
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
    const stats = { total: 0, g1: 0, g2: 0, skipped: 0, updated: 0, created: 0, debug_samples: [] };

    const allExisting = await base44.asServiceRole.entities.Inscrito.list();
    const toCreate = [];
    const toUpdate = [];

    // Map para deduplicação: key = email + nome_curso
    const processedLeads = new Map();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const ano = parseInt(row[0]) || null;
      const mes = parseInt(row[1]) || null;
      const dia = parseInt(row[2]) || null;
      const dataInscricao = parseDate(row[3]);
      const nomeCurso = (row[4] || '').trim();
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

      const isCurrent = CURRENT_COURSES.includes(nomeCurso);
      const isLegacy = LEGACY_COURSES.includes(nomeCurso);

      let grupoMonitoramento = null;

      // G1: Cursos Atuais com data >= 01/08/2024
      if (inscricaoDate >= cutoffDate && isCurrent) {
        grupoMonitoramento = 'G1_Cursos_Atuais';
      } 
      // G2: Cursos Legados independente da data (post Aug 2024 legacy courses)
      else if (isLegacy) {
        grupoMonitoramento = 'G2_Cursos_Legacy_Pos_Ago2024';
      }
      // Ignorar cursos que não se encaixam em G1 ou G2
      else {
        stats.skipped++;
        // Debug: guardar amostra de cursos ignorados
        if (stats.debug_samples.length < 10) {
          stats.debug_samples.push({
            row: i,
            nomeCurso,
            email,
            reason: `Curso não está nas listas. isCurrent: ${isCurrent}, isLegacy: ${isLegacy}, data: ${dataInscricao}`
          });
        }
        continue;
      }

      // Chave única: email + curso
      const uniqueKey = `${email}|${nomeCurso}`;

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
        inscricao_paga: inscricaoPaga,
        grupo_monitoramento: grupoMonitoramento,
        curso_e_legacy: isLegacy,
        ultima_sincronizacao: new Date().toISOString(),
        status_crm: 'Novo'
      });
    }

    // Processar leads deduplicados
    for (const inscritoData of processedLeads.values()) {
      const existing = allExisting.find(e => 
        e.email?.toLowerCase() === inscritoData.email.toLowerCase() && 
        e.nome_curso === inscritoData.nome_curso
      );

      if (existing) {
        // Preservar status de "Matriculado" se já foi definido manualmente
        const status_crm = (existing.status_crm === 'Matriculado Turma Antiga' || existing.status_crm === 'Matriculado Turma Nova')
          ? existing.status_crm
          : inscritoData.status_crm;

        toUpdate.push({ id: existing.id, ...inscritoData, status_crm });
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
    
    if (toCreate.length > 0) {
      await base44.asServiceRole.entities.Inscrito.bulkCreate(toCreate);
    }
    
    for (const item of toUpdate) {
      const { id, ...data } = item;
      await base44.asServiceRole.entities.Inscrito.update(id, data);
    }
    
    return Response.json({
      success: true,
      message: `Sincronização concluída: ${stats.created} criados, ${stats.updated} atualizados, ${stats.skipped} ignorados`,
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