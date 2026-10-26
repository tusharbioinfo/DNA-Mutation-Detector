import { useState, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { SequenceInputPanel } from './components/SequenceInputPanel';
import { MutationSummaryCards } from './components/MutationSummaryCards';
import { AlignmentViewer } from './components/AlignmentViewer';
import { VariantTable } from './components/VariantTable';
import { GeneDomainViewer } from './components/GeneDomainViewer';
import { Protein3DViewer } from './components/Protein3DViewer';
import { SangerTraceViewer } from './components/SangerTraceViewer';
import { CrisprTherapyPanel } from './components/CrisprTherapyPanel';
import { MutagenesisSandbox } from './components/MutagenesisSandbox';
import { VariantDetailModal } from './components/VariantDetailModal';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { ExportModal } from './components/ExportModal';
import { GuideModal } from './components/GuideModal';

import { SAMPLE_GENES } from './data/sampleGenes';
import { SampleGeneData, DetectedMutation } from './types/genomics';
import { analyzeMutations } from './utils/alignment';
import { translateDna } from './utils/geneticCode';

export function App() {
  // Initial default gene: TP53
  const [selectedGene, setSelectedGene] = useState<SampleGeneData | null>(SAMPLE_GENES[0]);
  const [geneSymbol, setGeneSymbol] = useState<string>(SAMPLE_GENES[0].geneSymbol);
  const [refSequence, setRefSequence] = useState<string>(SAMPLE_GENES[0].wildTypeDna);
  const [altSequence, setAltSequence] = useState<string>(SAMPLE_GENES[0].sampleMutatedDna);
  const [readingFrame, setReadingFrame] = useState<number>(0);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('alignment');
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Modals state
  const [selectedMutation, setSelectedMutation] = useState<DetectedMutation | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Run dynamic sequence alignment & mutation detection pipeline
  const alignmentResult = useMemo(() => {
    return analyzeMutations(refSequence, altSequence, geneSymbol, readingFrame);
  }, [refSequence, altSequence, geneSymbol, readingFrame]);

  // Protein translations
  const refTranslation = useMemo(() => {
    return translateDna(refSequence, readingFrame);
  }, [refSequence, readingFrame]);

  // Handle switching curated clinical cases
  const handleSelectGene = (gene: SampleGeneData) => {
    setSelectedGene(gene);
    setGeneSymbol(gene.geneSymbol);
    setRefSequence(gene.wildTypeDna);
    setAltSequence(gene.sampleMutatedDna);
    setReadingFrame(0);
    setSelectedMutation(null);
  };

  const handleResetToRef = () => {
    setAltSequence(refSequence);
    setSelectedMutation(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedGene={selectedGene}
        onSelectGene={handleSelectGene}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        totalMutationsCount={alignmentResult.mutations.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Sequence Input & Alignment Configuration Matrix */}
        <SequenceInputPanel
          refSequence={refSequence}
          altSequence={altSequence}
          geneSymbol={geneSymbol}
          readingFrame={readingFrame}
          onRefChange={setRefSequence}
          onAltChange={setAltSequence}
          onGeneSymbolChange={setGeneSymbol}
          onReadingFrameChange={setReadingFrame}
          onSelectSampleGene={handleSelectGene}
          isExpanded={isInputExpanded}
          onToggleExpand={() => setIsInputExpanded(!isInputExpanded)}
        />

        {/* Top Summary Metrics Cards */}
        <MutationSummaryCards
          alignment={alignmentResult}
          selectedGeneSymbol={geneSymbol}
          onFilterType={setActiveFilter}
          activeFilter={activeFilter}
          onSelectMutation={(mut) => setSelectedMutation(mut)}
        />

        {/* Tab 1: Alignment & Sequence Studio */}
        {activeTab === 'alignment' && (
          <div className="space-y-6">
            <AlignmentViewer
              alignment={alignmentResult}
              readingFrame={readingFrame}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
            />

            <VariantTable
              mutations={alignmentResult.mutations}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
              activeFilter={activeFilter}
            />
          </div>
        )}

        {/* Tab 2: Gene & Protein Domain Map (2D Ribbon) */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <GeneDomainViewer
              geneSymbol={geneSymbol}
              totalLengthNt={refSequence.length}
              totalLengthAa={refTranslation.protein.length}
              domains={selectedGene?.domains || []}
              exons={selectedGene?.exons || []}
              mutations={alignmentResult.mutations}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
            />

            <VariantTable
              mutations={alignmentResult.mutations}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
              activeFilter={activeFilter}
            />
          </div>
        )}

        {/* Tab 3: Interactive 3D Protein Structure Viewer */}
        {activeTab === 'structure3d' && (
          <div className="space-y-6">
            <Protein3DViewer
              proteinSequence={refTranslation.protein}
              mutations={alignmentResult.mutations}
              selectedMutation={selectedMutation}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              geneSymbol={geneSymbol}
            />

            <VariantTable
              mutations={alignmentResult.mutations}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
              activeFilter={activeFilter}
            />
          </div>
        )}

        {/* Tab 4: Sanger Electropherogram Trace Simulator */}
        {activeTab === 'sanger' && (
          <div className="space-y-6">
            <SangerTraceViewer
              sequence={refSequence}
              mutations={alignmentResult.mutations}
              geneSymbol={geneSymbol}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
            />

            <VariantTable
              mutations={alignmentResult.mutations}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
              activeFilter={activeFilter}
            />
          </div>
        )}

        {/* Tab 5: CRISPR Guide RNA & Therapeutic Oncology */}
        {activeTab === 'crispr' && (
          <div className="space-y-6">
            <CrisprTherapyPanel
              sequence={refSequence}
              mutations={alignmentResult.mutations}
              selectedMutation={selectedMutation}
              geneSymbol={geneSymbol}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
            />

            <VariantTable
              mutations={alignmentResult.mutations}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
              activeFilter={activeFilter}
            />
          </div>
        )}

        {/* Tab 6: Mutagenesis Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <MutagenesisSandbox
              refSequence={refSequence}
              altSequence={altSequence}
              onAltChange={setAltSequence}
              onResetToRef={handleResetToRef}
            />

            <AlignmentViewer
              alignment={alignmentResult}
              readingFrame={readingFrame}
              onSelectMutation={(mut) => setSelectedMutation(mut)}
              selectedMutationId={selectedMutation?.id}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">MutDetect AI™ Studio</span>
            <span>•</span>
            <span>ACMG/AMP Variant Interpretation Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-cyan-400 transition">
              Methodology & Documentation
            </button>
            <button onClick={() => setIsReportOpen(true)} className="hover:text-cyan-400 transition">
              Clinical Report
            </button>
            <button onClick={() => setIsExportOpen(true)} className="hover:text-cyan-400 transition">
              VCF Export
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedMutation && (
        <VariantDetailModal
          mutation={selectedMutation}
          geneSymbol={geneSymbol}
          onClose={() => setSelectedMutation(null)}
        />
      )}

      {isReportOpen && (
        <ClinicalReportModal
          geneSymbol={geneSymbol}
          transcriptId={selectedGene?.transcriptId}
          alignment={alignmentResult}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          geneSymbol={geneSymbol}
          transcriptId={selectedGene?.transcriptId}
          refSequence={refSequence}
          altSequence={altSequence}
          alignment={alignmentResult}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isGuideOpen && (
        <GuideModal onClose={() => setIsGuideOpen(false)} />
      )}
    </div>
  );
}

export default App;
