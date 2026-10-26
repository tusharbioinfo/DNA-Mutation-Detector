import React, { useState } from 'react';
import { 
  Upload, 
  RotateCcw, 
  ArrowRightLeft, 
  Sparkles, 
  FileCode, 
  Check, 
  Settings2
} from 'lucide-react';
import { calculateGcContent, reverseComplement, dnaToRna, rnaToDna } from '../utils/geneticCode';
import { SAMPLE_GENES } from '../data/sampleGenes';
import { SampleGeneData } from '../types/genomics';

interface SequenceInputPanelProps {
  refSequence: string;
  altSequence: string;
  geneSymbol: string;
  readingFrame: number;
  onRefChange: (val: string) => void;
  onAltChange: (val: string) => void;
  onGeneSymbolChange: (val: string) => void;
  onReadingFrameChange: (frame: number) => void;
  onSelectSampleGene: (gene: SampleGeneData) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const SequenceInputPanel: React.FC<SequenceInputPanelProps> = ({
  refSequence,
  altSequence,
  geneSymbol,
  readingFrame,
  onRefChange,
  onAltChange,
  onGeneSymbolChange,
  onReadingFrameChange,
  onSelectSampleGene,
  isExpanded,
  onToggleExpand,
}) => {
  const [activeTab, setActiveTab] = useState<'sequences' | 'vcf' | 'presets'>('sequences');
  const [vcfInput, setVcfInput] = useState('');
  const [hgvsInput, setHgvsInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const refGc = calculateGcContent(refSequence);
  const altGc = calculateGcContent(altSequence);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isRef: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (isRef) onRefChange(content);
        else onAltChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyVcfOrHgvs = () => {
    if (hgvsInput.trim()) {
      // Simple HGVS parser e.g. c.743G>A or c.1799T>A or c.20A>T
      const matchSub = hgvsInput.match(/c\.(\d+)([A-Z])>([A-Z])/i);
      if (matchSub) {
        const pos = parseInt(matchSub[1], 10);
        const refChar = matchSub[2].toUpperCase();
        const altChar = matchSub[3].toUpperCase();
        if (pos > 0 && pos <= refSequence.length) {
          const arr = refSequence.split('');
          if (arr[pos - 1] === refChar || true) {
            arr[pos - 1] = altChar;
            onAltChange(arr.join(''));
            showCopiedToast(`Applied HGVS mutation ${hgvsInput}`);
            return;
          }
        }
      }
    }

    if (vcfInput.trim()) {
      // Find ALT record from VCF line
      const lines = vcfInput.split('\n');
      for (const line of lines) {
        if (!line.startsWith('#') && line.trim()) {
          const cols = line.split('\t');
          if (cols.length >= 5) {
            const pos = parseInt(cols[1], 10);
            const ref = cols[3].toUpperCase();
            const alt = cols[4].toUpperCase();
            // If in current window or 1-based offset
            if (pos > 0 && pos <= refSequence.length) {
              const arr = refSequence.split('');
              arr.splice(pos - 1, ref.length, ...alt.split(''));
              onAltChange(arr.join(''));
              showCopiedToast(`Applied VCF record at pos ${pos}: ${ref} -> ${alt}`);
              return;
            }
          }
        }
      }
    }
  };

  const showCopiedToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleRevComp = (target: 'ref' | 'alt') => {
    if (target === 'ref') onRefChange(reverseComplement(refSequence));
    else onAltChange(reverseComplement(altSequence));
  };

  const handleRnaToggle = (target: 'ref' | 'alt') => {
    if (target === 'ref') {
      if (refSequence.includes('U')) onRefChange(rnaToDna(refSequence));
      else onRefChange(dnaToRna(refSequence));
    } else {
      if (altSequence.includes('U')) onAltChange(rnaToDna(altSequence));
      else onAltChange(dnaToRna(altSequence));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Panel Top Header */}
      <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-cyan-950 border border-cyan-800/80 rounded-lg text-cyan-400">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">Sequence Input & Alignment Matrix</h2>
              <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono font-semibold">
                Gene: {geneSymbol || 'Custom'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Provide Reference (Wild-Type) and Sample (Mutated) nucleotide or coding sequences.
            </p>
          </div>
        </div>

        {/* Tab selector and toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveTab('sequences')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeTab === 'sequences'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct DNA/RNA
            </button>
            <button
              onClick={() => setActiveTab('vcf')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeTab === 'vcf'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VCF / HGVS Parser
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeTab === 'presets'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clinical Presets
            </button>
          </div>

          <button
            onClick={onToggleExpand}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            {isExpanded ? 'Collapse ▲' : 'Expand Editor ▼'}
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="bg-emerald-950/90 text-emerald-300 text-xs px-4 py-2 border-b border-emerald-800 flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Main Body */}
      {isExpanded && (
        <div className="p-5">
          {activeTab === 'sequences' && (
            <div className="space-y-4">
              {/* Controls bar: Gene symbol + Reading frame */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Gene Symbol / Locus
                  </label>
                  <input
                    type="text"
                    value={geneSymbol}
                    onChange={(e) => onGeneSymbolChange(e.target.value.toUpperCase())}
                    placeholder="e.g. TP53, BRAF, EGFR, KRAS"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Reading Frame
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[0, 1, 2].map((frame) => (
                      <button
                        key={frame}
                        onClick={() => onReadingFrameChange(frame)}
                        className={`py-1.5 text-xs font-mono font-bold rounded-lg transition border ${
                          readingFrame === frame
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Frame +{frame + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Quick Sample Selector
                  </label>
                  <select
                    onChange={(e) => {
                      const found = SAMPLE_GENES.find(g => g.id === e.target.value);
                      if (found) onSelectSampleGene(found);
                    }}
                    value={SAMPLE_GENES.find(g => g.geneSymbol === geneSymbol)?.id || ''}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="" disabled>Select Curated Clinical Case...</option>
                    {SAMPLE_GENES.map(gene => (
                      <option key={gene.id} value={gene.id}>
                        {gene.geneSymbol} - {gene.expectedVariants[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Two Column Sequence Input Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Reference Sequence (Wild Type) */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold text-slate-200">
                        Reference (Wild-Type) Sequence
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {refSequence.length} bp | GC: <strong className="text-emerald-400">{refGc}%</strong>
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={refSequence}
                    onChange={(e) => onRefChange(e.target.value)}
                    placeholder="Paste reference DNA (ATCG...) or FASTA format..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-200 font-mono focus:outline-none focus:border-emerald-500 resize-y leading-relaxed tracking-wider"
                    spellCheck={false}
                  />

                  {/* Ref Sequence Tools */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center space-x-1">
                      <label className="cursor-pointer px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition">
                        <Upload className="w-3 h-3 text-emerald-400" />
                        <span>FASTA</span>
                        <input
                          type="file"
                          accept=".fasta,.fa,.txt"
                          onChange={(e) => handleFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => handleRevComp('ref')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition"
                        title="Reverse Complement"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
                        <span>RevComp</span>
                      </button>
                      <button
                        onClick={() => handleRnaToggle('ref')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition"
                      >
                        <span>DNA ↔ RNA</span>
                      </button>
                    </div>
                    <button
                      onClick={() => onRefChange('')}
                      className="px-2 py-1 text-slate-400 hover:text-rose-400 transition"
                      title="Clear"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Sample Mutated Sequence */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <span className="text-xs font-bold text-slate-200">
                        Sample / Patient (Mutated) Sequence
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {altSequence.length} bp | GC: <strong className="text-cyan-400">{altGc}%</strong>
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={altSequence}
                    onChange={(e) => onAltChange(e.target.value)}
                    placeholder="Paste sample DNA sequence to detect mutations..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-500 resize-y leading-relaxed tracking-wider"
                    spellCheck={false}
                  />

                  {/* Alt Sequence Tools */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center space-x-1">
                      <label className="cursor-pointer px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition">
                        <Upload className="w-3 h-3 text-cyan-400" />
                        <span>FASTA</span>
                        <input
                          type="file"
                          accept=".fasta,.fa,.txt"
                          onChange={(e) => handleFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => handleRevComp('alt')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition"
                        title="Reverse Complement"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                        <span>RevComp</span>
                      </button>
                      <button
                        onClick={() => handleRnaToggle('alt')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition"
                      >
                        <span>DNA ↔ RNA</span>
                      </button>
                      <button
                        onClick={() => onAltChange(refSequence)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition"
                        title="Copy Reference as baseline"
                      >
                        <RotateCcw className="w-3 h-3 text-cyan-400" />
                        <span>Copy Ref</span>
                      </button>
                    </div>
                    <button
                      onClick={() => onAltChange('')}
                      className="px-2 py-1 text-slate-400 hover:text-rose-400 transition"
                      title="Clear"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vcf' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VCF Input */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-cyan-400" /> VCF v4.2 Entry
                    </span>
                    <span className="text-[11px] text-slate-400">Variant Call Format</span>
                  </div>
                  <textarea
                    rows={4}
                    value={vcfInput}
                    onChange={(e) => setVcfInput(e.target.value)}
                    placeholder="chr17 7577121 rs2887654 G A 100 PASS DP=180..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste raw VCF records with chromosome, position, reference allele, and alternative allele.
                  </p>
                </div>

                {/* HGVS Nomenclature Input */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> HGVS Notation
                    </span>
                    <span className="text-[11px] text-slate-400">cDNA / Protein notation</span>
                  </div>
                  <input
                    type="text"
                    value={hgvsInput}
                    onChange={(e) => setHgvsInput(e.target.value)}
                    placeholder="e.g. c.743G>A, c.1799T>A, c.20A>T"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 mb-2"
                  />
                  <div className="flex flex-wrap gap-1 mb-2">
                    {['c.743G>A', 'c.1799T>A', 'c.35G>A', 'c.20A>T'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setHgvsInput(term)}
                        className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleApplyVcfOrHgvs}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md"
                  >
                    Apply HGVS / VCF to Reference
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {SAMPLE_GENES.map((gene) => (
                <div
                  key={gene.id}
                  onClick={() => onSelectSampleGene(gene)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    gene.geneSymbol === geneSymbol
                      ? 'bg-cyan-950/30 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-black text-cyan-300 font-mono">
                      {gene.geneSymbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                      {gene.chromosome}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {gene.geneName}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {gene.description}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-indigo-400 font-mono">{gene.expectedVariants[0]}</span>
                    <span className="text-cyan-400 font-medium">Load Preset →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
