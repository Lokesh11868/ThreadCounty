"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Maximize2, Send, Bot, Loader2 } from 'lucide-react';
import { chatbotApi } from '@/lib/apiClient';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function FloatingChatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about your fabric analysis. 🧵' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const btnRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const systemMsg = { role: 'system', content: 'You are ThreadCounty AI. You must respond in very short sentences. Use bullet points when listing items. Do not write long paragraphs. Keep it brief and engaging.' };
      const history = [systemMsg, ...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await chatbotApi.sendMessage(history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply || res.message || 'Got it!' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatBullets = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return <li key={i} className="ml-3 list-disc">{line.replace(/^[-•]\s/, '')}</li>;
      }
      return line.trim() ? <p key={i} className="mb-1">{line}</p> : null;
    });
  };

  return (
    <div
      ref={btnRef}
      style={{ position: 'fixed', bottom: pos.y === 0 ? 24 : 'auto', right: pos.x === 0 ? 24 : 'auto', top: pos.y !== 0 ? `calc(100vh - 24px + ${pos.y}px)` : 'auto', left: pos.x !== 0 ? `calc(100vw - 24px + ${pos.x}px)` : 'auto', zIndex: 9999 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">ThreadCounty AI</p>
                  <p className="text-[10px] text-muted-foreground">Fabric analysis assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { router.push('/chatbot'); setOpen(false); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Open full chat"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: '280px' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-xs px-3 py-2 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-foreground rounded-bl-sm'
                  }`}>
                    {m.role === 'assistant' ? (
                      <ul className="space-y-0.5">{formatBullets(m.content)}</ul>
                    ) : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask about fabric..."
                  className="flex-1 text-xs bg-secondary border-0 rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={send}
                  disabled={loading}
                  className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.div
        onMouseDown={onMouseDown}
        onClick={() => !dragging.current && setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-13 h-13 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center cursor-pointer select-none"
        style={{ width: 52, height: 52 }}
      >
        {open
          ? <X className="w-5 h-5 text-primary-foreground" />
          : <MessageSquare className="w-5 h-5 text-primary-foreground" />
        }
      </motion.div>
    </div>
  );
}
