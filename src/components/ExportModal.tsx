import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode } from 'lucide-react';
import { AlignmentResult } from '../types/genomics';

interface ExportModalProps {
  geneSymbol: string;
  transcriptId?: string;
  refSequence: string;
  altSequence: string;
  alignment: AlignmentResult;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  geneSymbol,
  transcriptId = 'NM_000546.6',
  refSequence,
  altSequence,
  alignment,
  onClose,
}) => {
  const [activeFormat, setActiveFormat] = useState<'vcf' | 'fasta' | 'csv' | 'json'>('vcf');
  const [copied, setCopied] = useState(false);

  const mutations = alignment.mutations;

  // Generate VCF text
  const generateVcf = () => {
    let out = `##fileformat=VCFv4.2\n`;
    out += `##fileDate=${new Date().toISOString().slice(0, 10)}\n`;
    out += `##source=MutDetectAI_v3.8\n`;
    out += `##reference=${geneSymbol}_${transcriptId}\n`;
    out += `##INFO=<ID=HGVS_C,Number=1,Type=String,Description="HGVS cDNA notation">\n`;
    out += `##INFO=<ID=HGVS_P,Number=1,Type=String,Description="HGVS protein notation">\n`;
    out += `##INFO=<ID=CLNSIG,Number=1,Type=String,Description="ACMG Clinical Significance">\n`;
    out += `##INFO=<ID=GRANTHAM,Number=1,Type=Integer,Description="Grantham Physicochemical Distance">\n`;
    out += `#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n`;

    mutations.forEach((m, idx) => {
      const ref = m.refNt === '-' ? 'N' : m.refNt;
      const alt = m.altNt === '-' ? 'N' : m.altNt;
      const hgvsC = m.hgvsC || '.';
      const hgvsP = m.hgvsP || '.';
      const sig = m.pathogenicity.replace(/\s+/g, '_');
      const grantham = m.granthamScore || 0;
      out += `chrTarget\t${m.genomicPos}\tvar_${idx + 1}\t${ref}\t${alt}\t100\tPASS\tHGVS_C=${hgvsC};HGVS_P=${hgvsP};CLNSIG=${sig};GRANTHAM=${grantham}\n`;
    });

    return out;
  };

  // Generate FASTA text
  const generateFasta = () => {
    let out = `>${geneSymbol}_WILD_TYPE | ${refSequence.length} bp\n`;
    for (let i = 0; i < refSequence.length; i += 70) {
      out += refSequence.slice(i, i + 70) + '\n';
    }
    out += `\n>${geneSymbol}_SAMPLE_MUTATED | ${altSequence.length} bp | ${mutations.length} mutations\n`;
    for (let i = 0; i < altSequence.length; i += 70) {
      out += altSequence.slice(i, i + 70) + '\n';
    }
    return out;
  };

  // Generate CSV text
  const generateCsv = () => {
    let out = `Gene,GenomicPos,CodonPos,RefNt,AltNt,HGVS_c,HGVS_p,VariantType,GranthamScore,SIFT,PolyPhen2,CADD,ACMG_Classification\n`;
    mutations.forEach((m) => {
      out += `"${geneSymbol}",${m.genomicPos},${m.codonPos || ''},"${m.refNt}","${m.altNt}","${m.hgvsC}","${m.hgvsP}","${m.type}",${m.granthamScore || ''},${m.siftScore || ''},${m.polyphenScore || ''},${m.caddScore || ''},"${m.pathogenicity}"\n`;
    });
    return out;
  };

  // Generate JSON text
  const generateJson = () => {
    const data = {
      meta: {
        tool: 'MutDetect AI™',
        version: '3.8',
        timestamp: new Date().toISOString(),
        geneSymbol,
        transcriptId,
      },
      alignment: {
        score: alignment.score,
        identityPercentage: alignment.identityPercentage,
        alignLength: alignment.alignLength,
        matches: alignment.matchesCount,
        mismatches: alignment.mismatchesCount,
        insertions: alignment.insertionsCount,
        deletions: alignment.deletionsCount,
      },
      mutations: alignment.mutations,
    };
    return JSON.stringify(data, null, 2);
  };

  const getContent = () => {
    if (activeFormat === 'vcf') return generateVcf();
    if (activeFormat === 'fasta') return generateFasta();
    if (activeFormat === 'csv') return generateCsv();
    return generateJson();
  };

  const content = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeFormat === 'vcf' ? 'vcf' : activeFormat === 'fasta' ? 'fasta' : activeFormat === 'csv' ? 'csv' : 'json';
    const mime = activeFormat === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${geneSymbol}_mutation_analysis.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white">Export Genomic Alignment & Variant Data</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Format Tabs */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['vcf', 'fasta', 'csv', 'json'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setActiveFormat(fmt)}
                className={`py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition ${
                  activeFormat === fmt
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <textarea
              readOnly
              rows={12}
              value={content}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Formatted for IGV, GATK, ANNOVAR, and downstream pipelines.
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg font-bold transition shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
