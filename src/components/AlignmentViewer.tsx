import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Info
} from 'lucide-react';
import { AlignmentResult, DetectedMutation } from '../types/genomics';
import { CODON_TABLE, AMINO_ACID_MAP } from '../utils/geneticCode';

interface AlignmentViewerProps {
  alignment: AlignmentResult;
  readingFrame: number;
  onSelectMutation: (mut: DetectedMutation) => void;
  selectedMutationId?: string | null;
}

export const AlignmentViewer: React.FC<AlignmentViewerProps> = ({
  alignment,
  readingFrame,
  onSelectMutation,
  selectedMutationId,
}) => {
  const [zoomLevel, setZoomLevel] = useState<'detailed' | 'codon' | 'compact'>('detailed');
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { pairs, mutations } = alignment;

  // Jump to specific mutation
  const handleJumpToMutation = (mut: DetectedMutation) => {
    onSelectMutation(mut);
    const pairIdx = pairs.findIndex(p => p.refIndex === mut.genomicPos || p.altIndex === mut.genomicPos);
    if (pairIdx !== -1 && scrollContainerRef.current) {
      const colWidth = zoomLevel === 'detailed' ? 32 : zoomLevel === 'codon' ? 24 : 14;
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, pairIdx * colWidth - 250),
        behavior: 'smooth'
      });
      setSelectedColIndex(pairIdx);
    }
  };

  // Auto-scroll when selectedMutationId changes
  useEffect(() => {
    if (selectedMutationId) {
      const mut = mutations.find(m => m.id === selectedMutationId);
      if (mut) {
        const pairIdx = pairs.findIndex(p => p.refIndex === mut.genomicPos || p.altIndex === mut.genomicPos);
        if (pairIdx !== -1 && scrollContainerRef.current) {
          const colWidth = zoomLevel === 'detailed' ? 32 : zoomLevel === 'codon' ? 24 : 14;
          scrollContainerRef.current.scrollTo({
            left: Math.max(0, pairIdx * colWidth - 250),
            behavior: 'smooth'
          });
          setSelectedColIndex(pairIdx);
        }
      }
    }
  }, [selectedMutationId, zoomLevel, mutations, pairs]);

  // Base nucleotide color styling
  const getNtColor = (char: string) => {
    switch (char.toUpperCase()) {
      case 'A': return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'C': return 'text-blue-400 bg-blue-950/60 border-blue-800/80';
      case 'G': return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'T':
      case 'U': return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case '-': return 'text-slate-500 bg-slate-900 border-dashed border-slate-700';
      default: return 'text-slate-300 bg-slate-900 border-slate-800';
    }
  };

  const getColWidthClass = () => {
    if (zoomLevel === 'detailed') return 'w-8 min-w-[2rem] text-xs';
    if (zoomLevel === 'codon') return 'w-6 min-w-[1.5rem] text-[11px]';
    return 'w-3.5 min-w-[0.875rem] text-[9px]';
  };

  // Group into codons for amino acid track
  const codonBlocks: {
    codonIndex: number;
    startCol: number;
    endCol: number;
    refCodon: string;
    altCodon: string;
    refAa: string;
    altAa: string;
    isMutated: boolean;
  }[] = [];

  let curRefCodonStr = '';
  let curAltCodonStr = '';
  let curStartCol = 0;
  let curCodonIdx = 1;

  for (let c = 0; c < pairs.length; c++) {
    const pair = pairs[c];
    if (pair.refChar !== '-') {
      curRefCodonStr += pair.refChar;
    }
    if (pair.altChar !== '-') {
      curAltCodonStr += pair.altChar;
    }

    if (curRefCodonStr.length === 3 || c === pairs.length - 1) {
      const refAa = CODON_TABLE[curRefCodonStr] || (curRefCodonStr.length === 3 ? '?' : '');
      const altAa = CODON_TABLE[curAltCodonStr] || (curAltCodonStr.length === 3 ? '?' : '');
      const isMut = curRefCodonStr !== curAltCodonStr;

      codonBlocks.push({
        codonIndex: curCodonIdx++,
        startCol: curStartCol,
        endCol: c,
        refCodon: curRefCodonStr,
        altCodon: curAltCodonStr,
        refAa,
        altAa,
        isMutated: isMut,
      });

      curRefCodonStr = '';
      curAltCodonStr = '';
      curStartCol = c + 1;
    }
  }

  const selectedCol = selectedColIndex !== null ? pairs[selectedColIndex] : null;
  const associatedMutation = selectedCol
    ? mutations.find(m => m.genomicPos === selectedCol.refIndex || (m.type.includes('deletion') && selectedCol.isGap))
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Top Controls Toolbar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Dynamic Pairwise Matrix
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Length: {alignment.alignLength} bp
          </span>
        </div>

        {/* Mutation Quick Jumper Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full sm:max-w-md py-1 no-scrollbar">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Jump to:</span>
          {mutations.length === 0 ? (
            <span className="text-xs text-emerald-400 font-medium">100% Homology</span>
          ) : (
            mutations.map((m) => (
              <button
                key={m.id}
                onClick={() => handleJumpToMutation(m)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold whitespace-nowrap transition border ${
                  selectedMutationId === m.id
                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                    : m.pathogenicity === 'Pathogenic'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800/80 hover:bg-rose-900'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800/80 hover:bg-amber-900'
                }`}
              >
                {m.hgvsP || m.hgvsC}
              </button>
            ))
          )}
        </div>

        {/* Zoom & View Modes */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setZoomLevel('detailed')}
              className={`px-2.5 py-1 rounded transition ${
                zoomLevel === 'detailed' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Base
            </button>
            <button
              onClick={() => setZoomLevel('codon')}
              className={`px-2.5 py-1 rounded transition ${
                zoomLevel === 'codon' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Codon
            </button>
            <button
              onClick={() => setZoomLevel('compact')}
              className={`px-2.5 py-1 rounded transition ${
                zoomLevel === 'compact' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dense
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                if (zoomLevel === 'compact') setZoomLevel('codon');
                else if (zoomLevel === 'codon') setZoomLevel('detailed');
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (zoomLevel === 'detailed') setZoomLevel('codon');
                else if (zoomLevel === 'codon') setZoomLevel('compact');
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Alignment Scroll Matrix Area */}
      <div className="p-4 overflow-x-auto relative" ref={scrollContainerRef}>
        <div className="inline-block min-w-full font-mono select-none">
          {/* Track 1: Position Ruler */}
          <div className="flex items-center mb-1">
            <div className="w-28 min-w-[7rem] text-[11px] font-semibold text-slate-400 uppercase tracking-wider pr-3 text-right">
              Position
            </div>
            <div className="flex items-center">
              {pairs.map((pair, colIdx) => {
                const showNumber = pair.refIndex % 10 === 0 || colIdx === 0;
                return (
                  <div
                    key={`pos-${colIdx}`}
                    onClick={() => setSelectedColIndex(colIdx)}
                    className={`${getColWidthClass()} text-center cursor-pointer transition ${
                      selectedColIndex === colIdx ? 'bg-cyan-500/20 rounded' : ''
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block truncate">
                      {showNumber ? pair.refIndex : '·'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Reference DNA */}
          <div className="flex items-center mb-1">
            <div className="w-28 min-w-[7rem] text-xs font-bold text-emerald-400 pr-3 text-right flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Ref DNA</span>
            </div>
            <div className="flex items-center">
              {pairs.map((pair, colIdx) => {
                const isSelected = selectedColIndex === colIdx;
                const isDiff = !pair.isMatch;
                return (
                  <div
                    key={`ref-${colIdx}`}
                    onClick={() => setSelectedColIndex(colIdx)}
                    className={`${getColWidthClass()} h-8 flex items-center justify-center font-bold border rounded-md mx-[0.5px] cursor-pointer transition ${getNtColor(
                      pair.refChar
                    )} ${isSelected ? 'ring-2 ring-cyan-400 shadow-md scale-105 z-10' : ''} ${
                      isDiff ? 'ring-1 ring-rose-500/80' : ''
                    }`}
                    title={`Ref Pos ${pair.refIndex}: ${pair.refChar}`}
                  >
                    {pair.refChar}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 3: Match / Identity Indicator */}
          <div className="flex items-center my-0.5">
            <div className="w-28 min-w-[7rem] text-[10px] text-slate-400 pr-3 text-right font-medium">
              Match
            </div>
            <div className="flex items-center">
              {pairs.map((pair, colIdx) => {
                return (
                  <div
                    key={`mid-${colIdx}`}
                    onClick={() => setSelectedColIndex(colIdx)}
                    className={`${getColWidthClass()} h-4 flex items-center justify-center cursor-pointer`}
                  >
                    {pair.isMatch ? (
                      <span className="text-slate-400 text-xs">|</span>
                    ) : pair.type === 'insertion' ? (
                      <span className="text-cyan-400 font-bold text-[10px]">▼</span>
                    ) : pair.type === 'deletion' ? (
                      <span className="text-rose-400 font-bold text-[10px]">✕</span>
                    ) : (
                      <span className="text-rose-400 font-bold text-xs animate-pulse">!</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 4: Sample Mutated DNA */}
          <div className="flex items-center mb-2">
            <div className="w-28 min-w-[7rem] text-xs font-bold text-cyan-400 pr-3 text-right flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Sample DNA</span>
            </div>
            <div className="flex items-center">
              {pairs.map((pair, colIdx) => {
                const isSelected = selectedColIndex === colIdx;
                const isDiff = !pair.isMatch;
                return (
                  <div
                    key={`alt-${colIdx}`}
                    onClick={() => setSelectedColIndex(colIdx)}
                    className={`${getColWidthClass()} h-8 flex items-center justify-center font-bold border rounded-md mx-[0.5px] cursor-pointer transition ${getNtColor(
                      pair.altChar
                    )} ${isSelected ? 'ring-2 ring-cyan-400 shadow-md scale-105 z-10' : ''} ${
                      isDiff ? 'ring-2 ring-rose-500 bg-rose-950 text-rose-300 animate-pulse' : ''
                    }`}
                    title={`Sample Pos ${pair.altIndex}: ${pair.altChar}`}
                  >
                    {pair.altChar}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider between Nucleotide and Protein tracks */}
          <div className="my-2 border-t border-slate-800/80"></div>

          {/* Track 5: Reference Protein Translation */}
          <div className="flex items-center mb-1">
            <div className="w-28 min-w-[7rem] text-xs font-semibold text-emerald-300 pr-3 text-right">
              Ref Protein (F+{readingFrame + 1})
            </div>
            <div className="flex items-center">
              {codonBlocks.map((blk) => {
                const colSpanWidth = (blk.endCol - blk.startCol + 1);
                const aaInfo = AMINO_ACID_MAP[blk.refAa] || AMINO_ACID_MAP['?'];
                return (
                  <div
                    key={`ref-aa-${blk.codonIndex}`}
                    className="h-7 flex items-center justify-center rounded bg-slate-800/90 border border-slate-700/80 text-[11px] font-bold text-slate-200 mx-[1px]"
                    style={{
                      width: `calc(${colSpanWidth} * ${
                        zoomLevel === 'detailed' ? '2rem' : zoomLevel === 'codon' ? '1.5rem' : '0.875rem'
                      } - 2px)`
                    }}
                    title={`Codon ${blk.codonIndex}: ${blk.refCodon} (${aaInfo.name})`}
                  >
                    <span style={{ color: aaInfo.color }}>
                      {zoomLevel === 'detailed' ? `${aaInfo.code3}${blk.codonIndex}` : aaInfo.code1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 6: Sample Mutated Protein Translation */}
          <div className="flex items-center">
            <div className="w-28 min-w-[7rem] text-xs font-semibold text-cyan-300 pr-3 text-right">
              Sample Protein
            </div>
            <div className="flex items-center">
              {codonBlocks.map((blk) => {
                const colSpanWidth = (blk.endCol - blk.startCol + 1);
                const aaInfo = AMINO_ACID_MAP[blk.altAa] || AMINO_ACID_MAP['?'];
                return (
                  <div
                    key={`alt-aa-${blk.codonIndex}`}
                    className={`h-7 flex items-center justify-center rounded text-[11px] font-bold mx-[1px] transition ${
                      blk.isMutated
                        ? 'bg-rose-950 border border-rose-500 text-rose-200 ring-1 ring-rose-500'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200'
                    }`}
                    style={{
                      width: `calc(${colSpanWidth} * ${
                        zoomLevel === 'detailed' ? '2rem' : zoomLevel === 'codon' ? '1.5rem' : '0.875rem'
                      } - 2px)`
                    }}
                    title={`Mutated Codon ${blk.codonIndex}: ${blk.altCodon} (${aaInfo.name})`}
                  >
                    <span style={{ color: blk.isMutated ? '#f87171' : aaInfo.color }}>
                      {zoomLevel === 'detailed' ? `${aaInfo.code3}${blk.codonIndex}` : aaInfo.code1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Base / Locus Inspection Bar */}
      {selectedCol && (
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-cyan-950 text-cyan-400 rounded">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200">
                Locus Inspection: Ref Pos #{selectedCol.refIndex} (Sample Pos #{selectedCol.altIndex})
              </span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="font-mono text-emerald-400">Ref: {selectedCol.refChar}</span>
              <span className="mx-1 text-slate-400">→</span>
              <span className="font-mono text-cyan-400">Sample: {selectedCol.altChar}</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className={`font-semibold ${selectedCol.isMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedCol.type.toUpperCase()}
              </span>
            </div>
          </div>

          {associatedMutation && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {associatedMutation.hgvsP || associatedMutation.hgvsC}
              </span>
              <button
                onClick={() => onSelectMutation(associatedMutation)}
                className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded font-bold text-xs hover:from-cyan-400 hover:to-indigo-500 transition"
              >
                Deep ACMG Analysis →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
