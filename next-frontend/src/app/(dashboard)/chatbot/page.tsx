"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotApi } from '@/lib/apiClient';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { 
  MessageSquare, Send, Bot, User, Trash2, Mic, MicOff, Sparkles, Loader2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const formatMessage = (text: string) => {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((para, pIdx) => {
    // Fenced code blocks
    if (para.trim().startsWith('```') && para.trim().endsWith('```')) {
      const code = para.trim().substring(3, para.trim().length - 3).replace(/^[a-zA-Z]+\n/, '');
      return (
        <pre key={pIdx} className="bg-secondary/60 text-secondary-foreground p-4 rounded-2xl overflow-x-auto text-xs my-2 font-mono border border-border/50">
          <code>{code}</code>
        </pre>
      );
    }

    // Bullet lists
    if (para.split('\n').every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
      return (
        <ul key={pIdx} className="list-disc pl-5 my-2 space-y-1 text-sm leading-relaxed">
          {para.split('\n').map((line, lIdx) => {
            const cleanLine = line.replace(/^[\s-*]+/, '');
            return <li key={lIdx}>{renderInline(cleanLine)}</li>;
          })}
        </ul>
      );
    }

    return (
      <p key={pIdx} className="text-sm leading-relaxed mb-2.5 last:mb-0">
        {renderInline(para)}
      </p>
    );
  });
};

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-secondary/80 px-1.5 py-0.5 rounded font-mono text-xs text-primary border border-border/20">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const SUGGESTIONS = [
  "How is fabric density calculated using FFT?",
  "What is the difference between twill and plain weave?",
  "How can I tell if denim has high quality?",
  "Can you explain Ends Per Inch (EPI)?"
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I am **ThreadCounty AI**, your virtual textile expert. Ask me anything about fabric analysis, weave types, thread density, or how our optical calculation tools work!" }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + ' ' + transcript);
    }
  }, [transcript]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Load chat history from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('threadcounty-chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveChat = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem('threadcounty-chat', JSON.stringify(newMsgs));
  };

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    saveChat(updatedMessages);
    setSending(true);

    try {
      // Send message history to Groq endpoint with system prompt
      const systemMsg = { role: 'system', content: 'You are ThreadCounty AI. You must respond in very short sentences. Use bullet points when listing items. Do not write long paragraphs. Keep it brief and engaging.' };
      const history = [systemMsg, ...updatedMessages].map(m => ({ role: m.role, content: m.content }));
      const response = await chatbotApi.sendMessage(history);
      saveChat([...updatedMessages, { role: 'assistant', content: response.content || response.reply || response.message }]);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to send message.',
        variant: 'destructive'
      });
      saveChat([...updatedMessages, { role: 'assistant', content: "Sorry, I had trouble processing that request. Please make sure `GROQ_API_KEY` is loaded on the server environment." }]);
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    const initialMsg: Message[] = [
      { role: 'assistant', content: "Hello! I am **ThreadCounty AI**, your virtual textile expert. Ask me anything about fabric analysis, weave types, thread density, or how our optical calculation tools work!" }
    ];
    saveChat(initialMsg);
    toast({ title: 'Chat cleared', description: 'Your conversation history has been reset.' });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold animate-fade-in" style={{ fontFamily: 'var(--font-display)' }}>AI Chatbot</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-13 mt-1">Ask questions and troubleshoot textile measurements.</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleClear} className="rounded-xl border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Clear conversation">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main chat window */}
      <div className="flex-1 bg-card rounded-3xl border border-border shadow-md flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const isAi = m.role === 'assistant';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-start gap-4 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isAi ? 'bg-gradient-to-br from-violet-500/10 to-teal-500/10 border border-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}>
                    {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>
                  
                  <div className={`rounded-2xl p-4 border shadow-sm ${isAi ? 'bg-card border-border text-foreground' : 'bg-primary/5 border-primary/10 text-foreground'}`}>
                    {formatMessage(m.content)}
                  </div>
                </motion.div>
              );
            })}

            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 max-w-[85%] mr-auto"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/10 to-teal-500/10 border border-primary/20 text-primary flex items-center justify-center shadow-sm">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="rounded-2xl p-4 bg-card border border-border text-foreground flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>

        {/* Suggestion cards for empty / starter chats */}
        {messages.length === 1 && !sending && (
          <div className="px-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-4">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(s);
                  handleSend(s);
                }}
                className="p-3 text-left rounded-2xl bg-secondary/40 border border-border/80 hover:border-primary/40 hover:bg-secondary/80 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}


        {/* Chat input box */}
        <div className="p-4 sm:p-6 border-t border-border/60 bg-card/60 backdrop-blur-md">
          <div className="flex gap-2 relative items-center">
            <Input
              placeholder={isListening ? "Listening... Speak now..." : "Ask ThreadCounty AI..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="pr-24 h-12 bg-background border-border rounded-xl text-sm"
              disabled={sending}
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-lg transition-all ${
                    isListening 
                      ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                  disabled={sending}
                  title={isListening ? "Stop listening" : "Talk to chatbot"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <Button
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                size="icon"
                className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
