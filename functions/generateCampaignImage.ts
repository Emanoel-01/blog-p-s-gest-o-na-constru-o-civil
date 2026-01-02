import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { prompt, size = '1024x1024', quality = 'standard' } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const enhancedPrompt = `Professional educational marketing image for civil engineering and architecture graduate programs. ${prompt}. High quality, modern, professional design with ESUDA branding style. Include elements related to construction, BIM, technology, and innovation.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: quality
    });

    const imageUrl = response.data[0].url;

    return Response.json({
      success: true,
      image_url: imageUrl,
      prompt_usado: enhancedPrompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});