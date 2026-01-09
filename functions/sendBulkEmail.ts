import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    console.log('User autenticado:', user?.email);
    
    if (!user || user.role !== 'admin') {
      console.error('Acesso negado:', user ? 'usuário não é admin' : 'usuário não autenticado');
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { 
      destinatarios, 
      assunto, 
      conteudo_html,
      campanha_id 
    } = await req.json();
    
    console.log('Payload recebido:', { 
      qtd_destinatarios: destinatarios?.length, 
      assunto, 
      campanha_id 
    });
    
    if (!destinatarios || destinatarios.length === 0) {
      console.error('Lista de destinatários vazia');
      return Response.json({ error: 'Lista de destinatários vazia' }, { status: 400 });
    }
    
    if (!assunto || !conteudo_html) {
      console.error('Assunto ou conteúdo faltando');
      return Response.json({ error: 'Assunto e conteúdo são obrigatórios' }, { status: 400 });
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');
    
    console.log('SendGrid configurado:', { 
      apiKey: sendgridApiKey ? 'Presente' : 'AUSENTE', 
      fromEmail: fromEmail || 'AUSENTE' 
    });
    
    if (!sendgridApiKey || !fromEmail) {
      console.error('Variáveis de ambiente SendGrid não configuradas');
      return Response.json({ 
        error: 'SendGrid não configurado. Configure SENDGRID_API_KEY e SENDGRID_FROM_EMAIL' 
      }, { status: 500 });
    }
    
    const stats = {
      total: destinatarios.length,
      enviados: 0,
      falhas: 0,
      erros: []
    };

    for (const dest of destinatarios) {
      try {
        console.log(`Tentando enviar email para ${dest.email}...`);
        
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
          console.log(`✅ Email enviado com sucesso para ${dest.email}`);
        } else {
          const errorText = await response.text();
          stats.falhas++;
          stats.erros.push({
            email: dest.email,
            erro: errorText
          });
          console.error(`❌ Erro ao enviar para ${dest.email}: ${response.status} - ${errorText}`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        stats.falhas++;
        stats.erros.push({
          email: dest.email,
          erro: error.message
        });
        console.error(`❌ Exception ao enviar para ${dest.email}:`, error.message);
      }
    }

    console.log('Estatísticas finais:', stats);

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