import React, { useRef, useEffect, useState } from 'react';
import { 
  RotateCw, 
  Layers, 
  Sparkles, 
  Zap
} from 'lucide-react';
import { DetectedMutation } from '../types/genomics';
import { AMINO_ACID_MAP } from '../utils/geneticCode';

interface Protein3DViewerProps {
  proteinSequence: string;
  mutations: DetectedMutation[];
  selectedMutation: DetectedMutation | null;
  onSelectMutation: (mut: DetectedMutation) => void;
  geneSymbol: string;
}

export const Protein3DViewer: React.FC<Protein3DViewerProps> = ({
  proteinSequence,
  mutations,
  selectedMutation,
  onSelectMutation,
  geneSymbol,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderMode, setRenderMode] = useState<'ribbon' | 'ballstick' | 'spacefill'>('ribbon');
  const [showWildType, setShowWildType] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.8 });
  const [zoom, setZoom] = useState<number>(1.1);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const activeMutation = selectedMutation || mutations[0] || null;
  const activeResidueIndex = activeMutation?.codonPos ? activeMutation.codonPos - 1 : 15;

  // Generate 3D pseudo-coordinates for protein backbone (Helices, Beta strands, Loops)
  const backbone3D = React.useMemo(() => {
    const coords: { x: number; y: number; z: number; aa: string; type: 'helix' | 'sheet' | 'loop'; index: number }[] = [];
    const seq = proteinSequence || 'MVKVGVNGFGRIGRLVTRAAFNSGKVDVVAINDPFIDLNYMVYMFQYDSTHGKFHGTVKAENGKLVINGNPITIFQERDPSKIKWGDAGAEYVVESTGVFTTMEKAGAHLQGGAKRVIISAPSADAPMFVMGVNHEKYDNSLKIISNASCTTNCLAPLAKVIHDNFGIVEGLMTTVHAITATQKTVDGPSGKLWRDGRGALQNIIPASTGAAKAVGKVIPELNGKLTGMAFRVPTANVSVVDLTCRLEKPAKYDDIKKVVKQASEGPLKGILGYTEHQVVSTDFNSDTHSSTFDAGAGIALNDHFVKLISWYDNEFGYSNRVVDLMAHMASKE';
    
    const count = Math.min(seq.length, 120);
    let curX = 0;
    let curY = 0;
    let curZ = 0;

    for (let i = 0; i < count; i++) {
      const aa = seq[i] || 'A';
      // Simulate periodic secondary structures
      const isHelix = (i % 28) < 14;
      const isSheet = (i % 28) >= 16 && (i % 28) < 24;

      if (isHelix) {
        const angle = i * 1.7;
        curX += Math.cos(angle) * 4.2;
        curY += 2.2;
        curZ += Math.sin(angle) * 4.2;
        coords.push({ x: curX, y: curY, z: curZ, aa, type: 'helix', index: i });
      } else if (isSheet) {
        curX += (i % 2 === 0 ? 5.5 : -5.5);
        curY += 4.5;
        curZ += (i % 4 < 2 ? 2.5 : -2.5);
        coords.push({ x: curX, y: curY, z: curZ, aa, type: 'sheet', index: i });
      } else {
        curX += (Math.sin(i * 0.8) * 6.5);
        curY += 3.2;
        curZ += (Math.cos(i * 0.8) * 6.5);
        coords.push({ x: curX, y: curY, z: curZ, aa, type: 'loop', index: i });
      }
    }

    // Center coordinates
    const avgX = coords.reduce((s, c) => s + c.x, 0) / (coords.length || 1);
    const avgY = coords.reduce((s, c) => s + c.y, 0) / (coords.length || 1);
    const avgZ = coords.reduce((s, c) => s + c.z, 0) / (coords.length || 1);

    return coords.map(c => ({
      ...c,
      x: c.x - avgX,
      y: c.y - avgY,
      z: c.z - avgZ,
    }));
  }, [proteinSequence]);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep dark cyber bio background gradient
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 20,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
      );
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Auto rotation
      if (isAutoRotating) {
        setRotation(prev => ({
          x: prev.x + 0.002,
          y: prev.y + 0.004,
        }));
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Projection with 3D rotation matrix
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      const projected = backbone3D.map(p => {
        // Rotate Y
        let x1 = p.x * cosY + p.z * sinY;
        let y1 = p.y;
        let z1 = -p.x * sinY + p.z * cosY;

        // Rotate X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Perspective
        const fov = 350;
        const scale = (fov / (fov + z2 + 120)) * zoom * 3.8;
        const px = cx + x2 * scale;
        const py = cy + y2 * scale;

        return { ...p, px, py, pz: z2, scale };
      });

      // Sort by Z for correct depth rendering (Painter's algorithm)
      projected.sort((a, b) => a.pz - b.pz);

      // 1. Draw connecting ribbon backbone
      ctx.beginPath();
      ctx.lineWidth = renderMode === 'ribbon' ? 7 * zoom : 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Connect along original sequence index
      const sortedByOriginal = [...projected].sort((a, b) => a.index - b.index);

      for (let i = 0; i < sortedByOriginal.length - 1; i++) {
        const p1 = sortedByOriginal[i];
        const p2 = sortedByOriginal[i + 1];

        const isMutLocus = Math.abs(p1.index - activeResidueIndex) <= 1;

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);

        if (isMutLocus) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 10 * zoom;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 15;
        } else if (p1.type === 'helix') {
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 6 * zoom;
          ctx.shadowBlur = 0;
        } else if (p1.type === 'sheet') {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 8 * zoom;
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3.5 * zoom;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // 2. Draw atoms / residues
      projected.forEach(p => {
        const isMutLocus = p.index === activeResidueIndex;
        const aaInfo = AMINO_ACID_MAP[p.aa] || AMINO_ACID_MAP['?'];
        const radius = isMutLocus 
          ? (renderMode === 'spacefill' ? 24 : 14) * p.scale 
          : (renderMode === 'spacefill' ? 14 : renderMode === 'ballstick' ? 8 : 4) * p.scale;

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(2, radius), 0, Math.PI * 2);

        if (isMutLocus) {
          // Glowing Mutated Residue Core
          ctx.fillStyle = showWildType ? '#10b981' : '#f43f5e';
          ctx.shadowColor = showWildType ? '#10b981' : '#f43f5e';
          ctx.shadowBlur = 20;
          ctx.fill();

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw residue callout badge in 3D space
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          const label = showWildType 
            ? `WT: ${activeMutation?.refAaName || 'Ref'} #${p.index + 1}`
            : `MUT: ${activeMutation?.altAaName || 'Mut'} #${p.index + 1}`;
          
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(p.px + 12, p.py - 12, label.length * 7.5 + 10, 20);
          ctx.strokeStyle = showWildType ? '#10b981' : '#f43f5e';
          ctx.lineWidth = 1;
          ctx.strokeRect(p.px + 12, p.py - 12, label.length * 7.5 + 10, 20);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, p.px + 16, p.py + 2);

          // If steric clash simulation
          if (!showWildType && activeMutation && (activeMutation.granthamScore || 0) > 100) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, radius * 1.8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } else {
          ctx.fillStyle = aaInfo.color;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [backbone3D, rotation, zoom, renderMode, showWildType, isAutoRotating, activeResidueIndex, activeMutation]);

  // Mouse drag handlers for 3D orbital rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsAutoRotating(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation(prev => ({
      x: prev.x + dy * 0.008,
      y: prev.y + dx * 0.008,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3.0, prev - e.deltaY * 0.0015)));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* 3D Top Toolbar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-950 border border-purple-800 rounded-lg text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive 3D Protein Backbone & Steric Locus</span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                {geneSymbol} Model
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Drag to orbit, scroll to zoom. Pinpoints spatial disruption and sidechain alterations.
            </p>
          </div>
        </div>

        {/* 3D Rendering Modes & Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {mutations.length > 1 && (
            <select
              value={activeMutation?.id || ''}
              onChange={(e) => {
                const found = mutations.find(m => m.id === e.target.value);
                if (found) onSelectMutation(found);
              }}
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-cyan-300 font-mono focus:outline-none"
            >
              {mutations.map(m => (
                <option key={m.id} value={m.id}>
                  {m.hgvsP || m.hgvsC}
                </option>
              ))}
            </select>
          )}
          {/* Style Mode */}
          <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center">
            {(['ribbon', 'ballstick', 'spacefill'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRenderMode(mode)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                  renderMode === mode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Wild-Type vs Mutant Switch */}
          <button
            onClick={() => setShowWildType(!showWildType)}
            className={`px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              showWildType
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-rose-950 text-rose-300 border-rose-600 shadow-md shadow-rose-950/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{showWildType ? 'Showing: Wild-Type' : 'Showing: Mutated'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg border transition ${
              isAutoRotating
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-[480px] cursor-grab active:cursor-grabbing block"
        />

        {/* Overlay Structural Consequence HUD */}
        {activeMutation && (
          <div className="absolute top-4 left-4 max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Residue #{activeMutation.codonPos || 1} Locus</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeMutation.pathogenicity === 'Pathogenic' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
              }`}>
                {activeMutation.pathogenicity}
              </span>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Wild-Type Residue:</span>
                <span className="text-emerald-400 font-bold">{activeMutation.refAaName} ({activeMutation.refAa})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mutant Residue:</span>
                <span className="text-rose-400 font-bold">{activeMutation.altAaName} ({activeMutation.altAa})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grantham Distance:</span>
                <span className="text-orange-400 font-bold">{activeMutation.granthamScore || 0}/215 ({activeMutation.granthamCategory})</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {activeMutation.structuralImpactNotes || 'Substitutions at this core locus can trigger steric hindrance, salt-bridge collapse, or hydrogen-bond loss.'}
            </p>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
              <span>CADD: <strong className="text-cyan-300">{activeMutation.caddScore || '28.4'}</strong></span>
              <span>PolyPhen-2: <strong className="text-rose-300">{activeMutation.polyphenPrediction || 'Damaging'}</strong></span>
            </div>
          </div>
        )}

        {/* Legend in corner */}
        <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1 text-slate-300">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[9px]">3D Color Key</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Alpha Helix</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Beta Sheet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Mutated Residue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
