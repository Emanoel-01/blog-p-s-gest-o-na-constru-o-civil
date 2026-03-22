import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Função auxiliar para normalizar nome do curso
function normalizarNomeCurso(nome) {
  return nome
    .replace(/^PÓS-GRADUAÇÃO - /i, '')
    .replace(/^MBA - /i, '')
    .replace(/^ESPECIALIZAÇÃO EM /i, '')
    .trim()
    .toUpperCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado. Apenas admins podem executar.' }, { status: 403 });
    }

    const allInscritos = await base44.asServiceRole.entities.Inscrito.list();
    
    // FUNCIONALIDADE DE LIMPEZA DE DUPLICATAS DESATIVADA
    // A lógica foi comentada para preservar todos os registros
    const toDelete = [];
    
    // // Map para identificar duplicatas: chave = email + curso normalizado
    // const duplicatesMap = new Map();
    // 
    // for (const inscrito of allInscritos) {
    //   const key = `${inscrito.email?.toLowerCase()}|${normalizarNomeCurso(inscrito.nome_curso || '')}`;
    //   
    //   if (duplicatesMap.has(key)) {
    //     const existing = duplicatesMap.get(key);
    //     const existingDate = new Date(existing.data_inscricao);
    //     const currentDate = new Date(inscrito.data_inscricao);
    //     
    //     const existingMatriculado = existing.status_crm === 'Matriculado Turma Antiga' || existing.status_crm === 'Matriculado Turma Nova';
    //     const currentMatriculado = inscrito.status_crm === 'Matriculado Turma Antiga' || inscrito.status_crm === 'Matriculado Turma Nova';
    //     
    //     // Prioridade 1: Manter o matriculado
    //     if (currentMatriculado && !existingMatriculado) {
    //       toDelete.push(existing.id);
    //       duplicatesMap.set(key, inscrito);
    //     } else if (existingMatriculado && !currentMatriculado) {
    //       toDelete.push(inscrito.id);
    //     } 
    //     // Prioridade 2: Se ambos ou nenhum são matriculados, manter o mais recente
    //     else if (currentDate > existingDate) {
    //       toDelete.push(existing.id);
    //       duplicatesMap.set(key, inscrito);
    //     } else {
    //       toDelete.push(inscrito.id);
    //     }
    //   } else {
    //     duplicatesMap.set(key, inscrito);
    //   }
    // }
    // 
    // // Deletar duplicatas
    // for (const id of toDelete) {
    //   await base44.asServiceRole.entities.Inscrito.delete(id);
    // }
    
    return Response.json({
      success: true,
      message: `${toDelete.length} duplicatas removidas com sucesso`,
      total_antes: allInscritos.length,
      total_depois: allInscritos.length - toDelete.length,
      duplicatas_removidas: toDelete.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro na limpeza:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});