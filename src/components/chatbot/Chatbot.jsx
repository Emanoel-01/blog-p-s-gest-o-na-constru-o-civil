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
            // Lead info already collected, resume agent conversation
            setLeadInfo({ ...leadData, leadCreated: true });
            if (storedConversationId) {
              await initializeAgentConversation(storedConversationId);
            } else {
              await initializeAgentConversation(null, `Olá, sou ${leadData.nome}. Meu WhatsApp é ${leadData.whatsapp}.`);
            }
          } else {
            // Start lead capture flow
            setMessages([
              {
                role: 'assistant',
                content: 'Olá! Sou o Coordenador Digital da ESUDA. Para melhor te atender, qual é o seu nome?',
                created_date: new Date().toISOString()
              }
            ]);
            setLeadInfo(prev => ({ ...prev, collectingName: true }));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };

    checkAuthAndInitChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize or resume agent conversation
  const initializeAgentConversation = async (existingConversationId = null, initialPrompt = null) => {
    try {
      let currentConversationId = existingConversationId;
      
      if (!currentConversationId) {
        let conversationName = 'Nova Conversa';
        
        if (isAuthenticated) {
          try {
            const user = await base44.auth.me();
            conversationName = `Conversa com ${user.full_name}`;
          } catch (error) {
            console.warn('Erro ao obter usuário:', error);
          }
        } else {
          conversationName = 'Conversa de Lead';
        }

        const conversation = await base44.agents.createConversation({
          agent_name: 'coordenador_digital',
          metadata: {
            name: conversationName,
            page: location.pathname
          }
        });
        currentConversationId = conversation.id;
        localStorage.setItem('chatbotConversationId', conversation.id);
      } else {
        // Validate existing conversation
        try {
          await base44.agents.getConversation(currentConversationId);
        } catch (error) {
          console.warn('Conversa inválida, criando nova:', error);
          localStorage.removeItem('chatbotConversationId');
          return await initializeAgentConversation(null, initialPrompt);
        }
      }
      
      setConversationId(currentConversationId);
      
      // Subscribe to conversation updates
      const unsubscribe = base44.agents.subscribeToConversation(currentConversationId, (data) => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
        setIsLoadingAI(false);
      });

      // Send initial prompt if provided
      if (initialPrompt) {
        await sendToAgent(initialPrompt, currentConversationId);
      }
      
      return () => unsubscribe();

    } catch (error) {
      console.error('Erro ao inicializar conversa:', error);
      setIsLoadingAI(false);
      toast.error('Erro ao iniciar conversa. Tente novamente.');
    }
  };

  const sendToAgent = async (content, convId) => {
    if (!convId) {
      console.error('sendToAgent: conversationId não fornecido');
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
      console.error('Erro ao enviar mensagem ao agente:', error);
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
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage, 
      created_date: new Date().toISOString() 
    }]);

    try {
      if (!isAuthenticated && !leadInfo.leadCreated) {
        // Lead capture flow for non-logged-in users
        if (leadInfo.collectingName) {
          // User provided name
          setLeadInfo(prev => ({ 
            ...prev, 
            nome: userMessage, 
            collectingName: false, 
            collectingWhatsApp: true 
          }));
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Prazer, ${userMessage}! Para que eu possa te enviar informações e dar continuidade ao atendimento, qual é o seu WhatsApp? (com DDD, ex: 81999999999)`,
            created_date: new Date().toISOString()
          }]);
          setIsLoadingAI(false);
          
        } else if (leadInfo.collectingWhatsApp) {
          // User provided WhatsApp
          const cleanWhatsApp = userMessage.replace(/\D/g, '');
          
          if (cleanWhatsApp.length < 10 || cleanWhatsApp.length > 13) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Por favor, insira um número de WhatsApp válido (ex: 81999999999 ou 5581999999999).',
              created_date: new Date().toISOString()
            }]);
            setIsLoadingAI(false);
            return;
          }

          const finalWhatsApp = cleanWhatsApp.length === 13 ? cleanWhatsApp : `55${cleanWhatsApp}`;
          
          setLeadInfo(prev => ({ 
            ...prev, 
            whatsapp: finalWhatsApp, 
            collectingWhatsApp: false, 
            leadCreated: true 
          }));
          
          // Create lead in database
          try {
            await base44.entities.Lead.create({
              nome: leadInfo.nome,
              whatsapp: finalWhatsApp,
              origem: 'Chatbot',
              mensagem_inicial: 'Iniciou conversa via Chatbot',
              interesse: 'Informações gerais',
              categoria_interesse: ['Geral'],
              historico_interacoes: [{
                data: new Date().toISOString(),
                tipo: 'Mensagem Chatbot',
                conteudo: `Lead capturado: ${leadInfo.nome} - ${finalWhatsApp}`,
                usuario: 'chatbot'
              }]
            });
            
            localStorage.setItem('chatbotLeadInfo', JSON.stringify({ 
              nome: leadInfo.nome, 
              whatsapp: finalWhatsApp 
            }));
            
            toast.success('Contato salvo! Agora posso te ajudar melhor.');
          } catch (error) {
            console.error('Erro ao criar lead:', error);
          }

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Perfeito! Seu contato foi salvo. Agora me conta: como posso te ajudar? Quer saber sobre nossas especializações, horários, valores ou tem alguma dúvida específica?`,
            created_date: new Date().toISOString()
          }]);
          setIsLoadingAI(false);
          
          // Initialize agent conversation now
          await initializeAgentConversation(null, `[LEAD: ${leadInfo.nome} | WhatsApp: ${finalWhatsApp} | Página: ${location.pathname}] Usuário conectado e pronto para conversar.`);
          
        } else {
          // Lead info collected, send to agent
          await sendToAgent(`[LEAD: ${leadInfo.nome} | WhatsApp: ${leadInfo.whatsapp} | Página: ${location.pathname}] ${userMessage}`, conversationId);
        }
      } else {
        // Normal interaction (authenticated user or lead already captured)
        const context = isAuthenticated ? 
          `[Página: ${location.pathname}]` : 
          `[LEAD: ${leadInfo.nome} | WhatsApp: ${leadInfo.whatsapp} | Página: ${location.pathname}]`;
        
        await sendToAgent(`${context} ${userMessage}`, conversationId);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, houve um erro. Por favor, tente novamente.', 
        created_date: new Date().toISOString() 
      }]);
      setIsLoadingAI(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const renderMessageContent = (content) => {
    return (
      <ReactMarkdown
        components={{
          a: ({ node, children, href, ...props }) => {
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
        <p className="text-xs text-green-100 mt-1">🤖 Assistente treinado pelo Prof. Emanoel</p>
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
                <p className="text-sm text-gray-600">Pensando...</p>
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
              !isAuthenticated && !leadInfo.leadCreated && leadInfo.collectingName ? "Digite seu nome..." :
              !isAuthenticated && !leadInfo.leadCreated && leadInfo.collectingWhatsApp ? "Digite seu WhatsApp..." :
              "Digite sua pergunta..."
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