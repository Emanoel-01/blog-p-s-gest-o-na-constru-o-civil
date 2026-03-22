import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        // Buscar todos os discentes
        const discentes = await base44.asServiceRole.entities.Discente.list();
        
        const results = {
            success: [],
            alreadyExists: [],
            errors: []
        };

        // Convidar cada discente como usuário
        for (const discente of discentes) {
            try {
                if (discente.email) {
                    await base44.users.inviteUser(discente.email, "user");
                    results.success.push({
                        nome: discente.nome,
                        email: discente.email
                    });
                }
            } catch (error) {
                // Se o usuário já existe, não é erro
                if (error.message && error.message.includes('already')) {
                    results.alreadyExists.push({
                        nome: discente.nome,
                        email: discente.email
                    });
                } else {
                    results.errors.push({
                        nome: discente.nome,
                        email: discente.email,
                        error: error.message
                    });
                }
            }
        }

        return Response.json({
            message: 'Processo de convite concluído',
            total: discentes.length,
            convidados: results.success.length,
            jaExistiam: results.alreadyExists.length,
            erros: results.errors.length,
            detalhes: results
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});