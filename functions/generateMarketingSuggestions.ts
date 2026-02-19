import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado: apenas administradores' }, { status: 403 });
    }

    const { type, entity_id } = await req.json();

    // Buscar dados baseados no tipo
    let contextData = {};
    let suggestions = {};

    if (type === 'especializacao') {
      const espec = await base44.asServiceRole.entities.Especializacao.filter({ id: entity_id });
      if (!espec || espec.length === 0) {
        return Response.json({ error: 'Especialização não encontrada' }, { status: 404 });
      }
      
      contextData = espec[0];

      // Gerar sugestões com IA
      const prompt = `
Você é um especialista em marketing educacional. Com base nos dados abaixo, gere sugestões criativas de marketing:

**Especialização:** ${contextData.nome}
**Resumo:** ${contextData.resumo || 'Não informado'}
**Carga Horária:** ${contextData.carga_horaria_total}h
**Status:** ${contextData.status_inscricao}
**Duração:** ${contextData.duracao_meses} meses

Gere as seguintes sugestões em português brasileiro:
1. 3 títulos chamativos para posts em redes sociais (máx 80 caracteres cada)
2. 3 ideias de posts completos para Instagram/Facebook (máx 300 caracteres cada)
3. 2 linhas de assunto para email marketing (máx 60 caracteres cada)
4. 1 texto para anúncio do Google Ads (máx 150 caracteres)
5. 3 hashtags relevantes
`;

      const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            titulos_posts: { type: "array", items: { type: "string" } },
            posts_completos: { type: "array", items: { type: "string" } },
            assuntos_email: { type: "array", items: { type: "string" } },
            anuncio_google: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } }
          }
        }
      });

      suggestions = aiResponse;

    } else if (type === 'post') {
      const post = await base44.asServiceRole.entities.Post.filter({ id: entity_id });
      if (!post || post.length === 0) {
        return Response.json({ error: 'Post não encontrado' }, { status: 404 });
      }
      
      contextData = post[0];

      const prompt = `
Você é um especialista em marketing de conteúdo educacional. Com base no post abaixo, gere sugestões de divulgação:

**Título:** ${contextData.titulo}
**Descrição:** ${contextData.descricao}
**Categoria:** ${contextData.categoria_principal || 'Geral'}

Gere as seguintes sugestões em português brasileiro:
1. 3 títulos alternativos para redes sociais (máx 100 caracteres cada)
2. 3 legendas para Instagram (máx 250 caracteres cada, incluindo call-to-action)
3. 2 tweets (máx 280 caracteres cada)
4. 3 hashtags relevantes
5. 1 ideia de stories interativo
`;

      const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            titulos_alternativos: { type: "array", items: { type: "string" } },
            legendas_instagram: { type: "array", items: { type: "string" } },
            tweets: { type: "array", items: { type: "string" } },
            hashtags: { type: "array", items: { type: "string" } },
            ideia_stories: { type: "string" }
          }
        }
      });

      suggestions = aiResponse;

    } else if (type === 'geral') {
      // Sugestões gerais baseadas em leads e tendências
      const leads = await base44.asServiceRole.entities.Lead.list('', 20);
      const especializacoes = await base44.asServiceRole.entities.Especializacao.list();

      const prompt = `
Você é um estrategista de marketing educacional. Analise os dados abaixo e gere um plano de marketing:

**Total de Leads Recentes:** ${leads.length}
**Cursos Oferecidos:** ${especializacoes.length}
**Categorias Principais:** BIM, Gestão de Projetos e Obras, Manutenção Predial, Engenharia Legal

Gere as seguintes sugestões estratégicas em português brasileiro:
1. 3 campanhas de email marketing (título e descrição breve de cada)
2. 3 temas para webinars/lives
3. 3 ideias de conteúdo para blog
4. 2 promoções sazonais criativas
5. 3 parcerias estratégicas sugeridas
`;

      const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            campanhas_email: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" }
                }
              }
            },
            temas_webinars: { type: "array", items: { type: "string" } },
            ideias_blog: { type: "array", items: { type: "string" } },
            promocoes: { type: "array", items: { type: "string" } },
            parcerias: { type: "array", items: { type: "string" } }
          }
        }
      });

      suggestions = aiResponse;
    }

    return Response.json({ 
      success: true,
      type,
      suggestions,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});