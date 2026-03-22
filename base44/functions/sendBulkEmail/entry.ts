import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para enviar email com retry
async function sendEmailWithRetry(emailData, sendgridApiKey, maxRetries = 3) {
  for (let tentativa = 0; tentativa < maxRetries; tentativa++) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      // Se deu certo, retorna sucesso
      if (response.ok) {
        return { success: true, status: response.status };
      }

      const errorText = await response.text();
      
      // Rate limiting (429) ou erro temporário (5xx) - tentar novamente
      if (response.status === 429 || response.status >= 500) {
        if (tentativa < maxRetries - 1) {
          // Backoff exponencial: 2s, 4s, 8s
          const delayMs = Math.pow(2, tentativa + 1) * 1000;
          console.log(`⏳ Rate limit/erro temporário. Aguardando ${delayMs}ms antes de retry ${tentativa + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }

      // Erro definitivo (4xx exceto 429)
      return { 
        success: false, 
        error: errorText,
        status: response.status
      };

    } catch (error) {
      // Erro de rede - tentar novamente
      if (tentativa < maxRetries - 1) {
        const delayMs = Math.pow(2, tentativa + 1) * 1000;
        console.log(`⏳ Erro de rede. Retry ${tentativa + 1}/${maxRetries} em ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'Máximo de tentativas excedido' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    console.log('User autenticado:', user?.email);
    
    if (!user || (user.role !== 'admin' && user.crm_access !== true)) {
      console.error('Acesso negado:', user ? 'usuário não é admin' : 'usuário não autenticado');
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { 
      destinatarios, 
      assunto, 
      conteudo_html,
      campanha_id,
      attachments = []
    } = await req.json();
    
    console.log('Payload recebido:', { 
      qtd_destinatarios: destinatarios?.length, 
      assunto, 
      campanha_id,
      qtd_anexos: attachments.length
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
      emails_invalidos: 0,
      erros: []
    };

    for (const dest of destinatarios) {
      try {
        // Validar formato do email
        if (!dest.email || !isValidEmail(dest.email)) {
          stats.emails_invalidos++;
          stats.falhas++;
          stats.erros.push({
            email: dest.email || 'N/A',
            erro: 'Formato de email inválido'
          });
          console.error(`❌ Email inválido: ${dest.email}`);
          continue;
        }

        console.log(`📧 Enviando para ${dest.email}...`);
        
        const emailData = {
          personalizations: [{
            to: [{ email: dest.email.trim(), name: dest.nome }],
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

        // Adicionar anexos se existirem
        if (attachments && attachments.length > 0) {
          emailData.attachments = attachments;
        }

        // Tentar enviar com retry automático
        const resultado = await sendEmailWithRetry(emailData, sendgridApiKey);

        if (resultado.success) {
          stats.enviados++;
          console.log(`✅ Email enviado com sucesso para ${dest.email}`);
        } else {
          stats.falhas++;
          stats.erros.push({
            email: dest.email,
            erro: resultado.error,
            status: resultado.status
          });
          console.error(`❌ Falha definitiva para ${dest.email}: ${resultado.error}`);
        }

        // Delay entre envios (respeitar rate limit)
        await new Promise(resolve => setTimeout(resolve, 200));

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