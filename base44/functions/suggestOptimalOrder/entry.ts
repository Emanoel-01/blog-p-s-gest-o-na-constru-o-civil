import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await req.json();
    const { entity_type, items } = payload; // entity_type: 'ciclo', 'especializacao', 'professor', 'parceiro'

    // Criar prompt para IA sugerir ordem ideal
    const prompt = `Como especialista em organização acadêmica, analise os seguintes ${entity_type}s e sugira uma ordem ideal de apresentação considerando:

1. Para Ciclos: Progressão pedagógica (básico → intermediário → avançado), pré-requisitos, carga horária
2. Para Especializações: Popularidade, nível de complexidade, área de conhecimento
3. Para Professores: Senioridade, titulação acadêmica, popularidade, áreas de especialização
4. Para Parceiros: Relevância no mercado, tipo de parceria, impacto estratégico

Itens a ordenar:
${JSON.stringify(items, null, 2)}

Retorne um array de IDs na ordem sugerida, com justificativa para cada posição.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          ordered_ids: {
            type: "array",
            items: { type: "string" },
            description: "IDs na ordem sugerida"
          },
          justificativas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                posicao: { type: "number" },
                razao: { type: "string" }
              }
            }
          },
          resumo_criterios: {
            type: "string",
            description: "Resumo dos critérios usados"
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestion: response,
      entity_type
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});