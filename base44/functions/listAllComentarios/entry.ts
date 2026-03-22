import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verificação de segurança: Apenas Admin
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Busca TODOS os comentários (incluindo pendentes) usando asServiceRole
    const comentarios = await base44.asServiceRole.entities.Comentario.list('-created_date');

    return Response.json({ comentarios });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});