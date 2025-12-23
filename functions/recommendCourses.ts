import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await req.json();
    const { discente_id } = payload;

    // Buscar perfil do aluno
    const discente = (await base44.entities.Discente.filter({ id: discente_id }))[0];
    if (!discente) {
      return Response.json({ error: 'Discente não encontrado' }, { status: 404 });
    }

    // Buscar especializações disponíveis
    const especializacoes = await base44.entities.Especializacao.list('ordem');

    // Criar prompt para IA analisar e recomendar
    const prompt = `Como conselheiro acadêmico especializado em Construção Civil, analise o perfil do aluno e recomende especializações ideais:

PERFIL DO ALUNO:
Nome: ${discente.nome}
Formação atual: ${discente.titulo || 'Não informado'}
Cargo: ${discente.cargo_atual || 'Não informado'}
Empresa: ${discente.empresa || 'Não informado'}
Status de carreira: ${discente.status_carreira || 'Não informado'}
Sobre: ${discente.sobre || 'Não informado'}
Competências: ${discente.tags_competencia?.join(', ') || 'Não informado'}
Especializações já cursadas: ${discente.especializacoes?.length || 0}

ESPECIALIZAÇÕES DISPONÍVEIS:
${especializacoes.map(e => `
- ID: ${e.id}
- Nome: ${e.nome}
- Área: ${e.area_conhecimento || 'Geral'}
- Carga horária: ${e.carga_horaria}h
- Público-alvo: ${e.publico_alvo || 'Profissionais da área'}
- Diferenciais: ${e.diferenciais?.join(', ') || 'N/A'}
`).join('\n')}

Analise e recomende as 3-5 especializações mais adequadas considerando:
1. Alinhamento com cargo e competências atuais
2. Potencial de crescimento profissional
3. Tendências do mercado de construção civil
4. Gaps de conhecimento identificados
5. Progressão de carreira ideal

Para cada recomendação, explique detalhadamente o PORQUÊ é ideal para este aluno.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                especializacao_id: { type: "string" },
                match_score: { type: "number", description: "Score de 0-100" },
                razoes: {
                  type: "array",
                  items: { type: "string" },
                  description: "Lista de razões detalhadas"
                },
                beneficios_esperados: {
                  type: "array",
                  items: { type: "string" }
                },
                tempo_ideal_inicio: { type: "string", description: "Ex: Imediato, 3 meses, 6 meses" }
              }
            }
          },
          career_path_suggestion: {
            type: "string",
            description: "Sugestão de trajetória de carreira"
          },
          skills_to_develop: {
            type: "array",
            items: { type: "string" },
            description: "Competências prioritárias a desenvolver"
          }
        }
      }
    });

    return Response.json({
      success: true,
      discente_nome: discente.nome,
      recommendations: response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});