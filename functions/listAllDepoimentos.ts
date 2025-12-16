import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    
    let depoimentos;
    
    if (user && user.role === 'admin') {
      // Admin vê todos os depoimentos
      depoimentos = await base44.asServiceRole.entities.Depoimento.list('-created_date');
    } else {
      // Usuários comuns veem apenas aprovados
      depoimentos = await base44.entities.Depoimento.list('-created_date');
    }

    return Response.json({ depoimentos, isAdmin: user?.role === 'admin' });
  } catch (error) {
    console.error("Error in listAllDepoimentos:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});