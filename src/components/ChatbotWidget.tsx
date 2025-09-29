import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotWidgetProps {
  className?: string;
}

export default function ChatbotWidget({ className = '' }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Namaste! 🙏 I\'m your Ayurvedic wellness assistant. Ask me anything about Ayurveda, Panchakarma therapies, dosha-based diet plans, or natural remedies!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AyurSutra Ayurvedic Assistant'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are an expert Ayurvedic assistant from India. 
Your only role is to answer user questions related to:
- Ayurveda principles and lifestyle
- Panchakarma therapies and treatments
- Ayurvedic diet plans based on body types (Vata, Pitta, Kapha)
- Preventive health, wellness, and natural remedies from Ayurveda

Guidelines:
- Always keep responses accurate, practical, and rooted in authentic Ayurvedic knowledge.
- Provide step-by-step explanations where useful.
- Use simple and clear language, easy for a beginner to understand.
- Write in plain text format without any special characters, markdown, asterisks, or formatting symbols.
- Use numbered lists for steps and simple bullet points for lists.
- Organize information in clean paragraphs with clear structure.
- Do not answer anything unrelated to Ayurveda, Panchakarma, or Ayurvedic diet.
- Never ask the user to log in; the chatbot must always answer directly.
- Keep responses concise but informative, ideally 2-4 paragraphs.
- Use traditional Ayurvedic terms but explain them in simple language.
- Write responses as if speaking directly to the person in a conversational tone.`
            },
            {
              role: 'user',
              content: userMessage.text
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const rawBotResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue. Please try asking your Ayurvedic question again.';
      
      // Clean and format the AI response
      const cleanBotResponse = formatAIResponse(rawBotResponse);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanBotResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble connecting right now. Please check your internet connection and try again, or contact our support team for Ayurvedic guidance.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Function to clean and format AI response text
  const formatAIResponse = (text: string): string => {
    let cleanText = text
      // Remove markdown asterisks and bold formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      
      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')
      
      // Convert markdown bullet points to clean format
      .replace(/^\s*[-*+]\s+/gm, '• ')
      
      // Convert numbered lists to clean format
      .replace(/^\s*\d+\.\s+/gm, (match, offset, string) => {
        const lineNum = string.substring(0, offset).split('\n').length;
        return `${lineNum}. `;
      })
      
      // Remove extra special characters and clean up
      .replace(/[_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove markdown links, keep text
      
      // Clean up excessive whitespace and line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      
      // Format paragraphs with proper spacing
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');

    return cleanText;
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Widget */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-gradient-to-b from-amber-50 to-emerald-50 rounded-2xl shadow-2xl border border-emerald-200/50 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Ayurvedic Assistant</h3>
                <p className="text-emerald-100 text-xs">Online • Ready to help</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 h-64 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-white/80 text-gray-800 rounded-bl-md border border-emerald-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-emerald-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white/80 p-3 rounded-2xl rounded-bl-md border border-emerald-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-emerald-200/50 bg-white/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Ayurveda, doshas, or treatments..."
                className="flex-1 px-3 py-2 text-sm border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 placeholder-gray-500"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      {/* Notification Badge */}
      {!isOpen && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
    </div>
  );
}
