// src/components/ai/AIChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Badge } from '@/components/ui/premium/GlassCard';
import { PremiumButton } from '@/components/ui/premium/PremiumButton';
import { Send, Sparkles, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  typing?: boolean;
}

interface AIChatProps {
  onMinimize?: () => void;
  defaultOpen?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({
  onMinimize,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 I\'m your AI shopping assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(text),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  const generateAIResponse = (input: string): string => {
    const responses: Record<string, string> = {
      'help': 'I can help you find products, track orders, process returns, and answer questions about our store.',
      'recommend': 'Based on your preferences, I\'d recommend checking our trending items or personalized collection.',
      'track': 'You can track your order by going to "My Orders" in your account dashboard.',
      'return': 'Our return policy allows 30 days for returns. Would you like help initiating a return?',
      'default': 'That\'s a great question! Let me help you with that.',
    };

    const key = Object.keys(responses).find((k) =>
      input.toLowerCase().includes(k)
    ) || 'default';

    return responses[key];
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-40 w-96 max-w-full"
          >
            <GlassCard variant="premium" className="h-96 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onMinimize?.();
                  }}
                  className="hover:bg-white/20 p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-900/30">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-2',
                      msg.sender === 'user' && 'justify-end'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-xs px-4 py-2 rounded-2xl',
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-br-none'
                          : 'bg-slate-700/50 text-slate-100 rounded-bl-none'
                      )}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="bg-slate-700/50 text-slate-100 px-4 py-2 rounded-2xl rounded-bl-none">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex gap-1"
                      >
                        <div className="w-2 h-2 rounded-full bg-current" />
                        <div className="w-2 h-2 rounded-full bg-current" />
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage(input);
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                />
                <PremiumButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleSendMessage(input)}
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4" />
                </PremiumButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
};
