import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { MessageCircle, X, Send, ChevronRight, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function Chatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [leadInfo, setLeadInfo] = useState({ nome: '', whatsapp: '', collectingName: false, collectingWhatsApp: false, leadCreated: false });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Check authentication status and initialize chatbot flow
  useEffect(() => {
    const checkAuthAndInitChat = async () => {
      try {
        const authStatus = await base44.auth.isAuthenticated();
        setIsAuthenticated(authStatus);

        const storedConversationId = localStorage.getItem('chatbotConversationId');
        const storedLeadInfo = localStorage.getItem('chatbotLeadInfo');
        const leadData = storedLeadInfo ? JSON.parse(storedLeadInfo) : {};

        if (authStatus) {
          // User is logged in, directly initialize agent conversation
          if (storedConversationId) {
            await initializeAgentConversation(storedConversationId);
          } else {
            await initializeAgentConversation();
          }
        } else {
          // User is not logged in, manage lead capture flow
          if (leadData.nome && leadData.whatsapp) {
            // Lead info already collected
            setLeadInfo({ ...leadData, leadCreated: true });
            if (storedConversationId) {
              await initializeAgentConversation(storedConversationId);
            } else {
              await initializeAgentConversation();
            }
          } else {
            // Start lead capture flow
            setMessages([
              {
                role: 'assistant',
                content: 'Olá! Sou seu Coordenador Digital. Para que eu possa te ajudar melhor, qual é o seu nome?',
                created_date: new Date().toISOString()
              }
            ]);
            setLeadInfo(prev => ({ ...prev, collectingName: true }));
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar chatbot:', error);
      }
    };

    checkAuthAndInitChat();
  }, []);

  // Effect for messages scrolling
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generic function to initialize or resume agent conversation
  const initializeAgentConversation = async (existingConversationId = null) => {
    try {
      let currentConversationId = existingConversationId || localStorage.getItem('chatbotConversationId');
      
      if (!currentConversationId) {
        const user = isAuthenticated ? await base44.auth.me() : null;
        const conversation = await base44.agents.createConversation({
          agent_name: 'coordenador_digital',
          metadata: {
            name: isAuthenticated ? `Conversa com ${user?.full_name}` : 'Conversa de Lead',
            page: location.pathname
          }
        });
        currentConversationId = conversation.id;
        localStorage.setItem('chatbotConversationId', conversation.id);
      } else {
        // Verify conversation exists
        try {
          await base44.agents.getConversation(currentConversationId);
        } catch (error) {
          console.warn('Stored conversation invalid, creating new one.');
          localStorage.removeItem('chatbotConversationId');
          const user = isAuthenticated ? await base44.auth.me() : null;
          const conversation = await base44.agents.createConversation({
            agent_name: 'coordenador_digital',
            metadata: {
              name: isAuthenticated ? `Conversa com ${user?.full_name}` : 'Conversa de Lead',
              page: location.pathname
            }
          });
          currentConversationId = conversation.id;
          localStorage.setItem('chatbotConversationId', conversation.id);
        }
      }
      
      setConversationId(currentConversationId);
      const unsubscribe = base44.agents.subscribeToConversation(currentConversationId, (data) => {
        setMessages(data.messages || []);
        setIsLoadingAI(false);
      });
      
      return () => unsubscribe();

    } catch (error) {
      console.error('Erro ao inicializar conversa do agente:', error);
      setIsLoadingAI(false);
    }
  };

  const sendToAgent = async (content, convId) => {
    if (!convId) {
      console.error('sendToAgent called without conversation ID');
      setIsLoadingAI(false);
      return;
    }
    try {
      const conversation = await base44.agents.getConversation(convId);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: content
      });
    } catch (error) {
      console.error('Erro ao adicionar mensagem ao agente:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.', 
        created_date: new Date().toISOString() 
      }]);
      setIsLoadingAI(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsLoadingAI(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage, created_date: new Date().toISOString() }]);

    try {
      if (!isAuthenticated && !leadInfo.leadCreated) {
        // Lead capture flow for non-logged-in users
        if (leadInfo.collectingName) {
          // User just provided name
          setLeadInfo(prev => ({ ...prev, nome: userMessage, collectingName: false, collectingWhatsApp: true }));
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Obrigado, ${userMessage}! Agora, por favor, me informe seu WhatsApp (com DDD) para que eu possa te enviar informações e continuar a conversa, se necessário.`,
            created_date: new Date().toISOString()
          }]);
          setIsLoadingAI(false);
        } else if (leadInfo.collectingWhatsApp) {
          // User just provided WhatsApp
          const whatsappCleaned = userMessage.replace(/\D/g, '');
          if (whatsappCleaned.length < 10 || whatsappCleaned.length > 13) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Por favor, insira um número de WhatsApp válido (ex: 5581999999999).',
              created_date: new Date().toISOString()
            }]);
            setIsLoadingAI(false);
            return;
          }

          setLeadInfo(prev => ({ ...prev, whatsapp: whatsappCleaned, collectingWhatsApp: false, leadCreated: true }));
          
          const leadPayload = {
            nome: leadInfo.nome,
            whatsapp: whatsappCleaned,
            origem: 'Chatbot',
            mensagem_inicial: `Lead capturado via Chatbot. Nome: ${leadInfo.nome}, WhatsApp: ${whatsappCleaned}`,
            historico_interacoes: [{
              data: new Date().toISOString(),
              tipo: 'Mensagem Chatbot',
              conteudo: `Lead capturado - Nome: ${leadInfo.nome}, WhatsApp: ${whatsappCleaned}`,
              usuario: 'chatbot'
            }]
          };
          
          await base44.entities.Lead.create(leadPayload);
          localStorage.setItem('chatbotLeadInfo', JSON.stringify({ nome: leadInfo.nome, whatsapp: whatsappCleaned }));
          toast.success('Seu contato foi salvo! Um especialista pode entrar em contato.');

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Perfeito! Seu contato foi salvo. Agora posso te ajudar. Qual a sua dúvida sobre a ESUDA?`,
            created_date: new Date().toISOString()
          }]);
          setIsLoadingAI(false);
          
          // Initialize agent conversation after lead capture
          await initializeAgentConversation();
        }
      } else {
        // Normal interaction - send to agent
        if (!conversationId) {
          await initializeAgentConversation();
          // Wait a bit for conversation to be initialized
          setTimeout(() => {
            if (conversationId) {
              sendToAgent(`[Página: ${location.pathname}] ${userMessage}`, conversationId);
            }
          }, 500);
        } else {
          const contextPrefix = !isAuthenticated ? `[LEAD: ${leadInfo.nome}, WhatsApp: ${leadInfo.whatsapp}, Página: ${location.pathname}]` : `[Página: ${location.pathname}]`;
          await sendToAgent(`${contextPrefix} ${userMessage}`, conversationId);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem ou capturar lead:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.',
        created_date: new Date().toISOString()
      }]);
      setIsLoadingAI(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const renderMessageContent = (content) => {
    // Converter links de página para links clicáveis
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    return (
      <ReactMarkdown
        components={{
          a: ({ node, children, href, ...props }) => {
            // Verificar se é um link de página interna
            const pageNames = ['EspecializacoesPage', 'CiclosPage', 'DiferenciaisPage', 'EmAcaoPage', 
                              'CalendarioDeAula', 'IncubadoraProfissionalPage', 'CoordenadorPage', 
                              'ProfessoresPage', 'DepoimentosPage', 'UpgradePage', 'Homepage'];
            
            if (pageNames.includes(href)) {
              return (
                <Link 
                  to={createPageUrl(href)} 
                  className="text-blue-600 hover:text-blue-800 underline font-semibold"
                  onClick={() => setIsOpen(false)}
                  {...props}
                >
                  {children}
                </Link>
              );
            }
            
            // Link externo
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

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
            <CardTitle className="text-lg">Coordenador Digital</CardTitle>
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
        <p className="text-xs text-green-100 mt-1">🤖 Assistente treinado pelo Coordenador Emanoel</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm">
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-line">{message.content}</p>
                  ) : (
                    renderMessageContent(message.content)
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                {new Date(message.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoadingAI && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <p className="text-sm text-gray-600">Coordenador Digital está pensando...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isAuthenticated && !leadInfo.leadCreated && leadInfo.collectingName 
                ? "Digite seu nome..." 
                : !isAuthenticated && !leadInfo.leadCreated && leadInfo.collectingWhatsApp 
                ? "Digite seu WhatsApp..." 
                : "Digite sua pergunta..."
            }
            className="flex-1"
            disabled={isLoadingAI}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-green-600 hover:bg-green-700"
            disabled={!inputValue.trim() || isLoadingAI}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}