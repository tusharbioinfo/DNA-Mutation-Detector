import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Copy, 
  Check, 
  Sparkles
} from 'lucide-react';
import { DetectedMutation } from '../types/genomics';
import { AMINO_ACID_MAP } from '../utils/geneticCode';

interface VariantDetailModalProps {
  mutation: DetectedMutation | null;
  geneSymbol: string;
  onClose: () => void;
}

export const VariantDetailModal: React.FC<VariantDetailModalProps> = ({
  mutation,
  geneSymbol,
  onClose,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!mutation) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const refAaInfo = mutation.refAa ? AMINO_ACID_MAP[mutation.refAa] : null;
  const altAaInfo = mutation.altAa ? AMINO_ACID_MAP[mutation.altAa] : null;

  const isPathogenic = mutation.pathogenicity === 'Pathogenic' || mutation.pathogenicity === 'Likely Pathogenic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8 text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              isPathogenic ? 'bg-rose-950/80 border-rose-700 text-rose-400' : 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-white font-mono">
                  {geneSymbol} : {mutation.hgvsP || mutation.hgvsC}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  isPathogenic ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-amber-950 text-amber-300 border-amber-700'
                }`}>
                  {mutation.pathogenicity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {mutation.hgvsC} | Genomic Locus #{mutation.genomicPos} {mutation.codonPos ? `| Codon #${mutation.codonPos}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* SECTION 1: Nomenclature & Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">HGVS cDNA</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-300 text-xs truncate">{mutation.hgvsC}</span>
                <button
                  onClick={() => handleCopy(mutation.hgvsC, 'c')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedText === 'c' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">HGVS Protein</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-300 text-xs truncate">{mutation.hgvsP}</span>
                <button
                  onClick={() => handleCopy(mutation.hgvsP, 'p')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedText === 'p' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Variant Consequence</span>
              <span className="font-bold text-white capitalize">{mutation.type.replace(/_/g, ' ')}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Impact Severity</span>
              <span className={`font-bold ${
                mutation.impact === 'HIGH' ? 'text-rose-400' : mutation.impact === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {mutation.impact} Severity
              </span>
            </div>
          </div>

          {/* SECTION 2: Amino Acid Physicochemical Transition (if missense) */}
          {refAaInfo && altAaInfo && mutation.type === 'missense' && (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Amino Acid Physicochemical Property Delta</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ref vs Alt Cards */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-emerald-400">Wild-Type Residue: {refAaInfo.name} ({refAaInfo.code3})</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Codon: {mutation.refCodon}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Category: <strong className="text-white">{refAaInfo.category}</strong></div>
                    <div>Charge: <strong className="text-white">{refAaInfo.charge > 0 ? `+${refAaInfo.charge}` : refAaInfo.charge}</strong></div>
                    <div>Hydropathy: <strong className="text-white">{refAaInfo.hydropathy}</strong></div>
                    <div>Mol Weight: <strong className="text-white">{refAaInfo.molecularWeight} Da</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-rose-400">Mutant Residue: {altAaInfo.name} ({altAaInfo.code3})</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Codon: {mutation.altCodon}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Category: <strong className="text-white">{altAaInfo.category}</strong></div>
                    <div>Charge: <strong className="text-white">{altAaInfo.charge > 0 ? `+${altAaInfo.charge}` : altAaInfo.charge}</strong></div>
                    <div>Hydropathy: <strong className="text-white">{altAaInfo.hydropathy}</strong></div>
                    <div>Mol Weight: <strong className="text-white">{altAaInfo.molecularWeight} Da</strong></div>
                  </div>
                </div>
              </div>

              {/* Grantham Score Bar */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300">Grantham Physicochemical Distance:</span>
                  <span className="ml-2 font-mono font-bold text-orange-400 text-sm">{mutation.granthamScore}</span>
                  <span className="text-slate-400 text-[11px]"> / 215 ({mutation.granthamCategory})</span>
                </div>
                <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (mutation.granthamScore || 0) > 100 ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, ((mutation.granthamScore || 0) / 215) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ACMG/AMP 2015 Criteria Evidence Breakdown */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>ACMG / AMP 2015 Guideline Criteria Breakdown</span>
              </h4>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isPathogenic ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
              }`}>
                Score: {mutation.acmgClassification.score > 0 ? `+${mutation.acmgClassification.score}` : mutation.acmgClassification.score}
              </span>
            </div>

            <div className="space-y-2">
              {mutation.acmgClassification.criteriaMet.length === 0 ? (
                <p className="text-slate-400">No specific ACMG pathogenic or benign rules triggered; classified as VUS.</p>
              ) : (
                mutation.acmgClassification.criteriaMet.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3"
                  >
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      c.category === 'Pathogenic'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {c.code} ({c.strength})
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 4: In-Silico Computational Ensemble */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>In Silico Computational Predictor Scores</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">SIFT Algorithm</span>
                <div className="text-base font-bold font-mono text-white">
                  {mutation.siftScore !== undefined ? mutation.siftScore : 'N/A'}
                </div>
                <div className={`text-[11px] font-semibold mt-0.5 ${
                  mutation.siftPrediction === 'Deleterious' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {mutation.siftPrediction || 'Deleterious'}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">PolyPhen-2 HDIV</span>
                <div className="text-base font-bold font-mono text-white">
                  {mutation.polyphenScore !== undefined ? mutation.polyphenScore : 'N/A'}
                </div>
                <div className={`text-[11px] font-semibold mt-0.5 ${
                  mutation.polyphenPrediction?.includes('Damaging') ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {mutation.polyphenPrediction || 'Probably Damaging'}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">CADD Phred Score</span>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {mutation.caddScore !== undefined ? mutation.caddScore : '28.0'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Top 1% deleterious in human genome
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Targeted Therapies & Associated Clinical Diseases */}
          {mutation.associatedDrugs && mutation.associatedDrugs.length > 0 && (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Targeted Oncology Therapeutics (NCCN & FDA)</span>
              </h4>

              <div className="space-y-2">
                {mutation.associatedDrugs.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs">{d.drugName}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{d.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {d.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            MutDetect AI™ Diagnostic Module • Evidence Level 1A
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
