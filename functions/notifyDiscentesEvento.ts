import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const { evento_id } = await req.json();

        if (!evento_id) {
            return Response.json({ error: 'evento_id is required' }, { status: 400 });
        }

        // Buscar o evento
        const evento = await base44.asServiceRole.entities.EventoDiscente.get(evento_id);
        
        if (!evento) {
            return Response.json({ error: 'Evento não encontrado' }, { status: 404 });
        }

        // Buscar todos os discentes
        let discentes = await base44.asServiceRole.entities.Discente.list();

        // Filtrar por turmas se especificado
        if (evento.turmas_alvo && evento.turmas_alvo.length > 0) {
            discentes = discentes.filter(d => 
                evento.turmas_alvo.includes(d.numero_turma)
            );
        }

        const notificacoes = [];

        // Criar notificação para cada discente
        for (const discente of discentes) {
            if (discente.email) {
                try {
                    const notificacao = await base44.asServiceRole.entities.Notificacao.create({
                        titulo: `Novo Evento: ${evento.titulo}`,
                        mensagem: `${evento.descricao}\n\nData: ${new Date(evento.data_evento).toLocaleString('pt-BR')}\nLocal: ${evento.localizacao}`,
                        tipo: 'evento',
                        destinatario_email: discente.email,
                        lida: false,
                        data_envio: new Date().toISOString(),
                        link_acao: evento.link_inscricao || null,
                        metadata: {
                            evento_id: evento.id,
                            tipo_evento: evento.tipo_evento
                        }
                    });
                    notificacoes.push(notificacao);
                } catch (error) {
                    console.error(`Erro ao criar notificação para ${discente.email}:`, error);
                }
            }
        }

        // Atualizar o evento marcando que a notificação foi enviada
        await base44.asServiceRole.entities.EventoDiscente.update(evento_id, {
            notificacao_enviada: true
        });

        return Response.json({
            success: true,
            message: `Notificações enviadas para ${notificacoes.length} discentes`,
            total_notificacoes: notificacoes.length,
            turmas_alvo: evento.turmas_alvo || ['Todos']
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});