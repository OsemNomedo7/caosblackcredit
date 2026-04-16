'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Settings2, Package, Home, Truck, Phone, Mail, MessageCircle, Check, MapPin, PackageSearch, ChevronDown, ChevronUp } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Chat from '@/components/Chat';
import { useSiteConfig } from '@/context/SiteConfigContext';
import BrandLogo from '@/components/BrandLogo';

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ['#820AD1', '#a03ce1', '#22c55e', '#facc15', '#3b82f6', '#f472b6'];

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [(Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720 - 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            delay: Math.random() * 2,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

const TIMELINE = [
  { day: 'Hoje', action: 'Pedido confirmado', Icon: CheckCircle2, color: 'text-green-500', done: true },
  { day: 'Amanhã', action: 'Cartão em produção', Icon: Settings2, color: 'text-blue-500', done: false },
  { day: '2-3 dias', action: 'Enviado pelos Correios', Icon: Truck, color: 'text-yellow-600', done: false },
  { day: '3-5 dias', action: 'Entregue em casa', Icon: Home, color: 'text-purple-600', done: false },
];

export default function ConfirmacaoPage() {
  const router = useRouter();
  const cfg = useSiteConfig();
  const [name, setName] = useState('');
  const [address, setAddress] = useState(null);
  const [orderId] = useState(() => Math.floor(Math.random() * 900000) + 100000);
  const [trackingOpen, setTrackingOpen] = useState(false);

  useEffect(() => {
    const n = sessionStorage.getItem('lead_name') || '';
    setName(n);
    try {
      const a = JSON.parse(sessionStorage.getItem('lead_address') || 'null');
      setAddress(a);
    } catch { /* ignora */ }
  }, []);

  const firstName = name.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <Confetti />

      {/* Header mínimo */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6"
      >
        <BrandLogo />
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg text-center">

          {/* Ícone de sucesso animado */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-6xl relative"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.1))',
                border: '2px solid rgba(34,197,94,0.4)',
                boxShadow: '0 0 60px rgba(34,197,94,0.2)',
              }}
            >
              <CheckCircle2 size={52} className="text-green-500" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-green-400"
                animate={{ scale: [1, 1.4, 1.4], opacity: [1, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black font-display text-gray-900 mb-3">
              {firstName ? `Parabéns, ${firstName}!` : 'Parabéns!'}
            </h1>
            <p className="text-xl text-green-600 font-semibold mb-2">
              Solicitação concluída com sucesso!
            </p>
            <p className="text-gray-600">
              {cfg.funil?.confirmacaoSubtitulo || 'Seu cartão está sendo preparado com toda atenção para você'}
            </p>
          </motion.div>

          {/* Número do pedido */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-dark rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-gray-500 text-xs mb-1">Número do pedido</p>
                <p className="text-gray-900 font-black text-2xl font-mono">#{orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs mb-1">Status</p>
                <span className="badge-approved text-sm">Em produção</span>
              </div>
            </div>
          </motion.div>

          {/* Endereço de entrega */}
          {address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass-dark rounded-2xl p-5 mb-6 text-left"
            >
              <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-brand-500" /> Endereço de entrega
              </h3>
              <p className="text-gray-800 text-sm font-medium">
                {address.logradouro}, {address.numero}
                {address.complemento && ` — ${address.complemento}`}
              </p>
              <p className="text-gray-600 text-xs mt-0.5">
                {address.bairro} · {address.cidade}/{address.estado} · CEP {address.cep}
              </p>
            </motion.div>
          )}

          {/* Timeline de entrega */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-dark rounded-2xl p-6 mb-6 text-left"
          >
            <h3 className="text-gray-900 font-bold mb-5">Acompanhe seu pedido</h3>
            <div className="space-y-4">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        item.done
                          ? 'bg-green-500/20 border border-green-500/40'
                          : 'bg-white/5 border border-white/10'
                      } ${item.color}`}
                    >
                      <item.Icon size={17} />
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`w-px h-6 mt-1 ${item.done ? 'bg-green-500/30' : 'bg-white/10'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{item.day}</span>
                      {item.done && <span className="text-xs text-green-400 font-medium flex items-center gap-0.5"><Check size={11}/>Concluído</span>}
                    </div>
                    <p className={`font-medium text-sm ${item.done ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Informações de suporte */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass-purple rounded-2xl p-5 mb-6"
          >
            <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2"><Package size={16} className="text-brand-500"/> Acompanhe sua entrega</h3>
            <p className="text-gray-700 text-sm mb-4">
              Você receberá o código de rastreamento por e-mail assim que o cartão for enviado.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={13} className="text-brand-400 flex-shrink-0" />
                <span>Suporte: {cfg.suporte?.whatsapp || '(11) 99999-9999'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={13} className="text-brand-400 flex-shrink-0" />
                <span>{cfg.suporte?.email || 'suporte@creditofacil.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle size={13} className="text-brand-400 flex-shrink-0" />
                <span>WhatsApp e chat disponíveis 24h</span>
              </div>
            </div>
          </motion.div>

          {/* Botões de ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <button
              onClick={() => setTrackingOpen(o => !o)}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #820AD1, #4b047d)', boxShadow: '0 10px 30px rgba(130,10,209,0.3)' }}
            >
              <PackageSearch size={20} />
              Acompanhar Envio
              {trackingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Painel de rastreio inline */}
            <AnimatePresence>
              {trackingOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-dark rounded-2xl p-5 text-left">
                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                      <PackageSearch size={15} className="text-brand-500" /> Status do seu pedido
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-700">Pedido confirmado</p>
                          <p className="text-green-600 text-xs">Seu pedido foi recebido e está em fila de produção</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <Settings2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-blue-700">Em produção</p>
                          <p className="text-blue-600 text-xs">Seu cartão está sendo personalizado com seu nome</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <Truck size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-500">Aguardando envio</p>
                          <p className="text-gray-400 text-xs">O código de rastreio chegará por e-mail ao sair para entrega</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <Home size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-500">Entrega em domicílio</p>
                          <p className="text-gray-400 text-xs">Previsão: 3-5 dias úteis após o envio pelos Correios</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-4 text-center">
                      Dúvidas? Contate: {cfg.suporte?.whatsapp || '(11) 99999-9999'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-2xl font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-all"
            >
              Voltar ao início
            </button>
          </motion.div>
        </div>
      </div>

      <Chat userName={name} />
    </div>
  );
}
