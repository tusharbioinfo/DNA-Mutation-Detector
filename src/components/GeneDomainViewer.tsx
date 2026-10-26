import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { DetectedMutation, GeneDomain, ExonBoundary } from '../types/genomics';

interface GeneDomainViewerProps {
  geneSymbol: string;
  totalLengthNt: number;
  totalLengthAa: number;
  domains: GeneDomain[];
  exons: ExonBoundary[];
  mutations: DetectedMutation[];
  onSelectMutation: (mut: DetectedMutation) => void;
  selectedMutationId?: string | null;
}

export const GeneDomainViewer: React.FC<GeneDomainViewerProps> = ({
  geneSymbol,
  totalLengthNt,
  totalLengthAa,
  domains,
  exons,
  mutations,
  onSelectMutation,
  selectedMutationId,
}) => {
  // If no predefined domains for custom sequence, generate synthetic segments
  const effectiveDomains: GeneDomain[] = domains.length > 0 ? domains : [
    { name: 'N-Terminal Region', start: 1, end: Math.floor(totalLengthAa * 0.3), color: '#3b82f6', description: 'N-terminal regulatory segment' },
    { name: 'Catalytic / Core Domain', start: Math.floor(totalLengthAa * 0.3) + 1, end: Math.floor(totalLengthAa * 0.75), color: '#ef4444', isHotspotRegion: true, description: 'Core functional active site' },
    { name: 'C-Terminal Tail', start: Math.floor(totalLengthAa * 0.75) + 1, end: totalLengthAa, color: '#10b981', description: 'C-terminal anchoring loop' },
  ];

  const maxResidue = Math.max(totalLengthAa, 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-950 border border-indigo-800 rounded-lg text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Linear Domain Architecture & Lollipop Mutational Landscape</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                {geneSymbol} ({totalLengthAa} aa / {totalLengthNt} bp)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive exon and functional domain mapping showing somatic and germline variant hotspots.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Pathogenic</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">VUS</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Benign</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Track 1: Protein Lollipop Track */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Residue Mutation Hotspots (Lollipops)
            </span>
            <span className="text-slate-400 text-[11px]">1 .. {totalLengthAa} Residues</span>
          </div>

          <div className="relative h-24 bg-slate-950/70 border border-slate-800/80 rounded-xl px-4 py-2 flex items-end">
            {/* Base guide horizontal line */}
            <div className="absolute left-4 right-4 bottom-2 h-0.5 bg-slate-700"></div>

            {/* Plot Lollipops for each mutation */}
            {mutations.map((mut) => {
              const residue = mut.codonPos || Math.floor(mut.genomicPos / 3) + 1;
              const leftPercent = Math.min(98, Math.max(2, (residue / maxResidue) * 100));
              const isSelected = selectedMutationId === mut.id;

              const isPath = mut.pathogenicity === 'Pathogenic' || mut.pathogenicity === 'Likely Pathogenic';
              const pinColor = isPath ? 'bg-rose-500 border-rose-300' : 'bg-amber-400 border-amber-200';
              const stemHeight = mut.impact === 'HIGH' ? 'h-14' : 'h-9';

              return (
                <div
                  key={mut.id}
                  onClick={() => onSelectMutation(mut)}
                  className="absolute bottom-2 flex flex-col items-center cursor-pointer group z-20 transition transform hover:scale-125"
                  style={{ left: `${leftPercent}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none transition z-30">
                    <div className="font-bold text-cyan-300">{mut.hgvsP || mut.hgvsC}</div>
                    <div className="text-slate-400">{mut.pathogenicity}</div>
                  </div>

                  {/* Pin Head */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 shadow-lg transition ${pinColor} ${
                      isSelected ? 'ring-4 ring-cyan-400 scale-125 animate-bounce' : ''
                    }`}
                  />
                  {/* Pin Stick */}
                  <div className={`w-0.5 ${stemHeight} bg-slate-400 group-hover:bg-cyan-400`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: Protein Domain Ribbon */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
            <span>Functional Protein Domains</span>
            <span className="text-slate-400 text-[11px]">Click domain to inspect</span>
          </div>

          <div className="h-10 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex relative p-1 gap-1">
            {effectiveDomains.map((dom, idx) => {
              const domWidth = ((dom.end - dom.start + 1) / maxResidue) * 100;
              return (
                <div
                  key={idx}
                  className="h-full rounded-lg flex items-center justify-center text-white text-xs font-bold px-2 relative group overflow-hidden transition hover:brightness-125 cursor-help"
                  style={{
                    width: `${Math.max(5, domWidth)}%`,
                    backgroundColor: dom.color,
                  }}
                  title={`${dom.name} (${dom.start}-${dom.end} aa): ${dom.description}`}
                >
                  <span className="truncate drop-shadow-md text-[11px]">{dom.name}</span>

                  {dom.isHotspotRegion && (
                    <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-white animate-ping"></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Domain Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
            {effectiveDomains.map((dom, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2.5"
              >
                <div
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: dom.color }}
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white truncate">{dom.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dom.start}-{dom.end} aa
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{dom.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track 3: Exon Map */}
        {exons.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
              <span>Exon & Intron Junction Map (Genomic Coding Scale)</span>
              <span className="text-slate-400 text-[11px]">{exons.length} Exons Annotated</span>
            </div>

            <div className="h-7 bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex gap-1 items-center">
              {exons.map((exon) => {
                const exonWidth = ((exon.endNt - exon.startNt + 1) / totalLengthNt) * 100;
                return (
                  <div
                    key={exon.exonNumber}
                    className="h-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center text-[10px] font-mono font-bold text-slate-200 transition"
                    style={{ width: `${Math.max(4, exonWidth)}%` }}
                    title={`Exon ${exon.exonNumber}: nt ${exon.startNt} - ${exon.endNt}`}
                  >
                    E{exon.exonNumber}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
