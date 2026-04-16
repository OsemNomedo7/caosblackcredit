'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, BarChart3, Brain, Wallet, Lock, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { Icon: Search, text: 'Verificando CPF...', duration: 900 },
  { Icon: BarChart3, text: 'Consultando histórico de crédito...', duration: 1100 },
  { Icon: Brain, text: 'Analisando score...', duration: 1200 },
  { Icon: Wallet, text: 'Calculando limite disponível...', duration: 1000 },
];

const TOTAL_DURATION = STEPS.reduce((acc, s) => acc + s.duration, 0) + 600;

export default function AnalisePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const score = sessionStorage.getItem('lead_score');
    if (!score) router.push('/');

    // Anima as etapas sequencialmente
    let elapsed = 0;

    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        // Marca como concluída após a duração da etapa
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, i]);
          if (i === STEPS.length - 1) {
            setTimeout(() => {
              setDone(true);
              setTimeout(() => router.push('/resultado'), 800);
            }, 500);
          }
        }, step.duration - 100);
      }, elapsed);

      elapsed += step.duration;
    });
  }, []);

  // Animação da barra de progresso
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const profile = typeof window !== 'undefined' ? sessionStorage.getItem('profile') : 'negativado';
  const name = typeof window !== 'undefined' ? sessionStorage.getItem('lead_name') : '';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 30% 30%, rgba(130,10,209,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(100,6,165,0.06) 0%, transparent 60%), #ffffff',
      }}
    >
      {/* Partículas de fundo */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            background: `rgba(130, 10, 209, ${Math.random() * 0.15 + 0.05})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-10"
        >
          <div
            className="inline-flex w-20 h-20 rounded-2xl items-center justify-center text-4xl mb-4"
            style={{ background: 'linear-gradient(135deg, #820AD1, #4b047d)', boxShadow: '0 0 40px rgba(130,10,209,0.35)' }}
          >
            🏦
          </div>
          <h2 className="text-xl font-black font-display text-gray-900">
            {name ? `Olá, ${name.split(' ')[0]}!` : 'Analisando...'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {profile === 'client' ? 'Verificando sua conta...' : 'Análise especial em andamento...'}
          </p>
        </motion.div>

        {/* Container principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-3xl p-8 mb-8"
        >
          {/* Título */}
          <h1 className="text-2xl font-black font-display text-gray-900 mb-6">
            Analisando seu crédito
          </h1>

          {/* Etapas */}
          <div className="space-y-4 mb-8 text-left">
            {STEPS.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = currentStep === i && !isCompleted;
              const isPending = currentStep < i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4"
                >
                  {/* Indicador */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg relative">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        className="w-full h-full rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)' }}
                      >
                        <span className="text-green-400 text-sm">✓</span>
                      </motion.div>
                    ) : isCurrent ? (
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(130,10,209,0.1)', border: '1px solid rgba(130,10,209,0.4)' }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(130,10,209,0.05)', border: '1px solid rgba(130,10,209,0.12)', color: '#820AD1' }}
                      >
                        <step.Icon size={16} />
                      </div>
                    )}
                  </div>

                  {/* Texto */}
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-gray-900' :
                      'text-gray-500'
                    }`}>
                      {step.text}
                    </p>
                    {isCurrent && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: step.duration / 1000 }}
                        className="h-0.5 bg-brand-500/40 rounded-full mt-1.5"
                      />
                    )}
                    {isCompleted && (
                      <p className="text-xs text-green-500/60 mt-0.5">Concluído</p>
                    )}
                  </div>

                  {/* Status */}
                  <span className="text-xs">
                    {isCompleted ? <CheckCircle2 size={14} className="text-green-500" /> : isCurrent ? <div className="w-3 h-3 rounded-full border-2 border-brand-400 border-t-transparent animate-spin"/> : <span className="text-gray-400 text-xs">·</span>}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-brand-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #820AD1, #a03ce1, #c070ee)',
                  transition: 'width 0.1s ease',
                }}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-6 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.4)', filter: 'blur(4px)' }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Info de segurança */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-gray-500 text-xs"
        >
          <Lock size={12} />
          <span>Conexão segura com criptografia SSL 256-bit</span>
        </motion.div>

        {/* Done overlay */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(248,244,255,0.95)' }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mb-4 flex justify-center"
                >
                  <CheckCircle2 size={80} className="text-green-500" strokeWidth={1.2} />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900">Análise concluída!</h2>
                <p className="text-brand-600">Redirecionando para seu resultado...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
