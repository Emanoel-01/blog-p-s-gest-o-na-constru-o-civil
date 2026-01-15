import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Grupo 1: Cursos de Engenharia/Construção 4.0
const GRUPO1_COURSES = [
  { full: "PÓS-GRADUAÇÃO - TECNOLOGIA BIM NA CONSTRUÇÃO CIVIL", display: "Tecnologia BIM na Construção Civil" },
  { full: "PÓS-GRADUAÇÃO - GESTÃO DE PROJETOS E OBRAS", display: "Gestão de Projetos e Obras" },
  { full: "PÓS-GRADUAÇÃO - ENGENHARIA E GESTÃO DE MANUTENÇÃO PREDIAL NA CONSTRUÇÃO 4.0", display: "Manutenção Predial 4.0" },
  { full: "PÓS-GRADUAÇÃO - Engenharia Legal e Perícias: Avaliações e Desempenho", display: "Engenharia Legal e Perícias" }
];

// Grupo 2: Cursos de Arquitetura/Design
const GRUPO2_COURSES = [
  { full: "PÓS-GRADUAÇÃO - ACÚSTICA ARQUITETÔNICA E ILUMINAÇÃO", display: "Acústica Arquitetônica" },
  { full: "PÓS-GRADUAÇÃO - NEUROARQUITETURA", display: "Neuroarquitetura" },
  { full: "PÓS-GRADUAÇÃO - DESIGN DE INTERIORES CONTEMPORÂNEO", display: "Design de Interiores" }
];

function normalize(name) {
  return name.replace(/^PÓS-GRADUAÇÃO - /i, '').replace(/^MBA - /i, '').trim().toUpperCase();
}

function generateGroupStats(inscritos, courses) {
  const stats = {};
  let totalInscritos = 0, totalPagos = 0, totalMatriculados = 0;

  courses.forEach(c => {
    stats[normalize(c.full)] = { display: c.display, inscritos: 0, pagos: 0, matriculados: 0 };
  });

  inscritos.forEach(i => {
    const key = normalize(i.nome_curso);
    if (stats[key]) {
      // Excluir "Matriculado Turma Antiga" apenas do curso Manutenção Predial 4.0
      const isManutencao = key === normalize("PÓS-GRADUAÇÃO - ENGENHARIA E GESTÃO DE MANUTENÇÃO PREDIAL NA CONSTRUÇÃO 4.0");
      if (isManutencao && i.status_crm === 'Matriculado Turma Antiga') {
        return; // Ignora este lead
      }
      
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

  const report = courses.map(c => {
    const s = stats[normalize(c.full)];
    const conv = s.pagos > 0 ? ((s.matriculados / s.pagos) * 100).toFixed(1) : 0;
    return {
      display_name: s.display,
      inscritos: s.inscritos,
      pagos: s.pagos,
      pendentes: s.inscritos - s.pagos,
      matriculados: s.matriculados,
      conversao: parseFloat(conv)
    };
  });

  const mediaConversao = totalPagos > 0 ? ((totalMatriculados / totalPagos) * 100).toFixed(1) : 0;

  return {
    report,
    summary: {
      totalInscritos,
      totalPagos,
      totalMatriculados,
      mediaConversaoFinal: parseFloat(mediaConversao)
    }
  };
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

    // Separar inscritos por grupo de cursos
    const grupo1Inscritos = allG1.filter(i => 
      GRUPO1_COURSES.some(c => normalize(c.full) === normalize(i.nome_curso))
    );

    const grupo2Inscritos = allG1.filter(i => 
      GRUPO2_COURSES.some(c => normalize(c.full) === normalize(i.nome_curso))
    );

    // Gerar estatísticas para cada grupo
    const grupo1Stats = generateGroupStats(grupo1Inscritos, GRUPO1_COURSES);
    const grupo2Stats = generateGroupStats(grupo2Inscritos, GRUPO2_COURSES);

    return Response.json({
      success: true,
      grupo1: {
        name: "Engenharia e Construção 4.0",
        report: grupo1Stats.report,
        summary: grupo1Stats.summary
      },
      grupo2: {
        name: "Arquitetura e Design",
        report: grupo2Stats.report,
        summary: grupo2Stats.summary
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});