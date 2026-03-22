import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado: apenas administradores' }, { status: 403 });
    }

    const { action = 'update' } = await req.json();

    // Buscar leads antigos (outubro 2025 ou anteriores), excluindo cursos do grupo G1
    const allLeads = await base44.asServiceRole.entities.Lead.list();
    
    const oldLeads = allLeads.filter(lead => {
      const createdDate = new Date(lead.created_date);
      const cutoffDate = new Date('2025-11-01'); // Novembro 2025
      
      // Excluir leads com interesse em BIM, GPO ou grupo G1
      const g1Courses = ['BIM', 'bim', 'Gestão de Projetos e Obras', 'gestão de projetos', 'gpo', 'GPO'];
      const isG1 = g1Courses.some(course => 
        (lead.interesse && lead.interesse.toLowerCase().includes(course.toLowerCase())) ||
        (lead.categoria_interesse && lead.categoria_interesse.some(cat => 
          cat.toLowerCase().includes(course.toLowerCase())
        ))
      );
      
      return createdDate < cutoffDate && !isG1;
    });

    if (oldLeads.length === 0) {
      return Response.json({ 
        success: true,
        message: 'Nenhum lead antigo encontrado',
        updated: 0
      });
    }

    if (action === 'count') {
      return Response.json({
        success: true,
        count: oldLeads.length,
        leads: oldLeads.map(l => ({
          id: l.id,
          nome: l.nome,
          created_date: l.created_date,
          status: l.status
        }))
      });
    }

    // Atualizar leads
    const results = [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const lead of oldLeads) {
      try {
        // Calcular nova data proporcional
        const originalDate = new Date(lead.created_date);
        const daysSinceOriginal = Math.floor((new Date('2025-11-01') - originalDate) / (24 * 60 * 60 * 1000));
        const newDate = new Date(oneMonthAgo.getTime() + (daysSinceOriginal * 24 * 60 * 60 * 1000 * 0.5));

        const updateData = {
          ultima_interacao: newDate.toISOString()
        };

        // Se o lead não tem interações recentes, atualizar notas
        if (!lead.historico_interacoes || lead.historico_interacoes.length === 0) {
          updateData.notas = (lead.notas || '') + '\n[Sistema] Lead atualizado automaticamente em ' + now.toISOString();
        }

        await base44.asServiceRole.entities.Lead.update(lead.id, updateData);
        
        results.push({
          id: lead.id,
          nome: lead.nome,
          status: 'atualizado',
          old_date: lead.created_date,
          new_interaction_date: newDate.toISOString()
        });
      } catch (error) {
        results.push({
          id: lead.id,
          nome: lead.nome,
          status: 'erro',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'atualizado').length;
    const errorCount = results.filter(r => r.status === 'erro').length;

    return Response.json({
      success: true,
      message: `${successCount} leads atualizados, ${errorCount} erros`,
      total: oldLeads.length,
      updated: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('Erro ao atualizar leads:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});