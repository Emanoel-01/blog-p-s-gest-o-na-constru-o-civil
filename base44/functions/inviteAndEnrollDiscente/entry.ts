import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Acesso negado. Apenas administradores podem convidar alunos.' }, { status: 403 });
  }

  const body = await req.json();
  const { email, numero_turma, especializacoes = [], nome_provisorio } = body;

  if (!email || !numero_turma) {
    return Response.json({ error: 'Email e número da turma são obrigatórios.' }, { status: 400 });
  }

  // Verificar se já existe um Discente com este email
  const discentes = await base44.asServiceRole.entities.Discente.filter({ email });

  if (discentes.length > 0) {
    // Discente já existe — apenas atualizar a turma se necessário
    const discenteExistente = discentes[0];
    const dadosAtualizados = {};

    if (!discenteExistente.numero_turma && numero_turma) {
      dadosAtualizados.numero_turma = numero_turma;
    }
    if (especializacoes.length > 0) {
      const especExistentes = discenteExistente.especializacoes || [];
      const novasEspec = [...new Set([...especExistentes, ...especializacoes])];
      if (novasEspec.length !== especExistentes.length) {
        dadosAtualizados.especializacoes = novasEspec;
      }
    }

    if (Object.keys(dadosAtualizados).length > 0) {
      await base44.asServiceRole.entities.Discente.update(discenteExistente.id, dadosAtualizados);
    }

    // Tentar convidar o usuário mesmo assim (o sistema ignora se já existir)
    try {
      await base44.users.inviteUser(email, 'user');
    } catch (_) {
      // Usuário já pode estar cadastrado — ignorar erro
    }

    return Response.json({
      success: true,
      message: `Aluno já cadastrado. Dados da turma ${numero_turma} atualizados.`,
      action: 'updated',
      discente_id: discenteExistente.id
    });
  }

  // Discente não existe — criar novo e convidar
  const novoDiscente = await base44.asServiceRole.entities.Discente.create({
    nome: nome_provisorio || email.split('@')[0],
    email,
    numero_turma,
    especializacoes,
    perfil_publico: true,
    ordem: 999
  });

  // Convidar o usuário no sistema
  try {
    await base44.users.inviteUser(email, 'user');
  } catch (err) {
    // Se o usuário já existia no sistema, ignorar
    console.warn('Aviso ao convidar usuário:', err.message);
  }

  return Response.json({
    success: true,
    message: `Aluno convidado com sucesso para a turma ${numero_turma}. Um email de convite foi enviado para ${email}.`,
    action: 'created',
    discente_id: novoDiscente.id
  });
});