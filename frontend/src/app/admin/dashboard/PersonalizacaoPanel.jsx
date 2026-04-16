'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSiteConfig, updateSiteConfig, uploadBannerFile, deleteBannerFile } from '@/lib/api';
import { DEFAULT_SITE_CONFIG } from '@/lib/defaultConfig';

// ─── CSS COLOR → HEX (para o input type=color) ───────────────────────────────
function toHex(css) {
  if (!css) return '#820AD1';
  const s = String(css).trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) return '#' + s.slice(1).split('').map(c => c + c).join('');
  const m = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return '#' + [m[1], m[2], m[3]].map(n => (+n).toString(16).padStart(2, '0')).join('');
  return '#820AD1';
}

const CHECKER = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect x='0' y='0' width='4' height='4' fill='%23888'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23888'/%3E%3C/svg%3E\")";

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const D = {
  card:     'rgba(255,255,255,0.03)',
  border:   'rgba(255,255,255,0.07)',
  borderHi: 'rgba(130,10,209,0.45)',
  purple:   '#820AD1',
  textPri:  '#f0e8ff',
  textSec:  'rgba(220,200,255,0.55)',
  textMut:  'rgba(200,180,255,0.3)',
  green:    '#22c55e',
  greenSoft:'rgba(34,197,94,0.12)',
  greenBdr: 'rgba(34,197,94,0.3)',
  red:      '#ef4444',
};

function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (Array.isArray(overrides[key])) result[key] = overrides[key];
    else if (typeof overrides[key] === 'object' && typeof defaults[key] === 'object') result[key] = deepMerge(defaults[key], overrides[key]);
    else if (overrides[key] !== undefined && overrides[key] !== null) result[key] = overrides[key];
  }
  return result;
}

