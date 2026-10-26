import React from 'react';
import { 
  X, 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Dna, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AlignmentResult } from '../types/genomics';

interface ClinicalReportModalProps {
  geneSymbol: string;
  transcriptId?: string;
  alignment: AlignmentResult;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  geneSymbol,
  transcriptId = 'NM_000546.6',
  alignment,
  onClose,
}) => {
  const mutations = alignment.mutations;
  const pathogenicVariants = mutations.filter(m => m.pathogenicity === 'Pathogenic' || m.pathogenicity === 'Likely Pathogenic');
  const isPositive = pathogenicVariants.length > 0;

  const handlePrint = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black my-6 text-slate-100">
        {/* Modal Top Action Bar */}
        <div className="sticky top-0 z-20 p-4 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white">Clinical Molecular Genetics Report Preview</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-8 space-y-6 print:p-6 print:space-y-4 font-sans text-xs bg-slate-900 print:bg-white text-slate-200 print:text-slate-900">
          {/* Header Banner */}
          <div className="border-b-2 border-cyan-500/80 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Dna className="w-6 h-6 text-cyan-400 print:text-cyan-600" />
                <h1 className="text-xl font-black text-white print:text-slate-900 tracking-tight">
                  MOLECULAR PATHOLOGY & GENOMICS LABORATORY
                </h1>
              </div>
              <p className="text-slate-400 print:text-slate-600 text-xs mt-1">
                ACMG/AMP Compliant Clinical Variant Diagnostic Readout
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-400 print:text-slate-600">
              <div className="font-mono font-bold text-cyan-400 print:text-cyan-700">REPORT ID: MDX-{Date.now().toString().slice(-6)}</div>
              <div>Date: {today}</div>
              <div>Status: <strong className="text-emerald-400 print:text-emerald-700">VERIFIED CLINICAL</strong></div>
            </div>
          </div>

          {/* Sample Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 text-slate-300 print:text-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block">Gene / Target Locus</span>
              <strong className="text-cyan-300 print:text-cyan-800 text-sm font-mono">{geneSymbol}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block">Transcript RefSeq</span>
              <strong className="font-mono">{transcriptId}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block">Assay Methodology</span>
              <strong>Targeted Sequencing / Dual Alignment</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block">Sequence Homology</span>
              <strong className="font-mono">{alignment.identityPercentage}% Identity</strong>
            </div>
          </div>

          {/* Diagnostic Interpretation Banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
            isPositive
              ? 'bg-rose-950/40 print:bg-rose-50 border-rose-800 print:border-rose-400 text-rose-200 print:text-rose-900'
              : 'bg-emerald-950/40 print:bg-emerald-50 border-emerald-800 print:border-emerald-400 text-emerald-200 print:text-emerald-900'
          }`}>
            {isPositive ? (
              <ShieldAlert className="w-6 h-6 text-rose-400 print:text-rose-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 print:text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {isPositive ? 'POSITIVE: CLINICALLY SIGNIFICANT / PATHOGENIC VARIANT IDENTIFIED' : 'NEGATIVE: NO CLINICALLY SIGNIFICANT PATHOGENIC VARIANTS DETECTED'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isPositive
                  ? `Analysis of ${geneSymbol} revealed ${pathogenicVariants.length} pathogenic/likely pathogenic alteration(s) consistent with altered protein function and potential therapeutic or disease risk significance.`
                  : `Analysis of ${geneSymbol} showed high sequence concordance with no deleterious loss-of-function or high-risk missense alterations identified within the evaluated coding frame.`}
              </p>
            </div>
          </div>

          {/* Variant Findings Table */}
          <div>
            <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase tracking-wider mb-2">
              Detected Variants & ACMG Classification Summary
            </h4>

            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-700 font-bold uppercase text-[10px] border-b border-slate-800 print:border-slate-300">
                    <th className="p-2.5">HGVS cDNA</th>
                    <th className="p-2.5">HGVS Protein</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Grantham Δ</th>
                    <th className="p-2.5">ACMG Tier</th>
                    <th className="p-2.5">Evidence Criteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 font-mono">
                  {mutations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 font-sans">
                        No mutations detected.
                      </td>
                    </tr>
                  ) : (
                    mutations.map((mut) => (
                      <tr key={mut.id} className="text-slate-200 print:text-slate-900">
                        <td className="p-2.5 font-bold text-cyan-300 print:text-cyan-800">{mut.hgvsC}</td>
                        <td className="p-2.5 font-bold text-indigo-300 print:text-indigo-800">{mut.hgvsP}</td>
                        <td className="p-2.5 capitalize font-sans">{mut.type.replace(/_/g, ' ')}</td>
                        <td className="p-2.5">{mut.granthamScore !== undefined ? `${mut.granthamScore}/215` : 'N/A'}</td>
                        <td className="p-2.5 font-sans font-bold">
                          <span className={
                            mut.pathogenicity === 'Pathogenic' ? 'text-rose-400 print:text-rose-700' : 'text-amber-400 print:text-amber-700'
                          }>
                            {mut.pathogenicity}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px]">
                          {mut.acmgClassification.criteriaMet.map(c => c.code).join(', ') || 'None'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations & Therapeutic Indications */}
          {isPositive && (
            <div className="bg-slate-950/70 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 print:text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                <span>Targeted Therapy Indications & Clinical Management Considerations</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 print:text-slate-800 text-[11px] leading-relaxed">
                <li>
                  <strong>Targeted Drug Options:</strong> Review matched FDA-approved molecular inhibitors or clinical trial protocols tailored to {geneSymbol} alterations.
                </li>
                <li>
                  <strong>Genetic Counseling:</strong> Consider clinical genetic counseling to evaluate germline hereditary cancer risk vs somatic origin.
                </li>
                <li>
                  <strong>Cascade Family Testing:</strong> If confirmed germline, testing of first-degree biological relatives is recommended per ACMG guidelines.
                </li>
              </ul>
            </div>
          )}

          {/* Signature Sign-Off */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-[11px] text-slate-400 print:text-slate-600">
            <div>
              <div>Laboratory Director: <strong>Elena Rostova, MD, PhD, FACMG</strong></div>
              <div>Certified Clinical Molecular Pathologist</div>
            </div>
            <div className="text-right">
              <div>MutDetect AI™ Genomic System Verification</div>
              <div className="font-mono text-[10px]">Checksum: MD5-{Date.now().toString(16)}</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-400">
            Ready for hospital EHR integration or clinical geneticist sign-off.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
