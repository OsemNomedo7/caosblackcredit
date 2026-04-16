'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import {
  getDashboard, getLeads, getChats, getChatMessages,
  updateSettings, getSettings, deleteLead, getWebhookUrl, updateCredentials
} from '@/lib/api';
import PersonalizacaoPanel from './PersonalizacaoPanel';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const D = {
  bg:         '#05000e',
  surface:    '#0d0520',
  surfaceHi:  '#140730',
  card:       'rgba(255,255,255,0.03)',
  cardHover:  'rgba(255,255,255,0.055)',
  border:     'rgba(255,255,255,0.07)',
  borderHi:   'rgba(130,10,209,0.45)',
  purple:     '#820AD1',
  purpleGlow: 'rgba(130,10,209,0.18)',
  purpleSoft: 'rgba(130,10,209,0.12)',
  textPri:    '#f0e8ff',
  textSec:    'rgba(220,200,255,0.55)',
  textMut:    'rgba(200,180,255,0.3)',
  green:      '#22c55e',
  greenSoft:  'rgba(34,197,94,0.12)',
  greenBdr:   'rgba(34,197,94,0.3)',
  yellow:     '#eab308',
  yellowSoft: 'rgba(234,179,8,0.12)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.12)',
  blue:       '#3b82f6',
  blueSoft:   'rgba(59,130,246,0.12)',
};

const cardStyle = {
  background: D.card,
  border: `1px solid ${D.border}`,
  borderRadius: 16,
};

// ─── FILL DAYS HELPER ────────────────────────────────────────────────────────
function fillDays(rawData = [], days = 7) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = rawData.find(r => r.day === key);
    result.push({
      day: key,
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: Number(found?.total || 0),
      paid: Number(found?.paid || 0),
    });
  }
  return result;
}

