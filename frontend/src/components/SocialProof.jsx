'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATIONS = [
  { name: 'Carlos M.', city: 'São Paulo, SP', action: 'foi aprovado', detail: 'limite de R$2.000', icon: '✅' },
  { name: 'Juliana F.', city: 'Belo Horizonte, MG', action: 'recebeu aumento de limite', detail: '+R$500', icon: '🎉' },
  { name: 'Roberto S.', city: 'Curitiba, PR', action: 'acabou de solicitar', detail: 'cartão aprovado em 2min', icon: '⚡' },
  { name: 'Amanda L.', city: 'Salvador, BA', action: 'foi aprovada mesmo negativada', detail: 'limite de R$2.000', icon: '🏆' },
  { name: 'Felipe A.', city: 'Rio de Janeiro, RJ', action: 'recebeu o cartão', detail: 'em 3 dias úteis', icon: '💳' },
  { name: 'Mariana C.', city: 'Fortaleza, CE', action: 'foi aprovada', detail: 'score melhorado', icon: '✅' },
  { name: 'Diego R.', city: 'Porto Alegre, RS', action: 'solicitou o cartão', detail: 'aprovação imediata', icon: '🚀' },
  { name: 'Fernanda B.', city: 'Recife, PE', action: 'recebeu aprovação', detail: 'limite de R$1.500', icon: '🎊' },
  { name: 'Lucas T.', city: 'Manaus, AM', action: 'foi aprovado', detail: 'mesmo com CPF restrito', icon: '⭐' },
  { name: 'Patricia M.', city: 'Brasília, DF', action: 'desbloqueou o limite', detail: 'R$2.000 disponíveis', icon: '🔓' },
];

function getRandomNotification(exclude) {
  const available = NOTIFICATIONS.filter((_, i) => i !== exclude);
  const idx = Math.floor(Math.random() * available.length);
  return { notif: available[idx], originalIdx: NOTIFICATIONS.indexOf(available[idx]) };
}

export function ToastNotifications() {
  const [notification, setNotification] = useState(null);
  const [lastIdx, setLastIdx] = useState(-1);

  useEffect(() => {
    const show = () => {
      const { notif, originalIdx } = getRandomNotification(lastIdx);
      setNotification(notif);
      setLastIdx(originalIdx);
      // Remove depois de 4s
      setTimeout(() => setNotification(null), 4000);
    };

    // Primeira notificação após 3s
    const firstTimer = setTimeout(show, 3000);

    // Notificações subsequentes a cada 7-12s
    const interval = setInterval(() => {
      const delay = Math.random() * 5000 + 7000;
      setTimeout(show, delay);
    }, 12000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-4 z-40 max-w-xs">
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.name + Date.now()}
            initial={{ opacity: 0, x: -80, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-dark rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-lg flex-shrink-0">
                {notification.icon}
              </div>
              <div>
                <p className="text-gray-900 text-sm font-semibold">{notification.name}</p>
                <p className="text-gray-500 text-xs">{notification.city}</p>
                <p className="text-brand-600 text-xs mt-1">
                  {notification.action} · <span className="text-green-600 font-medium">{notification.detail}</span>
                </p>
              </div>
            </div>
            <div className="mt-2 h-0.5 bg-brand-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ApprovedCounter({ className = '' }) {
  const [count, setCount] = useState(12847);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3) + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-30" />
      </div>
      <span className="text-sm text-gray-700">
        <span className={`font-bold text-green-600 tabular-nums transition-all duration-300 ${pulse ? 'scale-110' : 'scale-100'}`}>
          +{count.toLocaleString('pt-BR')}
        </span>{' '}
        cartões aprovados hoje
      </span>
    </div>
  );
}

export function OnlineCounter({ className = '' }) {
  const [online, setOnline] = useState(94);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnline(Math.floor(Math.random() * 40) + 75);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
      </div>
      <span className="text-xs text-gray-600">
        <span className="text-orange-500 font-semibold">{online}</span> pessoas consultando agora
      </span>
    </div>
  );
}

export function Testimonials() {
  const reviews = [
    {
      name: 'Carlos Eduardo',
      city: 'São Paulo, SP',
      text: 'Estava negativado há 2 anos e consegui meu cartão em menos de 5 minutos. Processo super simples e transparente!',
      rating: 5,
      avatar: 'CE',
      limit: 'R$ 2.000',
    },
    {
      name: 'Juliana Ferreira',
      city: 'Belo Horizonte, MG',
      text: 'Tinha dívidas no SPC e mesmo assim me aprovaram. O cartão chegou rapidinho e já estou usando normalmente.',
      rating: 5,
      avatar: 'JF',
      limit: 'R$ 1.500',
    },
    {
      name: 'Roberto Santos',
      city: 'Curitiba, PR',
      text: 'Minha expectativa era baixa por estar negativado. Surpreendente! Aprovado na hora com bom limite.',
      rating: 5,
      avatar: 'RS',
      limit: 'R$ 2.000',
    },
    {
      name: 'Amanda Lima',
      city: 'Salvador, BA',
      text: 'Processo rápido, transparente e sem enrolação. Recebi meu cartão em 4 dias úteis! Super recomendo.',
      rating: 5,
      avatar: 'AL',
      limit: 'R$ 2.000',
    },
    {
      name: 'Felipe Alves',
      city: 'Rio de Janeiro, RJ',
      text: 'Estava com score baixíssimo e mesmo assim consegui limite de R$2.000. Sensacional!',
      rating: 5,
      avatar: 'FA',
      limit: 'R$ 2.000',
    },
    {
      name: 'Mariana Costa',
      city: 'Fortaleza, CE',
      text: 'Já tentei vários bancos e sempre fui recusada. Aqui foi diferente! Aprovação na hora.',
      rating: 5,
      avatar: 'MC',
      limit: 'R$ 1.500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="card-glass card-glow rounded-2xl p-6 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center font-bold text-white text-sm">
              {r.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
              <p className="text-gray-500 text-xs">{r.city}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-green-600 font-semibold bg-green-100 border border-green-200 rounded-full px-3 py-1">
                {r.limit}
              </span>
            </div>
          </div>

          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: r.rating }).map((_, j) => (
              <span key={j} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">"{r.text}"</p>
        </motion.div>
      ))}
    </div>
  );
}