// ─── INPUT GENÉRICO ───────────────────────────────────────────────────────────
const inputBase = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`,
  borderRadius: 10, padding: '9px 12px', color: D.textPri, fontSize: 13,
  outline: 'none', resize: 'none',
};

function Field({ label, value, onChange, type = 'text', rows = 2, placeholder = '', hint = '' }) {
  return (
    <div>
      <label style={{ display: 'block', color: D.textMut, fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...inputBase, resize: 'vertical' }} />
      ) : type === 'color' ? (
        // Hex puro — swatch clicável abre o color picker nativo
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: `2px solid rgba(255,255,255,0.12)`, cursor: 'pointer', boxShadow: `0 2px 10px ${value || '#820AD1'}55` }}>
            <input
              type="color" value={value || '#820AD1'} onChange={e => onChange(e.target.value)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 }}
              title="Clique para escolher a cor"
            />
            <div style={{ width: '100%', height: '100%', background: value || '#820AD1', pointerEvents: 'none' }} />
          </div>
          <input
            type="text" value={value || ''} onChange={e => onChange(e.target.value)}
            style={{ ...inputBase, flex: 1, width: 'auto', fontFamily: 'monospace', fontSize: 12 }}
          />
        </div>
      ) : type === 'color-text' ? (
        // Aceita qualquer CSS (rgba, transparent, hex) — swatch clicável converte para hex no picker
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: `2px solid rgba(255,255,255,0.12)`, cursor: 'pointer' }}>
            <input
              type="color" value={toHex(value)} onChange={e => onChange(e.target.value)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 }}
              title="Clique para escolher a cor (converte para hex)"
            />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: CHECKER, backgroundSize: '8px 8px', opacity: 0.25, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: value || 'transparent', pointerEvents: 'none' }} />
          </div>
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'transparent, #fff, rgba(...)'}
            style={{ ...inputBase, flex: 1, width: 'auto', fontFamily: 'monospace', fontSize: 12 }}
          />
        </div>
      ) : type === 'banner' ? (
        <div>
          <input type="url" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="https://exemplo.com/imagem.jpg"
            style={{ ...inputBase, marginBottom: 6 }}
          />
          {value && (
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${D.border}`, height: 80, position: 'relative' }}>
              <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              <button onClick={() => onChange('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>✕ remover</button>
            </div>
          )}
        </div>
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputBase} />
      )}
      {hint && <p style={{ color: D.textMut, fontSize: 11, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── MINI PREVIEW DO CARTÃO ───────────────────────────────────────────────────
function CardPreviewMini({ cores, brandName }) {
  const c1 = cores?.cartaoCorInicio || '#820AD1';
  const c2 = cores?.cartaoCorMeio   || '#4b047d';
  const c3 = cores?.cartaoCorFim    || '#23023c';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
      <div style={{
        width: 300, borderRadius: 18,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
        padding: '20px 24px', position: 'relative', overflow: 'hidden',
        boxShadow: `0 20px 50px ${c1}55`,
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'box-shadow .3s',
      }}>
        {/* Glow decorativo */}
        <div style={{ position: 'absolute', top: -24, right: -24, width: 130, height: 130, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.12), transparent)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.06), transparent)`, pointerEvents: 'none' }} />

        {/* Topo: marca + bandeira */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, position: 'relative', zIndex: 1 }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>
            {(brandName || 'CREDITOFÁCIL').toUpperCase()}
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(250,204,21,0.85)' }} />
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(234,88,12,0.85)', marginLeft: -10 }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginLeft: 6 }}>Mastercard</span>
          </div>
        </div>

        {/* Chip */}
        <div style={{ width: 34, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #d4a843, #a07c2e)', marginBottom: 14, position: 'relative', zIndex: 1 }} />

        {/* Número */}
        <p style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.18em', marginBottom: 14, position: 'relative', zIndex: 1 }}>
          •••• •••• •••• ****
        </p>

        {/* Rodapé */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: '0.1em', marginBottom: 2 }}>TITULAR</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600 }}>SEU NOME AQUI</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: '0.1em', marginBottom: 2 }}>LIMITE</p>
            <p style={{ color: '#4ade80', fontSize: 14, fontWeight: 700 }}>R$ 2.000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEÇÃO ────────────────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 3, height: 16, background: D.purple, borderRadius: 4 }} />
        <span style={{ color: D.textPri, fontWeight: 700, fontSize: 13 }}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

// ─── GRADE DE 2 COLUNAS ───────────────────────────────────────────────────────
function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>{children}</div>;
}

// ─── BANNER PREVIEW ───────────────────────────────────────────────────────────
const ACCEPT = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/avif,image/bmp,image/x-icon,image/tiff,image/heic,image/heif,.heic,.heif,.jxl';

function BannerBlock({ label, urlKey, opacityKey, values, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadErr, setUploadErr] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');

  const currentUrl = values[urlKey] || '';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr('');
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadBannerFile(file, (pct) => setProgress(pct));
      onChange(urlKey, res.url);
      setUploadedFilename(res.filename);
    } catch (err) {
      setUploadErr(err?.response?.data?.error || 'Erro no upload. Tente novamente.');
    } finally {
      setUploading(false);
      // reset input so the same file can be reselected if needed
      if (e.target) e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (uploadedFilename) {
      try { await deleteBannerFile(uploadedFilename); } catch { /* ignora */ }
      setUploadedFilename('');
    }
    onChange(urlKey, '');
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${D.border}`, borderRadius: 12, padding: 14 }}>
      <p style={{ color: D.textSec, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{label}</p>

      {/* Área de upload ou prévia */}
      {currentUrl ? (
        <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${D.border}`, height: 90, position: 'relative', marginBottom: 8 }}>
          <img src={currentUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          <button onClick={handleRemove}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            ✕ remover
          </button>
        </div>
      ) : (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 90, borderRadius: 10, border: `2px dashed rgba(130,10,209,0.3)`, background: 'rgba(130,10,209,0.03)',
          cursor: uploading ? 'wait' : 'pointer', marginBottom: 8, transition: 'all .15s',
        }}
          onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = 'rgba(130,10,209,0.6)'; e.currentTarget.style.background = 'rgba(130,10,209,0.07)'; }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(130,10,209,0.3)'; e.currentTarget.style.background = 'rgba(130,10,209,0.03)'; }}
        >
          <input type="file" accept={ACCEPT} onChange={handleFileChange} disabled={uploading}
            style={{ display: 'none' }} />
          {uploading ? (
            <>
              <div style={{ width: 140, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: D.purple, borderRadius: 10, transition: 'width .2s' }} />
              </div>
              <span style={{ color: D.textMut, fontSize: 11 }}>{progress}% enviando...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 22 }}>🖼️</span>
              <span style={{ color: D.textMut, fontSize: 11, textAlign: 'center', lineHeight: 1.4 }}>
                Clique para enviar imagem<br />
                <span style={{ fontSize: 10, opacity: 0.6 }}>JPG, PNG, GIF, WEBP, SVG, AVIF, BMP, HEIC, JXL · máx 15 MB</span>
              </span>
            </>
          )}
        </label>
      )}

      {uploadErr && <p style={{ color: D.red, fontSize: 11, marginBottom: 8 }}>⚠ {uploadErr}</p>}

      {/* URL manual (alternativa) */}
      <div>
        <label style={{ display: 'block', color: D.textMut, fontSize: 10, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          ou cole uma URL
        </label>
        <input type="url" value={currentUrl} onChange={e => onChange(urlKey, e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          style={{ ...inputBase, fontSize: 12 }} />
      </div>

      {currentUrl && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'block', color: D.textMut, fontSize: 10, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Opacidade (0 = invisível · 1 = total)
          </label>
          <input type="text" value={values[opacityKey] || '0.15'} onChange={e => onChange(opacityKey, e.target.value)}
            placeholder="0.15" style={{ ...inputBase, fontSize: 12, width: 80 }} />
        </div>
      )}
    </div>
  );
}

// ─── LOGO BLOCK (navbar — sem opacidade, preview em fundo escuro) ─────────────
function LogoBlock({ urlKey, values, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadErr, setUploadErr] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const currentUrl = values[urlKey] || '';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr('');
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadBannerFile(file, pct => setProgress(pct));
      onChange(urlKey, res.url);
      setUploadedFilename(res.filename);
    } catch (err) {
      setUploadErr(err?.response?.data?.error || 'Erro no upload.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (uploadedFilename) { try { await deleteBannerFile(uploadedFilename); } catch { } setUploadedFilename(''); }
    onChange(urlKey, '');
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${D.border}`, borderRadius: 12, padding: 14 }}>
      <p style={{ color: D.textSec, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Logo da Navbar</p>

      {/* Preview simulando a navbar */}
      <div style={{ background: '#820AD1', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, minHeight: 56 }}>
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="logo" style={{ height: 36, maxWidth: 140, objectFit: 'contain' }} />
            <button onClick={handleRemove}
              style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              ✕ remover
            </button>
          </>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Prévia da logo aqui</span>
        )}
      </div>

      {!currentUrl && (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 70, borderRadius: 10, border: `2px dashed rgba(130,10,209,0.3)`, background: 'rgba(130,10,209,0.03)',
          cursor: uploading ? 'wait' : 'pointer', marginBottom: 8,
        }}>
          <input type="file" accept={ACCEPT} onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
          {uploading ? (
            <>
              <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: D.purple, borderRadius: 10, transition: 'width .2s' }} />
              </div>
              <span style={{ color: D.textMut, fontSize: 11 }}>{progress}% enviando...</span>
            </>
          ) : (
            <span style={{ color: D.textMut, fontSize: 11 }}>🖼️ Clique para enviar a logo · PNG, SVG, WebP recomendado</span>
          )}
        </label>
      )}

      {uploadErr && <p style={{ color: D.red, fontSize: 11, marginBottom: 8 }}>⚠ {uploadErr}</p>}

      <div>
        <label style={{ display: 'block', color: D.textMut, fontSize: 10, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          ou cole uma URL
        </label>
        <input type="url" value={currentUrl} onChange={e => onChange(urlKey, e.target.value)}
          placeholder="https://exemplo.com/logo.png"
          style={{ ...inputBase, fontSize: 12 }} />
      </div>
    </div>
  );
}

