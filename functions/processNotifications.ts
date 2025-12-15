import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Usar service role para operações administrativas
    const notifications = [];
    
    // 1. NOTIFICAÇÃO DE BOAS-VINDAS (Primeiro login)
    // Buscar usuários criados recentemente (últimas 24h) sem notificação de boas-vindas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const users = await base44.asServiceRole.entities.User.list();
    const recentUsers = users.filter(u => u.created_date > oneDayAgo);
    
    for (const user of recentUsers) {
      // Verificar se já tem notificação de boas-vindas
      const existingWelcome = await base44.asServiceRole.entities.Notificacao.filter({
        destinatario_email: user.email,
        tipo: 'Acadêmico',
        titulo: 'Bem-vindo à Comunidade ESUDA!'
      });
      
      if (existingWelcome.length === 0) {
        notifications.push({
          destinatario_email: user.email,
          tipo: 'Acadêmico',
          titulo: 'Bem-vindo à Comunidade ESUDA!',
          mensagem: 'Estamos felizes em ter você conosco! Complete seu perfil e explore as oportunidades disponíveis.',
          link_destino: 'Homepage'
        });
      }
    }
    
    // 2. LEMBRETE DE AULA (48h antes)
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const twoDaysFromNowStr = twoDaysFromNow.toLocaleDateString('pt-BR');
    
    const aulas = await base44.asServiceRole.entities.CronogramaAula.list();
    const upcomingAulas = aulas.filter(aula => {
      return aula.data === twoDaysFromNowStr && 
             aula.tipo !== 'Dia Sem aula' && 
             !['Prévias', 'Carnaval', 'Data Magna', 'Sexta Santa', 'Dia do Trabalho', 'Intervalo', '7 de Setembro'].includes(aula.tipo);
    });
    
    if (upcomingAulas.length > 0) {
      const discentes = await base44.asServiceRole.entities.Discente.list();
      for (const discente of discentes) {
        // Verificar se já enviou notificação para esta aula
        const existingReminder = await base44.asServiceRole.entities.Notificacao.filter({
          destinatario_email: discente.email,
          titulo: `Lembrete: Aula em ${twoDaysFromNowStr}`
        });
        
        if (existingReminder.length === 0) {
          notifications.push({
            destinatario_email: discente.email,
            tipo: 'Acadêmico',
            titulo: `Lembrete: Aula em ${twoDaysFromNowStr}`,
            mensagem: `Você tem ${upcomingAulas.length} aula(s) agendada(s) para ${twoDaysFromNowStr}. Não esqueça de se preparar!`,
            link_destino: 'CalendarioDeAula'
          });
        }
      }
    }
    
    // 3. MATCH DE SKILL (Verificar vagas na incubadora)
    // TODO: Implementar quando houver entidade de vagas
    
    // 4. LEMBRETE DE ATUALIZAÇÃO NA INCUBADORA (30 dias sem atividade)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const discentes = await base44.asServiceRole.entities.Discente.list();
    
    for (const discente of discentes) {
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
          // Verificar se já enviou lembrete
          const existingReminder = await base44.asServiceRole.entities.Notificacao.filter({
            destinatario_email: discente.email,
            titulo: 'Atualize sua Incubadora Profissional'
          });
          
          const recentReminder = existingReminder.filter(n => new Date(n.created_date) > thirtyDaysAgo);
          
          if (recentReminder.length === 0) {
            notifications.push({
              destinatario_email: discente.email,
              tipo: 'Carreira',
              titulo: 'Atualize sua Incubadora Profissional',
              mensagem: 'Faz mais de 30 dias desde sua última atividade. Adicione seus projetos recentes e conquistas!',
              link_destino: 'IncubadoraProfissionalPage'
            });
          }
        }
      }
    }
    
    // 5. NOTIFICAÇÃO DE RESPOSTA EM COMENTÁRIO
    const comentarios = await base44.asServiceRole.entities.Comentario.filter({ aprovado: true });
    const comentariosComResposta = comentarios.filter(c => c.resposta_admin && c.resposta_admin.trim() !== '');
    
    for (const comentario of comentariosComResposta) {
      // Verificar se já notificou sobre esta resposta
      const existingNotification = await base44.asServiceRole.entities.Notificacao.filter({
        destinatario_email: comentario.autor_email,
        titulo: 'Resposta no seu comentário'
      });
      
      // Verificar se a resposta é recente (últimas 24h)
      const comentarioRecente = new Date(comentario.updated_date) > oneDayAgo;
      
      if (existingNotification.length === 0 && comentarioRecente) {
        notifications.push({
          destinatario_email: comentario.autor_email,
          tipo: 'Engajamento',
          titulo: 'Resposta no seu comentário',
          mensagem: 'Seu comentário recebeu uma resposta da equipe ESUDA. Confira!',
          link_destino: 'EmAcaoPage'
        });
      }
    }
    
    // Criar todas as notificações
    if (notifications.length > 0) {
      await base44.asServiceRole.entities.Notificacao.bulkCreate(notifications);
    }
    
    return Response.json({ 
      success: true,
      notifications_created: notifications.length,
      message: `${notifications.length} notificações processadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao processar notificações:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});