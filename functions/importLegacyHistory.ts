import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SPREADSHEET_ID = '1VdfOYBmHV8RnveUmpGPgWTGkTxJmQAi5lWDPpquIU30';
const RANGE = 'listagem!A:M';

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
        stats: { total: 0, imported: 0, skipped: 0 }
      });
    }

    const cutoffDate = new Date('2024-08-01');
    const stats = { total: 0, imported: 0, skipped: 0 };
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      const ano = parseInt(row[0]) || null;
      const mes = parseInt(row[1]) || null;
      const dia = parseInt(row[2]) || null;
      const dataInscricao = parseDate(row[3]);
      const nomeCurso = row[4] || '';
      const nomeCompleto = row[5] || '';
      const tel03 = row[6] || '';
      const tel01 = row[7] || '';
      const tel02 = row[8] || '';
      const email = row[9] || '';
      const vinculoCurso = row[10] || '';
      const inscricaoPaga = row[12] === 'SIM';
      
      if (!nomeCompleto || !dataInscricao) {
        stats.skipped++;
        continue;
      }
      
      const inscricaoDate = new Date(dataInscricao);
      if (inscricaoDate >= cutoffDate) {
        stats.skipped++;
        continue;
      }
      
      const isLegacy = LEGACY_COURSES.includes(nomeCurso);
      const telefoneOriginal = tel03;
      const telefoneSanitizado = sanitizePhone(tel03);
      
      const inscritoData = {
        ano,
        mes,
        dia,
        data_inscricao: dataInscricao,
        nome_curso: nomeCurso,
        nome_completo: nomeCompleto,
        telefone_principal: telefoneOriginal,
        telefone_sanitizado: telefoneSanitizado,
        telefone_secundario: tel01,
        telefone_terciario: tel02,
        email,
        vinculo_curso: vinculoCurso,
        inscricao_paga: inscricaoPaga,
        grupo_monitoramento: 'Historico_Pre_Ago2024',
        curso_e_legacy: isLegacy,
        ultima_sincronizacao: new Date().toISOString(),
        status_crm: 'Novo',
        observacoes: 'Importado do histórico (pré-agosto/2024)'
      };
      
      const existingInscritos = await base44.asServiceRole.entities.Inscrito.filter({
        email: email,
        nome_curso: nomeCurso
      });
      
      if (existingInscritos.length === 0) {
        await base44.asServiceRole.entities.Inscrito.create(inscritoData);
        stats.imported++;
      } else {
        stats.skipped++;
      }
      
      stats.total++;
    }
    
    return Response.json({
      success: true,
      message: `Importação do histórico concluída`,
      stats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro na importação:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});