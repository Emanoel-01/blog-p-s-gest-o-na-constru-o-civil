import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    console.log('User autenticado:', user?.email);
    
    if (!user || (user.role !== 'admin' && user.crm_access !== true)) {
      console.error('Acesso negado');
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { filtros = {} } = await req.json();
    
    console.log('Filtros recebidos:', filtros);

    let query = {};
    
    if (filtros.grupo_monitoramento && filtros.grupo_monitoramento !== 'Todos') {
      query.grupo_monitoramento = filtros.grupo_monitoramento;
    }
    
    if (filtros.status_crm && filtros.status_crm !== 'Todos') {
      query.status_crm = filtros.status_crm;
    }
    
    if (filtros.inscricao_paga !== undefined && filtros.inscricao_paga !== 'Todos') {
      query.inscricao_paga = filtros.inscricao_paga === 'true' || filtros.inscricao_paga === true;
    }

    if (filtros.nome_curso && filtros.nome_curso !== 'Todos') {
      query.nome_curso = filtros.nome_curso;
    }

    console.log('Query final:', query);

    const inscritos = await base44.asServiceRole.entities.Inscrito.filter(query);
    
    console.log(`Total de inscritos encontrados: ${inscritos.length}`);

    // Cabeçalho do CSV
    let csvContent = 'Nome,Telefone WhatsApp,Email,Curso,Data Inscrição,Status CRM,Grupo\n';
    
    let count = 0;
    for (const inscrito of inscritos) {
      if (inscrito.telefone_sanitizado) {
        const linha = [
          inscrito.nome_completo || '',
          inscrito.telefone_sanitizado || '',
          inscrito.email || '',
          inscrito.nome_curso || '',
          inscrito.data_inscricao || '',
          inscrito.status_crm || 'Novo',
          inscrito.grupo_monitoramento || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        csvContent += linha + '\n';
        count++;
      }
    }

    console.log(`CSV gerado com ${count} leads (com telefone)`);

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