// ─── LISTA EDITÁVEL ───────────────────────────────────────────────────────────
function EditableList({ items, fields, onChange, addLabel, newItem }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${D.border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: D.textMut, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Item {i + 1}</span>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{ color: D.red, background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
            >✕ remover</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fields.map(f => (
              <Field key={f.key} label={f.label} value={item[f.key]} type={f.type || 'text'} rows={f.rows}
                onChange={val => { const u = [...items]; u[i] = { ...u[i], [f.key]: val }; onChange(u); }}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { ...newItem }])}
        style={{
          width: '100%', padding: 10, borderRadius: 10, border: `1px dashed rgba(130,10,209,0.35)`,
          background: 'rgba(130,10,209,0.04)', color: D.textMut, fontSize: 12, cursor: 'pointer', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(130,10,209,0.6)'; e.currentTarget.style.color = '#a78bfa'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(130,10,209,0.35)'; e.currentTarget.style.color = D.textMut; }}
      >+ {addLabel}</button>
    </div>
  );
}

// ─── SUB-TABS ─────────────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'cores',       icon: '🎨', label: 'Cores' },
  { id: 'banners',     icon: '🖼️', label: 'Banners' },
  { id: 'marca',       icon: '✦',  label: 'Marca' },
  { id: 'hero',        icon: '🏠', label: 'Hero' },
  { id: 'beneficios',  icon: '✨', label: 'Benefícios' },
  { id: 'passos',      icon: '📋', label: 'Passos' },
  { id: 'depoimentos', icon: '💬', label: 'Depoimentos' },
  { id: 'faq',         icon: '❓', label: 'FAQ' },
  { id: 'funil',       icon: '🎯', label: 'Funil' },
  { id: 'suporte',     icon: '📞', label: 'Suporte' },
  { id: 'rodape',      icon: '📄', label: 'Rodapé' },
];

// ─── PANEL ────────────────────────────────────────────────────────────────────
export default function PersonalizacaoPanel() {
  const [config, setConfig] = useState(null);
  const [subTab, setSubTab] = useState('cores');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteConfig().then(d => setConfig(deepMerge(DEFAULT_SITE_CONFIG, d))).catch(() => setConfig({ ...DEFAULT_SITE_CONFIG }));
  }, []);

  const set = (section, key, value) => setConfig(p => ({ ...p, [section]: { ...p[section], [key]: value } }));
  const setList = (section, value) => setConfig(p => ({ ...p, [section]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSiteConfig(config); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch { alert('Erro ao salvar. Tente novamente.'); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    if (confirm('Restaurar TUDO para o padrão? (cores, banners, textos)')) setConfig({ ...DEFAULT_SITE_CONFIG });
  };

  if (!config) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${D.purple}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: D.textMut, fontSize: 14 }}>Carregando...</span>
    </div>
  );

  const SaveBtn = ({ bottom }) => (
    <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      style={{
        padding: bottom ? '11px 28px' : '9px 20px', borderRadius: 10, fontSize: bottom ? 14 : 13,
        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
        background: saved ? D.greenSoft : 'rgba(130,10,209,0.2)',
        color: saved ? D.green : '#c084fc',
        border: `1px solid ${saved ? D.greenBdr : 'rgba(130,10,209,0.4)'}`,
      }}
    >{saving ? '⏳ Salvando...' : saved ? '✓ Salvo!' : '💾 Salvar alterações'}</motion.button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: D.textPri, fontSize: 24, fontWeight: 900, margin: 0 }}>Personalização do Site</h1>
          <p style={{ color: D.textMut, fontSize: 13, marginTop: 4 }}>Cores, banners, textos e conteúdo de todas as páginas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleReset}
            style={{ padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, color: D.textMut, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, cursor: 'pointer' }}
          >↺ Restaurar padrão</button>
          <SaveBtn />
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${D.border}`, borderRadius: 14, padding: 5 }}>
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              background: subTab === t.id ? 'rgba(130,10,209,0.2)' : 'none',
              color: subTab === t.id ? '#d8b4fe' : D.textMut,
              border: `1px solid ${subTab === t.id ? 'rgba(130,10,209,0.4)' : 'transparent'}`,
            }}
          ><span>{t.icon}</span><span>{t.label}</span></button>
        ))}
      </div>

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

          {/* ── CORES ────────────────────────────────────────────────── */}
          {subTab === 'cores' && (
            <div>
              <Section title="Identidade" icon="🎨">
                <Grid2>
                  <Field label="Cor primária (botões, destaques)" value={config.cores?.primaria} type="color" onChange={v => set('cores', 'primaria', v)} />
                  <Field label="Cor secundária (gradientes)" value={config.cores?.segundaria} type="color" onChange={v => set('cores', 'segundaria', v)} />
                </Grid2>
              </Section>

              <Section title="Página" icon="🌐">
                <Grid2>
                  <Field label="Background da página" value={config.cores?.background} type="color-text" onChange={v => set('cores', 'background', v)} hint="Ex: #ffffff, rgba(248,240,255,1)" />
                  <Field label="Cor dos títulos" value={config.cores?.textoTitulo} type="color-text" onChange={v => set('cores', 'textoTitulo', v)} />
                  <Field label="Cor do texto do corpo" value={config.cores?.textoCorpo} type="color-text" onChange={v => set('cores', 'textoCorpo', v)} />
                  <Field label="Cor do texto de destaque" value={config.cores?.textoDestaque} type="color-text" onChange={v => set('cores', 'textoDestaque', v)} />
                </Grid2>
              </Section>

              <Section title="Navbar" icon="📌">
                <Grid2>
                  <Field label="Background da navbar" value={config.cores?.navbarBg} type="color-text" onChange={v => set('cores', 'navbarBg', v)} />
                  <Field label="Cor do texto da navbar" value={config.cores?.navbarTexto} type="color-text" onChange={v => set('cores', 'navbarTexto', v)} />
                  <Field label="Cor da borda/linha da navbar" value={config.cores?.navbarBorda} type="color-text" onChange={v => set('cores', 'navbarBorda', v)} />
                </Grid2>
              </Section>

              <Section title="Seção Hero" icon="🏠">
                <Field label="Background do hero" value={config.cores?.heroBg} type="color-text" onChange={v => set('cores', 'heroBg', v)} hint="transparent para usar o fundo da página" />
              </Section>

              <Section title="Seção Benefícios" icon="✨">
                <Grid2>
                  <Field label="Background da seção" value={config.cores?.beneficiosBg} type="color-text" onChange={v => set('cores', 'beneficiosBg', v)} />
                  <Field label="Background dos cards" value={config.cores?.cardBg} type="color-text" onChange={v => set('cores', 'cardBg', v)} />
                  <Field label="Borda dos cards" value={config.cores?.cardBorda} type="color-text" onChange={v => set('cores', 'cardBorda', v)} />
                </Grid2>
              </Section>

              <Section title="Seção Passos" icon="📋">
                <Field label="Background da seção" value={config.cores?.passosBg} type="color-text" onChange={v => set('cores', 'passosBg', v)} />
              </Section>

              <Section title="Seção Depoimentos" icon="💬">
                <Field label="Background da seção" value={config.cores?.depoimentosBg} type="color-text" onChange={v => set('cores', 'depoimentosBg', v)} />
              </Section>

              <Section title="Seção Segurança" icon="🔒">
                <Field label="Background do card de segurança" value={config.cores?.segurancaBg} type="color-text" onChange={v => set('cores', 'segurancaBg', v)} />
              </Section>

              <Section title="Seção FAQ" icon="❓">
                <Field label="Background da seção" value={config.cores?.faqBg} type="color-text" onChange={v => set('cores', 'faqBg', v)} />
              </Section>

              <Section title="Seção CTA Final" icon="🚀">
                <Grid2>
                  <Field label="Background do card CTA" value={config.cores?.ctaBg} type="color-text" onChange={v => set('cores', 'ctaBg', v)} />
                  <Field label="Borda do card CTA" value={config.cores?.ctaBorda} type="color-text" onChange={v => set('cores', 'ctaBorda', v)} />
                </Grid2>
              </Section>

              <Section title="Footer" icon="📄">
                <Grid2>
                  <Field label="Background do footer" value={config.cores?.footerBg} type="color-text" onChange={v => set('cores', 'footerBg', v)} />
                  <Field label="Cor da borda superior" value={config.cores?.footerBorda} type="color-text" onChange={v => set('cores', 'footerBorda', v)} />
                  <Field label="Cor do texto do footer" value={config.cores?.footerTexto} type="color-text" onChange={v => set('cores', 'footerTexto', v)} />
                </Grid2>
              </Section>

              <Section title="Cartão de Crédito" icon="💳">
                <p style={{ color: D.textMut, fontSize: 12 }}>
                  Gradiente do cartão exibido na página inicial e na página de emissão. Clique na caixinha para abrir a paleta.
                </p>
                <Grid2>
                  <Field label="Cor inicial (esquerda)" value={config.cores?.cartaoCorInicio} type="color" onChange={v => set('cores', 'cartaoCorInicio', v)} />
                  <Field label="Cor do meio" value={config.cores?.cartaoCorMeio} type="color" onChange={v => set('cores', 'cartaoCorMeio', v)} />
                  <Field label="Cor final (direita)" value={config.cores?.cartaoCorFim} type="color" onChange={v => set('cores', 'cartaoCorFim', v)} />
                </Grid2>
                <CardPreviewMini cores={config.cores} brandName={config.brand?.name} />
              </Section>
            </div>
          )}

          {/* ── BANNERS ──────────────────────────────────────────────── */}
          {subTab === 'banners' && (
            <div>
              <div style={{ background: 'rgba(130,10,209,0.07)', border: `1px solid rgba(130,10,209,0.2)`, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ color: '#c084fc', fontSize: 12, margin: 0 }}>
                  💡 Cole a URL de qualquer imagem pública (JPG, PNG, WebP). O banner é exibido como fundo da seção com a opacidade configurável. Use imagens de alta qualidade para melhor resultado.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Section title="Hero — Banner de fundo" icon="🏠">
                  <BannerBlock label="Imagem de fundo do hero" urlKey="hero" opacityKey="heroBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Navbar — Logo" icon="📌">
                  <p style={{ color: D.textMut, fontSize: 11, marginBottom: 8 }}>A logo aparece no canto esquerdo da barra de navegação. Recomendado: fundo transparente (PNG/SVG), altura mínima de 80px.</p>
                  <LogoBlock urlKey="navbar" values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Seção Benefícios" icon="✨">
                  <BannerBlock label="Imagem de fundo da seção" urlKey="beneficios" opacityKey="beneficiosBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Seção Passos / Como Funciona" icon="📋">
                  <BannerBlock label="Imagem de fundo da seção" urlKey="passos" opacityKey="passosBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Seção Depoimentos" icon="💬">
                  <BannerBlock label="Imagem de fundo da seção" urlKey="depoimentos" opacityKey="depoimentosBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Seção Segurança" icon="🔒">
                  <BannerBlock label="Imagem de fundo da seção" urlKey="seguranca" opacityKey="segurancaBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Seção FAQ" icon="❓">
                  <BannerBlock label="Imagem de fundo da seção" urlKey="faq" opacityKey="faqBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="CTA Final" icon="🚀">
                  <BannerBlock label="Imagem de fundo do CTA" urlKey="cta" opacityKey="ctaBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>

                <Section title="Footer" icon="📄">
                  <BannerBlock label="Imagem de fundo do footer" urlKey="footer" opacityKey="footerBgOpacity"
                    values={config.banners || {}} onChange={(k, v) => set('banners', k, v)} />
                </Section>
              </div>
            </div>
          )}

          {/* ── MARCA ────────────────────────────────────────────────── */}
          {subTab === 'marca' && (
            <div>
              <Section title="Identidade da marca" icon="✦">
                <Field label="Nome da marca" value={config.brand?.name} onChange={v => set('brand', 'name', v)} placeholder="CreditoFácil" />
                <Field label="Tagline / Slogan" value={config.brand?.tagline} onChange={v => set('brand', 'tagline', v)} placeholder="Cartão para negativados" />
              </Section>
            </div>
          )}

          {/* ── HERO ─────────────────────────────────────────────────── */}
          {subTab === 'hero' && (
            <div>
              <Section title="Título principal (3 linhas)" icon="🏠">
                <Field label="Linha 1" value={config.hero?.titulo1} onChange={v => set('hero', 'titulo1', v)} placeholder="Cartão de crédito" />
                <Field label="Linha 2" value={config.hero?.titulo2} onChange={v => set('hero', 'titulo2', v)} placeholder="aprovado mesmo" />
                <Field label="Linha 3 (destaque roxo)" value={config.hero?.titulo3} onChange={v => set('hero', 'titulo3', v)} placeholder="negativado" />
              </Section>
              <Section title="Subtítulo">
                <Field label="Texto inicial" value={config.hero?.subtitulo} onChange={v => set('hero', 'subtitulo', v)} />
                <Field label="Destaque do limite" value={config.hero?.limiteDestaque} onChange={v => set('hero', 'limiteDestaque', v)} placeholder="R$ 2.000" />
                <Field label="Texto final" value={config.hero?.subtituloFim} onChange={v => set('hero', 'subtituloFim', v)} />
              </Section>
              <Section title="Botões e badges">
                <Grid2>
                  <Field label="CTA principal" value={config.hero?.ctaPrincipal} onChange={v => set('hero', 'ctaPrincipal', v)} />
                  <Field label="CTA secundário" value={config.hero?.ctaSecundario} onChange={v => set('hero', 'ctaSecundario', v)} />
                  <Field label="Badge aprovados" value={config.hero?.badgeAprovados} onChange={v => set('hero', 'badgeAprovados', v)} />
                  <Field label="Badge sem consulta" value={config.hero?.badgeSemConsulta} onChange={v => set('hero', 'badgeSemConsulta', v)} />
                  <Field label="Badge aprovação" value={config.hero?.badgeAprovacao} onChange={v => set('hero', 'badgeAprovacao', v)} />
                </Grid2>
              </Section>
            </div>
          )}

          {/* ── BENEFÍCIOS ───────────────────────────────────────────── */}
          {subTab === 'beneficios' && (
            <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: D.purple, borderRadius: 4 }} />
                <span style={{ color: D.textPri, fontWeight: 700, fontSize: 13 }}>Cards de benefícios</span>
              </div>
              <EditableList
                items={config.beneficios || []}
                fields={[{ key: 'icon', label: 'Emoji / Ícone' }, { key: 'titulo', label: 'Título' }, { key: 'desc', label: 'Descrição' }]}
                onChange={v => setList('beneficios', v)}
                addLabel="Adicionar benefício"
                newItem={{ icon: '⭐', titulo: 'Novo benefício', desc: 'Descrição do benefício' }}
              />
            </div>
          )}

          {/* ── PASSOS ───────────────────────────────────────────────── */}
          {subTab === 'passos' && (
            <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: D.purple, borderRadius: 4 }} />
                <span style={{ color: D.textPri, fontWeight: 700, fontSize: 13 }}>Como funciona — passos</span>
              </div>
              <EditableList
                items={config.passos || []}
                fields={[{ key: 'numero', label: 'Número (ex: 01)' }, { key: 'titulo', label: 'Título' }, { key: 'desc', label: 'Descrição' }]}
                onChange={v => setList('passos', v)}
                addLabel="Adicionar passo"
                newItem={{ numero: '05', titulo: 'Novo passo', desc: 'Descrição do passo' }}
              />
            </div>
          )}

          {/* ── DEPOIMENTOS ──────────────────────────────────────────── */}
          {subTab === 'depoimentos' && (
            <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: D.purple, borderRadius: 4 }} />
                <span style={{ color: D.textPri, fontWeight: 700, fontSize: 13 }}>Depoimentos de clientes</span>
              </div>
              <EditableList
                items={config.depoimentos || []}
                fields={[{ key: 'nome', label: 'Nome' }, { key: 'cidade', label: 'Cidade, Estado' }, { key: 'texto', label: 'Depoimento', type: 'textarea', rows: 3 }, { key: 'nota', label: 'Nota (1-5)' }]}
                onChange={v => setList('depoimentos', v)}
                addLabel="Adicionar depoimento"
                newItem={{ nome: 'Cliente', cidade: 'São Paulo, SP', texto: 'Ótimo serviço!', nota: 5 }}
              />
            </div>
          )}

          {/* ── FAQ ──────────────────────────────────────────────────── */}
          {subTab === 'faq' && (
            <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: D.purple, borderRadius: 4 }} />
                <span style={{ color: D.textPri, fontWeight: 700, fontSize: 13 }}>Perguntas frequentes</span>
              </div>
              <EditableList
                items={config.faq || []}
                fields={[{ key: 'pergunta', label: 'Pergunta' }, { key: 'resposta', label: 'Resposta', type: 'textarea', rows: 3 }]}
                onChange={v => setList('faq', v)}
                addLabel="Adicionar pergunta"
                newItem={{ pergunta: 'Nova pergunta?', resposta: 'Resposta aqui.' }}
              />
            </div>
          )}

          {/* ── FUNIL ────────────────────────────────────────────────── */}
          {subTab === 'funil' && (
            <div>
              {[
                { title: 'Página: Perfil', keys: [['perfilTitulo','Título'],['perfilSubtitulo','Subtítulo']] },
                { title: 'Página: Formulário', keys: [['formularioTitulo','Título'],['formularioSubtitulo','Subtítulo']] },
                { title: 'Página: Análise', keys: [['analiseTitulo','Título']] },
                { title: 'Página: Resultado', keys: [['resultadoTitulo','Título']] },
                { title: 'Página: Emissão', keys: [['emissaoTitulo','Título'],['emissaoSubtitulo','Subtítulo']] },
                { title: 'Página: Confirmação', keys: [['confirmacaoTitulo','Título'],['confirmacaoSubtitulo','Subtítulo']] },
              ].map(s => (
                <Section key={s.title} title={s.title}>
                  {s.keys.map(([k, l]) => (
                    <Field key={k} label={l} value={config.funil?.[k]} onChange={v => set('funil', k, v)} />
                  ))}
                </Section>
              ))}
            </div>
          )}

          {/* ── SUPORTE ──────────────────────────────────────────────── */}
          {subTab === 'suporte' && (
            <div>
              <Section title="Informações de suporte" icon="📞">
                <Grid2>
                  <Field label="WhatsApp" value={config.suporte?.whatsapp} onChange={v => set('suporte', 'whatsapp', v)} placeholder="(11) 99999-9999" />
                  <Field label="E-mail" value={config.suporte?.email} onChange={v => set('suporte', 'email', v)} placeholder="suporte@creditofacil.com" />
                  <Field label="Horário de atendimento" value={config.suporte?.horario} onChange={v => set('suporte', 'horario', v)} placeholder="Seg a Sex, 8h às 18h" />
                </Grid2>
              </Section>
              <Section title="Chat automático">
                <Field label="Mensagem de boas-vindas" value={config.chat?.bemVindo} type="textarea" rows={3} onChange={v => set('chat', 'bemVindo', v)} />
                <Field label="Resposta padrão" value={config.chat?.respostaPadrao} type="textarea" rows={3} onChange={v => set('chat', 'respostaPadrao', v)} />
              </Section>
            </div>
          )}

          {/* ── RODAPÉ ───────────────────────────────────────────────── */}
          {subTab === 'rodape' && (
            <div>
              <Section title="Rodapé" icon="📄">
                <Field label="Texto de copyright" value={config.rodape?.texto} onChange={v => set('rodape', 'texto', v)} placeholder="© 2024 CreditoFácil. Todos os direitos reservados." />
                <Field label="Descrição / aviso legal" value={config.rodape?.descricao} type="textarea" rows={2} onChange={v => set('rodape', 'descricao', v)} />
              </Section>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Botão salvar fixo */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn bottom />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(200,180,255,0.2); }
      `}</style>
    </div>
  );
}
