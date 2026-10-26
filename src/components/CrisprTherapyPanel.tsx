import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Zap, 
  Copy, 
  Check, 
  Sparkles
} from 'lucide-react';
import { DetectedMutation, CrisprTargetResult } from '../types/genomics';
import { scanCrisprGuides } from '../utils/crispr';
import { THERAPY_DATABASE } from '../data/therapyData';

interface CrisprTherapyPanelProps {
  sequence: string;
  mutations: DetectedMutation[];
  selectedMutation: DetectedMutation | null;
  geneSymbol: string;
  onSelectMutation: (mut: DetectedMutation) => void;
}

export const CrisprTherapyPanel: React.FC<CrisprTherapyPanelProps> = ({
  sequence,
  mutations,
  selectedMutation,
  geneSymbol,
  onSelectMutation,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const activeMutation = selectedMutation || mutations[0] || null;

  // Scan for CRISPR Guides
  const guides: CrisprTargetResult[] = useMemo(() => {
    if (!sequence || !activeMutation) return [];
    return scanCrisprGuides(sequence, activeMutation.genomicPos, 45);
  }, [sequence, activeMutation]);

  // Match Drugs and Targeted Therapies
  const matchedTherapies = useMemo(() => {
    const symUpper = (geneSymbol || '').toUpperCase();
    const pattern = activeMutation ? (activeMutation.hgvsP || activeMutation.hgvsC || '') : '';
    return THERAPY_DATABASE.filter(item => {
      const gMatch = item.gene.toUpperCase() === symUpper || symUpper.includes(item.gene.toUpperCase());
      const vMatch = pattern.toUpperCase().includes(item.variantPattern.toUpperCase()) ||
        item.variantPattern.toUpperCase().includes(pattern.toUpperCase());
      return gMatch && (vMatch || pattern === '');
    });
  }, [geneSymbol, activeMutation]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Top Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>CRISPR/Cas9 Guide Designer & Precision Oncology Therapeutics</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                Target: {activeMutation ? (activeMutation.hgvsP || activeMutation.hgvsC) : 'General'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Auto-designs high-efficiency SpCas9 gRNAs (NGG PAM) and queries FDA-approved targeted drug indications.
            </p>
          </div>
        </div>

        {/* Mutation Selector if multiple mutations */}
        {mutations.length > 1 && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Select Mutation:</span>
            <select
              value={activeMutation?.id || ''}
              onChange={(e) => {
                const found = mutations.find(m => m.id === e.target.value);
                if (found) onSelectMutation(found);
              }}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              {mutations.map(m => (
                <option key={m.id} value={m.id}>
                  {m.hgvsP || m.hgvsC} (Pos #{m.genomicPos})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* SECTION 1: CRISPR Guide RNA Candidates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Optimized SpCas9 gRNA Guides (20-nt Protospacer + NGG PAM)</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {guides.length} Candidates Evaluated
            </span>
          </div>

          {guides.length === 0 ? (
            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
              No NGG or CCN PAM sites found within ±40 bp window of this mutation locus.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {guides.map((g, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Guide #{idx + 1} ({g.strand} Strand)
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        PAM: <strong className="text-cyan-400">{g.pam}</strong> @ #{g.pamPos}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        g.onTargetScore >= 80 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        Score: {g.onTargetScore}/100
                      </span>
                      <button
                        onClick={() => handleCopy(g.protospacer, `guide-${idx}`)}
                        className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition"
                        title="Copy Guide Protospacer"
                      >
                        {copiedText === `guide-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Protospacer Sequence display */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                    <span className="text-emerald-300 font-bold tracking-wider">{g.protospacer}</span>
                    <span className="text-cyan-400 font-bold ml-1.5">[{g.pam}]</span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cut Distance:</span>
                      <span className={`font-bold font-mono ${g.distanceToMutation <= 3 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {g.distanceToMutation} bp from mut
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">GC Content:</span>
                      <span className="font-bold text-slate-200 font-mono">{g.gcContent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Off-Target Risk:</span>
                      <span className={`font-bold ${
                        g.offTargetRisk === 'Low' ? 'text-emerald-400' : g.offTargetRisk === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {g.offTargetRisk}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: Targeted Oncology Drugs & Clinical Evidence */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Targeted Oncology Therapeutics & Actionability Database</span>
            </h4>
            <span className="text-[11px] text-slate-400">NCCN / FDA Biomarker Catalog</span>
          </div>

          {matchedTherapies.length === 0 ? (
            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
              No FDA-approved direct targeted inhibitors registered for this exact variant pattern. Standard platinum/cytotoxic regimens or clinical trial enrollment may be indicated.
            </div>
          ) : (
            <div className="space-y-4">
              {matchedTherapies.map((item, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-cyan-300 font-mono">
                        {item.gene} ({item.variantPattern})
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {item.evidenceLevel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.drugs.length} Therapeutic Regimens
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {item.clinicalNotes}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    {item.drugs.map((drug, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{drug.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              drug.response === 'Resistant'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {drug.response}
                            </span>
                          </div>
                          <div className="text-[10px] text-indigo-300 font-medium mb-1.5">
                            {drug.class}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {drug.mechanism}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Status: <strong className="text-slate-200">{drug.status}</strong></span>
                          <span className="text-cyan-400 truncate max-w-[150px]">{drug.indication}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
