import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { MessageCircle, X, Send, ChevronRight } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Olá! 👋 Sou o assistente virtual da ESUDA. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const { data: faqs = [] } = useQuery({
    queryKey: ['chatbot-faqs'],
    queryFn: async () => {
      const all = await base44.entities.ChatbotFAQ.list('ordem');
      return all.filter(f => f.ativo !== false);
    }
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Busca resposta nas FAQs
    setTimeout(() => {
      const match = findBestMatch(inputValue);
      
      if (match) {
        const botResponse = {
          type: 'bot',
          text: match.resposta,
          pagina_destino: match.pagina_destino,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        const botResponse = {
          type: 'bot',
          text: 'Desculpe, não encontrei uma resposta específica para sua pergunta. Entre em contato conosco através do Instagram @esuda.oficial ou visite nossa página de especializações para mais informações.',
          pagina_destino: 'EspecializacoesPage',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    }, 500);

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
                <p className="text-sm">{message.text}</p>
              </div>
              {message.pagina_destino && (
                <Link to={createPageUrl(message.pagina_destino)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs border-green-500 text-green-700 hover:bg-green-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Ir para a página <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {messages.length === 1 && (
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