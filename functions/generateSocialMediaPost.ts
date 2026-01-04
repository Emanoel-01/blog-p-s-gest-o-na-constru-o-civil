import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await req.json();
    const { especializacao, platform, tone = 'profissional', keywords = '', cta = '', modelo = null } = payload;

    const platformSpecs = {
      instagram: {
        limite_caracteres: 2200,
        estilo: 'Visual, emotivo, com emojis, foco em transformação pessoal',
        hashtags: 15,
        cta: 'Link na bio'
      },
      linkedin: {
        limite_caracteres: 3000,
        estilo: 'Profissional, técnico, dados e resultados',
        hashtags: 5,
        cta: 'Saiba mais no link'
      },
      twitter: {
        limite_caracteres: 280,
        estilo: 'Conciso, impactante, direto ao ponto',
        hashtags: 3,
        cta: 'Confira'
      }
    };

    const spec = platformSpecs[platform];

    const toneDescriptions = {
      profissional: 'Profissional, corporativo, sério e confiável',
      informal: 'Descontraído, próximo, amigável e acessível',
      persuasivo: 'Convincente, motivador, focado em benefícios e urgência',
      inspirador: 'Motivacional, transformador, aspiracional',
      tecnico: 'Técnico, detalhado, focado em especificações e dados'
    };

    let prompt = `Você é um especialista em marketing digital para educação. Crie um post para ${platform.toUpperCase()} promovendo a seguinte especialização:

ESPECIALIZAÇÃO: ${especializacao.nome}
DESCRIÇÃO: ${especializacao.descricao || especializacao.resumo || 'Curso de pós-graduação em Construção Civil'}
CARGA HORÁRIA: ${especializacao.carga_horaria_total || 360}h
PÚBLICO-ALVO: Engenheiros, Arquitetos e Profissionais da Construção Civil

ESPECIFICAÇÕES DA PLATAFORMA:
- Limite de caracteres: ${spec.limite_caracteres}
- Estilo: ${spec.estilo}
- Quantidade de hashtags: até ${spec.hashtags}
- CTA padrão: ${spec.cta}

CUSTOMIZAÇÕES SOLICITADAS:
- Tom: ${toneDescriptions[tone]}${cta ? `\n- CTA específico: "${cta}"` : ''}${keywords ? `\n- Palavras-chave obrigatórias: ${keywords}` : ''}

${modelo ? `\nMODELO DE REFERÊNCIA (siga esta estrutura):\n${modelo}\n` : ''}

DIRETRIZES:
1. Use o tom especificado: ${tone}
2. Destaque benefícios concretos (ROI, empregabilidade, reconhecimento)
3. ${keywords ? `Inclua obrigatoriamente as palavras-chave: ${keywords}` : 'Use palavras-chave relevantes'}
4. ${cta ? `Use este CTA: "${cta}"` : 'Crie um CTA forte'}
5. Use hashtags estratégicas focadas em: construção civil, engenharia, BIM, pós-graduação
6. Seja autêntico e crie conexão emocional com o público

Retorne o post completo, pronto para publicar.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          post_text: {
            type: "string",
            description: "Texto completo do post"
          },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description: "Lista de hashtags sugeridas"
          },
          best_time_to_post: {
            type: "string",
            description: "Melhor horário para publicar (ex: '18h-20h durante a semana')"
          },
          image_suggestions: {
            type: "array",
            items: { type: "string" },
            description: "Sugestões de elementos visuais para a imagem do post"
          },
          alternative_versions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                tone: { type: "string" }
              }
            },
            description: "2-3 versões alternativas do post com tons diferentes"
          }
        }
      }
    });

    return Response.json({
      success: true,
      platform,
      content: response,
      especializacao_nome: especializacao.nome
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});