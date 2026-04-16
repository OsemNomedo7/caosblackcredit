'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useSiteConfig } from '@/context/SiteConfigContext';

const QUICK_REPLIES = [
  'Como funciona?',
  'Já fui aprovado?',
  'Como pagar?',
  'Qual o prazo de entrega?',
];

const AUTO_REPLIES = {
  'como funciona': 'É simples! Você preenche seus dados, consultamos sua situação de crédito e em segundos você tem a resposta. Aprovado, basta emitir o cartão! 💳',
  'já fui aprovado': 'Para verificar sua aprovação, você precisará acessar a etapa de resultado. Se precisar de ajuda, pode me contar mais detalhes? 😊',
  'como pagar': 'O pagamento é feito por PIX, de forma rápida e segura. Taxa de emissão: R$19,90 + frete R$29,90. Você recebe QR Code para pagar na hora! 📱',
  'qual o prazo': 'Após o pagamento confirmado, seu cartão é enviado em 1-3 dias úteis com código de rastreio no seu e-mail. 🚚',
};

export default function Chat({ userName = '' }) {
  const cfg = useSiteConfig();
  const c = cfg.cores || {};
  const brandName = cfg.brand?.name || 'Suporte';
  const logoUrl = cfg.banners?.navbar || null;
  const primaria = c.primaria || '#820AD1';
  const primariaEscura = c.primaria ? `${c.primaria}cc` : '#5c079a';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('chat_session');
      if (!sid) {
        sid = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem('chat_session', sid);
      }
      return sid;
    }
    return `user_${Date.now()}`;
  });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('user_join', { sessionId, name: userName || 'Visitante' });
    });

    socket.on('receive_message', (msg) => {
      if (msg.sender === 'support') {
        setMessages(prev => [...prev, msg]);
        if (!isOpen) setUnread(n => n + 1);
        setIsTyping(false);
      }
    });

    return () => socket.disconnect();
  }, [sessionId, userName]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = (text = inputText) => {
    const msg = text.trim();
    if (!msg) return;

    const userMsg = {
      session_id: sessionId,
      sender: 'user',
      message: msg,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    socketRef.current?.emit('send_message', {
      sessionId,
      message: msg,
      sender: 'user',
    });

    // Auto-resposta local (fallback se admin não estiver online)
    const lower = msg.toLowerCase();
    const matchKey = Object.keys(AUTO_REPLIES).find(k => lower.includes(k));

    if (matchKey) {
      setIsTyping(true);
      setTimeout(() => {
        const autoReply = {
          session_id: sessionId,
          sender: 'support',
          message: AUTO_REPLIES[matchKey],
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, autoReply]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaria}, ${primariaEscura})` }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={!isOpen ? { boxShadow: [`0 0 0 0 ${primaria}66`, `0 0 0 20px ${primaria}00`, `0 0 0 0 ${primaria}00`] } : {}}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} className="text-xl text-white">✕</motion.span>
          ) : logoUrl ? (
            <motion.img key="logo" src={logoUrl} alt={brandName} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-9 h-9 object-contain rounded-full" />
          ) : (
            <motion.span key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">💬</motion.span>
          )}
        </AnimatePresence>

        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center text-white">
            {unread}
          </span>
        )}
      </motion.button>

      {/* Janela do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: c.cardBg || 'rgba(255, 255, 255, 0.98)',
              border: `1px solid ${primaria}33`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 20px 60px ${primaria}26`,
            }}
          >
            {/* Header */}
            <div className="p-4" style={{ background: `linear-gradient(135deg, ${primaria}, ${primariaEscura})` }}>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={logoUrl} alt={brandName} className="w-8 h-8 object-contain" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">🎯</div>
                )}
                <div>
                  <p className="font-semibold text-white text-sm">Suporte {brandName}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-white/70 text-xs">Online agora</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="h-72 overflow-y-auto p-4 space-y-3 flex flex-col">
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-xs text-center">Iniciando conversa...</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-support'}`}
                    style={msg.sender === 'user' ? { background: `linear-gradient(135deg, ${primaria}, ${primariaEscura})` } : {}}
                  >
                    {msg.message}
                    <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/50' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="chat-bubble chat-bubble-support">
                    <div className="loading-dots flex gap-1 items-center h-4">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Respostas rápidas */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((r) => (
                  <button
                    key={r}
                    onClick={() => sendMessage(r)}
                    className="text-xs px-3 py-1.5 rounded-full border border-brand-300 text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 placeholder-gray-400 outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${primaria}, ${primariaEscura})` }}
                >
                  <svg className="w-4 h-4 text-white rotate-90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 12L22 2L14 22L11 13L2 12Z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
