import React from 'react';
import { X, BookOpen, ShieldAlert, Dna, Target, Flame } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8 text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white">MutDetect AI™ Clinical & Technical Documentation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs leading-relaxed text-slate-300">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dna className="w-4 h-4 text-cyan-400" />
              <span>1. Sequence Alignment & Mutation Types</span>
            </h3>
            <p>
              MutDetect AI™ performs global Needleman-Wunsch dynamic programming alignment across nucleotide and translated amino acid tracks, categorizing detected variants into:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-cyan-300 block mb-0.5">Missense Mutation:</strong>
                Single nucleotide substitution resulting in a non-synonymous amino acid replacement.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-rose-400 block mb-0.5">Nonsense Mutation (PTC):</strong>
                Premature termination codon causing truncated peptide or nonsense-mediated decay (NMD).
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-purple-300 block mb-0.5">Frameshift Indel:</strong>
                Insertion/deletion not divisible by 3, altering downstream reading frame up to novel termination.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-emerald-300 block mb-0.5">Synonymous (Silent):</strong>
                Codon alteration without changing primary amino acid identity.
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>2. ACMG / AMP 2015 5-Tier Classification Rules</span>
            </h3>
            <p>
              Variants are classified into <strong>Pathogenic, Likely Pathogenic, VUS, Likely Benign, or Benign</strong> adhering to American College of Medical Genetics standards:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-rose-400">PVS1:</strong> Null variant (nonsense, frameshift) in a gene where loss of function is established.</li>
              <li><strong className="text-orange-400">PM1:</strong> Mutational hotspot or well-established critical functional domain without benign variation.</li>
              <li><strong className="text-orange-400">PM2:</strong> Extremely low or absent frequency in gnomAD population databases.</li>
              <li><strong className="text-cyan-400">PP3:</strong> Multiple computational tools (SIFT, PolyPhen-2, CADD Phred &gt; 20) predict deleterious impact.</li>
              <li><strong className="text-emerald-400">BP7:</strong> Synonymous variant with no predicted splice-site disruption.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>3. Grantham Physicochemical Distance Matrix</span>
            </h3>
            <p>
              Measures chemical divergence between wild-type and mutant residues based on composition, polarity, and molecular volume (Grantham R., Science 1974):
            </p>
            <div className="grid grid-cols-4 gap-2 text-center font-bold">
              <div className="p-2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                0 - 60<br /><span className="text-[10px] font-normal">Conservative</span>
              </div>
              <div className="p-2 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                61 - 100<br /><span className="text-[10px] font-normal">Mod. Conservative</span>
              </div>
              <div className="p-2 rounded bg-orange-950/60 text-orange-300 border border-orange-800">
                101 - 150<br /><span className="text-[10px] font-normal">Mod. Radical</span>
              </div>
              <div className="p-2 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
                &gt; 150<br /><span className="text-[10px] font-normal">Radical</span>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>4. CRISPR & Precision Oncology Matching</span>
            </h3>
            <p>
              Scans target DNA for canonical <i>Streptococcus pyogenes</i> Cas9 PAM sequences (<code className="text-cyan-300">5'-NGG-3'</code>) and maps validated oncogenic drivers (BRAF V600E, EGFR L858R/T790M, KRAS G12C/D, BRCA1, CFTR, HBB) to FDA-approved inhibitors and clinical protocols.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
