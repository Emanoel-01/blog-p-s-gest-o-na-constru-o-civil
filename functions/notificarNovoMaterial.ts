import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { materialId, titulo, tipo, turma } = await req.json();

        if (!materialId || !titulo) {
            return Response.json({ error: 'materialId e titulo são obrigatórios' }, { status: 400 });
        }

        // Busca todos os discentes da turma (ou todos se turma não especificada)
        let discentes = [];
        if (turma) {
            discentes = await base44.asServiceRole.entities.Discente.filter({ numero_turma: turma });
        } else {
            discentes = await base44.asServiceRole.entities.Discente.list();
        }

        if (!discentes || discentes.length === 0) {
            return Response.json({ ok: true, notificados: 0, msg: 'Nenhum aluno encontrado para notificar.' });
        }

        // Cria notificação para cada aluno
        let notificados = 0;
        for (const discente of discentes) {
            if (!discente.email) continue;
            await base44.asServiceRole.entities.Notificacao.create({
                destinatario_email: discente.email,
                titulo: `📚 Novo material disponível: ${titulo}`,
                mensagem: `Um novo material do tipo "${tipo || 'Documento'}" foi disponibilizado${turma ? ` para a turma ${turma}` : ''}. Acesse a área de Materiais da Turma para visualizá-lo.`,
                tipo: 'Acadêmico',
                link_destino: '/MaterialTurmaPage',
                lida: false
            });
            notificados++;
        }

        return Response.json({ ok: true, notificados });

    } catch (error) {
        console.error('notificarNovoMaterial error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});