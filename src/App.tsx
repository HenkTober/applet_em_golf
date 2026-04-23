/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Activity, 
  Zap, 
  Info,
  ChevronRight
} from 'lucide-react';

// --- Types ---
interface WavePoint {
  x: number;
  e: number;
  b: number;
}

const STEPS = [
  { id: 'a', label: 't = 0', phase: 0, description: 'Begin van de cyclus. Antenne is neutraal.' },
  { id: 'b', label: 't = 1/4 T', phase: Math.PI / 2, description: 'Maximale lading: Boven ++, Onder --. E-veld wijst naar beneden.' },
  { id: 'c', label: 't = 2/4 T', phase: Math.PI, description: 'Lading keert terug naar nul. Golf schuift op naar rechts.' },
  { id: 'd', label: 't = 3/4 T', phase: 3 * Math.PI / 2, description: 'Omgekeerde polariteit: Boven --, Onder ++. E-veld wijst naar boven.' },
  { id: 'e', label: 't = T', phase: 2 * Math.PI, description: 'Eén volledige cyclus voltooid.' },
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEField, setShowEField] = useState(true);
  const [showBField, setShowBField] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(60);
  const [time, setTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  // Animation Loop
  const animate = (t: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (t - lastTimeRef.current) / 1000;
      if (isPlaying && currentStepIndex === -1) {
        setTime(prev => prev + deltaTime * frequency * 3);
      }
    }
    lastTimeRef.current = t;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, frequency, currentStepIndex]);

  const startWave = () => {
    setTime(0);
    setCurrentStepIndex(-1);
    setIsPlaying(true);
  };

  const selectStep = (index: number) => {
    setCurrentStepIndex(index);
    setTime(STEPS[index].phase);
    setIsPlaying(false);
  };

  // Wave Calculation
  const points = useMemo(() => {
    const numPoints = 120;
    const waveLength = 200;
    const k = (2 * Math.PI) / waveLength;

    const pts: WavePoint[] = [];
    for (let i = 0; i < numPoints; i++) {
        const x = i * 5;
        const phase = time - k * x;
        if (phase < 0) {
            pts.push({ x, e: 0, b: 0 });
            continue;
        }
        const e = Math.sin(phase) * amplitude;
        const b = Math.sin(phase) * amplitude;
        pts.push({ x, e, b });
    }
    return pts;
  }, [time, amplitude]);

  const antennaCharge = Math.sin(time);
  // Synchronize current with the peak of the wave at the source for visual clarity
  const antennaCurrent = Math.sin(time);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="max-w-5xl w-full mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Zap size={24} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
               EM Wave Generator
            </h1>
        </div>
        <p className="text-slate-400 max-w-2xl">
          Visualiseer de dipole-antenne en de 3D voortplanting van elektromagnetische velden.
        </p>
      </header>

      <main className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 bg-slate-900/40 rounded-3xl border border-white/5 p-4 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl min-h-[600px] flex items-center justify-center group text-white">
          
          <div className="absolute top-8 left-8 z-10 space-y-2 pointer-events-none">
             <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4 font-mono">Simulatie Status</div>
             {showEField && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-red-400 font-bold uppercase tracking-tighter">Elektrisch (E)</span>
                </div>
             )}
             {showBField && (
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-blue-400 font-bold uppercase tracking-tighter">Magnetisch (B)</span>
                </div>
             )}
          </div>

          <svg
            viewBox="-100 -220 800 440"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Refined Markers for Arrows - refX=10 puts the tip exactly at the coordinate */}
              <marker id="arrow-e" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
              <marker id="arrow-b" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-current" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
              </marker>
              
              <linearGradient id="poleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* 3D Grid */}
            <g transform="skewX(-25) translate(40, 0)">
                {[...Array(6)].map((_, i) => (
                    <line key={`grid-x-${i}`} x1={i * 120} y1="-150" x2={i * 120} y2="150" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                ))}
                {[...Array(7)].map((_, i) => (
                    <line key={`grid-y-${i}`} x1="0" y1={-150 + i * 50} x2="650" y2={-150 + i * 50} stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                ))}
            </g>

            {/* Axes */}
            <g className="axes">
               <line x1="-20" y1="0" x2="650" y2="0" stroke="white" strokeOpacity="0.1" strokeWidth="1.5" />
               <text x="640" y="20" fill="#475569" fontSize="9" fontWeight="black" className="tracking-widest">PROPAGATIE-AXIS</text>
            </g>

            {/* Wave Fields */}
            {showBField && (
               <g transform="skewX(-25)">
                  {showVectors && points.map((p, i) => (
                    p.b !== 0 && i % 4 === 0 && (
                      <line
                        key={`b-vec-${i}`}
                        x1={p.x} y1="0" 
                        // Flipped sign for p.b to ensure E x B points Right (Propagation direction)
                        x2={p.x} y2={-p.b * 1.2 * 0.92}
                        stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"
                        markerEnd="url(#arrow-b)"
                        opacity={Math.abs(p.b) > 4 ? 0.7 : 0}
                      />
                    )
                  ))}
                  <path d={`M ${points.map(p => `${p.x},${-p.b * 1.2}`).join(' L ')}`} fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
               </g>
            )}

            {showEField && (
               <g>
                   {showVectors && points.map((p, i) => (
                    p.e !== 0 && i % 4 === 0 && (
                      <line
                        key={`e-vec-${i}`}
                        x1={p.x} y1="0" 
                        // Corrected: If p.e is positive (corresponding to top +), vector points DOWN (positive y)
                        x2={p.x} y2={p.e * 0.92}
                        stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"
                        markerEnd="url(#arrow-e)"
                        opacity={Math.abs(p.e) > 4 ? 0.8 : 0}
                      />
                    )
                  ))}
                  <path d={`M ${points.map(p => `${p.x},${p.e}`).join(' L ')}`} fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.8" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
               </g>
            )}

            {/* Dipole Antenna - Fixed Positions, Dynamic Charges & Current */}
            <g className="antenna">
              {/* Static poles */}
              <rect x="-3" y="-120" width="6" height="115" rx="3" fill="url(#poleGrad)" stroke="#475569" strokeWidth="1" />
              <rect x="-3" y="5" width="6" height="115" rx="3" fill="url(#poleGrad)" stroke="#475569" strokeWidth="1" />
              
              {/* Current Flow Visualization (Internal) */}
              <mask id="antennaMask">
                <rect x="-3" y="-120" width="6" height="115" rx="3" fill="white" />
                <rect x="-3" y="5" width="6" height="115" rx="3" fill="white" />
              </mask>
              
              <g mask="url(#antennaMask)">
                 {[...Array(6)].map((_, i) => (
                    <motion.line
                        key={`flow-${i}`}
                        x1="0" y1={-120 + i * 40} x2="0" y2={-100 + i * 40}
                        stroke="#fbbf24" strokeWidth="2" strokeDasharray="2 4"
                        animate={{ y: [0, antennaCurrent * 20] }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        opacity={Math.abs(antennaCurrent) * 0.5}
                    />
                 ))}
              </g>

              {/* AC Source Symbol (Oscillator) */}
              <g className="ac-source">
                 <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" className="drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]" />
                 <path 
                    d="M -5 0 Q -2.5 -5 0 0 Q 2.5 5 5 0" 
                    fill="none" 
                    stroke="#fbbf24" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                 />
              </g>

              {/* Current Direction Arrow (I) */}
              <motion.g 
                animate={{ 
                    opacity: Math.abs(antennaCurrent) > 0.2 ? Math.abs(antennaCurrent) : 0,
                    scaleY: antennaCurrent > 0 ? 1 : -1
                }}
                className="pointer-events-none"
              >
                  <line x1="-15" y1="30" x2="-15" y2="-30" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#arrow-current)" />
                  <text x="-25" y="0" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="black" transform={antennaCurrent > 0 ? "" : "scale(1, -1)"}>I</text>
              </motion.g>

              {/* Top Tip Charge (+ sign) */}
              <motion.g animate={{ opacity: antennaCharge > 0.1 ? antennaCharge : 0, scale: antennaCharge > 0.1 ? 1.1 : 0.8 }}>
                 <text x="0" y="-135" textAnchor="middle" fill="#facc15" fontSize="28" fontWeight="black" className="select-none">
                    +
                 </text>
              </motion.g>

              {/* Top Tip Charge (- sign) */}
              <motion.g animate={{ opacity: antennaCharge < -0.1 ? -antennaCharge : 0, scale: antennaCharge < -0.1 ? 1.1 : 0.8 }}>
                 <text x="0" y="-135" textAnchor="middle" fill="#94a3b8" fontSize="28" fontWeight="black" className="select-none">
                    -
                 </text>
              </motion.g>

              {/* Bottom Tip Charge (Strictly Opposite) */}
              <motion.g animate={{ opacity: antennaCharge > 0.1 ? antennaCharge : 0, scale: antennaCharge > 0.1 ? 1.1 : 0.8 }}>
                 <text x="0" y="150" textAnchor="middle" fill="#94a3b8" fontSize="28" fontWeight="black" className="select-none">
                    -
                 </text>
              </motion.g>

              <motion.g animate={{ opacity: antennaCharge < -0.1 ? -antennaCharge : 0, scale: antennaCharge < -0.1 ? 1.1 : 0.8 }}>
                 <text x="0" y="150" textAnchor="middle" fill="#facc15" fontSize="28" fontWeight="black" className="select-none">
                    +
                 </text>
              </motion.g>
              
              <text x="0" y="190" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="black" className="tracking-widest uppercase">Dipool Antenne</text>
            </g>
          </svg>

          {/* HUD Overlay */}
          <div className="absolute bottom-8 left-8 flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-950/40 border border-white/5 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500">PERIODS</span>
                        <span className="text-xs font-mono font-bold text-white">{(time / (2*Math.PI)).toFixed(1)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-500">CHARGE</span>
                      <span className={`text-xs font-mono font-bold ${antennaCharge > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                         {antennaCharge > 0 ? 'POSITIVE' : 'NEGATIVE'}
                      </span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <section className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-2xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={12} className="text-amber-500" /> Control Hub
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={startWave}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95"
              >
                Reset & Start
              </button>

              <div className="flex gap-2">
                <button
                    onClick={() => { setIsPlaying(!isPlaying); if (currentStepIndex !== -1) setCurrentStepIndex(-1); }}
                    className="flex-1 py-3 px-4 bg-slate-800 border border-white/5 rounded-2xl text-[10px] font-bold uppercase transition-all hover:bg-slate-700"
                >
                    {isPlaying ? <span className="flex items-center justify-center gap-2"><Pause size={12} /> Pause</span> : <span className="flex items-center justify-center gap-2"><Play size={12} /> Play</span>}
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                        <span>Freq</span>
                        <span className="text-amber-500">{frequency.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0.1" max="4" step="0.1" value={frequency} onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                        <span>Ampl</span>
                        <span className="text-white">{amplitude}</span>
                    </div>
                    <input type="range" min="10" max="100" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-white" />
                </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-2xl space-y-2">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Display</h2>
            {[
              { id: 'e', label: 'Electric Field', color: 'text-red-500', state: showEField, setter: setShowEField },
              { id: 'b', label: 'Magnetic Field', color: 'text-blue-500', state: showBField, setter: setShowBField },
              { id: 'v', label: 'Vector Arrows', color: 'text-slate-400', state: showVectors, setter: setShowVectors }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => btn.setter(!btn.state)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  btn.state ? 'bg-slate-800/50 border-white/10' : 'bg-transparent border-transparent opacity-30 text-slate-600'
                }`}
              >
                <span className="text-[9px] font-bold uppercase">{btn.label}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${btn.state ? btn.color.replace('text', 'bg') : 'bg-slate-700'}`} />
              </button>
            ))}
          </section>

          <section className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-2xl">
             <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Key Steps</h2>
             <div className="grid grid-cols-5 gap-2">
                {STEPS.map((step, idx) => (
                    <button
                        key={step.id}
                        onClick={() => selectStep(idx)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                            currentStepIndex === idx 
                            ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/20' 
                            : 'bg-slate-800 text-slate-600 hover:text-slate-300'
                        }`}
                    >
                        {step.id.toUpperCase()}
                    </button>
                ))}
             </div>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl w-full mt-12 mb-12 flex flex-col md:flex-row gap-8 items-start opacity-60">
        <div className="flex-1 p-6 bg-white/2 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Techniek</h4>
            <p className="text-[10px] leading-relaxed text-slate-500">
               In deze simulatie zie je de directe koppeling tussen de oscillatie van de bron (de antenne) en de 
               resulterende transversale golf. Let op hoe de pijlpunten van het elektrische veld naar beneden wijzen 
               wanneer de bovenste staaf positief geladen is (moment b).
            </p>
        </div>
        <div className="flex flex-col items-center justify-center p-8 border border-white/5 rounded-3xl min-w-[200px]">
            <p className="text-[8px] font-mono tracking-[1em] text-slate-700">WAVE_ENGINE_V2</p>
        </div>
      </footer>
    </div>
  );
}
