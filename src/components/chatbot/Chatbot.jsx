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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o assistente virtual da ESUDA - Pós-Graduação em Gestão e Tecnologias na Construção Civil.

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

IMPORTANTE: Analise o contexto da conversa para decidir qual call-to-action usar ao final:
- Se o usuário está tirando dúvidas básicas: "Quer tirar mais dúvidas diretamente com o coordenador?"
- Se perguntou sobre inscrição/matrícula: "Deseja se inscrever agora com ajuda do coordenador?"
- Se perguntou sobre carreira/especialização: "Deseja uma consultoria de carreira exclusiva com o próprio coordenador do curso?"
- Se está indeciso entre cursos: "Deseja que o coordenador te oriente sobre qual especialização escolher?"

Responda de forma clara, objetiva e amigável. Se a pergunta for sobre informações específicas que você não tem certeza, sugira que o usuário entre em contato pelo Instagram @esudapos. 

Ao final da resposta, SEMPRE inclua:
1. Um link para a página da especialização relevante (se houver)
2. Uma call-to-action personalizada para falar com o coordenador via WhatsApp

Formato da resposta esperado:
{
  "resposta": "sua resposta aqui",
  "especializacao_relevante": "nome da especialização mais relevante ou null",
  "cta_whatsapp": "texto do call-to-action para WhatsApp baseado no contexto"
}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            resposta: { type: "string" },
            especializacao_relevante: { type: "string" },
            cta_whatsapp: { type: "string" }
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

      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          text: response.resposta,
          timestamp: new Date(),
          especializacao_link: especLink,
          cta_whatsapp: response.cta_whatsapp
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