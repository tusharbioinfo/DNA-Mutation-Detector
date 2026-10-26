import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sun, 
  Flame, 
  Zap, 
  RotateCcw, 
  Sparkles, 
  Dna,
  Shuffle
} from 'lucide-react';

interface MutagenesisSandboxProps {
  refSequence: string;
  altSequence: string;
  onAltChange: (seq: string) => void;
  onResetToRef: () => void;
}

export const MutagenesisSandbox: React.FC<MutagenesisSandboxProps> = ({
  refSequence,
  altSequence,
  onAltChange,
  onResetToRef,
}) => {
  const [selectedLocus, setSelectedLocus] = useState<number | null>(null);
  const [lastMutagenApplied, setLastMutagenApplied] = useState<string | null>(null);

  // Apply Environmental Mutational Signatures
  const applyMutagen = (type: 'uv' | 'deamination' | 'tobacco' | 'ros' | 'random') => {
    const chars = altSequence.split('');
    let modifiedCount = 0;

    if (type === 'uv') {
      // CC -> TT or C -> T at TT/CC pairs
      for (let i = 0; i < chars.length - 1; i++) {
        if (chars[i] === 'C' && chars[i + 1] === 'C' && Math.random() > 0.4) {
          chars[i] = 'T';
          chars[i + 1] = 'T';
          modifiedCount += 2;
          break;
        } else if (chars[i] === 'C' && Math.random() > 0.7) {
          chars[i] = 'T';
          modifiedCount++;
          break;
        }
      }
      setLastMutagenApplied(`UV Radiation signature: CC>TT / C>T pyrimidine dimer transition`);
    } else if (type === 'deamination') {
      // C -> T at CpG dinucleotides
      for (let i = 0; i < chars.length - 1; i++) {
        if (chars[i] === 'C' && chars[i + 1] === 'G') {
          chars[i] = 'T';
          modifiedCount++;
          break;
        }
      }
      if (modifiedCount === 0) {
        // Fallback to any C
        const cIdx = chars.findIndex(c => c === 'C');
        if (cIdx !== -1) {
          chars[cIdx] = 'T';
          modifiedCount++;
        }
      }
      setLastMutagenApplied(`Spontaneous Deamination: 5mC>T transition at CpG dinucleotide hotspot`);
    } else if (type === 'tobacco') {
      // G -> T transversion
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === 'G' && Math.random() > 0.4) {
          chars[i] = 'T';
          modifiedCount++;
          break;
        }
      }
      setLastMutagenApplied(`Tobacco Smoke Carcinogen (Benzo[a]pyrene): G>T transversion`);
    } else if (type === 'ros') {
      // 8-oxoG: G -> T or C -> A
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === 'G') {
          chars[i] = 'T';
          modifiedCount++;
          break;
        }
      }
      setLastMutagenApplied(`Reactive Oxygen Species (Oxidative Stress): 8-oxoG (G>T) lesion`);
    } else if (type === 'random') {
      // Random point mutation
      const randIdx = Math.floor(Math.random() * chars.length);
      const bases = ['A', 'C', 'G', 'T'].filter(b => b !== chars[randIdx]);
      const newBase = bases[Math.floor(Math.random() * bases.length)];
      chars[randIdx] = newBase;
      modifiedCount++;
      setLastMutagenApplied(`Random Point Mutagenesis (Error-Prone Polymerase) at Pos #${randIdx + 1}`);
    }

    if (modifiedCount > 0) {
      onAltChange(chars.join(''));
    }
  };

  const handleManualBaseEdit = (newBase: string) => {
    if (selectedLocus === null) return;
    const chars = altSequence.split('');
    if (selectedLocus >= 0 && selectedLocus < chars.length) {
      chars[selectedLocus] = newBase;
      onAltChange(chars.join(''));
    }
  };

  const handleManualInsert = () => {
    if (selectedLocus === null) return;
    const chars = altSequence.split('');
    chars.splice(selectedLocus, 0, 'A');
    onAltChange(chars.join(''));
  };

  const handleManualDelete = () => {
    if (selectedLocus === null) return;
    const chars = altSequence.split('');
    chars.splice(selectedLocus, 1);
    onAltChange(chars.join(''));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Top Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-rose-950 border border-rose-800 rounded-lg text-rose-400">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Mutagenesis Sandbox & Environmental Signature Injector</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Inject UV radiation, spontaneous deamination, tobacco carcinogens, or introduce site-directed nucleotide edits.
            </p>
          </div>
        </div>

        <button
          onClick={onResetToRef}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset Sample to Wild-Type</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Environmental Mutagen Presets */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Environmental Mutational Signatures (COSMIC Signatures)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              onClick={() => applyMutagen('uv')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition group shadow-md"
            >
              <div className="flex items-center space-x-2 mb-1 text-amber-400">
                <Sun className="w-4 h-4 group-hover:animate-spin" />
                <span className="font-bold text-xs text-white">UV Radiation (SBS7)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Induces C&gt;T / CC&gt;TT transitions at pyrimidine dimers.
              </p>
            </button>

            <button
              onClick={() => applyMutagen('deamination')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-500 rounded-xl text-left transition group shadow-md"
            >
              <div className="flex items-center space-x-2 mb-1 text-cyan-400">
                <Zap className="w-4 h-4 group-hover:scale-110" />
                <span className="font-bold text-xs text-white">CpG Deamination (SBS1)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Spontaneous clock-like 5mC&gt;T transition at CpG dinucleotides.
              </p>
            </button>

            <button
              onClick={() => applyMutagen('tobacco')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-rose-500 rounded-xl text-left transition group shadow-md"
            >
              <div className="flex items-center space-x-2 mb-1 text-rose-400">
                <Flame className="w-4 h-4 group-hover:animate-bounce" />
                <span className="font-bold text-xs text-white">Tobacco Smoke (SBS4)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Benzo[a]pyrene bulky adducts causing G&gt;T transversions.
              </p>
            </button>

            <button
              onClick={() => applyMutagen('ros')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-purple-500 rounded-xl text-left transition group shadow-md"
            >
              <div className="flex items-center space-x-2 mb-1 text-purple-400">
                <Dna className="w-4 h-4" />
                <span className="font-bold text-xs text-white">Oxidative Stress (SBS18)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                8-oxoguanine damage triggering G&gt;T and C&gt;A transversions.
              </p>
            </button>

            <button
              onClick={() => applyMutagen('random')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition group shadow-md"
            >
              <div className="flex items-center space-x-2 mb-1 text-emerald-400">
                <Shuffle className="w-4 h-4 group-hover:rotate-180 transition" />
                <span className="font-bold text-xs text-white">Random Point Mut</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Simulate random polymerase copying replication error.
              </p>
            </button>
          </div>

          {lastMutagenApplied && (
            <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center justify-between">
              <span className="font-medium">Applied: {lastMutagenApplied}</span>
              <button
                onClick={() => setLastMutagenApplied(null)}
                className="text-slate-400 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Interactive Site-Directed Base Mutator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Site-Directed Mutagenesis Grid (Click Any Base to Edit)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {altSequence.length} Nucleotides
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-56 overflow-y-auto font-mono text-xs flex flex-wrap gap-1 leading-relaxed">
            {altSequence.split('').map((base, idx) => {
              const isSelected = selectedLocus === idx;
              const isDiffFromRef = refSequence[idx] !== base;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedLocus(idx)}
                  className={`w-6 h-7 rounded flex items-center justify-center font-bold text-xs transition border ${
                    isSelected
                      ? 'bg-cyan-500 text-white border-cyan-400 ring-2 ring-cyan-400/50 scale-110 z-10'
                      : isDiffFromRef
                      ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                  title={`Pos #${idx + 1}: ${base} (Ref: ${refSequence[idx] || '-'})`}
                >
                  {base}
                </button>
              );
            })}
          </div>

          {/* Action Palette when a locus is selected */}
          {selectedLocus !== null && (
            <div className="mt-3 p-3 bg-slate-950/90 border border-cyan-800/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">
                  Selected Pos #{selectedLocus + 1} (Current: <strong className="text-cyan-400 font-mono">{altSequence[selectedLocus]}</strong>, Ref: <strong className="text-emerald-400 font-mono">{refSequence[selectedLocus] || '-'}</strong>)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[11px]">Mutate to:</span>
                {['A', 'C', 'G', 'T'].map((base) => (
                  <button
                    key={base}
                    onClick={() => handleManualBaseEdit(base)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-white rounded font-mono font-bold text-xs transition"
                  >
                    {base}
                  </button>
                ))}
                <button
                  onClick={handleManualInsert}
                  className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-700 text-indigo-300 hover:text-white rounded text-xs font-bold transition border border-indigo-800"
                >
                  + Ins Base
                </button>
                <button
                  onClick={handleManualDelete}
                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-700 text-rose-300 hover:text-white rounded text-xs font-bold transition border border-rose-800"
                >
                  - Del Base
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
