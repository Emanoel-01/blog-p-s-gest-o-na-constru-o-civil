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

export default function Chatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [leadInfo, setLeadInfo] = useState({ nome: '', whatsapp: '', collectingName: true, collectingWhatsApp: false });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);
  // Inicializar conversa com o agente
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeConversation();
    }
  }, []);

  const initializeConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: 'coordenador_digital',
        metadata: {
          name: 'Nova Conversa',
          page: location.pathname
        }
      });
      setConversationId(conversation.id);
      
      // Inscrever para atualizações em tempo real
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Erro ao inicializar conversa:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    setIsLoadingAI(true);
    
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: `[Página atual: ${location.pathname}]\n\n${inputValue}`
      });
      
      setInputValue('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
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