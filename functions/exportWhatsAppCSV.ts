import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { filtros = {} } = await req.json();

    let query = {};
    
    if (filtros.grupo_monitoramento) {
      query.grupo_monitoramento = filtros.grupo_monitoramento;
    }
    
    if (filtros.status_crm) {
      query.status_crm = filtros.status_crm;
    }
    
    if (filtros.inscricao_paga !== undefined) {
      query.inscricao_paga = filtros.inscricao_paga;
    }

    const inscritos = await base44.asServiceRole.entities.Inscrito.filter(query);

    let csvContent = 'Nome,Telefone WhatsApp,Email,Curso,Data Inscrição,Status\n';
    
    for (const inscrito of inscritos) {
      if (inscrito.telefone_sanitizado) {
        const linha = [
          inscrito.nome_completo,
          inscrito.telefone_sanitizado,
          inscrito.email || '',
          inscrito.nome_curso,
          inscrito.data_inscricao,
          inscrito.status_crm
        ].map(field => `"${field}"`).join(',');
        
        csvContent += linha + '\n';
      }
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="whatsapp_leads_${Date.now()}.csv"`
      }
    });

  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});