// ─── SVG: SPARKLINE ──────────────────────────────────────────────────────────
function Sparkline({ values = [], color = '#820AD1', width = 72, height = 28 }) {
  if (values.length < 2) return <div style={{ width, height }} />;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 3 - ((v - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const ptsStr = pts.join(' ');
  const last = pts[pts.length - 1].split(',');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={ptsStr} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── SVG: AREA CHART (7 dias) ────────────────────────────────────────────────
function AreaChart({ data = [] }) {
  const W = 560, H = 160;
  const pad = { t: 12, r: 12, b: 32, l: 36 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  if (data.length < 2) {
    return (
      <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.textMut, fontSize: 12 }}>
        Sem dados suficientes (mínimo 2 dias)
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const xi = i => pad.l + (i / (data.length - 1)) * iw;
  const yt = v => pad.t + ih - (v / maxVal) * ih;

  const totalPts = data.map((d, i) => `${xi(i).toFixed(1)},${yt(d.total).toFixed(1)}`).join(' ');
  const paidPts  = data.map((d, i) => `${xi(i).toFixed(1)},${yt(d.paid).toFixed(1)}`).join(' ');
  const baseline = (pad.t + ih).toFixed(1);

  const totalArea = `M ${xi(0).toFixed(1)},${baseline} ${data.map((d, i) => `L ${xi(i).toFixed(1)},${yt(d.total).toFixed(1)}`).join(' ')} L ${xi(data.length - 1).toFixed(1)},${baseline} Z`;
  const paidArea  = `M ${xi(0).toFixed(1)},${baseline} ${data.map((d, i) => `L ${xi(i).toFixed(1)},${yt(d.paid).toFixed(1)}`).join(' ')} L ${xi(data.length - 1).toFixed(1)},${baseline} Z`;

  const gridVals = [0, 0.5, 1].map(f => ({ f, v: Math.round(maxVal * f) }));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D.purple} stopOpacity="0.35" />
          <stop offset="100%" stopColor={D.purple} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D.green} stopOpacity="0.35" />
          <stop offset="100%" stopColor={D.green} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridVals.map(({ f, v }) => {
        const y = (pad.t + ih * (1 - f)).toFixed(1);
        return (
          <g key={f}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke={D.border} strokeWidth="1" strokeDasharray="4 3" />
            <text x={pad.l - 6} y={parseFloat(y) + 4} textAnchor="end" fontSize="9" fill={D.textMut}>{v}</text>
          </g>
        );
      })}

      {/* Areas */}
      <path d={totalArea} fill="url(#gTotal)" />
      <path d={paidArea} fill="url(#gPaid)" />

      {/* Lines */}
      <polyline points={totalPts} fill="none" stroke={D.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={paidPts} fill="none" stroke={D.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots on last point */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const lx = xi(data.length - 1);
        return (
          <>
            <circle cx={lx} cy={yt(last.total)} r="3.5" fill={D.purple} stroke={D.surface} strokeWidth="1.5" />
            <circle cx={lx} cy={yt(last.paid)} r="3.5" fill={D.green} stroke={D.surface} strokeWidth="1.5" />
          </>
        );
      })()}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={xi(i)} y={H - 6} textAnchor="middle" fontSize="9" fill={D.textMut}>
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── SVG: DONUT CHART ────────────────────────────────────────────────────────
function DonutChart({ paid = 0, pending = 0, analyzing = 0, size = 160 }) {
  const total = paid + pending + analyzing || 1;
  const r = (size / 2) - 18;
  const cx = size / 2;
  const cy = size / 2;
  const sw = 14;
  const circ = 2 * Math.PI * r;

  const segs = [
    { value: paid,      color: D.green,  label: 'Pagos' },
    { value: pending,   color: D.yellow, label: 'Pendentes' },
    { value: analyzing, color: D.blue,   label: 'Análise' },
  ].filter(s => s.value > 0);

  let offset = 0;
  const arcs = segs.map(s => {
    const dash = (s.value / total) * circ;
    const arc = { ...s, dash, gap: circ - dash, offset };
    offset += dash;
    return arc;
  });

  const pct = ((paid / total) * 100).toFixed(0);

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
      {arcs.map((arc, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={sw}
          strokeDasharray={`${arc.dash.toFixed(2)} ${arc.gap.toFixed(2)}`}
          strokeDashoffset={-(arc.offset).toFixed(2)}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="22" fontWeight="900" fill={D.textPri}>{pct}%</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10" fill={D.textMut}>conversão</text>
    </svg>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = D.purple, accentSoft = D.purpleSoft, trend, sparkData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      style={{
        background: `linear-gradient(135deg, ${accentSoft}, rgba(0,0,0,0))`,
        border: `1px solid ${accent}25`,
        borderRadius: 16, padding: '18px 20px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}30, transparent)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}20`, border: `1px solid ${accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{icon}</div>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? D.green : D.red, background: trend >= 0 ? D.greenSoft : D.redSoft, border: `1px solid ${trend >= 0 ? D.greenBdr : D.redSoft}`, padding: '2px 7px', borderRadius: 20 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p style={{ color: D.textSec, fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{ color: D.textPri, fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 3 }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {sub && <p style={{ color: D.textMut, fontSize: 11 }}>{sub}</p>}
        {sparkData && <Sparkline values={sparkData} color={accent} />}
      </div>
    </motion.div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    paid:      { label: 'Pago',     color: D.green,  soft: D.greenSoft,  bdr: D.greenBdr,       icon: '●' },
    pending:   { label: 'Pendente', color: D.yellow, soft: D.yellowSoft, bdr: `${D.yellow}40`,  icon: '◐' },
    analyzing: { label: 'Análise',  color: D.blue,   soft: D.blueSoft,   bdr: `${D.blue}40`,    icon: '◌' },
  };
  const s = cfg[status] || cfg.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: s.color, background: s.soft, border: `1px solid ${s.bdr}`, padding: '3px 9px', borderRadius: 20 }}>
      <span style={{ fontSize: 7 }}>{s.icon}</span>{s.label}
    </span>
  );
}

// ─── SCORE BAR ────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const pct = Math.min(100, Math.max(0, (score / 1000) * 100));
  const color = score >= 650 ? D.green : score >= 500 ? D.yellow : D.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color, fontWeight: 700, fontSize: 13, minWidth: 32 }}>{score}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', maxWidth: 60 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color }} />
      </div>
    </div>
  );
}

