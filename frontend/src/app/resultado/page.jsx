'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreditCard, Globe, CalendarDays, ShieldCheck, CheckCircle2, Rocket } from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import AnimatedBackground from '@/components/AnimatedBackground';
import Chat from '@/components/Chat';
import BrandLogo from '@/components/BrandLogo';
import { useSiteConfig } from '@/context/SiteConfigContext';

function LimitCounter({ target }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const t = setTimeout(() => requestAnimationFrame(animate), 500);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <span className="text-5xl font-black text-green-400 tabular-nums">
      R$ {val.toLocaleString('pt-BR')}
    </span>
  );
}

export default function ResultadoPage() {
  const router = useRouter();
  const cfg = useSiteConfig();
  const [data, setData] = useState(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const score = parseInt(sessionStorage.getItem('lead_score') || '400');
    const profile = sessionStorage.getItem('profile') || 'negativado';
    const name = sessionStorage.getItem('lead_name') || '';
    const limit = parseFloat(sessionStorage.getItem('lead_limit') || '2000');

    if (!score) { router.push('/'); return; }

    setData({ score, profile, name, limit });

    // Mostra o conteúdo após a animação do gauge
    setTimeout(() => setShowContent(true), 1200);
  }, []);

  const handleContinue = () => {
    router.push('/endereco');
  };

  if (!data) return null;

  const isClient = data.profile === 'client';
  const firstName = data.name.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6"
      >
        <div />
        <BrandLogo />
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 rounded-full ${s <= 3 ? 'bg-brand-400' : 'bg-white/20'} ${s === 3 ? 'w-5' : 'w-2'}`} />
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-lg">

          {/* Badge de aprovação */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="text-center mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#4ade80',
              }}
            >
              <CheckCircle2 size={15} />{' '}
              {isClient
                ? 'Novo limite disponível!'
                : 'Aprovado mesmo com restrições!'}
            </motion.div>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-black font-display text-gray-900 mb-2">
              {isClient
                ? `${firstName}, seu novo limite:`
                : `${firstName}, você foi aprovado!`}
            </h1>
            <p className="text-gray-600">
              {isClient
                ? 'Analisamos sua conta e liberamos um aumento'
                : 'Nossa análise especial aprovou seu cartão mesmo com restrições'}
            </p>
          </motion.div>

          {/* Card principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-3xl p-5 sm:p-8 mb-6"
          >
            {/* Score Gauge */}
            <div className="flex justify-center mb-8">
              <ScoreGauge targetScore={data.score} profile={data.profile} />
            </div>

            <div className="divider-gradient my-6" />

            {/* Limite */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-gray-500 text-sm mb-2">Limite aprovado</p>
              <LimitCounter target={data.limit} />

              {isClient && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-gray-500 text-sm line-through">R$ 500</span>
                  <span className="text-green-400 text-xs font-bold bg-green-400/10 border border-green-400/20 rounded-full px-3 py-0.5">
                    + R$1.500 liberados
                  </span>
                </div>
              )}
            </motion.div>

            <div className="divider-gradient my-6" />

            {/* Info adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              {[
                { icon: <CreditCard size={14} />, label: 'Tipo', value: 'Cartão de Crédito Internacional' },
                { icon: <Globe size={14} />, label: 'Bandeira', value: 'Mastercard / Visa' },
                { icon: <CalendarDays size={14} />, label: 'Validade', value: '4 anos' },
                { icon: <ShieldCheck size={14} />, label: 'Chip & NFC', value: 'Incluso' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-gray-900 font-medium">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mensagem contextual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            className="glass-purple rounded-2xl p-5 mb-6 text-sm text-gray-700 leading-relaxed"
          >
            {isClient ? (
              <>
                <strong className="text-gray-900">Para ativar o novo limite</strong>, é necessário emitir um novo cartão
                com chip atualizado. O processo leva apenas alguns minutos e seu cartão chega em casa em até 3 dias úteis.
              </>
            ) : (
              <>
                <strong className="text-gray-900">Parabéns!</strong> Sua aprovação foi confirmada mesmo com restrições
                no histórico. Para receber seu cartão, basta concluir a emissão. Utilizando regularmente, seu score
                aumenta automaticamente.
              </>
            )}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.03, boxShadow: '0 25px 60px rgba(130,10,209,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full text-lg py-5 rounded-2xl font-display font-bold"
            >
              <span className="flex items-center justify-center gap-2">
                {isClient ? <><Rocket size={18}/> Solicitar Novo Cartão</> : <><CreditCard size={18}/> Solicitar Meu Cartão</>}
              </span>
            </motion.button>

            <p className="text-center text-gray-600 text-xs mt-3">
              Emissão simples · Pagamento via PIX · Entrega com rastreio
            </p>
          </motion.div>
        </div>
      </div>

      <Chat userName={data?.name} />
    </div>
  );
}
