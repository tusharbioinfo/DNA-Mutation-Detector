import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Activity, Sparkles, Sliders, AlertTriangle } from 'lucide-react';
import { generateSangerTrace } from '../utils/sangerSimulator';
import { DetectedMutation } from '../types/genomics';

interface SangerTraceViewerProps {
  sequence: string;
  mutations: DetectedMutation[];
  geneSymbol: string;
  onSelectMutation: (mut: DetectedMutation) => void;
}

export const SangerTraceViewer: React.FC<SangerTraceViewerProps> = ({
  sequence,
  mutations,
  geneSymbol,
  onSelectMutation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHeterozygousMode, setIsHeterozygousMode] = useState<boolean>(true);
  const [windowOffset, setWindowOffset] = useState<number>(0);
  const [channelVisibility, setChannelVisibility] = useState({
    a: true,
    c: true,
    g: true,
    t: true,
  });

  const windowBases = 28; // Number of bases visible in viewport

  const mutatedPositions = useMemo(() => {
    return mutations.map(m => ({
      pos: m.genomicPos,
      altBase: m.altNt && m.altNt.length === 1 && m.altNt !== '-' ? m.altNt : 'A',
      isHeterozygous: isHeterozygousMode,
    }));
  }, [mutations, isHeterozygousMode]);

  const { tracePoints, baseCalls } = useMemo(() => {
    return generateSangerTrace(sequence || 'ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAG', mutatedPositions, 16);
  }, [sequence, mutatedPositions]);

  // Center window around first mutation initially
  useEffect(() => {
    if (mutations.length > 0) {
      const firstMutPos = mutations[0].genomicPos;
      setWindowOffset(Math.max(0, firstMutPos - Math.floor(windowBases / 2)));
    }
  }, [mutations]);

  // Render Sanger Chromatogram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Baseline grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let y = 40; y < height - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const pointsPerBase = 16;
    const totalPointsInWindow = windowBases * pointsPerBase;
    const startPointIdx = windowOffset * pointsPerBase;
    const endPointIdx = Math.min(tracePoints.length - 1, startPointIdx + totalPointsInWindow);

    const visiblePoints = tracePoints.slice(startPointIdx, endPointIdx);
    const visibleCalls = baseCalls.slice(windowOffset, windowOffset + windowBases);

    if (visiblePoints.length === 0) return;

    const scaleX = width / (totalPointsInWindow || 1);
    const plotHeight = height - 70;
    const baseY = height - 35;

    // Helper to draw single channel trace
    const drawChannel = (
      channel: 'a' | 'c' | 'g' | 't',
      color: string,
      glowColor: string
    ) => {
      if (!channelVisibility[channel]) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 4;

      for (let i = 0; i < visiblePoints.length; i++) {
        const pt = visiblePoints[i];
        const px = i * scaleX;
        const val = pt[channel];
        const py = baseY - (val / 100) * plotHeight;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // Draw Chromatogram Waves (A=Green, C=Blue, G=Black/Gray, T=Red)
    drawChannel('a', '#10b981', 'rgba(16, 185, 129, 0.4)');
    drawChannel('c', '#38bdf8', 'rgba(56, 189, 248, 0.4)');
    drawChannel('g', '#fbbf24', 'rgba(251, 191, 36, 0.4)');
    drawChannel('t', '#f43f5e', 'rgba(244, 63, 94, 0.4)');

    // Draw Base Calls and Quality Tracks along bottom and top
    visibleCalls.forEach((call, callIdx) => {
      const callCenterX = (callIdx * pointsPerBase + pointsPerBase / 2) * scaleX;

      // Base letter box at top
      ctx.fillStyle = call.isMutated ? 'rgba(244, 63, 94, 0.25)' : 'rgba(30, 41, 59, 0.6)';
      ctx.fillRect(callCenterX - 10, 8, 20, 22);
      ctx.strokeStyle = call.isMutated ? '#f43f5e' : '#334155';
      ctx.strokeRect(callCenterX - 10, 8, 20, 22);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = call.isMutated ? '#f43f5e' : '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(call.base, callCenterX, 23);

      // Position index & Phred Quality at bottom
      ctx.font = '10px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${call.position}`, callCenterX, height - 12);

      // Phred quality indicator dot
      ctx.beginPath();
      ctx.arc(callCenterX, height - 24, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = call.quality >= 40 ? '#10b981' : call.quality >= 30 ? '#fbbf24' : '#ef4444';
      ctx.fill();

      // Mutation Flag
      if (call.isMutated) {
        ctx.beginPath();
        ctx.moveTo(callCenterX, 34);
        ctx.lineTo(callCenterX, baseY);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

  }, [tracePoints, baseCalls, windowOffset, channelVisibility, isHeterozygousMode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Top Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-950 border border-amber-800 rounded-lg text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Sanger Capillary Electropherogram Simulator</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                {geneSymbol} Chromatogram
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              4-Color fluorescence wave simulation. Detects heterozygous double-peaks and base-call Phred Q-scores.
            </p>
          </div>
        </div>

        {/* Trace Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Heterozygous Toggle */}
          <button
            onClick={() => setIsHeterozygousMode(!isHeterozygousMode)}
            className={`px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              isHeterozygousMode
                ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHeterozygousMode ? 'Heterozygous (Double Peaks)' : 'Homozygous'}</span>
          </button>

          {/* Color Channels Filter */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1">
            {[
              { key: 'a', label: 'A', color: 'text-emerald-400' },
              { key: 'c', label: 'C', color: 'text-sky-400' },
              { key: 'g', label: 'G', color: 'text-amber-400' },
              { key: 't', label: 'T', color: 'text-rose-400' },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setChannelVisibility(prev => ({ ...prev, [key]: !prev[key as keyof typeof channelVisibility] }))}
                className={`px-2 py-0.5 rounded font-mono font-bold text-xs transition ${
                  channelVisibility[key as keyof typeof channelVisibility]
                    ? `${color} bg-slate-800 border border-slate-700`
                    : 'text-slate-600 line-through bg-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Chromatogram View */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={900}
          height={260}
          className="w-full h-[260px] rounded-xl border border-slate-800 block bg-slate-950"
        />

        {/* Viewport Scroller Slider */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Window:
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, baseCalls.length - windowBases)}
            value={windowOffset}
            onChange={(e) => setWindowOffset(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <span className="text-xs font-mono text-cyan-400 font-bold whitespace-nowrap">
            Pos {windowOffset + 1} - {Math.min(baseCalls.length, windowOffset + windowBases)}
          </span>
        </div>

        {/* Mutation Highlights in Sanger Trace */}
        {mutations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Chromatogram Mutation Peaks:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mutations.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setWindowOffset(Math.max(0, m.genomicPos - Math.floor(windowBases / 2)));
                    onSelectMutation(m);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>{m.hgvsP || m.hgvsC} (Pos #{m.genomicPos})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