// ─── ADMIN CHAT ───────────────────────────────────────────────────────────────
function AdminChat({ socket }) {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const messagesEndRef = useRef(null);

  const loadSessions = async () => {
    try { setSessions(await getChats()); } catch { /* */ }
  };

  useEffect(() => {
    loadSessions();
    socket?.on('receive_message', (msg) => {
      if (msg.sender === 'user') {
        setSessions(prev => {
          const exists = prev.find(s => s.session_id === msg.session_id);
          if (!exists) { loadSessions(); return prev; }
          return prev.map(s => s.session_id === msg.session_id
            ? { ...s, last_msg: msg.message, last_message: msg.created_at, unread: (s.unread || 0) + (activeSession !== msg.session_id ? 1 : 0) }
            : s);
        });
        if (activeSession === msg.session_id) setMessages(p => [...p, msg]);
      }
    });
    socket?.on('new_lead', () => loadSessions());
    return () => { socket?.off('receive_message'); socket?.off('new_lead'); };
  }, [socket, activeSession]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openSession = async (sid) => {
    setActiveSession(sid);
    setSessions(p => p.map(s => s.session_id === sid ? { ...s, unread: 0 } : s));
    try { setMessages(await getChatMessages(sid)); } catch { /* */ }
  };

  const sendReply = () => {
    if (!reply.trim() || !activeSession) return;
    socket?.emit('send_message', { sessionId: activeSession, message: reply, sender: 'support' });
    setMessages(p => [...p, { session_id: activeSession, sender: 'support', message: reply, created_at: new Date().toISOString() }]);
    setReply('');
  };

  const activeData = sessions.find(s => s.session_id === activeSession);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 540 }}>
      {/* Lista */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: D.textPri, fontWeight: 700, fontSize: 13 }}>Conversas</span>
          <button onClick={loadSessions} style={{ color: D.textMut, fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}>↻ atualizar</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: D.textMut, fontSize: 13 }}>Nenhuma conversa</div>
          ) : sessions.map(s => (
            <button key={s.session_id} onClick={() => openSession(s.session_id)} style={{
              width: '100%', padding: '12px 16px', textAlign: 'left',
              background: activeSession === s.session_id ? D.purpleSoft : 'none',
              borderLeft: activeSession === s.session_id ? `2px solid ${D.purple}` : '2px solid transparent',
              borderRight: 'none', borderTop: 'none', borderBottom: `1px solid ${D.border}`,
              cursor: 'pointer', transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ color: D.textPri, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.lead_name || `Usuário …${s.session_id.slice(-4)}`}
                </span>
                {s.unread > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: D.purple, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 4px' }}>{s.unread}</span>
                )}
              </div>
              <p style={{ color: D.textMut, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.last_sender === 'support' ? '↗ Você: ' : ''}{s.last_msg}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mensagens */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeSession ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 36 }}>💬</div>
            <p style={{ color: D.textMut, fontSize: 13 }}>Selecione uma conversa</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: D.purpleSoft, border: `1px solid ${D.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
              <div>
                <p style={{ color: D.textPri, fontSize: 13, fontWeight: 600 }}>{activeData?.lead_name || 'Usuário'}</p>
                <p style={{ color: D.textMut, fontSize: 11 }}>ID: {activeSession.slice(-10)}</p>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'support' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '9px 13px', borderRadius: 14, background: msg.sender === 'support' ? D.purpleSoft : 'rgba(255,255,255,0.05)', border: `1px solid ${msg.sender === 'support' ? D.borderHi : D.border}`, color: D.textPri, fontSize: 13, lineHeight: 1.5 }}>
                    {msg.message}
                    <div style={{ color: D.textMut, fontSize: 10, marginTop: 4 }}>
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${D.border}`, display: 'flex', gap: 8 }}>
              <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="Digite sua resposta..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: 10, padding: '10px 14px', color: D.textPri, fontSize: 13, outline: 'none' }} />
              <button onClick={sendReply} disabled={!reply.trim()} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: reply.trim() ? `linear-gradient(135deg, ${D.purple}, #4b047d)` : 'rgba(255,255,255,0.05)', color: reply.trim() ? '#fff' : D.textMut, border: 'none', cursor: reply.trim() ? 'pointer' : 'default', transition: 'all .15s' }}>Enviar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
