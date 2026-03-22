import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { depoimentoId, action, depoimento } = await req.json();

    let emailSubject = '';
    let emailBody = '';

    if (action === 'new_submission') {
      emailSubject = '🎉 Novo Depoimento Recebido - ESUDA';
      emailBody = `
        <h2>Novo Depoimento para Aprovação</h2>
        <p><strong>Nome:</strong> ${depoimento.nome}</p>
        <p><strong>Email:</strong> ${depoimento.email}</p>
        <p><strong>Profissão:</strong> ${depoimento.profissao}</p>
        <p><strong>Vínculo:</strong> ${depoimento.vinculo_pos_graduacao}</p>
        <p><strong>Avaliação:</strong> ${depoimento.avaliacao_estrelas} estrelas</p>
        <p><strong>Depoimento:</strong></p>
        <blockquote>${depoimento.depoimento_texto || 'Depoimento em áudio/vídeo'}</blockquote>
        <p>Acesse o painel administrativo para revisar e aprovar.</p>
      `;
    } else if (action === 'approved') {
      emailSubject = '✅ Seu Depoimento foi Aprovado - ESUDA';
      emailBody = `
        <h2>Seu Depoimento foi Aprovado!</h2>
        <p>Olá ${depoimento.nome},</p>
        <p>Agradecemos por compartilhar sua experiência conosco! Seu depoimento foi aprovado e já está publicado em nossa página.</p>
        <p>Veja em: <a href="https://posgraduacao-esuda.base44.app/DepoimentosPage">Página de Depoimentos</a></p>
        <p>Obrigado por fazer parte da comunidade ESUDA!</p>
      `;
    } else if (action === 'rejected') {
      emailSubject = '❌ Atualização sobre seu Depoimento - ESUDA';
      emailBody = `
        <h2>Atualização sobre seu Depoimento</h2>
        <p>Olá ${depoimento.nome},</p>
        <p>Agradecemos por compartilhar sua experiência conosco.</p>
        <p>Infelizmente, neste momento não poderemos publicar seu depoimento.</p>
        ${depoimento.admin_observacoes ? `<p><strong>Observações:</strong> ${depoimento.admin_observacoes}</p>` : ''}
        <p>Caso tenha dúvidas, sinta-se à vontade para entrar em contato conosco.</p>
      `;
    }

    const emailTo = action === 'new_submission' ? 'emanoel.s.amorim@gmail.com' : depoimento.email;

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'ESUDA - Pós-Graduação',
      to: emailTo,
      subject: emailSubject,
      body: emailBody
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});