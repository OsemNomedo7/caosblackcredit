'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { adminLogin, verifyToken } from '@/lib/api';

// Partícula de relâmpago SVG inline
function LightningParticle({ style }) {
  return (
    <motion.div
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
    >
      <svg width="6" height="6" viewBox="0 0 6 6">
        <circle cx="3" cy="3" r="2.5" fill={style.color || '#00cfff'} opacity="0.7" />
        <circle cx="3" cy="3" r="1.5" fill="#ffffff" opacity="0.9" />
      </svg>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      verifyToken()
        .then(() => router.push('/admin/dashboard'))
        .catch(() => { localStorage.removeItem('admin_token'); setChecking(false); });
    } else {
      setChecking(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Preencha todos os campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { token } = await adminLogin(form);
      localStorage.setItem('admin_token', token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Usuário ou senha incorretos');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#020008', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #00cfff', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const particles = Array.from({ length: 24 }).map((_, i) => ({
    left: `${(i * 4.17) % 100}%`,
    top: `${(i * 7.3 + 10) % 100}%`,
    color: i % 3 === 0 ? '#ff2d55' : i % 3 === 1 ? '#00cfff' : '#a855f7',
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(0,80,150,0.18) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(200,0,40,0.12) 0%, transparent 50%), #020008',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Grid de fundo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,180,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,180,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Borda neon superior */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #ff2d55, #00cfff, #a855f7, transparent)', opacity: 0.8 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,207,255,0.4), transparent)' }} />

      {/* Partículas */}
      {particles.map((p, i) => (
        <LightningParticle key={i} style={p} />
      ))}

      {/* Glows de fundo */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,140,255,0.12), transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,0,50,0.1), transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,0,180,0.07), transparent 70%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

      {/* Card central */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        style={{
          width: '100%', maxWidth: 420,
          position: 'relative', zIndex: 10,
        }}
      >
        {/* Borda com glow */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(0,207,255,0.08), rgba(168,85,247,0.06), rgba(255,45,85,0.05))',
          border: '1px solid rgba(0,207,255,0.2)',
          borderRadius: 24,
          boxShadow: '0 0 40px rgba(0,180,255,0.08), 0 0 80px rgba(100,0,200,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}>

          {/* Linha decorativa topo */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #ff2d55 20%, #00cfff 50%, #a855f7 80%, transparent)', opacity: 0.9 }} />

          <div style={{ padding: '28px 40px 40px' }}>

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 16 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  display: 'flex', justifyContent: 'center',
                  filter: 'drop-shadow(0 0 24px rgba(0,180,255,0.6)) drop-shadow(0 0 48px rgba(168,85,247,0.35))',
                }}
              >
                <img
                  src="/imagens/logo.png"
                  alt="Logo"
                  style={{ height: 220, width: 'auto', maxWidth: 380, objectFit: 'contain', display: 'block' }}
                />
              </motion.div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.25)',
                borderRadius: 20, padding: '5px 16px',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff2d55', boxShadow: '0 0 6px #ff2d55', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ color: '#ff6080', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Acesso Restrito</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Campo usuário */}
              <div>
                <label style={{ display: 'block', color: 'rgba(160,210,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Usuário
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused('')}
                    placeholder="admin"
                    autoComplete="username"
                    autoFocus
                    style={{
                      width: '100%', padding: '13px 16px 13px 44px',
                      background: focused === 'username' ? 'rgba(0,180,255,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${focused === 'username' ? 'rgba(0,207,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12, color: '#e0f0ff', fontSize: 14,
                      outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
                      boxShadow: focused === 'username' ? '0 0 0 3px rgba(0,180,255,0.08), inset 0 0 20px rgba(0,180,255,0.03)' : 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }}>◈</span>
                </div>
              </div>

              {/* Campo senha */}
              <div>
                <label style={{ display: 'block', color: 'rgba(160,210,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '13px 48px 13px 44px',
                      background: focused === 'password' ? 'rgba(0,180,255,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${focused === 'password' ? 'rgba(0,207,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12, color: '#e0f0ff', fontSize: 14,
                      outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
                      boxShadow: focused === 'password' ? '0 0 0 3px rgba(0,180,255,0.08), inset 0 0 20px rgba(0,180,255,0.03)' : 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }}>🔒</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(160,210,255,0.5)', fontSize: 14, padding: 2,
                      transition: 'color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00cfff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,210,255,0.5)'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Erro */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,45,85,0.1)',
                      border: '1px solid rgba(255,45,85,0.3)',
                      color: '#ff6080', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span>⚠</span> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.97 }}
                style={{
                  padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800,
                  background: loading
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, #0066cc, #00a0e9 40%, #0055bb)',
                  color: loading ? 'rgba(255,255,255,0.3)' : '#ffffff',
                  border: loading ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,180,255,0.4)',
                  cursor: loading ? 'default' : 'pointer',
                  letterSpacing: '0.05em',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(0,140,255,0.3), 0 4px 16px rgba(0,0,0,0.4)',
                  transition: 'all .2s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {!loading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08))', pointerEvents: 'none' }} />
                )}
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#00cfff' }} />
                    Autenticando...
                  </div>
                ) : (
                  <span style={{ position: 'relative' }}>⚡ Acessar Painel</span>
                )}
              </motion.button>
            </form>

            {/* Footer do card */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00cfff', boxShadow: '0 0 6px #00cfff', display: 'inline-block' }} />
              <span style={{ color: 'rgba(130,180,220,0.4)', fontSize: 11 }}>Conexão segura · Área protegida</span>
            </div>
          </div>
        </div>

        {/* Reflexo no fundo */}
        <div style={{
          position: 'absolute', bottom: -20, left: '10%', right: '10%', height: 20,
          background: 'linear-gradient(to bottom, rgba(0,180,255,0.08), transparent)',
          filter: 'blur(8px)', borderRadius: '0 0 50% 50%', pointerEvents: 'none',
        }} />
      </motion.div>

      <style>{`
        input::placeholder { color: rgba(160,210,255,0.2) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
