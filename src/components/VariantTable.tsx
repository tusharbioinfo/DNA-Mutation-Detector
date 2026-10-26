import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Eye, 
  Filter, 
  Copy, 
  Check,
  Zap
} from 'lucide-react';
import { DetectedMutation, PathogenicityTier } from '../types/genomics';

interface VariantTableProps {
  mutations: DetectedMutation[];
  onSelectMutation: (mut: DetectedMutation) => void;
  selectedMutationId?: string | null;
  activeFilter?: string | null;
}

export const VariantTable: React.FC<VariantTableProps> = ({
  mutations,
  onSelectMutation,
  selectedMutationId,
  activeFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pathologyFilter, setPathologyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'pos' | 'grantham' | 'pathogenicity'>('pos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter mutations
  const filteredMutations = useMemo(() => {
    return mutations.filter((m) => {
      // Global quick filter from summary cards
      if (activeFilter === 'pathogenic' && !(m.pathogenicity === 'Pathogenic' || m.pathogenicity === 'Likely Pathogenic')) {
        return false;
      }
      if (activeFilter === 'snv' && !(m.type === 'missense' || m.type === 'nonsense' || m.type === 'synonymous')) {
        return false;
      }
      if (activeFilter === 'indel' && !(m.type.includes('insertion') || m.type.includes('deletion'))) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchC = m.hgvsC.toLowerCase().includes(query);
        const matchP = m.hgvsP.toLowerCase().includes(query);
        const matchType = m.type.toLowerCase().includes(query);
        const matchAa = (m.altAaName || '').toLowerCase().includes(query) || (m.refAaName || '').toLowerCase().includes(query);
        if (!matchC && !matchP && !matchType && !matchAa) return false;
      }

      // Pathology filter
      if (pathologyFilter !== 'ALL' && m.pathogenicity !== pathologyFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'MISSENSE' && m.type !== 'missense') return false;
        if (typeFilter === 'NONSENSE' && m.type !== 'nonsense') return false;
        if (typeFilter === 'FRAMESHIFT' && !m.type.includes('frameshift')) return false;
        if (typeFilter === 'SYNONYMOUS' && m.type !== 'synonymous') return false;
      }

      return true;
    });
  }, [mutations, searchTerm, pathologyFilter, typeFilter, activeFilter]);

  // Sort mutations
  const sortedMutations = useMemo(() => {
    return [...filteredMutations].sort((a, b) => {
      let result = 0;
      if (sortField === 'pos') {
        result = a.genomicPos - b.genomicPos;
      } else if (sortField === 'grantham') {
        result = (a.granthamScore || 0) - (b.granthamScore || 0);
      } else if (sortField === 'pathogenicity') {
        const rank = (tier: PathogenicityTier) => {
          if (tier === 'Pathogenic') return 5;
          if (tier === 'Likely Pathogenic') return 4;
          if (tier === 'Variant of Uncertain Significance (VUS)') return 3;
          if (tier === 'Likely Benign') return 2;
          return 1;
        };
        result = rank(a.pathogenicity) - rank(b.pathogenicity);
      }
      return sortOrder === 'asc' ? result : -result;
    });
  }, [filteredMutations, sortField, sortOrder]);

  const handleSort = (field: 'pos' | 'grantham' | 'pathogenicity') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCopyHgvs = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPathogenicityBadge = (tier: PathogenicityTier) => {
    switch (tier) {
      case 'Pathogenic':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'Likely Pathogenic':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/80';
      case 'Variant of Uncertain Significance (VUS)':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'Likely Benign':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/80';
      case 'Benign':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'missense':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'nonsense':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'frameshift_deletion':
      case 'frameshift_insertion':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'inframe_deletion':
      case 'inframe_insertion':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'synonymous':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Table Toolbar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-950 border border-indigo-800/80 rounded-lg text-indigo-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Detected Genomic Variants</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                {sortedMutations.length} of {mutations.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ACMG/AMP 5-tier classification with in-silico predictor consensus & targeted oncology indications.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search HGVS, residue..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Pathology Filter */}
          <select
            value={pathologyFilter}
            onChange={(e) => setPathologyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All ACMG Tiers</option>
            <option value="Pathogenic">Pathogenic</option>
            <option value="Likely Pathogenic">Likely Pathogenic</option>
            <option value="Variant of Uncertain Significance (VUS)">VUS</option>
            <option value="Likely Benign">Likely Benign</option>
            <option value="Benign">Benign</option>
          </select>

          {/* Mutation Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Types</option>
            <option value="MISSENSE">Missense</option>
            <option value="NONSENSE">Nonsense (Stop)</option>
            <option value="FRAMESHIFT">Frameshift</option>
            <option value="SYNONYMOUS">Synonymous</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('pos')}>
                <div className="flex items-center gap-1">
                  <span>Locus / Pos</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-3 px-4">HGVS DNA (cDNA)</th>
              <th className="py-3 px-4">HGVS Protein</th>
              <th className="py-3 px-4">Variant Type</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('grantham')}>
                <div className="flex items-center gap-1">
                  <span>Grantham Δ</span>
                  <ArrowUpDown className="w-3 h-3 text-orange-400" />
                </div>
              </th>
              <th className="py-3 px-4">In-Silico (SIFT/PolyPhen/CADD)</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('pathogenicity')}>
                <div className="flex items-center gap-1">
                  <span>ACMG Classification</span>
                  <ArrowUpDown className="w-3 h-3 text-rose-400" />
                </div>
              </th>
              <th className="py-3 px-4">Clinical Action</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs text-slate-200 font-mono">
            {sortedMutations.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                  {mutations.length === 0
                    ? 'No variants detected in this sequence alignment.'
                    : 'No mutations match the active search and filter criteria.'}
                </td>
              </tr>
            ) : (
              sortedMutations.map((mut) => {
                const isSelected = selectedMutationId === mut.id;
                return (
                  <tr
                    key={mut.id}
                    onClick={() => onSelectMutation(mut)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 ring-1 ring-cyan-500'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Pos #{mut.genomicPos}</div>
                      {mut.codonPos && (
                        <div className="text-[10px] text-slate-400 font-sans">
                          Codon #{mut.codonPos}
                        </div>
                      )}
                    </td>

                    {/* HGVS.c */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-cyan-300">{mut.hgvsC}</span>
                        <button
                          onClick={(e) => handleCopyHgvs(mut.hgvsC, `c-${mut.id}`, e)}
                          className="p-1 text-slate-500 hover:text-cyan-400 rounded transition"
                          title="Copy HGVS.c"
                        >
                          {copiedId === `c-${mut.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {mut.refNt} → {mut.altNt}
                      </div>
                    </td>

                    {/* HGVS.p */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-indigo-300">{mut.hgvsP}</span>
                        <button
                          onClick={(e) => handleCopyHgvs(mut.hgvsP, `p-${mut.id}`, e)}
                          className="p-1 text-slate-500 hover:text-indigo-400 rounded transition"
                          title="Copy HGVS.p"
                        >
                          {copiedId === `p-${mut.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {mut.refAaName && mut.altAaName && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px] font-sans">
                          {mut.refAaName} → {mut.altAaName}
                        </div>
                      )}
                    </td>

                    {/* Variant Type */}
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadge(mut.type)}`}>
                        {mut.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Grantham Score */}
                    <td className="py-3 px-4">
                      {mut.granthamScore !== undefined ? (
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white">{mut.granthamScore}</span>
                            <span className="text-[10px] text-slate-500">/215</span>
                          </div>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                mut.granthamScore > 100
                                  ? 'bg-rose-500'
                                  : mut.granthamScore > 60
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, (mut.granthamScore / 215) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* In-silico Predictors */}
                    <td className="py-3 px-4 text-[11px] font-sans">
                      {mut.siftScore !== undefined ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">SIFT:</span>
                            <span className={mut.siftPrediction === 'Deleterious' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                              {mut.siftScore} ({mut.siftPrediction})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">CADD:</span>
                            <span className="text-cyan-400 font-mono font-semibold">{mut.caddScore}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">LOF Truncation</span>
                      )}
                    </td>

                    {/* ACMG Tier Badge */}
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center truncate ${getPathogenicityBadge(mut.pathogenicity)}`}>
                        {mut.pathogenicity}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 text-center">
                        {mut.acmgClassification.criteriaMet.map(c => c.code).join(', ') || 'VUS'}
                      </div>
                    </td>

                    {/* Clinical / Drug Action */}
                    <td className="py-3 px-4 font-sans">
                      {mut.associatedDrugs && mut.associatedDrugs.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <Zap className="w-3 h-3" />
                          </span>
                          <span className="text-emerald-300 font-bold text-[11px] truncate max-w-[120px]">
                            {mut.associatedDrugs[0].drugName}
                          </span>
                        </div>
                      ) : mut.associatedDiseases && mut.associatedDiseases.length > 0 ? (
                        <span className="text-slate-300 text-[11px] truncate max-w-[130px] block">
                          {mut.associatedDiseases[0]}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Investigating</span>
                      )}
                    </td>

                    {/* Details Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMutation(mut);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg transition"
                        title="View Full ACMG & Structural Evidence"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
