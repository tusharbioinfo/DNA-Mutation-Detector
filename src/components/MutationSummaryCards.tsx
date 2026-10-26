import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Dna, 
  Flame, 
  ShieldAlert, 
  Zap,
  Activity
} from 'lucide-react';
import { AlignmentResult, DetectedMutation } from '../types/genomics';

interface MutationSummaryCardsProps {
  alignment: AlignmentResult;
  selectedGeneSymbol: string;
  onFilterType?: (type: string | null) => void;
  activeFilter?: string | null;
  onSelectMutation: (mut: DetectedMutation) => void;
}

export const MutationSummaryCards: React.FC<MutationSummaryCardsProps> = ({
  alignment,
  selectedGeneSymbol,
  onFilterType,
  activeFilter,
  onSelectMutation,
}) => {
  const mutations = alignment.mutations;
  const pathogenicCount = mutations.filter(m => m.pathogenicity === 'Pathogenic' || m.pathogenicity === 'Likely Pathogenic').length;
  const vusCount = mutations.filter(m => m.pathogenicity === 'Variant of Uncertain Significance (VUS)').length;
  const benignCount = mutations.filter(m => m.pathogenicity === 'Benign' || m.pathogenicity === 'Likely Benign').length;
  
  const snvCount = mutations.filter(m => m.type === 'missense' || m.type === 'nonsense' || m.type === 'synonymous').length;
  const frameshiftCount = mutations.filter(m => m.type === 'frameshift_deletion' || m.type === 'frameshift_insertion').length;
  const indelCount = mutations.filter(m => m.type.includes('insertion') || m.type.includes('deletion')).length;

  const maxGrantham = mutations.reduce((max, m) => Math.max(max, m.granthamScore || 0), 0);
  const highestImpactMutation = mutations.find(m => m.impact === 'HIGH') || mutations[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* 1. Total Mutations */}
      <div 
        onClick={() => onFilterType && onFilterType(activeFilter === 'all' ? null : 'all')}
        className={`bg-slate-900/80 p-3.5 rounded-xl border transition-all cursor-pointer hover:border-cyan-500/60 shadow-lg ${
          activeFilter === 'all' ? 'border-cyan-500 ring-1 ring-cyan-500/50 bg-cyan-950/20' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Total Variants</span>
          <Dna className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white">{mutations.length}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {alignment.matchesCount}/{alignment.alignLength} bp
          </span>
        </div>
        <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-medium">
          <Activity className="w-3 h-3" /> {alignment.identityPercentage}% Identity
        </div>
      </div>

      {/* 2. Pathogenicity Alert */}
      <div 
        onClick={() => onFilterType && onFilterType(activeFilter === 'pathogenic' ? null : 'pathogenic')}
        className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-lg ${
          pathogenicCount > 0 
            ? 'bg-rose-950/25 border-rose-800/80 hover:border-rose-500' 
            : 'bg-emerald-950/25 border-emerald-800/80 hover:border-emerald-500'
        } ${activeFilter === 'pathogenic' ? 'ring-2 ring-rose-500' : ''}`}
      >
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-slate-300">ACMG Risk</span>
          {pathogenicCount > 0 ? (
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-black ${pathogenicCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {pathogenicCount > 0 ? pathogenicCount : '0'}
          </span>
          <span className="text-[11px] text-slate-400">
            {pathogenicCount > 0 ? 'Pathogenic' : 'Benign'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>VUS: <strong className="text-amber-400">{vusCount}</strong></span>
          <span>Benign: <strong className="text-emerald-400">{benignCount}</strong></span>
        </div>
      </div>

      {/* 3. SNVs / Substitutions */}
      <div 
        onClick={() => onFilterType && onFilterType(activeFilter === 'snv' ? null : 'snv')}
        className={`bg-slate-900/80 p-3.5 rounded-xl border transition-all cursor-pointer hover:border-indigo-500/60 shadow-lg ${
          activeFilter === 'snv' ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-950/20' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Point SNVs</span>
          <Zap className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-indigo-300">{snvCount}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {alignment.mismatchesCount} edits
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          Missense & Nonsense
        </div>
      </div>

      {/* 4. Indels & Frameshifts */}
      <div 
        onClick={() => onFilterType && onFilterType(activeFilter === 'indel' ? null : 'indel')}
        className={`bg-slate-900/80 p-3.5 rounded-xl border transition-all cursor-pointer hover:border-amber-500/60 shadow-lg ${
          activeFilter === 'indel' ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-950/20' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Indels / Shifts</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-amber-300">{indelCount}</span>
          <span className="text-[11px] text-slate-400">
            {frameshiftCount > 0 ? `${frameshiftCount} frameshift` : 'in-frame'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {alignment.insertionsCount} ins / {alignment.deletionsCount} del
        </div>
      </div>

      {/* 5. Max Grantham Physicochemical Distance */}
      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Max Grantham</span>
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-black ${
            maxGrantham > 100 ? 'text-orange-400' : maxGrantham > 60 ? 'text-amber-300' : 'text-emerald-400'
          }`}>
            {maxGrantham}
          </span>
          <span className="text-[11px] text-slate-400">/ 215</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">
          {maxGrantham > 150 ? 'Radical change' : maxGrantham > 100 ? 'Mod. Radical' : maxGrantham > 60 ? 'Mod. Conservative' : 'Conservative'}
        </div>
      </div>

      {/* 6. Primary Actionable Target */}
      <div 
        onClick={() => highestImpactMutation && onSelectMutation(highestImpactMutation)}
        className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 p-3.5 rounded-xl border border-indigo-800/60 hover:border-indigo-400 transition-all cursor-pointer shadow-lg group"
      >
        <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Lead Variant</span>
          <span className="text-[10px] text-cyan-400 group-hover:underline">Inspect →</span>
        </div>
        <div className="truncate">
          <span className="text-base font-bold text-white font-mono">
            {highestImpactMutation ? highestImpactMutation.hgvsP || highestImpactMutation.hgvsC : 'None'}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 mt-1 truncate">
          Gene: <strong className="text-cyan-300">{selectedGeneSymbol}</strong>
        </div>
      </div>
    </div>
  );
};
