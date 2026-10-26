import React from 'react';
import { 
  Dna, 
  Activity, 
  FileText, 
  Download, 
  Layers, 
  Sparkles, 
  FlaskConical, 
  Target,
  Box,
  HelpCircle
} from 'lucide-react';
import { SAMPLE_GENES } from '../data/sampleGenes';
import { SampleGeneData } from '../types/genomics';

export type ActiveTab = 'alignment' | 'domains' | 'structure3d' | 'sanger' | 'crispr' | 'sandbox';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedGene: SampleGeneData | null;
  onSelectGene: (gene: SampleGeneData) => void;
  onOpenReport: () => void;
  onOpenExport: () => void;
  onOpenGuide: () => void;
  totalMutationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedGene,
  onSelectGene,
  onOpenReport,
  onOpenExport,
  onOpenGuide,
  totalMutationsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30 flex items-center justify-center">
              <Dna className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  MutDetect AI™
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  v3.8 Clinical
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Genomic Mutation Detector & ACMG Variant Pathogenicity Engine
              </p>
            </div>
          </div>

          {/* Sample Gene Quick Selectors */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/90 text-xs">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Presets:
            </span>
            {SAMPLE_GENES.slice(0, 6).map((gene) => {
              const isSelected = selectedGene?.id === gene.id;
              return (
                <button
                  key={gene.id}
                  onClick={() => onSelectGene(gene)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={`${gene.geneName} - ${gene.associatedCancerOrDisease}`}
                >
                  {gene.geneSymbol}
                </button>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenGuide}
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
              title="Documentation & ACMG Guidelines Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExport}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition shadow-sm"
              title="Export VCF, FASTA, TSV, or JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-lg shadow-lg shadow-indigo-500/25 transition transform active:scale-95 border border-cyan-400/30"
              title="Generate printable ACMG Diagnostic Clinical Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clinical Report</span>
              {totalMutationsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                  {totalMutationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/70 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('alignment')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'alignment'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Dna className="w-4 h-4 text-cyan-400" />
            <span>Alignment & Nucleotide Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'domains'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Gene & Protein Domains (2D Ribbon)</span>
          </button>

          <button
            onClick={() => setActiveTab('structure3d')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'structure3d'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-4 h-4 text-purple-400" />
            <span>3D Protein Fold & Sidechains</span>
          </button>

          <button
            onClick={() => setActiveTab('sanger')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'sanger'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Sanger Trace Electropherogram</span>
          </button>

          <button
            onClick={() => setActiveTab('crispr')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'crispr'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>CRISPR & Drug Actionability</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'sandbox'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-rose-400" />
            <span>Mutagenesis Sandbox</span>
          </button>
        </div>
      </div>
    </header>
  );
};
