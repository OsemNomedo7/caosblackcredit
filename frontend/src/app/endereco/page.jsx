'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MapPin, Hash, Home, Building2, Map, Loader2,
  CheckCircle2, AlertCircle, ChevronRight, Lock,
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Chat from '@/components/Chat';
import BrandLogo from '@/components/BrandLogo';

// ─── Máscara de CEP ───────────────────────────────────────────────────────────
function maskCEP(v) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

// ─── Campo de formulário reutilizável ─────────────────────────────────────────
function Field({ label, icon: Icon, children, error, success }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-gray-600 text-sm font-medium mb-2">
        <Icon size={13} className="text-brand-500" />
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-red-500 text-xs mt-1.5"
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-green-600 text-xs mt-1.5"
          >
            <CheckCircle2 size={11} /> {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Input padrão ─────────────────────────────────────────────────────────────
const inputCls = (focused, error) =>
  `w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 border ${
    error
      ? 'border-red-400 bg-red-50 text-gray-900'
      : focused
      ? 'border-brand-500 bg-[#fdf8ff] shadow-[0_0_0_3px_rgba(130,10,209,0.1)] text-gray-900'
      : 'border-[rgba(130,10,209,0.2)] bg-white text-gray-900'
  } placeholder:text-gray-400`;

export default function EnderecoPage() {
  const router = useRouter();
  const numRef = useRef(null);

  const [form, setForm] = useState({
    cep: '', logradouro: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '',
  });
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});
  const [cepStatus, setCepStatus] = useState('idle'); // idle | loading | found | error
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const n = sessionStorage.getItem('lead_name') || '';
    setName(n);
    // Se não passou pela análise, volta ao início
    const score = sessionStorage.getItem('lead_score');
    if (!score) router.push('/');
  }, []);

  // ─── Busca CEP ──────────────────────────────────────────────────────────────
  const fetchCEP = async (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepStatus('loading');
    setErrors(e => ({ ...e, cep: '' }));

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepStatus('error');
        setErrors(e => ({ ...e, cep: 'CEP não encontrado. Verifique e tente novamente.' }));
        return;
      }

      setCepStatus('found');
      setForm(f => ({
        ...f,
        logradouro: data.logradouro || '',
        bairro:     data.bairro     || '',
        cidade:     data.localidade || '',
        estado:     data.uf         || '',
        complemento: data.complemento || f.complemento,
      }));

      // Foca no número após preenchimento automático
      setTimeout(() => numRef.current?.focus(), 100);
    } catch {
      setCepStatus('error');
      setErrors(e => ({ ...e, cep: 'Erro ao buscar CEP. Verifique sua conexão.' }));
    }
  };

  const handleCEP = (v) => {
    const masked = maskCEP(v);
    setForm(f => ({ ...f, cep: masked }));
    setCepStatus('idle');
    if (masked.replace(/\D/g, '').length === 8) fetchCEP(masked);
  };

  // ─── Validação ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (form.cep.replace(/\D/g, '').length !== 8) e.cep = 'Informe um CEP válido';
    if (!form.logradouro.trim()) e.logradouro = 'Informe o logradouro';
    if (!form.numero.trim()) e.numero = 'Informe o número';
    if (!form.bairro.trim()) e.bairro = 'Informe o bairro';
    if (!form.cidade.trim()) e.cidade = 'Informe a cidade';
    if (!form.estado.trim()) e.estado = 'Informe o estado';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    // Salva endereço na sessão para usar na confirmação
    sessionStorage.setItem('lead_address', JSON.stringify({
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
    }));

    setTimeout(() => router.push('/emissao'), 400);
  };

  const firstName = name.split(' ')[0];

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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm"
        >
          ← Voltar
        </button>

        <BrandLogo />

        {/* Etapas */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${s <= 3 ? 'bg-brand-400' : 'bg-gray-200'} ${s === 3 ? 'w-6' : 'w-2'}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Conteúdo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-lg"
        >
          {/* Título */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 text-brand-600 text-sm font-medium mb-3 px-4 py-2 rounded-full glass-purple"
            >
              <MapPin size={13} /> Etapa 3 de 4
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-black font-display text-gray-900 mb-2">
              {firstName ? `${firstName}, onde` : 'Onde'} <span className="gradient-text">entregar?</span>
            </h1>
            <p className="text-gray-600">
              Informe o endereço para receber seu cartão em casa
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* CEP */}
            <Field label="CEP" icon={MapPin} error={errors.cep}
              success={cepStatus === 'found' ? 'Endereço encontrado!' : ''}
            >
              <div className="relative">
                <input
                  type="text"
                  value={form.cep}
                  onChange={e => handleCEP(e.target.value)}
                  onFocus={() => setFocused('cep')}
                  onBlur={() => setFocused(null)}
                  placeholder="00000-000"
                  maxLength={9}
                  inputMode="numeric"
                  className={inputCls(focused === 'cep', errors.cep)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {cepStatus === 'loading' && <Loader2 size={16} className="text-brand-400 animate-spin" />}
                  {cepStatus === 'found'   && <CheckCircle2 size={16} className="text-green-500" />}
                  {cepStatus === 'error'   && <AlertCircle size={16} className="text-red-400" />}
                </span>
              </div>
            </Field>

            {/* Logradouro + Número em linha */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Logradouro" icon={Home} error={errors.logradouro}>
                  <input
                    type="text"
                    value={form.logradouro}
                    onChange={e => setForm(f => ({ ...f, logradouro: e.target.value }))}
                    onFocus={() => setFocused('logradouro')}
                    onBlur={() => setFocused(null)}
                    placeholder="Rua, Av., Travessa..."
                    className={inputCls(focused === 'logradouro', errors.logradouro)}
                  />
                </Field>
              </div>
              <div>
                <Field label="Número" icon={Hash} error={errors.numero}>
                  <input
                    ref={numRef}
                    type="text"
                    value={form.numero}
                    onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                    onFocus={() => setFocused('numero')}
                    onBlur={() => setFocused(null)}
                    placeholder="123"
                    inputMode="numeric"
                    className={inputCls(focused === 'numero', errors.numero)}
                  />
                </Field>
              </div>
            </div>

            {/* Complemento */}
            <Field label="Complemento (opcional)" icon={Building2}>
              <input
                type="text"
                value={form.complemento}
                onChange={e => setForm(f => ({ ...f, complemento: e.target.value }))}
                onFocus={() => setFocused('complemento')}
                onBlur={() => setFocused(null)}
                placeholder="Apto, Bloco, Casa..."
                className={inputCls(focused === 'complemento', false)}
              />
            </Field>

            {/* Bairro */}
            <Field label="Bairro" icon={Map} error={errors.bairro}>
              <input
                type="text"
                value={form.bairro}
                onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))}
                onFocus={() => setFocused('bairro')}
                onBlur={() => setFocused(null)}
                placeholder="Bairro"
                className={inputCls(focused === 'bairro', errors.bairro)}
              />
            </Field>

            {/* Cidade + Estado em linha */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Cidade" icon={Building2} error={errors.cidade}>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                    onFocus={() => setFocused('cidade')}
                    onBlur={() => setFocused(null)}
                    placeholder="Sua cidade"
                    className={inputCls(focused === 'cidade', errors.cidade)}
                  />
                </Field>
              </div>
              <div>
                <Field label="UF" icon={Map} error={errors.estado}>
                  <input
                    type="text"
                    value={form.estado}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                    onFocus={() => setFocused('estado')}
                    onBlur={() => setFocused(null)}
                    placeholder="SP"
                    maxLength={2}
                    className={inputCls(focused === 'estado', errors.estado)}
                  />
                </Field>
              </div>
            </div>

            {/* Preview do endereço preenchido */}
            <AnimatePresence>
              {cepStatus === 'found' && form.logradouro && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-purple rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
                      <MapPin size={15} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">
                        {form.logradouro}{form.numero ? `, ${form.numero}` : ''}{form.complemento ? ` — ${form.complemento}` : ''}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {form.bairro && `${form.bairro} · `}{form.cidade}/{form.estado} · CEP {form.cep}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="btn-primary w-full text-lg py-5 rounded-2xl font-display font-bold mt-2"
            >
              <AnimatePresence mode="wait">
                {submitting ? (
                  <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 size={18} className="animate-spin" /> Salvando endereço...
                  </motion.div>
                ) : (
                  <motion.span key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    Confirmar endereço <ChevronRight size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <p className="flex items-center justify-center gap-1.5 text-center text-gray-500 text-xs">
              <Lock size={11} /> Seus dados são protegidos com criptografia SSL 256-bit
            </p>
          </form>
        </motion.div>
      </div>

      <Chat userName={name} />
    </div>
  );
}
