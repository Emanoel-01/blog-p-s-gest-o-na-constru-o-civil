import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const G1_COURSES = [
  { full: "PÓS-GRADUAÇÃO - TECNOLOGIA BIM NA CONSTRUÇÃO CIVIL", display: "Tecnologia BIM na Construção Civil" },
  { full: "PÓS-GRADUAÇÃO - NEUROARQUITETURA", display: "Neuroarquitetura" },
  { full: "PÓS-GRADUAÇÃO - GESTÃO DE PROJETOS E OBRAS", display: "Gestão de Projetos e Obras" },
  { full: "PÓS-GRADUAÇÃO - ENGENHARIA E GESTÃO DE MANUTENÇÃO PREDIAL NA CONSTRUÇÃO 4.0", display: "Manutenção Predial 4.0" },
  { full: "PÓS-GRADUAÇÃO - ACÚSTICA ARQUITETÔNICA E ILUMINAÇÃO", display: "Acústica Arquitetônica" },
  { full: "PÓS-GRADUAÇÃO - DESIGN DE INTERIORES CONTEMPORÂNEO", display: "Design de Interiores" },
  { full: "PÓS-GRADUAÇÃO - Engenharia Legal e Perícias: Avaliações e Desempenho", display: "Engenharia Legal e Perícias" }
];

function normalize(name) {
  return name.replace(/^PÓS-GRADUAÇÃO - /i, '').replace(/^MBA - /i, '').trim().toUpperCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (!user.crm_access && user.role !== 'admin')) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const allG1 = await base44.asServiceRole.entities.Inscrito.filter({
      grupo_monitoramento: 'G1_Cursos_Atuais'
    });

    const stats = {};
    let totalInscritos = 0, totalPagos = 0, totalMatriculados = 0;

    G1_COURSES.forEach(c => {
      stats[normalize(c.full)] = { display: c.display, inscritos: 0, pagos: 0, matriculados: 0 };
    });

    allG1.forEach(i => {
      const key = normalize(i.nome_curso);
      if (stats[key]) {
        stats[key].inscritos++;
        totalInscritos++;
        if (i.inscricao_paga) {
          stats[key].pagos++;
          totalPagos++;
        }
        if (i.status_crm === 'Matriculado Turma Nova') {
          stats[key].matriculados++;
          totalMatriculados++;
        }
      }
    });

    const report = G1_COURSES.map(c => {
      const s = stats[normalize(c.full)];
      const conv = s.pagos > 0 ? ((s.matriculados / s.pagos) * 100).toFixed(1) : 0;
      return {
        display_name: s.display,
        inscritos: s.inscritos,
        pagos: s.pagos,
        pendentes: s.inscritos - s.pagos,
        conversao: parseFloat(conv)
      };
    });

    const mediaConversao = totalPagos > 0 ? ((totalMatriculados / totalPagos) * 100).toFixed(1) : 0;

    return Response.json({
      success: true,
      report,
      totalResumo: {
        totalInscritos,
        totalPagos,
        mediaConversaoFinal: parseFloat(mediaConversao)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});