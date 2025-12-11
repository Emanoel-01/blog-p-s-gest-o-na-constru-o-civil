import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { MessageCircle, X, Send, ChevronRight, ExternalLink } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Olá! 👋 Sou o assistente virtual da ESUDA. Para iniciarmos, por favor me informe seu nome:',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [leadInfo, setLeadInfo] = useState({ nome: '', whatsapp: '', collectingName: true, collectingWhatsApp: false });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const messagesEndRef = useRef(null);
  const [userBehavior, setUserBehavior] = useState({
    currentPage: window.location.pathname,
    timeOnPage: 0,
    pagesVisited: [],
    proactiveMessageSent: false
  });
  const [detectedInterests, setDetectedInterests] = useState([]);

  const { data: faqs = [] } = useQuery({
    queryKey: ['chatbot-faqs'],
    queryFn: async () => {
      const all = await base44.entities.ChatbotFAQ.list('ordem');
      return all.filter(f => f.ativo !== false);
    }
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes-chatbot'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-chatbot'],
    queryFn: () => base44.entities.Post.list('-ordem')
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tracking de comportamento do usuário
  useEffect(() => {
    let timeCounter = 0;
    const interval = setInterval(() => {
      timeCounter += 1;
      setUserBehavior(prev => ({
        ...prev,
        timeOnPage: timeCounter
      }));

      // Mensagem proativa após 30 segundos em uma página
      if (timeCounter === 30 && !userBehavior.proactiveMessageSent && !leadInfo.collectingName && !leadInfo.collectingWhatsApp) {
        sendProactiveMessage();
      }
    }, 1000);

    // Detectar mudanças de página
    const handlePageChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== userBehavior.currentPage) {
        setUserBehavior(prev => ({
          ...prev,
          currentPage: currentPath,
          pagesVisited: [...prev.pagesVisited, currentPath],
          timeOnPage: 0
        }));
        detectPageInterest(currentPath);
      }
    };

    window.addEventListener('popstate', handlePageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePageChange);
    };
  }, [userBehavior.proactiveMessageSent, leadInfo]);

  const detectPageInterest = (path) => {
    const interests = [];
    
    if (path.includes('BIM') || path.includes('Ciclos')) {
      interests.push('BIM');
    }
    if (path.includes('GPO') || path.includes('Projetos')) {
      interests.push('Gestão de Projetos e Obras');
    }
    if (path.includes('Predial') || path.includes('Manutencao')) {
      interests.push('Manutenção Predial');
    }
    if (path.includes('Legal') || path.includes('Juridic')) {
      interests.push('Engenharia Legal');
    }
    if (path.includes('Incubadora')) {
      interests.push('Incubadora Profissional');
    }
    if (path.includes('Especializacoes')) {
      interests.push('Geral');
    }
    
    setDetectedInterests(prev => [...new Set([...prev, ...interests])]);
  };

  const sendProactiveMessage = () => {
    const pageName = userBehavior.currentPage.split('/').pop() || 'esta página';
    const proactiveMessages = [
      `Vejo que você está explorando nossa ${pageName}! 😊 Posso ajudar com alguma dúvida específica?`,
      `Notei seu interesse! Quer saber mais sobre nossas especializações? Estou aqui para ajudar! 🎓`,
      `Está procurando algo específico? Posso te orientar sobre cursos, inscrições ou tirar dúvidas! 💡`
    ];

    const randomMessage = proactiveMessages[Math.floor(Math.random() * proactiveMessages.length)];
    
    setMessages(prev => [...prev, {
      type: 'bot',
      text: randomMessage,
      timestamp: new Date()
    }]);
    
    setUserBehavior(prev => ({ ...prev, proactiveMessageSent: true }));
  };

  const detectUserIntent = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Mapeamento de intenções
    const intents = {
      inscricao: ['inscri', 'matricul', 'entrar', 'começar', 'iniciar', 'me inscrever', 'como faço'],
      preco: ['valor', 'preço', 'quanto custa', 'mensalid', 'parcela', 'pagamento', 'custo'],
      duvida_curso: ['diferença', 'qual curso', 'melhor', 'escolher', 'recomendar', 'indicar'],
      horario: ['horário', 'quando', 'que horas', 'dia', 'aula'],
      duracao: ['duração', 'quanto tempo', 'meses', 'termina'],
      online_presencial: ['online', 'presencial', 'ead', 'remoto', 'híbrido', 'formato'],
      contato: ['falar', 'contato', 'whatsapp', 'telefone', 'coordenador'],
      conteudo: ['artigo', 'post', 'blog', 'ler', 'material', 'conteúdo']
    };

    const detected = [];
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detected.push(intent);
      }
    }

    return detected;
  };

  const findBestMatch = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Busca por correspondência exata ou parcial
    const matches = faqs.filter(faq => {
      const lowerPergunta = faq.pergunta.toLowerCase();
      return lowerMessage.includes(lowerPergunta) || lowerPergunta.includes(lowerMessage);
    });

    if (matches.length > 0) {
      // Retorna a melhor correspondência (pela ordem de prioridade)
      return matches[0];
    }

    return null;
  };

  const getRelevantContent = (interests) => {
    if (!interests || interests.length === 0 || posts.length === 0) return [];
    
    // Buscar posts relacionados aos interesses
    const relevantPosts = posts.filter(post => {
      return interests.some(interest => 
        post.titulo?.toLowerCase().includes(interest.toLowerCase()) ||
        post.descricao?.toLowerCase().includes(interest.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
      );
    }).slice(0, 3);

    return relevantPosts;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Coleta de informações do lead
    if (leadInfo.collectingName) {
      setLeadInfo({ ...leadInfo, nome: inputValue, collectingName: false, collectingWhatsApp: true });
      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          text: `Prazer em conhecê-lo, ${inputValue}! 😊 Agora, por favor, informe seu número de WhatsApp para que possamos enviar informações adicionais:`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 500);
      setInputValue('');
      return;
    }

    if (leadInfo.collectingWhatsApp) {
      setLeadInfo({ ...leadInfo, whatsapp: inputValue, collectingWhatsApp: false });
      
      // Salva o lead no banco de dados
      try {
        await base44.entities.Lead.create({
          nome: leadInfo.nome,
          whatsapp: inputValue,
          origem: 'Chatbot',
          mensagem_inicial: '',
          status: 'Novo'
        });
      } catch (error) {
        console.error('Erro ao salvar lead:', error);
      }

      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          text: `Perfeito, ${leadInfo.nome}! Obrigado pelas informações. 🎓 Agora me diga: como posso ajudar você hoje?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 500);
      setInputValue('');
      return;
    }

    // Detectar intenção do usuário
    const userIntents = detectUserIntent(inputValue);
    
    // Busca resposta nas FAQs primeiro
    const match = findBestMatch(inputValue);
    
    if (match) {
      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          text: match.resposta,
          pagina_destino: match.pagina_destino,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 500);
      setInputValue('');
      return;
    }

    // Se não encontrar nas FAQs, usa IA para responder
    setIsLoadingAI(true);
    try {
      const conversationHistory = messages.map(m => `${m.type === 'user' ? 'Usuário' : 'Assistente'}: ${m.text}`).join('\n');
      
      // Detectar qual especialização está sendo discutida
      const especializacoesInfo = especializacoes.map(e => ({
        nome: e.nome,
        link: e.link_externo,
        id: e.id
      }));

      // Buscar conteúdo relevante
      const relevantContent = getRelevantContent([...detectedInterests, inputValue]);
      const contentInfo = relevantContent.map(p => ({
        titulo: p.titulo,
        descricao: p.descricao,
        data: p.data
      }));
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o assistente virtual da ESUDA - Pós-Graduação em Gestão e Tecnologias na Construção Civil.

ANÁLISE DE COMPORTAMENTO DO USUÁRIO:
- Páginas visitadas: ${userBehavior.pagesVisited.join(', ') || 'Nenhuma ainda'}
- Interesses detectados: ${detectedInterests.join(', ') || 'Nenhum ainda'}
- Intenções identificadas na mensagem atual: ${userIntents.join(', ') || 'Nenhuma específica'}

CONTEÚDO RELEVANTE DISPONÍVEL:
${contentInfo.length > 0 ? contentInfo.map((c, i) => `${i + 1}. ${c.titulo} (${c.data}) - ${c.descricao}`).join('\n') : 'Nenhum conteúdo específico encontrado'}


Contexto da conversa:
${conversationHistory}

Pergunta atual do usuário: ${inputValue}

Informações importantes sobre a ESUDA:
- Especializações oferecidas: BIM, Gestão de Projetos e Obras (GPO 4.0), Manutenção Predial (Predial 4.0) e Engenharia Legal
- Todas têm 360 horas mínimas de carga horária
- Formato híbrido: matérias de gestão EAD, matérias técnicas 100% presenciais
- Duração: 10 meses
- Desconto para quem mora a mais de 70km: 50% na mensalidade
- TCC é opcional e gratuito
- Ex-alunos têm matrícula grátis (1ª parcela)
- Programa "Quem Indica Amigo É": última mensalidade grátis se indicar alguém que se matricule
- Aulas gravadas disponíveis na plataforma
- Instagram oficial: @esudapos
- WhatsApp do coordenador: (81) 99129-8803

Especializações disponíveis:
${especializacoesInfo.map(e => `- ${e.nome}${e.link ? ` (link: ${e.link})` : ''}`).join('\n')}

INSTRUÇÕES IMPORTANTES:

1. **RECONHECIMENTO DE INTENÇÃO**: Com base nas intenções detectadas acima, adapte sua resposta:
   - Se a intenção é "inscricao": Seja direto sobre o processo e próximos passos
   - Se a intenção é "preco": Foque em condições de pagamento e benefícios
   - Se a intenção é "duvida_curso": Compare cursos e ajude na escolha
   - Se a intenção é "contato": Facilite o contato direto com o coordenador
   - Se a intenção é "conteudo": Recomende o conteúdo relevante listado acima

2. **PERSONALIZAÇÃO**: Use o histórico de comportamento e interesses detectados para:
   - Recomendar conteúdo (artigos/posts) se houver disponível
   - Sugerir a especialização mais alinhada aos interesses
   - Adaptar o tom da conversa (mais comercial para inscrição, mais consultivo para dúvidas)

3. **CALL-TO-ACTION CONTEXTUAL**: Analise o contexto da conversa para decidir:
   - Dúvidas básicas: "Quer tirar mais dúvidas diretamente com o coordenador?"
   - Inscrição/matrícula: "Deseja se inscrever agora com ajuda do coordenador?"
   - Carreira/especialização: "Deseja uma consultoria de carreira exclusiva com o próprio coordenador do curso?"
   - Indeciso entre cursos: "Deseja que o coordenador te oriente sobre qual especialização escolher?"

4. **RECOMENDAÇÃO DE CONTEÚDO**: Se houver posts/artigos relevantes, mencione-os naturalmente na resposta

Responda de forma clara, objetiva e amigável. Se a pergunta for sobre informações específicas que você não tem certeza, sugira que o usuário entre em contato pelo Instagram @esudapos. 

Formato da resposta esperado:
{
  "resposta": "sua resposta aqui (mencione conteúdo relevante se houver)",
  "especializacao_relevante": "nome da especialização mais relevante ou null",
  "cta_whatsapp": "texto do call-to-action para WhatsApp baseado no contexto",
  "posts_recomendados": ["titulo1", "titulo2"] ou []
}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            resposta: { type: "string" },
            especializacao_relevante: { type: "string" },
            cta_whatsapp: { type: "string" },
            posts_recomendados: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Atualizar lead com categoria de interesse e última interação
      try {
        const leadExistente = await base44.entities.Lead.filter({ whatsapp: leadInfo.whatsapp });
        
        if (leadExistente && leadExistente.length > 0) {
          const lead = leadExistente[0];
          const historico = lead.historico_interacoes || [];
          
          // Adicionar nova interação ao histórico
          historico.push({
            data: new Date().toISOString(),
            tipo: 'Mensagem Chatbot',
            conteudo: `Usuário: ${inputValue}\nAssistente: ${response.resposta}`,
            usuario: 'Chatbot'
          });

          // Categorizar automaticamente baseado na especialização relevante
          let categorias = lead.categoria_interesse || [];
          if (response.especializacao_relevante) {
            const categoria = response.especializacao_relevante;
            if (!categorias.includes(categoria)) {
              categorias.push(categoria);
            }
          }

          await base44.entities.Lead.update(lead.id, {
            ultima_interacao: new Date().toISOString(),
            historico_interacoes: historico,
            categoria_interesse: categorias,
            interesse: response.especializacao_relevante || lead.interesse,
            dias_sem_resposta: 0
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar lead:', error);
      }

      // Salvar pergunta sem resposta adequada se a IA sugerir contato
      const respostaLower = response.resposta.toLowerCase();
      if (respostaLower.includes('instagram') || respostaLower.includes('entre em contato') || 
          respostaLower.includes('visite') || respostaLower.includes('não tenho')) {
        try {
          await base44.entities.PerguntaSemResposta.create({
            pergunta: inputValue,
            resposta_ia: response.resposta,
            lead_nome: leadInfo.nome,
            lead_whatsapp: leadInfo.whatsapp,
            status: 'Pendente'
          });
        } catch (error) {
          console.error('Erro ao salvar pergunta sem resposta:', error);
        }
      }

      // Encontrar especialização relevante se mencionada
      let especLink = null;
      if (response.especializacao_relevante) {
        const espec = especializacoes.find(e => 
          e.nome.toLowerCase().includes(response.especializacao_relevante.toLowerCase()) ||
          response.especializacao_relevante.toLowerCase().includes(e.nome.toLowerCase())
        );
        if (espec && espec.link_externo) {
          especLink = espec.link_externo;
        }
      }

      // Buscar posts recomendados pela IA
      let postsRecomendados = [];
      if (response.posts_recomendados && response.posts_recomendados.length > 0) {
        postsRecomendados = posts.filter(p => 
          response.posts_recomendados.some(titulo => 
            p.titulo.toLowerCase().includes(titulo.toLowerCase()) ||
            titulo.toLowerCase().includes(p.titulo.toLowerCase())
          )
        );
      }

      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          text: response.resposta,
          timestamp: new Date(),
          especializacao_link: especLink,
          cta_whatsapp: response.cta_whatsapp,
          posts_recomendados: postsRecomendados
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoadingAI(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao consultar IA:', error);
      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          text: 'Desculpe, tive um problema ao processar sua pergunta. Entre em contato conosco através do Instagram @esudapos ou visite nossa página de especializações para mais informações.',
          pagina_destino: 'EspecializacoesPage',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoadingAI(false);
      }, 500);
    }

    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'Como faço para me inscrever?',
    'Quais cursos vocês oferecem?',
    'Qual o valor da mensalidade?',
    'Como entrar em contato?'
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-2xl z-50 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <CardTitle className="text-lg">Assistente ESUDA</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-green-100 mt-1">Online • Sempre disponível</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
              </div>
              
              <div className="mt-2 space-y-2">
                {message.especializacao_link && (
                  <a href={message.especializacao_link} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-blue-500 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver página da Especialização
                    </Button>
                  </a>
                )}
                
                {message.pagina_destino && (
                  <Link to={createPageUrl(message.pagina_destino)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-green-500 text-green-700 hover:bg-green-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Ir para a página <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
                
                {message.cta_whatsapp && (
                  <a 
                    href="https://wa.me/5581991298803" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      className="w-full text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                      💬 {message.cta_whatsapp}
                    </Button>
                  </a>
                )}

                {message.posts_recomendados && message.posts_recomendados.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs text-gray-600 font-semibold">📚 Conteúdo Recomendado:</p>
                    {message.posts_recomendados.map((post, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <h6 className="text-xs font-bold text-gray-800 mb-1">{post.titulo}</h6>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{post.descricao}</p>
                        <Link to={createPageUrl('EmAcaoPage')}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border-gray-300 hover:bg-gray-100"
                            onClick={() => setIsOpen(false)}
                          >
                            Ler artigo completo <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoadingAI && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <p className="text-sm text-gray-600">Pensando...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {messages.length > 4 && !leadInfo.collectingName && !leadInfo.collectingWhatsApp && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Perguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-green-50 text-xs"
                onClick={() => setInputValue(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-green-600 hover:bg-green-700"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}