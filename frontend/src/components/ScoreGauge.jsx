'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// Gauge semicircular premium
export default function ScoreGauge({ targetScore = 700, profile = 'negativado' }) {
  const [displayScore, setDisplayScore] = useState(300);
  const [finished, setFinished] = useState(false);

  const isClient = profile === 'client';
  const duration = isClient ? 2500 : 4000;

  // Cores baseadas no score
  const getScoreColor = (score) => {
    if (score < 400) return { color: '#ef4444', label: 'Baixo', bg: 'from-red-500/20 to-red-900/5' };
    if (score < 500) return { color: '#f97316', label: 'Regular', bg: 'from-orange-500/20 to-orange-900/5' };
    if (score < 650) return { color: '#eab308', label: 'Médio', bg: 'from-yellow-500/20 to-yellow-900/5' };
    if (score < 750) return { color: '#22c55e', label: 'Bom', bg: 'from-green-500/20 to-green-900/5' };
    return { color: '#16a34a', label: 'Excelente', bg: 'from-emerald-500/20 to-emerald-900/5' };
  };

  const scoreInfo = getScoreColor(displayScore);

  // Animação do contador de score
  useEffect(() => {
    const startScore = 300;
    const endScore = targetScore;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: rápido no início, desacelera
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + (endScore - startScore) * eased);

      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(endScore);
        setFinished(true);
      }
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [targetScore, duration]);

  // SVG gauge
  const SIZE = 240;
  const STROKE = 18;
  const R = (SIZE - STROKE) / 2 - 4;
  const CX = SIZE / 2;
  const CY = SIZE / 2 + 20;

  // Arco de 210 graus (de -210° a 30°, ou seja 210° sweep)
  const MIN_ANGLE = -210;
  const MAX_ANGLE = 30;
  const TOTAL_ANGLE = MAX_ANGLE - MIN_ANGLE; // 240°

  // Score range: 300 a 900
  const scorePercent = Math.max(0, Math.min(1, (displayScore - 300) / (900 - 300)));
  const currentAngle = MIN_ANGLE + scorePercent * TOTAL_ANGLE;

  const polarToXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad),
    };
  };

  const describeArc = (startAngle, endAngle) => {
    const start = polarToXY(startAngle, R);
    const end = polarToXY(endAngle, R);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needle = polarToXY(currentAngle, R * 0.75);
  const needleBase1 = polarToXY(currentAngle + 90, 8);
  const needleBase2 = polarToXY(currentAngle - 90, 8);

  return (
    <div className="flex flex-col items-center">
      {/* SVG Gauge */}
      <div className={`relative rounded-full bg-gradient-to-b ${scoreInfo.bg} p-2`}>
        <svg width={SIZE} height={SIZE * 0.75} viewBox={`0 0 ${SIZE} ${SIZE * 0.82}`}>
          {/* Trilha (fundo) */}
          <path
            d={describeArc(MIN_ANGLE, MAX_ANGLE)}
            fill="none"
            stroke="rgba(130,10,209,0.12)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Gradiente de cores da trilha */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f97316" />
              <stop offset="66%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Arco de progresso */}
          {scorePercent > 0 && (
            <path
              d={describeArc(MIN_ANGLE, Math.min(currentAngle, MAX_ANGLE - 0.1))}
              fill="none"
              stroke={scoreInfo.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{ transition: 'stroke 0.3s ease' }}
            />
          )}

          {/* Marcações */}
          {[300, 450, 600, 750, 900].map((val, i) => {
            const pct = (val - 300) / 600;
            const angle = MIN_ANGLE + pct * TOTAL_ANGLE;
            const outer = polarToXY(angle, R + STROKE / 2 + 6);
            const inner = polarToXY(angle, R - STROKE / 2 - 6);
            return (
              <g key={val}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1.5"
                />
                <text
                  x={polarToXY(angle, R + STROKE / 2 + 20).x}
                  y={polarToXY(angle, R + STROKE / 2 + 20).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(0,0,0,0.45)"
                  fontSize="9"
                  fontFamily="Inter"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Agulha */}
          <polygon
            points={`${needle.x},${needle.y} ${needleBase1.x},${needleBase1.y} ${CX},${CY} ${needleBase2.x},${needleBase2.y}`}
            fill={scoreInfo.color}
            opacity="0.9"
            filter="url(#glow)"
          />

          {/* Centro da agulha */}
          <circle cx={CX} cy={CY} r="10" fill="#f8f4ff" stroke={scoreInfo.color} strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r="4" fill={scoreInfo.color} />
        </svg>

        {/* Score no centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <motion.div
            key={finished ? 'done' : 'animating'}
            animate={finished ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="text-5xl font-black tabular-nums"
            style={{ color: scoreInfo.color, textShadow: `0 0 30px ${scoreInfo.color}60` }}
          >
            {displayScore}
          </motion.div>
          <div className="text-xs text-gray-600 mt-1 font-medium tracking-widest uppercase">Score</div>
        </div>
      </div>

      {/* Label do score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center"
      >
        <span
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{
            backgroundColor: `${scoreInfo.color}20`,
            border: `1px solid ${scoreInfo.color}40`,
            color: scoreInfo.color,
          }}
        >
          {scoreInfo.label}
        </span>

        {finished && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-600 mt-2"
          >
            Score atualizado com sucesso ✓
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
