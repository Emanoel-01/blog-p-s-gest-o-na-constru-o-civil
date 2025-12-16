import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verifica se o usuário está autenticado e é admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Busca todos os depoimentos usando service role (bypassa RLS)
    const depoimentos = await base44.asServiceRole.entities.Depoimento.list('-created_date');

    return Response.json({ depoimentos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});