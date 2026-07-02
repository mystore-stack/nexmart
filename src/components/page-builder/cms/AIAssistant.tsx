'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2,
  Wand2,
  Layout,
  Type,
  Image as ImageIcon,
  ShoppingBag,
  Globe,
  ChevronRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIAssistantProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const AI_SUGGESTIONS = [
  {
    category: 'Page Generation',
    suggestions: [
      {
        icon: Layout,
        title: 'Generate Homepage',
        prompt: 'Create a complete luxury Moroccan marketplace homepage with hero, categories, featured products, testimonials, and footer'
      },
      {
        icon: Wand2,
        title: 'Generate Hero Banner',
        prompt: 'Create a luxury Moroccan marketplace hero banner with elegant colors, premium design, and compelling CTA'
      },
      {
        icon: ShoppingBag,
        title: 'Generate Entire Store',
        prompt: 'Generate a complete e-commerce store with homepage, product pages, cart, checkout, and all necessary sections'
      },
    ]
  },
  {
    category: 'Sections',
    suggestions: [
      {
        icon: Wand2,
        title: 'Generate Banner',
        prompt: 'Create a promotional banner with flash sale countdown and luxury design elements'
      },
      {
        icon: Layout,
        title: 'Generate Categories',
        prompt: 'Create a categories section with elegant category cards and hover effects'
      },
      {
        icon: ShoppingBag,
        title: 'Generate Product Layout',
        prompt: 'Create a product grid layout with luxury product cards, quick view, and add to cart functionality'
      },
      {
        icon: Sparkles,
        title: 'Generate Flash Sale',
        prompt: 'Create a flash sale section with countdown timer, discounted products, and urgency elements'
      },
      {
        icon: Star,
        title: 'Generate Luxury Layout',
        prompt: 'Apply luxury design principles with gold accents, elegant typography, and premium spacing'
      },
    ]
  },
  {
    category: 'Content & Copy',
    suggestions: [
      {
        icon: Type,
        title: 'Generate Marketing Copy',
        prompt: 'Write compelling marketing copy for the featured products section with persuasive language'
      },
      {
        icon: Sparkles,
        title: 'Generate CTA Copy',
        prompt: 'Create compelling call-to-action copy that drives conversions and engagement'
      },
      {
        icon: Globe,
        title: 'Translate Content',
        prompt: 'Translate all content to multiple languages for international customers'
      },
    ]
  },
  {
    category: 'Design & Theme',
    suggestions: [
      {
        icon: ImageIcon,
        title: 'Generate Color Palette',
        prompt: 'Generate a luxury color palette with complementary colors, gold accents, and elegant tones'
      },
      {
        icon: Layout,
        title: 'Generate Theme',
        prompt: 'Create a complete theme with typography, colors, spacing, and design system'
      },
      {
        icon: ImageIcon,
        title: 'Generate Icons',
        prompt: 'Generate custom icons that match the luxury Moroccan marketplace aesthetic'
      },
      {
        icon: ShoppingBag,
        title: 'Generate Collections',
        prompt: 'Create product collections with curated items and elegant presentation'
      },
    ]
  },
  {
    category: 'Optimization',
    suggestions: [
      {
        icon: Globe,
        title: 'Improve SEO',
        prompt: 'Optimize the homepage for SEO with better meta tags, descriptions, and structured data'
      },
      {
        icon: Sparkles,
        title: 'Improve Accessibility',
        prompt: 'Enhance accessibility with ARIA labels, keyboard navigation, and screen reader support'
      },
      {
        icon: Sparkles,
        title: 'Optimize Performance',
        prompt: 'Optimize performance with lazy loading, image optimization, and code splitting'
      },
    ]
  },
];

export function AIAssistant({ onClose, onGenerate }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. I can help you generate sections, improve content, and design your homepage. What would you like to create?' }
  ]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've generated the content for: "${prompt}". The section has been added to your homepage.` 
      }]);
      setIsGenerating(false);
      onGenerate(prompt);
      setPrompt('');
    }, 2000);
  };

  const handleSuggestion = (suggestionPrompt: string) => {
    setPrompt(suggestionPrompt);
    handleGenerate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-background rounded-2xl shadow-luxury-lg border border-border/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 bg-gradient-to-r from-brand-500/5 to-brand-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Powered by advanced AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="h-[400px] p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-brand-500 text-white'
                      : 'bg-muted/50 border border-border/40'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">U</span>
                  </div>
                )}
              </motion.div>
            ))}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                </div>
                <div className="bg-muted/50 border border-border/40 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Generating...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* AI Suggestions */}
        <div className="p-4 border-t border-border/40 bg-muted/30">
          <ScrollArea className="h-[200px]">
            <div className="space-y-4 pr-2">
              {AI_SUGGESTIONS.map((category) => (
                <div key={category.category}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 px-2">{category.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.title}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestion(suggestion.prompt)}
                        className="h-8 gap-2 text-xs"
                      >
                        <suggestion.icon className="w-3 h-3" />
                        {suggestion.title}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40">
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe what you want to create..."
              className="flex-1"
              disabled={isGenerating}
            />
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
