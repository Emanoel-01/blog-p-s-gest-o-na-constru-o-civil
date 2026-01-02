import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ADMIN_WHATSAPP = '5581991298803';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const inscritos = await base44.asServiceRole.entities.Inscrito.filter({
      grupo_monitoramento: { $in: ['G1_Cursos_Atuais', 'G2_Cursos_Legacy_Pos_Ago2024'] }
    });

    const stats = {
      total: inscritos.length,
      novos: inscritos.filter(i => i.status_crm === 'Novo').length,
      contatados: inscritos.filter(i => i.status_crm === 'Contatado').length,
      em_negociacao: inscritos.filter(i => i.status_crm === 'Em Negociação').length,
      matriculados: inscritos.filter(i => i.status_crm === 'Matriculado').length,
      pagos: inscritos.filter(i => i.inscricao_paga).length,
      nao_pagos: inscritos.filter(i => !i.inscricao_paga).length,
      g1: inscritos.filter(i => i.grupo_monitoramento === 'G1_Cursos_Atuais').length,
      g2: inscritos.filter(i => i.grupo_monitoramento === 'G2_Cursos_Legacy_Pos_Ago2024').length
    };

    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const novosOntem = inscritos.filter(i => {
      const created = new Date(i.created_date);
      return created >= ontem && created < hoje;
    });

    const summary = `
📊 RESUMO DIÁRIO CRM - ${hoje.toLocaleDateString('pt-BR')}

📈 VISÃO GERAL:
• Total de Leads Ativos: ${stats.total}
• Novos (últimas 24h): ${novosOntem.length}

🎯 STATUS DO FUNIL:
• Novos: ${stats.novos}
• Contatados: ${stats.contatados}
• Em Negociação: ${stats.em_negociacao}
• Matriculados: ${stats.matriculados}

💰 PAGAMENTOS:
• Pagos: ${stats.pagos}
• Não Pagos: ${stats.nao_pagos}

📚 GRUPOS DE MONITORAMENTO:
• G1 (Cursos Atuais): ${stats.g1}
• G2 (Legacy Pós-Ago/24): ${stats.g2}

⚠️ ATENÇÃO NECESSÁRIA:
• Leads sem contato: ${stats.novos}
• Leads em negociação: ${stats.em_negociacao}

🔗 Acesse o painel: https://posgraduacao-esuda.base44.app/AdminPage

---
Mensagem automática gerada às ${hoje.toLocaleTimeString('pt-BR')}
    `.trim();

    console.log('=== RESUMO DIÁRIO ===');
    console.log(summary);
    console.log('======================');
    
    console.log(`[INFO] WhatsApp configurado para: ${ADMIN_WHATSAPP}`);
    console.log('[INFO] Envio de WhatsApp será implementado na Fase 2');

    return Response.json({
      success: true,
      message: 'Resumo diário gerado com sucesso',
      summary: summary,
      stats: stats,
      whatsapp_destino: ADMIN_WHATSAPP,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});