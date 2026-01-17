import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Helper para delay entre requisições
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const notifications = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // ========== CATEGORIA: ACADÊMICO ==========
    
    // 1. BOAS-VINDAS (Primeiro login)
    const users = await base44.asServiceRole.entities.User.list();
    const recentUsers = users.filter(u => u.created_date > oneDayAgo);
    
    // Fetch todas as notificações de boas-vindas uma vez ao invés de per-user
    const existingWelcomes = await base44.asServiceRole.entities.Notificacao.filter({
      titulo: 'Bem-vindo à Comunidade ESUDA!'
    });
    const welcomeEmails = new Set(existingWelcomes.map(n => n.destinatario_email));
    
    for (const user of recentUsers) {
      if (!welcomeEmails.has(user.email)) {
        notifications.push({
          destinatario_email: user.email,
          tipo: 'Acadêmico',
          titulo: 'Bem-vindo à Comunidade ESUDA!',
          mensagem: 'Seu acesso está liberado. Complete seu perfil agora para se conectar com parceiros e oportunidades.',
          link_destino: 'MeuPerfilDiscente'
        });
      }
    }
    
    await delay(100);
    
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
      
      // Fetch todas as notificações de aula uma vez
      const existingReminders = await base44.asServiceRole.entities.Notificacao.filter({
        titulo: `Aula Amanhã: ${tomorrowStr}`
      });
      const reminderEmails = new Set(existingReminders.map(n => n.destinatario_email));
      
      for (const discente of discentes) {
        if (!discente.email) continue;
        
        if (!reminderEmails.has(discente.email)) {
          const disciplinasAmanha = aulasAmanha.map(a => a.disciplina_nome).filter(Boolean).join(', ') || 'Confira sua agenda';
          
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
    
    await delay(100);
    
    // ========== CATEGORIA: CARREIRA ==========
    
    // 3. MATCH DE SKILL (Quando nova oportunidade é criada na Incubadora)
    // Buscar oportunidades criadas nas últimas 24h do tipo FreelancerNetwork
    const recentOpportunities = await base44.asServiceRole.entities.FreelancerNetwork.filter({});
    const newOpportunities = recentOpportunities.filter(opp => opp.created_date > oneDayAgo);
    
    if (newOpportunities.length > 0) {
      const discentes = await base44.asServiceRole.entities.Discente.list();
      const discentesOpenToWork = discentes.filter(d => d.status_carreira === 'Open to Work' && d.tags_competencia);
      
      // Fetch todas as notificações de vaga uma vez
      const existingMatches = await base44.asServiceRole.entities.Notificacao.filter({
        titulo: 'Vaga Compatível Encontrada'
      });
      const matchEmailsByDay = new Map();
      existingMatches.forEach(n => {
        if (n.created_date > oneDayAgo) {
          if (!matchEmailsByDay.has(n.destinatario_email)) matchEmailsByDay.set(n.destinatario_email, true);
        }
      });
      
      for (const opp of newOpportunities) {
        // Verificar se a oportunidade tem requisitos de competências (no resumo ou descrição)
        const oppText = `${opp.resumo || ''} ${opp.descricao_completa || ''}`.toLowerCase();
        
        for (const discente of discentesOpenToWork) {
          // Verificar match de competências
          const hasMatch = discente.tags_competencia.some(tag => 
            oppText.includes(tag.toLowerCase())
          );
          
          if (hasMatch && !matchEmailsByDay.has(discente.email)) {
            notifications.push({
              destinatario_email: discente.email,
              tipo: 'Carreira',
              titulo: 'Vaga Compatível Encontrada',
              mensagem: `Uma nova oportunidade foi encontrada que combina com suas competências. Confira os detalhes na Incubadora!`,
              link_destino: 'IncubadoraProfissionalPage'
            });
            break; // Apenas uma notificação por discente
          }
        }
      }
    }
    
    await delay(100);
    
    // 4. LEMBRETE DE ROI (30 dias sem atividade na Incubadora)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const discentes2 = await base44.asServiceRole.entities.Discente.list();
    
    // Fetch todas as notificações de portfólio uma vez
    const existingPortfolioReminders = await base44.asServiceRole.entities.Notificacao.filter({
      titulo: 'Atualize seu Portfólio'
    });
    const portfolioReminderEmails = new Set();
    existingPortfolioReminders.forEach(n => {
      if (new Date(n.created_date) > thirtyDaysAgo) {
        portfolioReminderEmails.add(n.destinatario_email);
      }
    });
    
    for (const discente of discentes2) {
      if (!discente.email || portfolioReminderEmails.has(discente.email)) continue;
      
      // Buscar última atividade do aluno na incubadora
      const [freelancers, relatorios, producoes, eventos, canteiros, artigos] = await Promise.all([
        base44.asServiceRole.entities.FreelancerNetwork.filter({ aluno_id: discente.id }),
        base44.asServiceRole.entities.RelatorioTecnico.filter({ aluno_id: discente.id }),
        base44.asServiceRole.entities.ProducaoTecnologica.filter({ aluno_id: discente.id }),
        base44.asServiceRole.entities.Evento.filter({ aluno_id: discente.id }),
        base44.asServiceRole.entities.CanteiroDidatico.filter({ aluno_id: discente.id }),
        base44.asServiceRole.entities.ArtigoCientifico.filter({ aluno_id: discente.id })
      ]);
      
      const allActivities = [...freelancers, ...relatorios, ...producoes, ...eventos, ...canteiros, ...artigos];
      
      if (allActivities.length > 0) {
        const lastActivity = allActivities.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
        
        if (new Date(lastActivity.created_date) < thirtyDaysAgo) {
          notifications.push({
            destinatario_email: discente.email,
            tipo: 'Carreira',
            titulo: 'Atualize seu Portfólio',
            mensagem: 'Teve alguma conquista profissional ou economia em obra este mês? Registre na Incubadora e valorize seu perfil.',
            link_destino: 'IncubadoraProfissionalPage'
          });
        }
      }
      
      await delay(50); // Pequeno delay entre iterações para evitar rate limit
    }
    
    await delay(100);
    
    // 5. PROVA SOCIAL (Item marcado como destaque)
    // Este gatilho seria acionado quando o admin marcar algo como destaque manualmente
    // Por enquanto, não há campo "destaque" nas entidades da Incubadora
    
    // ========== CATEGORIA: ENGAJAMENTO ==========
    
    // 6. RESPOSTA EM COMENTÁRIO (Admin/Docente responde)
    const comentarios = await base44.asServiceRole.entities.Comentario.filter({ aprovado: true });
    const comentariosComResposta = comentarios.filter(c => c.resposta_admin && c.resposta_admin.trim() !== '');
    
    // Fetch todas as notificações de resposta uma vez
    const existingReplyNotifications = await base44.asServiceRole.entities.Notificacao.filter({
      titulo: 'Você recebeu uma resposta!'
    });
    const replyEmailsByDay = new Set();
    existingReplyNotifications.forEach(n => {
      if (n.created_date > oneDayAgo) {
        replyEmailsByDay.add(n.destinatario_email);
      }
    });
    
    for (const comentario of comentariosComResposta) {
      if (!comentario.autor_email || replyEmailsByDay.has(comentario.autor_email)) continue;
      
      const comentarioRecente = new Date(comentario.updated_date) > oneDayAgo;
      
      if (comentarioRecente) {
        notifications.push({
          destinatario_email: comentario.autor_email,
          tipo: 'Engajamento',
          titulo: 'Você recebeu uma resposta!',
          mensagem: 'O Coordenador/Professor comentou na sua publicação. Veja a resposta.',
          link_destino: 'EmAcaoPage'
        });
      }
    }
    
    await delay(100);
    
    // 7. VISITAS AO PERFIL (Semanal)
    // Este gatilho requer sistema de tracking de visualizações
    // Por ora, está marcado como "Planejado" no sistema
    
    // Criar todas as notificações
    if (notifications.length > 0) {
      await base44.asServiceRole.entities.Notificacao.bulkCreate(notifications);
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