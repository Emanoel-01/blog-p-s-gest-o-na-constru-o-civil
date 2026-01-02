import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { 
      destinatarios, 
      assunto, 
      conteudo_html,
      campanha_id 
    } = await req.json();
    
    if (!destinatarios || destinatarios.length === 0) {
      return Response.json({ error: 'Lista de destinatários vazia' }, { status: 400 });
    }
    
    if (!assunto || !conteudo_html) {
      return Response.json({ error: 'Assunto e conteúdo são obrigatórios' }, { status: 400 });
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');
    
    const stats = {
      total: destinatarios.length,
      enviados: 0,
      falhas: 0,
      erros: []
    };

    for (const dest of destinatarios) {
      try {
        const emailData = {
          personalizations: [{
            to: [{ email: dest.email, name: dest.nome }],
            subject: assunto
          }],
          from: {
            email: fromEmail,
            name: 'ESUDA Pós-Graduação'
          },
          content: [{
            type: 'text/html',
            value: conteudo_html
          }]
        };

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });

        if (response.ok) {
          stats.enviados++;
        } else {
          const errorText = await response.text();
          stats.falhas++;
          stats.erros.push({
            email: dest.email,
            erro: errorText
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        stats.falhas++;
        stats.erros.push({
          email: dest.email,
          erro: error.message
        });
      }
    }

    if (campanha_id) {
      await base44.asServiceRole.entities.CampanhaMarketing.update(campanha_id, {
        status: stats.falhas === 0 ? 'Enviada' : 'Falhou',
        data_envio: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no envio em massa:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});