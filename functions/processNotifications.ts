import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Função de retry com backoff exponencial
async function executeWithRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !error.message.includes('rate limit')) {
        throw error;
      }
      const waitTime = Math.pow(2, attempt) * 500;
      console.warn(`Rate limit atingido. Tentativa ${attempt}. Aguardando ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Busca notificações existentes com filtro otimizado
const getExistingNotifications = async (base44, emailsToCheck, oneDayAgo) => {
  if (emailsToCheck.length === 0) return {};
  
  const existing = {};
  
  // Buscar todas as notificações do último dia de uma vez (filtro no servidor)
  const recentNotifications = await base44.asServiceRole.entities.Notificacao.filter({
    created_date_gte: oneDayAgo
  });
  
  // Agrupar por email
  for (const notif of recentNotifications) {
    if (!existing[notif.destinatario_email]) {
      existing[notif.destinatario_email] = [];
    }
    existing[notif.destinatario_email].push(notif);
  }
  
  return existing;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const notifications = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // ========== CATEGORIA: ACADÊMICO ==========
    
    // 1. BOAS-VINDAS (Primeiro login) - Filtro otimizado
    const recentUsers = await base44.asServiceRole.entities.User.filter({
      created_date_gte: oneDayAgo
    });
    
    const welcomeEmails = recentUsers.map(u => u.email);
    const existingWelcomes = await getExistingNotifications(base44, welcomeEmails, oneDayAgo);
    
    for (const user of recentUsers) {
      const existingWelcome = existingWelcomes[user.email] || [];
      const hasWelcome = existingWelcome.some(n => n.titulo === 'Bem-vindo à Comunidade ESUDA!');
      
      if (!hasWelcome) {
        notifications.push({
          destinatario_email: user.email,
          tipo: 'Acadêmico',
          titulo: 'Bem-vindo à Comunidade ESUDA!',
          mensagem: 'Seu acesso está liberado. Complete seu perfil agora para se conectar com parceiros e oportunidades.',
          link_destino: 'MeuPerfilDiscente'
        });
      }
    }
    
    // 2. LEMBRETE DE AULA (D+1 - dia seguinte)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const aulas = await base44.asServiceRole.entities.CronogramaAula.list();
    const aulasAmanha = aulas.filter(aula => {
      return aula.data === tomorrowStr && 
             aula.tipo !== 'Dia Sem aula' && 
             !['Prévias', 'Carnaval', 'Data Magna', 'Sexta Santa', 'Dia do Trabalho', 'Intervalo', '7 de Setembro'].includes(aula.tipo);
    });
    
    if (aulasAmanha.length > 0) {
      const discentes = await base44.asServiceRole.entities.Discente.list();
      const discenteEmails = discentes.filter(d => d.email).map(d => d.email);
      const existingReminders = await getExistingNotifications(base44, discenteEmails, oneDayAgo);
      
      const disciplinasAmanha = aulasAmanha.map(a => a.disciplina_nome).filter(Boolean).join(', ') || 'Confira sua agenda';
      
      for (const discente of discentes) {
        if (!discente.email) continue;
        
        const existingReminder = existingReminders[discente.email] || [];
        const hasReminder = existingReminder.some(n => n.titulo === `Aula Amanhã: ${tomorrowStr}`);
        
        if (!hasReminder) {
          notifications.push({
            destinatario_email: discente.email,
            tipo: 'Acadêmico',
            titulo: `Aula Amanhã: ${tomorrowStr}`,
            mensagem: `Você tem aula(s) agendada(s) amanhã: ${disciplinasAmanha}. Verifique o horário e prepare-se!`,
            link_destino: 'CalendarioDeAula'
          });
        }
      }
    }
    
    // ========== CATEGORIA: CARREIRA ==========
    
    // 3. MATCH DE SKILL - Filtro otimizado no servidor
    const newOpportunities = await base44.asServiceRole.entities.FreelancerNetwork.filter({
      created_date_gte: oneDayAgo
    });
    
    if (newOpportunities.length > 0) {
      const discentes = await base44.asServiceRole.entities.Discente.list();
      const discentesOpenToWork = discentes.filter(d => d.status_carreira === 'Open to Work' && d.tags_competencia);
      
      const matchEmails = discentesOpenToWork.map(d => d.email);
      const existingMatches = await getExistingNotifications(base44, matchEmails, oneDayAgo);
      
      for (const opp of newOpportunities) {
        // Verificar se a oportunidade tem requisitos de competências (no resumo ou descrição)
        const oppText = `${opp.resumo || ''} ${opp.descricao_completa || ''}`.toLowerCase();
        
        for (const discente of discentesOpenToWork) {
          // Verificar match de competências
          const hasMatch = discente.tags_competencia.some(tag => 
            oppText.includes(tag.toLowerCase())
          );
          
          if (hasMatch) {
            const existingMatch = existingMatches[discente.email] || [];
            const recentMatch = existingMatch.filter(n => 
              n.titulo === 'Vaga Compatível Encontrada' && n.created_date > oneDayAgo
            );
            
            if (recentMatch.length === 0) {
              notifications.push({
                destinatario_email: discente.email,
                tipo: 'Carreira',
                titulo: 'Vaga Compatível Encontrada',
                mensagem: `Uma nova oportunidade foi encontrada que combina com suas competências. Confira os detalhes na Incubadora!`,
                link_destino: 'IncubadoraProfissionalPage'
              });
            }
            break; // Apenas uma notificação por discente
          }
        }
      }
    }
    
    // 4. LEMBRETE DE ROI (30 dias sem atividade) - Otimizado com consultas filtradas
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const discentes = await base44.asServiceRole.entities.Discente.list();
    const roiEmails = discentes.filter(d => d.email).map(d => d.email);
    const existingRoiNotifications = await getExistingNotifications(base44, roiEmails, oneDayAgo);
    
    for (const discente of discentes) {
      if (!discente.email) continue;
      
      // Verificar se já existe lembrete recente
      const existingRoi = existingRoiNotifications[discente.email] || [];
      const hasRecentRoiNotification = existingRoi.some(n => n.titulo === 'Atualize seu Portfólio na Incubadora');
      
      if (hasRecentRoiNotification) continue;
      
      // Verificar se há atividade recente (limite 1 para performance)
      const [freelancerActivities, eventos, artigos, canteiros, relatorios, producoes] = await Promise.all([
        base44.asServiceRole.entities.FreelancerNetwork.filter({ aluno_id: discente.id, created_date_gte: thirtyDaysAgo, limit: 1 }),
        base44.asServiceRole.entities.Evento.filter({ aluno_id: discente.id, created_date_gte: thirtyDaysAgo, limit: 1 }),
        base44.asServiceRole.entities.ArtigoCientifico.filter({ aluno_id: discente.id, created_date_gte: thirtyDaysAgo, limit: 1 }),
        base44.asServiceRole.entities.CanteiroDidatico.filter({ aluno_id: discente.id, created_date_gte: thirtyDaysAgo, limit: 1 }),
        base44.asServiceRole.entities.RelatorioTecnico.filter({ aluno_id: discente.id, created_date_gte: thirtyDaysAgo, limit: 1 }),
        base44.asServiceRole.entities.ProducaoTecnologica.filter({ aluno_id: discente.id, created_date_gte: thirtyDaysAgo, limit: 1 })
      ]);
      
      const hasRecentActivity = 
        freelancerActivities.length > 0 || 
        eventos.length > 0 || 
        artigos.length > 0 || 
        canteiros.length > 0 || 
        relatorios.length > 0 || 
        producoes.length > 0;
      
      // Se não houver atividade há 30 dias, enviar lembrete
      if (!hasRecentActivity) {
        notifications.push({
          destinatario_email: discente.email,
          tipo: 'Carreira',
          titulo: 'Atualize seu Portfólio na Incubadora',
          mensagem: 'Faz mais de 30 dias desde sua última atividade. Adicione projetos, eventos ou conquistas para aumentar sua visibilidade!',
          link_destino: 'IncubadoraProfissionalPage'
        });
      }
    }
    
    // 5. PROVA SOCIAL (Item marcado como destaque pelo admin)
    const entidadesDestaque = await Promise.all([
      base44.asServiceRole.entities.FreelancerNetwork.filter({ destaque: true, updated_date_gte: oneDayAgo }),
      base44.asServiceRole.entities.ArtigoCientifico.filter({ destaque: true, updated_date_gte: oneDayAgo }),
      base44.asServiceRole.entities.Evento.filter({ destaque: true, updated_date_gte: oneDayAgo }),
      base44.asServiceRole.entities.CanteiroDidatico.filter({ destaque: true, updated_date_gte: oneDayAgo }),
      base44.asServiceRole.entities.RelatorioTecnico.filter({ destaque: true, updated_date_gte: oneDayAgo }),
      base44.asServiceRole.entities.ProducaoTecnologica.filter({ destaque: true, updated_date_gte: oneDayAgo })
    ]);

    const itensDestaque = entidadesDestaque.flat();

    if (itensDestaque.length > 0) {
      const discentes = await base44.asServiceRole.entities.Discente.list();
      const discenteEmailsDestaque = discentes.filter(d => d.email).map(d => d.email);
      const existingDestaque = await getExistingNotifications(base44, discenteEmailsDestaque, oneDayAgo);

      for (const item of itensDestaque) {
        const autor = discentes.find(d => d.id === item.aluno_id);
        if (!autor) continue;

        const tituloItem = item.nome_atividade || item.titulo_artigo || item.nome_evento || item.nome_canteiro || item.titulo_relatorio || item.titulo_producao || 'Atividade';

        // Notificar o próprio autor
        const existingAutorNotif = existingDestaque[autor.email] || [];
        const hasAutorNotif = existingAutorNotif.some(n => n.titulo === '🌟 Sua atividade foi destacada!');
        if (!hasAutorNotif) {
          notifications.push({
            destinatario_email: autor.email,
            tipo: 'Engajamento',
            titulo: '🌟 Sua atividade foi destacada!',
            mensagem: `"${tituloItem}" foi marcada como destaque pelo coordenador. Parabéns!`,
            link_destino: 'IncubadoraProfissionalPage'
          });
        }

        // Notificar todos os outros discentes (prova social)
        for (const discente of discentes) {
          if (!discente.email || discente.id === autor.id) continue;
          const existingDiscenteNotif = existingDestaque[discente.email] || [];
          const hasDiscenteNotif = existingDiscenteNotif.some(n => n.titulo === '🏆 Colega em destaque na Incubadora!');
          if (!hasDiscenteNotif) {
            notifications.push({
              destinatario_email: discente.email,
              tipo: 'Engajamento',
              titulo: '🏆 Colega em destaque na Incubadora!',
              mensagem: `${autor.nome} teve "${tituloItem}" destacado. Inspire-se e registre suas conquistas também!`,
              link_destino: 'IncubadoraProfissionalPage'
            });
            break; // Apenas uma notificação de prova social por discente por dia
          }
        }
      }
    }
    
    // ========== CATEGORIA: ENGAJAMENTO ==========
    
    // 6. RESPOSTA EM COMENTÁRIO (Admin/Docente responde) - Otimizado
    const comentariosRecentes = await base44.asServiceRole.entities.Comentario.filter({ 
      aprovado: true,
      updated_date_gte: oneDayAgo
    });
    
    const comentariosComResposta = comentariosRecentes.filter(c => c.resposta_admin && c.resposta_admin.trim() !== '');
    
    const commentEmails = comentariosComResposta.filter(c => c.autor_email).map(c => c.autor_email);
    const existingCommentNotifications = await getExistingNotifications(base44, commentEmails, oneDayAgo);
    
    for (const comentario of comentariosComResposta) {
      if (!comentario.autor_email) continue;
      
      const existingNotification = existingCommentNotifications[comentario.autor_email] || [];
      const hasNotification = existingNotification.some(n => n.titulo === 'Você recebeu uma resposta!');
      
      if (!hasNotification) {
        notifications.push({
          destinatario_email: comentario.autor_email,
          tipo: 'Engajamento',
          titulo: 'Você recebeu uma resposta!',
          mensagem: 'O Coordenador/Professor comentou na sua publicação. Veja a resposta.',
          link_destino: 'EmAcaoPage'
        });
      }
    }
    
    // 7. VISITAS AO PERFIL (Semanal - toda segunda-feira)
    const hoje = new Date();
    const isDiaEnvioSemanal = hoje.getDay() === 1; // Segunda-feira

    if (isDiaEnvioSemanal) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const visitasRecentes = await base44.asServiceRole.entities.VisitaPerfil.filter({
        data_visita_gte: sevenDaysAgo
      });

      // Agrupar visitas por discente
      const visitasPorDiscente = {};
      for (const visita of visitasRecentes) {
        if (!visitasPorDiscente[visita.discente_email]) {
          visitasPorDiscente[visita.discente_email] = 0;
        }
        visitasPorDiscente[visita.discente_email]++;
      }

      const discentesVisitados = Object.entries(visitasPorDiscente).filter(([_, count]) => count > 0);
      const emailsVisitados = discentesVisitados.map(([email]) => email);
      const existingVisitNotifications = await getExistingNotifications(base44, emailsVisitados, oneDayAgo);

      for (const [email, totalVisitas] of discentesVisitados) {
        const existingVisitNotif = existingVisitNotifications[email] || [];
        const hasVisitNotif = existingVisitNotif.some(n => n.titulo === '👀 Seu perfil foi visitado esta semana!');
        if (!hasVisitNotif) {
          notifications.push({
            destinatario_email: email,
            tipo: 'Carreira',
            titulo: '👀 Seu perfil foi visitado esta semana!',
            mensagem: `Seu perfil recebeu ${totalVisitas} visita(s) nos últimos 7 dias. Mantenha-o atualizado para aproveitar o interesse!`,
            link_destino: 'MeuPerfilDiscente'
          });
        }
      }
    }
    
    // Criar notificações com retry inteligente (lotes maiores)
    if (notifications.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
        const batch = notifications.slice(i, i + BATCH_SIZE);
        await executeWithRetry(() => 
          base44.asServiceRole.entities.Notificacao.bulkCreate(batch)
        );
      }
    }
    
    return Response.json({ 
      success: true,
      notifications_created: notifications.length,
      details: {
        boas_vindas: notifications.filter(n => n.titulo.includes('Bem-vindo')).length,
        lembrete_aula: notifications.filter(n => n.titulo.includes('Aula Amanhã')).length,
        match_skill: notifications.filter(n => n.titulo.includes('Vaga Compatível')).length,
        lembrete_roi: notifications.filter(n => n.titulo.includes('Atualize seu Portfólio')).length,
        resposta_comentario: notifications.filter(n => n.titulo.includes('Você recebeu uma resposta')).length
      },
      message: `${notifications.length} notificação(ões) processada(s) com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao processar notificações:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});