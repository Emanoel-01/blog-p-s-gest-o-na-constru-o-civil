import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Função utilitária para tentar executar uma ação com repetições (Exponential Backoff)
async function executeWithRetry(operation, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (attempt === maxRetries || errorMessage.includes('already exists') || errorMessage.includes('já cadastrado') || errorMessage.includes('user_already_exists')) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`[Aviso] Tentativa ${attempt} falhou. Retentando em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado: apenas administradores' }, { status: 403 });
    }

    const discentes = await base44.asServiceRole.entities.Discente.list({ limit: 1000 });

    if (!discentes || discentes.length === 0) {
      return Response.json({ success: true, message: 'Nenhum discente encontrado', invited: 0 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    let alreadyExistsCount = 0;

    for (const discente of discentes) {
      if (!discente.email) continue;
      
      try {
        await executeWithRetry(async () => {
          await base44.asServiceRole.users.inviteUser(discente.email, 'user');
        });

        results.push({ email: discente.email, nome: discente.nome, status: 'convidado' });
        successCount++;
        
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('already') || errorMessage.includes('existe') || errorMessage.includes('cadastrado')) {
          results.push({ email: discente.email, nome: discente.nome, status: 'ja_existe' });
          alreadyExistsCount++;
        } else {
          results.push({ email: discente.email, nome: discente.nome, status: 'erro', error: error.message });
          errorCount++;
        }
      }
    }

    return Response.json({
      success: true,
      message: `Processamento concluído: ${successCount} novos convidados, ${alreadyExistsCount} já existiam, ${errorCount} erros.`,
      total_discentes: discentes.length,
      invited: successCount,
      already_users: alreadyExistsCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('Erro fatal ao convidar discentes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});