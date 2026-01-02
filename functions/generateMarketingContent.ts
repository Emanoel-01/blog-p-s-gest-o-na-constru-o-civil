import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { prompt, tipo = 'email', contexto = {} } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    let systemPrompt = '';
    
    if (tipo === 'email') {
      systemPrompt = `Você é um especialista em marketing educacional para pós-graduação em Engenharia Civil e Arquitetura.
Crie emails persuasivos, profissionais e diretos. Inclua:
- Assunto atrativo
- Introdução envolvente
- Corpo do email com proposta de valor clara
- Call-to-action forte
- Assinatura profissional

Contexto adicional: ${JSON.stringify(contexto)}`;
    } else if (tipo === 'whatsapp') {
      systemPrompt = `Você é um especialista em marketing educacional para pós-graduação em Engenharia Civil e Arquitetura.
Crie mensagens curtas, diretas e persuasivas para WhatsApp. Máximo 3 parágrafos curtos.
Inclua emojis relevantes e um CTA claro.

Contexto adicional: ${JSON.stringify(contexto)}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;

    return Response.json({
      success: true,
      content: content,
      tipo: tipo,
      prompt_usado: prompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});