'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, Building2, Zap, ClipboardList, Shield, KeyRound, BadgeCheck, Rocket, Search } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { ToastNotifications, ApprovedCounter, OnlineCounter, Testimonials } from '@/components/SocialProof';
import Chat from '@/components/Chat';
import { useSiteConfig } from '@/context/SiteConfigContext';
import BrandLogo from '@/components/BrandLogo';

function FAQItem({ q, a, cardBg, cardBorda, textoTitulo, textoCorpo, primaria }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      onClick={() => setOpen(o => !o)}
      style={{
        background: cardBg || 'rgba(255,255,255,0.85)',
        border: `1px solid ${open ? (primaria || '#820AD1') + '50' : (cardBorda || 'rgba(130,10,209,0.12)')}`,
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        backdropFilter: 'blur(8px)', transition: 'border-color .2s',
      }}
      whileHover={{ borderColor: `${primaria || '#820AD1'}40` }}
    >
      <div className="p-5 flex items-center justify-between gap-4">
        <span className="font-medium text-sm" style={{ color: textoTitulo || '#111827' }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-lg flex-shrink-0" style={{ color: primaria || '#820AD1' }}>▼</motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-5 pb-5 text-sm leading-relaxed pt-3" style={{ color: textoCorpo || '#6b7280', borderTop: `1px solid ${cardBorda || 'rgba(130,10,209,0.08)'}` }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const cfg = useSiteConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCTA = () => router.push('/perfil');

  const benefits = cfg.beneficios || [];
  const passos = cfg.passos || [];
  const faqs = cfg.faq || [];

  // helpers para aplicar banners
  const bannerStyle = (key, opacityKey, extra = {}) => {
    const url = cfg.banners?.[key];
    if (!url) return extra;
    return {
      ...extra,
      position: 'relative',
    };
  };

  // Overlay de fundo para seções
  // fit='cover' → preenche a seção inteira (padrão para fundos de seção)
  // fit='contain' → mostra a imagem inteira sem cortar nem esticar (para o hero)
  const BannerOverlay = ({ bKey, opacityKey, fit = 'cover', wrapperClass = '' }) => {
    const url = cfg.banners?.[bKey];
    if (!url) return null;
    const opacity = parseFloat(cfg.banners?.[opacityKey] || '0.15');
    return (
      <div
        className={wrapperClass || undefined}
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url(${url})`,
          backgroundSize: fit, backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          opacity,
        }}
      />
    );
  };

  if (!mounted) return null;

  const c = cfg.cores || {};

  return (
    <div className="min-h-screen relative" style={{ background: c.background || '#ffffff' }}>
      <AnimatedBackground />
      <ToastNotifications />

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-30 px-4 py-3 sm:px-6 sm:py-4"
        style={{ background: c.navbarBg || '#820AD1', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.navbarBorda || 'rgba(130,10,209,0.8)'}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {cfg.banners?.navbar ? (
              <img src={cfg.banners.navbar} alt={cfg.brand?.name || 'Logo'} style={{ height: 40, width: 'auto', maxWidth: 160, objectFit: 'contain', display: 'block' }} />
            ) : (
              <span className="font-black text-xl font-display" style={{ color: c.navbarTexto || '#ffffff' }}>{cfg.brand?.name || 'CreditoFácil'}</span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: c.navbarTexto ? `${c.navbarTexto}cc` : 'rgba(255,255,255,0.8)' }}>
            <a href="#beneficios" className="hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>Benefícios</a>
            <a href="#como-funciona" className="hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>Como funciona</a>
            <a href="#depoimentos" className="hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>Depoimentos</a>
          </div>
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-sm px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl whitespace-nowrap"
          >
            Solicitar Agora
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between px-4 pt-20" style={{ background: c.heroBg || 'transparent', position: 'relative', overflow: 'hidden' }}>
        {/* Banner desktop (oculto em mobile se banner mobile estiver configurado) */}
        <BannerOverlay bKey="hero" opacityKey="heroBgOpacity" fit="cover"
          wrapperClass={cfg.banners?.heroMobile ? 'hidden sm:block' : ''} />
        {/* Banner mobile (só aparece se configurado; cobre apenas telas < sm) */}
        {cfg.banners?.heroMobile && (
          <BannerOverlay bKey="heroMobile" opacityKey="heroBgOpacity" fit="cover" wrapperClass="sm:hidden" />
        )}

        {/* Espaço livre para o banner do admin aparecer */}
        <div className="flex-1" />

        {/* Rodapé do hero: prova social + CTAs + trust badges */}
        <div className="pb-14" style={{ position: 'relative', zIndex: 1 }}>
          <div className="max-w-2xl mx-auto text-center">

            {/* Prova social */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <ApprovedCounter />
              <div className="hidden sm:block w-px h-4 bg-gray-100" />
              <OnlineCounter />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <motion.button
                onClick={handleCTA}
                whileHover={{ scale: 1.04, boxShadow: '0 25px 60px rgba(130,10,209,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-lg px-10 py-5 rounded-2xl w-full sm:w-auto font-display font-bold flex items-center justify-center gap-2"
              >
                <Rocket size={18}/> {cfg.hero?.ctaPrincipal || 'Quero meu cartão agora'}
              </motion.button>
              <motion.button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-5 rounded-2xl text-lg font-semibold border transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                style={{ color: c.textoTitulo || '#111827', borderColor: c.cardBorda || 'rgba(130,10,209,0.2)', background: c.cardBg || 'rgba(255,255,255,0.7)' }}
              >
                <Search size={18}/> {cfg.hero?.ctaSecundario || 'Ver como funciona'}
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm"
              style={{ color: c.textoCorpo || '#6b7280' }}
            >
              {[
                { icon: <Lock size={13}/>, label: 'SSL 256-bit' },
                { icon: <Building2 size={13}/>, label: 'Regulado pelo Banco Central' },
                { icon: <Zap size={13}/>, label: 'Aprovação em segundos' },
                { icon: <ClipboardList size={13}/>, label: 'Sem comprovante de renda' },
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">{t.icon}{t.label}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CARTÃO FLUTUANTE (bridge hero → benefícios) ─────────── */}
      <section className="relative z-10 py-10 px-4 flex justify-center" style={{ background: c.heroBg || 'transparent' }}>
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: -12, rotateY: 6 }}
          whileInView={{ opacity: 1, y: 0, rotateX: -6, rotateY: 3 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{ perspective: 1200 }}
        >
          <motion.div
            whileHover={{ rotateX: 0, rotateY: 0, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={handleCTA}
            className="relative rounded-3xl overflow-hidden cursor-pointer w-[300px] sm:w-[320px]"
            style={{
              background: `linear-gradient(135deg, ${c.cartaoCorInicio || '#820AD1'} 0%, ${c.cartaoCorMeio || '#4b047d'} 50%, ${c.cartaoCorFim || '#23023c'} 100%)`,
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: `0 40px 100px ${c.cartaoCorInicio || '#820AD1'}55, 0 12px 30px rgba(0,0,0,0.25)`,
              padding: '24px 26px',
            }}
          >
            {/* Glow circles */}
            <div style={{ position: 'absolute', top: -28, right: -28, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.13), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07), transparent)', pointerEvents: 'none' }} />

            {/* Topo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
                {(cfg.brand?.name || 'CREDITOFÁCIL').toUpperCase()}
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(250,204,21,0.85)' }} />
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(234,88,12,0.85)', marginLeft: -10 }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginLeft: 6 }}>Mastercard</span>
              </div>
            </div>

            {/* Chip */}
            <div style={{ width: 36, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d4a843, #a07c2e)', marginBottom: 16, position: 'relative', zIndex: 1 }} />

            {/* Número */}
            <p style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.2em', marginBottom: 16, position: 'relative', zIndex: 1 }}>
              •••• •••• •••• ****
            </p>

            {/* Rodapé */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 2 }}>TITULAR</p>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600 }}>SEU NOME</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 2 }}>LIMITE</p>
                <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 700 }}>R$ 2.000</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── BENEFÍCIOS ──────────────────────────────────────────── */}
      <section id="beneficios" className="relative z-10 py-24 px-4" style={{ background: c.beneficiosBg || 'transparent', position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="beneficios" opacityKey="beneficiosBgOpacity" />
        <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4" style={{ color: c.textoTitulo || '#111827' }}>
              Por que escolher o{' '}
              <span className="gradient-text">{cfg.brand?.name || 'CreditoFácil'}?</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: c.textoCorpo || '#6b7280' }}>
              Um cartão feito para quem mais precisa. Sem preconceito, sem burocracia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-2xl p-7 transition-all duration-300"
                style={{ background: c.cardBg || 'rgba(255,255,255,0.85)', border: `1px solid ${c.cardBorda || 'rgba(130,10,209,0.12)'}`, backdropFilter: 'blur(8px)' }}
              >
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: c.textoTitulo || '#111827' }}>{b.titulo || b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: c.textoCorpo || '#6b7280' }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ───────────────────────────────────────── */}
      <section id="como-funciona" className="relative z-10 py-24 px-4" style={{ background: c.passosBg || 'transparent', position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="passos" opacityKey="passosBgOpacity" />
        <div className="max-w-5xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4" style={{ color: c.textoTitulo || '#111827' }}>
              Como <span className="gradient-text">funciona?</span>
            </h2>
            <p className="text-lg" style={{ color: c.textoCorpo || '#6b7280' }}>Em menos de 5 minutos você pode ter seu cartão aprovado</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {passos.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="relative">
                <div className="rounded-2xl p-6 text-center h-full" style={{ background: c.cardBg || 'rgba(255,255,255,0.85)', border: `1px solid ${c.cardBorda || 'rgba(130,10,209,0.12)'}`, backdropFilter: 'blur(8px)' }}>
                  <div className="text-4xl mb-4">{s.icon || '📋'}</div>
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: c.primaria || '#820AD1' }}>{s.numero || s.n}</div>
                  <h3 className="font-bold mb-2" style={{ color: c.textoTitulo || '#111827' }}>{s.titulo || s.title}</h3>
                  <p className="text-sm" style={{ color: c.textoCorpo || '#6b7280' }}>{s.desc}</p>
                </div>
                {i < passos.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-xl z-10" style={{ color: c.primaria || '#820AD1' }}>→</div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <motion.button onClick={handleCTA} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary text-lg px-12 py-5 rounded-2xl font-display font-bold">
              Começar Agora →
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ─────────────────────────────────────────── */}
      <section id="depoimentos" className="relative z-10 py-24 px-4" style={{ background: c.depoimentosBg || 'transparent', position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="depoimentos" opacityKey="depoimentosBgOpacity" />
        <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4" style={{ color: c.textoTitulo || '#111827' }}>
              O que dizem nossos <span className="gradient-text">clientes</span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
              </div>
              <span className="font-bold text-lg" style={{ color: c.textoTitulo || '#111827' }}>4.9</span>
              <span style={{ color: c.textoCorpo || '#6b7280' }}>(+12.000 avaliações)</span>
            </div>
          </motion.div>
          <Testimonials />
        </div>
      </section>

      {/* ── SEGURANÇA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4" style={{ position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="seguranca" opacityKey="segurancaBgOpacity" />
        <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-10 text-center"
            style={{ background: c.segurancaBg || 'rgba(248,240,255,0.7)', border: `1px solid ${c.cardBorda || 'rgba(130,10,209,0.12)'}` }}
          >
            <h2 className="text-3xl font-black font-display mb-6" style={{ color: c.textoTitulo || '#111827' }}>
              🔒 Seus dados estão <span className="gradient-text">100% seguros</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {[
                { icon: <Shield size={28} strokeWidth={1.5}/>, title: 'SSL 256-bit', desc: 'Criptografia bancária' },
                { icon: <Building2 size={28} strokeWidth={1.5}/>, title: 'Banco Central', desc: 'Regulamentado e seguro' },
                { icon: <KeyRound size={28} strokeWidth={1.5}/>, title: 'LGPD', desc: 'Dados protegidos por lei' },
                { icon: <BadgeCheck size={28} strokeWidth={1.5}/>, title: 'Certificado', desc: 'Sistema auditado' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="flex justify-center mb-2" style={{ color: c.primaria || '#820AD1' }}>{s.icon}</div>
                  <p className="font-semibold text-sm" style={{ color: c.textoTitulo || '#111827' }}>{s.title}</p>
                  <p className="text-xs" style={{ color: c.textoCorpo || '#6b7280' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4" style={{ background: c.faqBg || 'transparent', position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="faq" opacityKey="faqBgOpacity" />
        <div className="max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black font-display mb-4" style={{ color: c.textoTitulo || '#111827' }}>
              Dúvidas <span className="gradient-text">frequentes</span>
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <FAQItem q={faq.pergunta || faq.q} a={faq.resposta || faq.a} cardBg={c.cardBg} cardBorda={c.cardBorda} textoTitulo={c.textoTitulo} textoCorpo={c.textoCorpo} primaria={c.primaria} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4" style={{ position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="cta" opacityKey="ctaBgOpacity" />
        <div className="max-w-4xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: c.ctaBg || 'rgba(130,10,209,0.06)', border: `1px solid ${c.ctaBorda || 'rgba(130,10,209,0.2)'}` }}
          >
            <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 50%, ${c.primaria || '#820AD1'}, transparent)` }} />
            <h2 className="relative text-4xl md:text-5xl font-black font-display mb-4" style={{ color: c.textoTitulo || '#111827' }}>
              Pronto para ter seu <span className="gradient-text">cartão?</span>
            </h2>
            <p className="relative text-lg mb-8" style={{ color: c.textoCorpo || '#6b7280' }}>
              Junte-se a mais de 12.000 clientes que já foram aprovados
            </p>
            <motion.button onClick={handleCTA} whileHover={{ scale: 1.05, boxShadow: `0 30px 70px ${c.primaria || '#820AD1'}66` }} whileTap={{ scale: 0.97 }}
              className="relative btn-primary text-xl px-14 py-6 rounded-2xl font-display font-bold"
            >
              <span className="flex items-center gap-2"><Rocket size={20}/> Solicitar Meu Cartão Agora</span>
            </motion.button>
            <p className="relative text-sm mt-4" style={{ color: c.textoCorpo || '#6b7280' }}>
              Gratuito · Sem consulta ao SPC · Resultado imediato
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="relative z-10 py-10 px-4 text-center text-sm" style={{ background: c.footerBg || '#ffffff', borderTop: `1px solid ${c.footerBorda || '#e5e7eb'}`, color: c.footerTexto || '#6b7280', position: 'relative', overflow: 'hidden' }}>
        <BannerOverlay bKey="footer" opacityKey="footerBgOpacity" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="mb-2">
            <span className="gradient-text font-bold">{cfg.brand?.name || 'CreditoFácil'}</span>
            {' · '}{cfg.rodape?.texto || 'Todos os direitos reservados'}
          </p>
          {cfg.suporte?.email && <p>{cfg.suporte.email}</p>}
          <p className="mt-2 text-xs">
            {cfg.rodape?.descricao || 'Serviço de intermediação financeira. Não somos uma instituição financeira.'}
          </p>
        </div>
      </footer>

      <Chat />
    </div>
  );
}
