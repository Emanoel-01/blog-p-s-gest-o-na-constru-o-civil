import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado: apenas administradores' }, { status: 403 });
    }

    const { prompt, news_source_type, news_source_value, keywords } = await req.json();

    let contextData = "";

    // 1. Coleta de Dados baseada no tipo de fonte
    if (news_source_type === 'url' && news_source_value) {
      try {
        const response = await fetch(news_source_value);
        const html = await response.text();
        contextData = html.replace(/<[^>]*>?/gm, '').substring(0, 8000);
      } catch (error) {
        console.warn('Erro ao buscar URL:', error);
        contextData = `Não foi possível acessar a URL fornecida.`;
      }
    } else if (news_source_type === 'search_terms' && news_source_value) {
      contextData = `Buscar informações sobre: ${news_source_value}`;
    } else if (news_source_type === 'rss_feed' && news_source_value) {
      try {
        const response = await fetch(news_source_value);
        const xml = await response.text();
        contextData = xml.substring(0, 8000);
      } catch (error) {
        console.warn('Erro ao buscar RSS:', error);
        contextData = `Não foi possível acessar o feed RSS fornecido.`;
      }
    }

    // 2. Geração do Conteúdo do Post (Texto)
    const aiPrompt = `Você é um redator de blog especialista em engenharia, arquitetura e construção civil.

Tema principal: ${prompt}
Palavras-chave: ${keywords || 'Nenhuma especificada'}
${contextData ? `Contexto/Notícias: ${contextData}` : ''}

Crie um post completo para blog seguindo este formato:
- Título atraente e profissional
- Descrição/resumo curto (1-2 frases)
- Conteúdo completo em HTML com tags <h2>, <p>, <ul>, <li>, <strong>, etc.

O conteúdo deve ser informativo, profissional e engajador.`;

    const textResponse = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      add_context_from_internet: news_source_type === 'search_terms',
      response_json_schema: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          descricao: { type: "string" },
          conteudo_completo: { type: "string" }
        },
        required: ["titulo", "descricao", "conteudo_completo"]
      }
    });

    const postData = textResponse;

    // 3. Sugestão de Imagens
    let imageUrls = [];
    try {
      const imagePrompt = `Uma imagem profissional, moderna e de alta qualidade para um blog post sobre: ${postData.titulo}. Estilo: fotorrealista, limpo, profissional`;
      
      const imageResponse = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });
      
      imageUrls = [imageResponse.url];
    } catch (imageError) {
      console.warn("Erro ao gerar imagem:", imageError);
    }

    // 4. Retorno dos dados consolidados
    return Response.json({
      success: true,
      titulo: postData.titulo,
      descricao: postData.descricao,
      conteudo_completo: postData.conteudo_completo,
      imagens_sugeridas: imageUrls,
      palavra_chave_principal: keywords ? keywords.split(',')[0].trim() : ''
    });

  } catch (error) {
    console.error('Erro na geração do post AI:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});