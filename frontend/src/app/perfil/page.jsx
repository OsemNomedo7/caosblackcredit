'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, Target, Check } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { ApprovedCounter } from '@/components/SocialProof';
import Chat from '@/components/Chat';
import { useSiteConfig } from '@/context/SiteConfigContext';
import BrandLogo from '@/components/BrandLogo';

const ClientIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4"/>
    <path d="M24 14l2.8 5.6 6.2.9-4.5 4.4 1.1 6.1L24 28.1l-5.6 2.9 1.1-6.1-4.5-4.4 6.2-.9L24 14z" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(59,130,246,0.15)"/>
    <circle cx="24" cy="33" r="2.5" fill="#3b82f6" opacity="0.6"/>
  </svg>
);

const NegativadoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#820AD1" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4"/>
    <path d="M24 12v16M24 34v2" stroke="#820AD1" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M14 20c0-5.5 4.5-10 10-10s10 4.5 10 10c0 3.5-1.8 6.6-4.5 8.5L24 36l-5.5-7.5C15.8 26.6 14 23.5 14 20z" stroke="#820AD1" strokeWidth="1.8" fill="rgba(130,10,209,0.12)"/>
  </svg>
);

const PROFILES = [
  {
    id: 'client',
    Icon: ClientIcon,
    title: 'Já sou cliente',
    subtitle: 'Tenho conta ativa',
    desc: 'Quero aumentar meu limite ou emitir um novo cartão com mais vantagens.',
    badge: 'Aprovação mais rápida',
    badgeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    color: 'from-blue-600/20 to-blue-900/10',
    borderHover: 'hover:border-blue-500/50',
    highlight: '#3b82f6',
    features: ['Score preferencial', 'Análise prioritária', 'Limite aumentado'],
  },
  {
    id: 'negativado',
    Icon: NegativadoIcon,
    title: 'Estou negativado',
    subtitle: 'CPF com restrição',
    desc: 'Tenho restrição no SPC/Serasa mas quero crédito para reconstruir minha vida financeira.',
    badge: 'Aprovado mesmo negativado',
    badgeColor: 'text-green-500 bg-green-500/10 border-green-500/20',
    color: 'from-brand-600/20 to-brand-900/10',
    borderHover: 'hover:border-brand-500/50',
    highlight: '#820AD1',
    features: ['Aprovação especial', 'Sem consulta ao SPC', 'Até R$2.000'],
  },
];

export default function PerfilPage() {
  const router = useRouter();
  const cfg = useSiteConfig();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleSelect = (profileId) => {
    setSelected(profileId);
    sessionStorage.setItem('profile', profileId);

    setTimeout(() => {
      router.push('/formulario');
    }, 600);
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
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          ← Voltar
        </button>

        <BrandLogo />

        {/* Etapas */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${s === 1 ? 'bg-brand-400 w-6' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          {/* Título */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 text-brand-300 text-sm font-medium mb-4 px-4 py-2 rounded-full glass-purple"
            >
              <span>Etapa 1 de 4</span>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-black font-display text-gray-900 mb-3">
              {cfg.funil?.perfilTitulo || 'Qual é o seu perfil?'}
            </h1>
            <p className="text-gray-600 text-lg">
              {cfg.funil?.perfilSubtitulo || 'Selecione para personalizarmos a melhor oferta para você'}
            </p>
          </div>

          {/* Cards de perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROFILES.map((profile, i) => (
              <motion.button
                key={profile.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHovered(profile.id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => handleSelect(profile.id)}
                className={`
                  relative overflow-hidden rounded-2xl p-7 text-left border transition-all duration-300 cursor-pointer
                  ${selected === profile.id ? 'border-brand-400/80' : 'border-white/10'}
                  ${profile.borderHover}
                  bg-gradient-to-br ${profile.color}
                `}
                style={{
                  boxShadow: hovered === profile.id ? `0 20px 60px ${profile.highlight}30` : 'none',
                }}
              >
                {/* Glow de fundo */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${profile.highlight}15, transparent)`,
                    opacity: hovered === profile.id ? 1 : 0,
                  }}
                />

                {/* Badge */}
                <span className={`relative inline-flex text-xs font-semibold px-3 py-1 rounded-full border mb-5 ${profile.badgeColor}`}>
                  {profile.badge}
                </span>

                {/* Ícone */}
                <div className="relative mb-4"><profile.Icon /></div>

                <h3 className="relative text-gray-900 font-black text-xl font-display mb-1">
                  {profile.title}
                </h3>
                <p className="relative text-gray-600 text-sm mb-4">{profile.subtitle}</p>
                <p className="relative text-gray-700 text-sm leading-relaxed mb-5">{profile.desc}</p>

                {/* Features */}
                <div className="relative space-y-2">
                  {profile.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={13} className="text-green-600 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>

                {/* Selecionado */}
                {selected === profile.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: profile.highlight }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {/* Seta */}
                <motion.div
                  className="absolute bottom-6 right-6 text-2xl"
                  animate={{ x: hovered === profile.id ? 4 : 0 }}
                >
                  →
                </motion.div>
              </motion.button>
            ))}
          </div>

          {/* Prova social */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <ApprovedCounter />
          </motion.div>
        </motion.div>
      </div>

      <Chat />
    </div>
  );
}
