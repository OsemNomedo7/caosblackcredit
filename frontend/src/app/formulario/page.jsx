'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, User, PenLine, AlertCircle, Search, Star, Target } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { createLead } from '@/lib/api';
import Chat from '@/components/Chat';
import { useSiteConfig } from '@/context/SiteConfigContext';
import BrandLogo from '@/components/BrandLogo';

// Máscara de CPF
function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10 || digit1 === 11) digit1 = 0;
  if (digit1 !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10 || digit2 === 11) digit2 = 0;
  return digit2 === parseInt(clean[10]);
}

export default function FormularioPage() {
  const router = useRouter();
  const cfg = useSiteConfig();
  const [profile, setProfile] = useState('negativado');
  const [form, setForm] = useState({ name: '', cpf: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    const p = sessionStorage.getItem('profile');
    if (!p) router.push('/perfil');
    else setProfile(p);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().split(' ').length < 2) {
      errs.name = 'Informe seu nome completo';
    }
    if (!validateCPF(form.cpf)) {
      errs.cpf = 'CPF inválido. Verifique e tente novamente';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const sessionId = sessionStorage.getItem('chat_session') || `user_${Date.now()}`;
      const result = await createLead({
        name: form.name.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        profile,
        sessionId,
      });

      sessionStorage.setItem('lead_id', result.id);
      sessionStorage.setItem('lead_score', result.score);
      sessionStorage.setItem('lead_limit', result.limit_value);
      sessionStorage.setItem('lead_name', form.name.trim());

      router.push('/analise');
    } catch (err) {
      console.error(err);
      // Mesmo com erro, simula score e redireciona
      const score = profile === 'client'
        ? Math.floor(Math.random() * 200) + 650
        : Math.floor(Math.random() * 250) + 300;

      sessionStorage.setItem('lead_id', '0');
      sessionStorage.setItem('lead_score', score);
      sessionStorage.setItem('lead_limit', '2000');
      sessionStorage.setItem('lead_name', form.name.trim());
      router.push('/analise');
    }
  };

  const profileIsClient = profile === 'client';

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6"
      >
        <button
          onClick={() => router.push('/perfil')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          ← Voltar
        </button>

        <BrandLogo />

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${s <= 2 ? 'bg-brand-400' : 'bg-white/20'} ${s === 2 ? 'w-5' : 'w-2'}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Conteúdo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Perfil selecionado */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 mb-8 p-3 rounded-xl glass-purple"
          >
            {profileIsClient
              ? <Star size={22} className="text-blue-500 flex-shrink-0" />
              : <Target size={22} className="text-brand-500 flex-shrink-0" />
            }
            <div>
              <p className="text-gray-900 text-sm font-semibold">
                {profileIsClient ? 'Já sou cliente' : 'Negativado'}
              </p>
              <p className="text-gray-600 text-xs">
                {profileIsClient ? 'Aumento de limite disponível' : 'Aprovação especial ativa'}
              </p>
            </div>
            <button
              onClick={() => router.push('/perfil')}
              className="ml-auto text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              alterar
            </button>
          </motion.div>

          {/* Título */}
          <div className="text-center mb-8">
            <span className="text-brand-600 text-sm font-medium">Etapa 2 de 4</span>
            <h1 className="text-3xl font-black font-display text-gray-900 mt-2 mb-2">
              {cfg.funil?.formularioTitulo || 'Seus dados'}
            </h1>
            <p className="text-gray-600">
              {cfg.funil?.formularioSubtitulo || 'Precisamos apenas do seu nome e CPF para a consulta'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <motion.div
              animate={{ borderColor: focused === 'name' ? 'rgba(130,10,209,0.8)' : errors.name ? 'rgba(239,68,68,0.6)' : 'transparent' }}
            >
              <label className="text-gray-600 text-sm font-medium block mb-2">
                Nome completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm(f => ({ ...f, name: e.target.value }));
                    if (errors.name) setErrors(er => ({ ...er, name: '' }));
                  }}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="João da Silva"
                  className="input-dark pr-12"
                  autoComplete="name"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {focused === 'name' ? <PenLine size={16} /> : <User size={16} />}
                </span>
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CPF */}
            <div>
              <label className="text-gray-600 text-sm font-medium block mb-2">
                CPF
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => {
                    setForm(f => ({ ...f, cpf: maskCPF(e.target.value) }));
                    if (errors.cpf) setErrors(er => ({ ...er, cpf: '' }));
                  }}
                  onFocus={() => setFocused('cpf')}
                  onBlur={() => setFocused(null)}
                  placeholder="000.000.000-00"
                  className="input-dark pr-12"
                  maxLength={14}
                  inputMode="numeric"
                  autoComplete="off"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
              </div>
              <AnimatePresence>
                {errors.cpf && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {errors.cpf}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Aviso de segurança */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-gray-600">
              <Lock size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Seus dados são criptografados com <strong className="text-green-700">SSL 256-bit</strong> e nunca
                compartilhados com terceiros.
              </span>
            </div>

            {/* Botão submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full text-lg py-5 rounded-2xl font-display font-bold relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Consultando...
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                    <Search size={18} /> Consultar Agora
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <p className="text-center text-gray-500 text-xs">
              Ao continuar você concorda com nossos{' '}
              <a href="#" className="text-brand-400 hover:underline">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-brand-400 hover:underline">Política de Privacidade</a>
            </p>
          </form>
        </motion.div>
      </div>

      <Chat userName={form.name} />
    </div>
  );
}