function SettingsPanel() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookCopied, setWebhookCopied] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
    getWebhookUrl().then(d => setWebhookUrl(d.url)).catch(() => {
      setWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/webhook/sigilopay`);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const fields = [
    { key: 'emission_fee',    label: 'Taxa de Emissão',          icon: '💳', type: 'number', step: '0.01', suffix: 'R$' },
    { key: 'shipping_fee',   label: 'Taxa de Envio',             icon: '📦', type: 'number', step: '0.01', suffix: 'R$' },
    { key: 'max_limit',      label: 'Limite Máximo',             icon: '💰', type: 'number', suffix: 'R$' },
    { key: 'pix_key',        label: 'Chave PIX (fallback)',      icon: '🔑', type: 'text' },
    { key: 'pix_type',       label: 'Tipo da Chave PIX',         icon: '📋', type: 'text' },
    { key: 'beneficiary_name', label: 'Nome do Beneficiário',    icon: '🏢', type: 'text' },
    { key: 'approved_today', label: 'Contador "Aprovados Hoje"', icon: '📊', type: 'number' },
  ];

  const sigiloFields = [
    { key: 'sigilopay_public_key', label: 'SigiloPay — Public Key', icon: '🔓', type: 'text' },
    { key: 'sigilopay_secret_key', label: 'SigiloPay — Secret Key', icon: '🔐', type: 'password' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginBottom: 20 }}>
        {fields.map(f => (
          <div key={f.key} style={{ ...cardStyle, padding: '16px 18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: D.textSec, fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>{f.icon}</span>{f.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {f.suffix && <span style={{ color: D.textMut, fontSize: 13 }}>{f.suffix}</span>}
              <input type={f.type} step={f.step} value={settings[f.key] || ''} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: 10, padding: '9px 12px', color: D.textPri, fontSize: 14, fontWeight: 600, outline: 'none', width: '100%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* SigiloPay */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: D.purpleSoft, border: `1px solid ${D.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <div>
            <p style={{ color: D.textPri, fontSize: 13, fontWeight: 700 }}>Gateway SigiloPay</p>
            <p style={{ color: D.textMut, fontSize: 11 }}>Quando configurado, gera QR Code real via SigiloPay. Sem chaves = PIX local de fallback.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {sigiloFields.map(f => (
            <div key={f.key} style={{ ...cardStyle, padding: '16px 18px', borderColor: D.borderHi }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d8b4fe', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span>{f.icon}</span>{f.label}
              </label>
              <input type={f.type} value={settings[f.key] || ''} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.key.includes('secret') ? '••••••••••••••••' : 'pk_...'}
                style={{ width: '100%', background: 'rgba(130,10,209,0.06)', border: `1px solid ${D.borderHi}`, borderRadius: 10, padding: '9px 12px', color: D.textPri, fontSize: 13, fontWeight: 500, outline: 'none', fontFamily: 'monospace' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Webhook */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: D.blueSoft, border: `1px solid ${D.blue}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔔</div>
          <div>
            <p style={{ color: D.textPri, fontSize: 13, fontWeight: 700 }}>Webhook de Pagamento</p>
            <p style={{ color: D.textMut, fontSize: 11 }}>Configure esta URL no painel SigiloPay para receber confirmações automáticas de pagamento.</p>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px 18px', borderColor: `${D.blue}40`, marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#93c5fd', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🔗 URL do Webhook
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, background: 'rgba(59,130,246,0.06)', border: `1px solid ${D.blue}35`, borderRadius: 10, padding: '9px 12px', color: '#93c5fd', fontSize: 12, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {webhookUrl || 'Carregando...'}
            </div>
            <button onClick={() => { if (!webhookUrl) return; navigator.clipboard.writeText(webhookUrl).then(() => { setWebhookCopied(true); setTimeout(() => setWebhookCopied(false), 2000); }); }}
              style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0, background: webhookCopied ? D.greenSoft : D.blueSoft, color: webhookCopied ? D.green : '#93c5fd', border: `1px solid ${webhookCopied ? D.greenBdr : `${D.blue}40`}`, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
              {webhookCopied ? '✅ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <p style={{ color: D.textMut, fontSize: 11, marginTop: 8 }}>
            SigiloPay: Configurações → Webhooks → adicione a URL acima com evento <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>TRANSACTION_PAID</span>
          </p>
        </div>
        <div style={{ ...cardStyle, padding: '16px 18px', borderColor: `${D.blue}40` }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#93c5fd', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🛡️ Token de Validação (opcional)
          </label>
          <input type="text" value={settings.webhook_token || ''} onChange={e => setSettings(s => ({ ...s, webhook_token: e.target.value }))}
            placeholder="Cole aqui o token fornecido pela SigiloPay..."
            style={{ width: '100%', background: 'rgba(59,130,246,0.06)', border: `1px solid ${D.blue}35`, borderRadius: 10, padding: '9px 12px', color: D.textPri, fontSize: 13, outline: 'none', fontFamily: 'monospace' }} />
          <p style={{ color: D.textMut, fontSize: 11, marginTop: 6 }}>Deixe em branco para aceitar todos os webhooks.</p>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: saved ? D.greenSoft : `linear-gradient(135deg, ${D.purple}, #4b047d)`, color: saved ? D.green : '#fff', border: `1px solid ${saved ? D.greenBdr : 'transparent'}`, cursor: 'pointer', transition: 'all .2s' }}>
        {saving ? '⏳ Salvando...' : saved ? '✅ Salvo!' : '💾 Salvar Configurações'}
      </button>
    </div>
  );
}

// ─── DATA TABLE ───────────────────────────────────────────────────────────────
function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: D.textMut, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${D.border}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

// ─── CONTA / CREDENCIAIS ──────────────────────────────────────────────────────
function ContaPanel() {
  const [form, setForm] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.currentPassword) { setMsg({ type: 'err', text: 'Informe sua senha atual.' }); return; }
    if (!form.newUsername && !form.newPassword) { setMsg({ type: 'err', text: 'Informe ao menos um campo para alterar.' }); return; }
    if (form.newPassword && form.newPassword !== form.confirmPassword) { setMsg({ type: 'err', text: 'As senhas não coincidem.' }); return; }
    if (form.newPassword && form.newPassword.length < 6) { setMsg({ type: 'err', text: 'Nova senha: mínimo 6 caracteres.' }); return; }

    setSaving(true);
    try {
      await updateCredentials({
        currentPassword: form.currentPassword,
        newUsername: form.newUsername || undefined,
        newPassword: form.newPassword || undefined,
      });
      setMsg({ type: 'ok', text: 'Credenciais atualizadas com sucesso!' });
      setForm({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'err', text: err?.response?.data?.error || 'Erro ao atualizar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`,
    borderRadius: 10, padding: '11px 14px', color: D.textPri, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', color: D.textSec, fontSize: 11, fontWeight: 600,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em',
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: D.textPri, fontSize: 24, fontWeight: 900, margin: 0 }}>Conta do Administrador</h1>
        <p style={{ color: D.textMut, fontSize: 13, marginTop: 4 }}>Altere usuário e/ou senha de acesso ao painel</p>
      </div>

      <form onSubmit={handleSave}>
        {/* Senha atual */}
        <div style={{ ...cardStyle, padding: '22px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: D.purpleSoft, border: `1px solid ${D.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔐</div>
            <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>Verificação de identidade</p>
          </div>
          <label style={labelStyle}>Senha atual <span style={{ color: D.red }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Digite sua senha atual"
              style={{ ...inputStyle, paddingRight: 44 }}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowCurrent(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: D.textMut, fontSize: 14 }}>
              {showCurrent ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Novo usuário */}
        <div style={{ ...cardStyle, padding: '22px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: D.blueSoft, border: `1px solid ${D.blue}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>◈</div>
            <div>
              <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>Novo usuário</p>
              <p style={{ color: D.textMut, fontSize: 11 }}>Deixe em branco para manter o atual</p>
            </div>
          </div>
          <label style={labelStyle}>Nome de usuário</label>
          <input
            type="text"
            value={form.newUsername}
            onChange={e => setForm(f => ({ ...f, newUsername: e.target.value }))}
            placeholder="ex: admin2"
            style={inputStyle}
            autoComplete="username"
          />
        </div>

        {/* Nova senha */}
        <div style={{ ...cardStyle, padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: D.greenSoft, border: `1px solid ${D.greenBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔑</div>
            <div>
              <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>Nova senha</p>
              <p style={{ color: D.textMut, fontSize: 11 }}>Mínimo 6 caracteres · Deixe em branco para manter</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nova senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: D.textMut, fontSize: 14 }}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirmar senha</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                style={{
                  ...inputStyle,
                  borderColor: form.confirmPassword && form.confirmPassword !== form.newPassword
                    ? `${D.red}60` : D.border,
                }}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Força da senha */}
          {form.newPassword && (() => {
            const len = form.newPassword.length;
            const hasUpper = /[A-Z]/.test(form.newPassword);
            const hasNum = /[0-9]/.test(form.newPassword);
            const hasSpecial = /[^a-zA-Z0-9]/.test(form.newPassword);
            const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0);
            const levels = [
              { label: 'Muito fraca', color: D.red },
              { label: 'Fraca',       color: D.red },
              { label: 'Média',       color: D.yellow },
              { label: 'Forte',       color: D.green },
              { label: 'Muito forte', color: D.green },
            ];
            const lv = levels[score] || levels[0];
            return (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? lv.color : 'rgba(255,255,255,0.06)', transition: 'background .2s' }} />
                  ))}
                </div>
                <p style={{ color: lv.color, fontSize: 11 }}>{lv.label}</p>
              </div>
            );
          })()}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                padding: '11px 16px', borderRadius: 10, marginBottom: 16,
                background: msg.type === 'ok' ? D.greenSoft : D.redSoft,
                border: `1px solid ${msg.type === 'ok' ? D.greenBdr : `${D.red}40`}`,
                color: msg.type === 'ok' ? D.green : D.red,
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: saving ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${D.purple}, #4b047d)`,
            color: saving ? D.textMut : '#fff',
            border: 'none', cursor: saving ? 'default' : 'pointer', transition: 'all .2s',
            boxShadow: saving ? 'none' : `0 4px 20px ${D.purpleGlow}`,
          }}
        >
          {saving ? '⏳ Salvando...' : '💾 Salvar Credenciais'}
        </button>
      </form>
    </div>
  );
}

// ─── SIDEBAR NAV ITEM ────────────────────────────────────────────────────────
function NavItem({ tab, label, icon, active, collapsed, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
        padding: collapsed ? '12px 0' : '10px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? D.purpleSoft : 'none',
        borderLeft: active ? `3px solid ${D.purple}` : '3px solid transparent',
        borderRight: 'none', borderTop: 'none', borderBottom: 'none',
        cursor: 'pointer', transition: 'all .15s', position: 'relative',
        marginBottom: 2, borderRadius: collapsed ? 0 : '0 10px 10px 0',
      }}
    >
      <span style={{ fontSize: 17, flexShrink: 0, color: active ? '#d8b4fe' : D.textMut }}>{icon}</span>
      {!collapsed && <span style={{ color: active ? '#d8b4fe' : D.textSec, fontSize: 13, fontWeight: active ? 700 : 500, flex: 1, textAlign: 'left' }}>{label}</span>}
      {badge > 0 && (
        <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: D.purple, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', position: collapsed ? 'absolute' : 'relative', top: collapsed ? 6 : 'auto', right: collapsed ? 6 : 'auto' }}>{badge}</span>
      )}
    </button>
  );
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [newLeadFlash, setNewLeadFlash] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);

  const sideW = collapsed ? 72 : 260;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin'); return; }

    const sock = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', { transports: ['websocket', 'polling'] });
    sock.on('connect', () => sock.emit('admin_auth', token));
    sock.on('admin_ready', ({ online_count }) => setOnlineCount(online_count));
    sock.on('user_online', ({ online_count }) => setOnlineCount(online_count));
    sock.on('user_offline', ({ online_count }) => setOnlineCount(online_count));
    sock.on('new_lead', (lead) => {
      setStats(s => s ? { ...s, total: s.total + 1, today: s.today + 1 } : s);
      setLeads(prev => [lead, ...prev.slice(0, 19)]);
      setNewLeadFlash(true);
      setTimeout(() => setNewLeadFlash(false), 3000);
    });
    sock.on('lead_updated', ({ id, payment_status }) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, payment_status } : l));
    });
    sock.on('receive_message', (msg) => {
      if (msg.sender === 'user' && activeTab !== 'chat') {
        setUnreadChats(u => u + 1);
      }
    });
    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, leadsData] = await Promise.all([getDashboard(), getLeads({ search, page })]);
      setStats(dashData);
      setLeads(leadsData.leads);
      setTotalPages(leadsData.pages);
    } catch {
      localStorage.removeItem('admin_token');
      router.push('/admin');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [page]);
  useEffect(() => { const t = setTimeout(loadData, 400); return () => clearTimeout(t); }, [search]);

  const handleLogout = () => { localStorage.removeItem('admin_token'); router.push('/admin'); };

  const conversionRate = stats?.total ? ((stats?.paid / stats?.total) * 100).toFixed(1) : '0.0';
  const chartData = fillDays(stats?.leadsByDay || []);
  const sparkTotal = chartData.map(d => d.total);
  const sparkPaid  = chartData.map(d => d.paid);

  const TABS = [
    { id: 'dashboard',      icon: '▣', label: 'Dashboard' },
    { id: 'leads',          icon: '⊞', label: 'Leads' },
    { id: 'chat',           icon: '◎', label: 'Chat', badge: unreadChats },
    { id: 'settings',       icon: '◈', label: 'Configurações' },
    { id: 'personalizacao', icon: '◐', label: 'Personalização' },
    { id: 'conta',          icon: '👤', label: 'Minha Conta' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.textPri, fontFamily: "'Inter', sans-serif", display: 'flex' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        width: sideW, background: D.surface,
        borderRight: `1px solid ${D.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'width .2s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
      }}>

        {/* Logo + toggle */}
        <div style={{ borderBottom: `1px solid ${D.border}`, flexShrink: 0, position: 'relative' }}>
          {!collapsed ? (
            <div style={{ padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src="/imagens/logo.png"
                alt="Logo"
                style={{ width: '100%', maxWidth: 224, height: 'auto', objectFit: 'contain', display: 'block' }}
              />
              <button
                onClick={() => setCollapsed(true)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, cursor: 'pointer', color: D.textMut, fontSize: 14, borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                title="Recolher"
              >‹</button>
            </div>
          ) : (
            <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <img
                src="/imagens/logo.png"
                alt="Logo"
                style={{ width: 54, height: 54, objectFit: 'contain' }}
              />
              <button
                onClick={() => setCollapsed(false)}
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, cursor: 'pointer', color: D.textMut, fontSize: 14, borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Expandir"
              >›</button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 12, overflowY: 'auto', overflowX: 'hidden' }}>
          {TABS.map(t => (
            <NavItem
              key={t.id}
              tab={t.id}
              label={t.label}
              icon={t.id === 'dashboard' && newLeadFlash ? '🟢' : t.icon}
              active={activeTab === t.id}
              collapsed={collapsed}
              badge={t.badge}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id === 'chat') setUnreadChats(0);
              }}
            />
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: collapsed ? '16px 0' : '16px', borderTop: `1px solid ${D.border}`, flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: D.green, boxShadow: `0 0 6px ${D.green}`, flexShrink: 0 }} />
              <span style={{ color: D.textSec, fontSize: 12 }}>{onlineCount} online agora</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sair' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, padding: collapsed ? '8px 0' : '8px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: D.textMut, fontSize: 13, borderRadius: 8,
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = D.red}
            onMouseLeave={e => e.currentTarget.style.color = D.textMut}
          >
            <span>⎋</span>
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, marginLeft: sideW, transition: 'margin-left .2s cubic-bezier(.4,0,.2,1)', minHeight: '100vh', position: 'relative' }}>

        {/* Watermark */}
        <div style={{ position: 'fixed', top: '50%', left: `calc(50% + ${sideW / 2}px)`, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }}>
          <img src="/imagens/logo.png" alt="" style={{ maxWidth: 480, maxHeight: 480, objectFit: 'contain', opacity: 0.03, userSelect: 'none' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '32px 28px', paddingBottom: 48, maxWidth: 1260, margin: '0 auto' }}>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${D.purple}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: D.textMut, fontSize: 14 }}>Carregando dados...</span>
            </div>
          )}

          {!loading && (
            <AnimatePresence mode="wait">

              {/* ── DASHBOARD ──────────────────────────────────────── */}
              {activeTab === 'dashboard' && (
                <motion.div key="dash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                      <p style={{ color: D.textMut, fontSize: 12, marginBottom: 4 }}>
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h1 style={{ color: D.textPri, fontSize: 24, fontWeight: 900, margin: 0 }}>Visão Geral</h1>
                    </div>
                    <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, color: D.textSec, background: D.card, border: `1px solid ${D.border}`, cursor: 'pointer' }}>↻ Atualizar</button>
                  </div>

                  {/* KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 24 }}>
                    <StatCard icon="👥" label="Total de Leads" value={stats?.total || 0} sub="Desde o início" trend={12} sparkData={sparkTotal} />
                    <StatCard icon="✅" label="Pagamentos" value={stats?.paid || 0} sub="Confirmados" accent={D.green} accentSoft={D.greenSoft} trend={8} sparkData={sparkPaid} />
                    <StatCard icon="📅" label="Hoje" value={stats?.today || 0} sub="Novos leads" accent={D.blue} accentSoft={D.blueSoft} />
                    <StatCard icon="💰" label="Receita Total" value={`R$ ${(stats?.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} sub={`Ticket médio: R$ ${(stats?.ticketMedio || 49.80).toFixed(2)}`} accent={D.yellow} accentSoft={D.yellowSoft} trend={5} />
                    <StatCard icon="🎯" label="Conversão" value={`${conversionRate}%`} sub="Leads que pagaram" accent="#a855f7" accentSoft="rgba(168,85,247,0.1)" />
                  </div>

                  {/* Charts row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, marginBottom: 16 }}>

                    {/* Area chart */}
                    <div style={{ ...cardStyle, padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>Leads — últimos 7 dias</p>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.textMut }}>
                            <span style={{ display: 'inline-block', width: 10, height: 2, borderRadius: 2, background: D.purple }} />Total
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.textMut }}>
                            <span style={{ display: 'inline-block', width: 10, height: 2, borderRadius: 2, background: D.green }} />Pagos
                          </span>
                        </div>
                      </div>
                      <AreaChart data={chartData} />
                    </div>

                    {/* Donut chart */}
                    <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14, marginBottom: 12, alignSelf: 'flex-start' }}>Conversão</p>
                      <DonutChart paid={stats?.paid || 0} pending={stats?.pending || 0} analyzing={0} size={140} />
                      <div style={{ marginTop: 12, width: '100%' }}>
                        {[
                          { label: 'Pagos', v: stats?.paid || 0, color: D.green },
                          { label: 'Pendentes', v: stats?.pending || 0, color: D.yellow },
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: D.textSec }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                              {item.label}
                            </span>
                            <span style={{ color: item.color, fontWeight: 700, fontSize: 12 }}>{item.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Perfis + leads recentes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>

                    {/* Perfis */}
                    <div style={{ ...cardStyle, padding: 20 }}>
                      <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Perfis</p>
                      {(stats?.profileStats || []).map(ps => {
                        const tot = stats?.total || 1;
                        const pct = Math.round((ps.count / tot) * 100);
                        const isClient = ps.profile === 'client';
                        return (
                          <div key={ps.profile} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{isClient ? '👑' : '🎯'}</span>
                                <span style={{ color: D.textSec, fontSize: 13 }}>{isClient ? 'Clientes' : 'Negativados'}</span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>{ps.count}</span>
                                <span style={{ color: D.textMut, fontSize: 11, marginLeft: 4 }}>{pct}%</span>
                              </div>
                            </div>
                            <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: isClient ? D.blue : D.purple, transition: 'width .6s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                      {(!stats?.profileStats || stats.profileStats.length === 0) && (
                        <div style={{ color: D.textMut, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sem dados</div>
                      )}
                    </div>

                    {/* Leads recentes */}
                    <div style={{ ...cardStyle, overflow: 'hidden' }}>
                      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>Leads Recentes</p>
                        <button onClick={() => setActiveTab('leads')} style={{ color: '#a78bfa', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos →</button>
                      </div>
                      <DataTable
                        headers={['Nome', 'Perfil', 'Score', 'Status', 'Data']}
                        rows={(stats?.recent || []).map(l => (
                          <tr key={l.id} style={{ borderBottom: `1px solid ${D.border}`, transition: 'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = D.cardHover}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ color: D.textPri, fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                              <div style={{ color: D.textMut, fontSize: 11, fontFamily: 'monospace' }}>{l.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</div>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, color: l.profile === 'client' ? D.blue : '#a78bfa', background: l.profile === 'client' ? D.blueSoft : D.purpleSoft, border: `1px solid ${l.profile === 'client' ? `${D.blue}35` : D.borderHi}` }}>
                                {l.profile === 'client' ? '👑 Cliente' : '🎯 Negativado'}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px' }}><ScoreBar score={l.score} /></td>
                            <td style={{ padding: '11px 14px' }}><StatusBadge status={l.payment_status} /></td>
                            <td style={{ padding: '11px 14px', color: D.textMut, fontSize: 11 }}>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      />
                      {(stats?.recent || []).length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: D.textMut, fontSize: 13 }}>Nenhum lead ainda</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── LEADS ─────────────────────────────────────────── */}
              {activeTab === 'leads' && (
                <motion.div key="leads" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h1 style={{ color: D.textPri, fontSize: 24, fontWeight: 900, margin: 0 }}>Leads</h1>
                      <p style={{ color: D.textMut, fontSize: 13, marginTop: 4 }}>{stats?.total || 0} registros no total</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: D.textMut, fontSize: 13 }}>🔍</span>
                      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou CPF..."
                        style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 10, padding: '10px 14px 10px 36px', color: D.textPri, fontSize: 13, outline: 'none', width: 280 }} />
                    </div>
                  </div>

                  <div style={{ ...cardStyle, overflow: 'hidden' }}>
                    <DataTable
                      headers={['#', 'Lead', 'Perfil', 'Score', 'Limite', 'Status', 'IP / Localização', 'Data', '']}
                      rows={leads.map(l => (
                        <tr key={l.id} style={{ borderBottom: `1px solid ${D.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = D.cardHover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 14px', color: D.textMut, fontSize: 11, fontFamily: 'monospace' }}>#{l.id}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ color: D.textPri, fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                            <div style={{ color: D.textMut, fontSize: 11, fontFamily: 'monospace' }}>{String(l.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, color: l.profile === 'client' ? D.blue : '#a78bfa', background: l.profile === 'client' ? D.blueSoft : D.purpleSoft, border: `1px solid ${l.profile === 'client' ? `${D.blue}35` : D.borderHi}` }}>
                              {l.profile === 'client' ? '👑 Cliente' : '🎯 Neg.'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}><ScoreBar score={l.score} /></td>
                          <td style={{ padding: '12px 14px', color: D.textSec, fontSize: 13, fontWeight: 600 }}>R$ {parseFloat(l.limit_value || 2000).toFixed(0)}</td>
                          <td style={{ padding: '12px 14px' }}><StatusBadge status={l.payment_status} /></td>
                          <td style={{ padding: '12px 14px', maxWidth: 160 }}>
                            {l.ip ? (
                              <div style={{ color: D.textMut, fontSize: 10, fontFamily: 'monospace', marginBottom: l.location ? 2 : 0 }}>
                                {l.ip.split(',')[0].trim()}
                              </div>
                            ) : null}
                            {l.location ? (
                              <div style={{ color: D.textSec, fontSize: 11 }}>📍 {l.location}</div>
                            ) : l.ip ? (
                              <div style={{ color: D.textMut, fontSize: 10 }}>sem geo</div>
                            ) : (
                              <span style={{ color: D.textMut, fontSize: 11 }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: D.textMut, fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => { if (confirm(`Excluir lead ${l.name}?`)) deleteLead(l.id).then(loadData).catch(() => {}); }}
                              style={{ background: 'none', border: 'none', color: D.textMut, cursor: 'pointer', fontSize: 14, padding: '4px', borderRadius: 6, transition: 'color .15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = D.red}
                              onMouseLeave={e => e.currentTarget.style.color = D.textMut}
                              title="Excluir lead">🗑</button>
                          </td>
                        </tr>
                      ))}
                    />
                    {leads.length === 0 && (
                      <div style={{ padding: 48, textAlign: 'center', color: D.textMut, fontSize: 14 }}>
                        {search ? `🔍 Nenhum resultado para "${search}"` : '📭 Nenhum lead cadastrado'}
                      </div>
                    )}
                    {totalPages > 1 && (
                      <div style={{ padding: '14px 18px', borderTop: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: page === 1 ? 'none' : D.card, color: page === 1 ? D.textMut : D.textSec, border: `1px solid ${page === 1 ? 'transparent' : D.border}`, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Anterior</button>
                        <span style={{ color: D.textMut, fontSize: 12 }}>Página {page} de {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: page === totalPages ? 'none' : D.card, color: page === totalPages ? D.textMut : D.textSec, border: `1px solid ${page === totalPages ? 'transparent' : D.border}`, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Próxima →</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── CHAT ──────────────────────────────────────────── */}
              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 24 }}>
                    <h1 style={{ color: D.textPri, fontSize: 24, fontWeight: 900, margin: 0 }}>Chat ao Vivo</h1>
                    <p style={{ color: D.textMut, fontSize: 13, marginTop: 4 }}>{onlineCount} usuários conectados agora</p>
                  </div>
                  <AdminChat socket={socket} />
                </motion.div>
              )}

              {/* ── SETTINGS ──────────────────────────────────────── */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 24 }}>
                    <h1 style={{ color: D.textPri, fontSize: 24, fontWeight: 900, margin: 0 }}>Configurações</h1>
                    <p style={{ color: D.textMut, fontSize: 13, marginTop: 4 }}>Taxas, PIX e parâmetros operacionais</p>
                  </div>
                  <SettingsPanel />
                </motion.div>
              )}

              {/* ── PERSONALIZAÇÃO ────────────────────────────────── */}
              {activeTab === 'personalizacao' && (
                <motion.div key="personalizacao" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <PersonalizacaoPanel />
                </motion.div>
              )}

              {/* ── CONTA ─────────────────────────────────────────── */}
              {activeTab === 'conta' && (
                <motion.div key="conta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <ContaPanel />
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(200,180,255,0.25); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(130,10,209,0.4); border-radius: 4px; }
      `}</style>
    </div>
  );
}
