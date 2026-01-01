import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { tipo, dados } = await req.json();

    // Buscar todos os admins
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin');

    if (admins.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'Nenhum admin encontrado para notificar' 
      });
    }

    // Preparar mensagem baseada no tipo
    let assunto = '';
    let corpo = '';

    if (tipo === 'comentario') {
      assunto = `Novo Comentário no Blog - ${dados.post_titulo || 'Post'}`;
      corpo = `
        <h2>Novo Comentário Publicado</h2>
        <p><strong>Autor:</strong> ${dados.autor_nome}</p>
        <p><strong>Email:</strong> ${dados.autor_email}</p>
        <p><strong>Post:</strong> ${dados.post_titulo || 'N/A'}</p>
        <p><strong>Comentário:</strong></p>
        <p>${dados.conteudo}</p>
        <p><a href="https://posgraduacao-esuda.base44.app/AdminPage">Ver no Painel Admin</a></p>
      `;
    } else if (tipo === 'depoimento') {
      assunto = `Novo Depoimento Recebido - ${dados.autor_nome}`;
      corpo = `
        <h2>Novo Depoimento Publicado</h2>
        <p><strong>Autor:</strong> ${dados.autor_nome}</p>
        <p><strong>Email:</strong> ${dados.autor_email || 'N/A'}</p>
        <p><strong>Avaliação:</strong> ${dados.avaliacao || 'N/A'} estrelas</p>
        <p><strong>Depoimento:</strong></p>
        <p>${dados.depoimento}</p>
        <p><a href="https://posgraduacao-esuda.base44.app/AdminPage">Ver no Painel Admin</a></p>
      `;
    }

    // Enviar email para todos os admins
    const emailPromises = admins.map(admin => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: assunto,
        body: corpo
      })
    );

    await Promise.all(emailPromises);

    // Criar notificações in-app
    const notificationPromises = admins.map(admin =>
      base44.asServiceRole.entities.Notificacao.create({
        usuario_email: admin.email,
        tipo: tipo === 'comentario' ? 'Novo Comentário' : 'Novo Depoimento',
        titulo: assunto,
        mensagem: tipo === 'comentario' 
          ? `${dados.autor_nome} comentou: "${dados.conteudo.substring(0, 100)}..."`
          : `${dados.autor_nome} deixou um depoimento com ${dados.avaliacao} estrelas`,
        link_destino: 'AdminPage',
        lida: false
      })
    );

    await Promise.all(notificationPromises);

    return Response.json({ 
      success: true, 
      message: `Notificações enviadas para ${admins.length} admin(s)` 
    });

  } catch (error) {
    console.error('Erro ao notificar admins:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});