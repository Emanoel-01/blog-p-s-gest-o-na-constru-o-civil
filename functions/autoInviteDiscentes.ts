import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado: apenas administradores' }, { status: 403 });
    }

    // Buscar todos os discentes (limite aumentado para 1000)
    const discentes = await base44.asServiceRole.entities.Discente.list({ limit: 1000 });

    if (!discentes || discentes.length === 0) {
      return Response.json({ 
        success: true,
        message: 'Nenhum discente encontrado',
        invited: 0
      });
    }

    // Buscar usuários existentes
    const existingUsers = await base44.asServiceRole.entities.User.list();
    const existingEmails = existingUsers.map(u => u.email.toLowerCase());

    // Filtrar discentes que ainda não são usuários
    const discentesToInvite = discentes.filter(d => 
      d.email && !existingEmails.includes(d.email.toLowerCase())
    );

    if (discentesToInvite.length === 0) {
      return Response.json({
        success: true,
        message: 'Todos os discentes já são usuários',
        invited: 0,
        total_discentes: discentes.length
      });
    }

    const results = [];

    for (const discente of discentesToInvite) {
      try {
        await base44.users.inviteUser(discente.email, 'user');
        results.push({
          email: discente.email,
          nome: discente.nome,
          status: 'convidado'
        });
        
        // Pausa de 300ms entre convites para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        results.push({
          email: discente.email,
          nome: discente.nome,
          status: 'erro',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'convidado').length;
    const errorCount = results.filter(r => r.status === 'erro').length;

    return Response.json({
      success: true,
      message: `${successCount} discentes convidados, ${errorCount} erros`,
      total_discentes: discentes.length,
      already_users: discentes.length - discentesToInvite.length,
      invited: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('Erro ao convidar discentes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});