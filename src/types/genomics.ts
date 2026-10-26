export type SequenceType = 'DNA' | 'RNA' | 'PROTEIN';

export type MutationType = 
  | 'missense'
  | 'nonsense'
  | 'synonymous'
  | 'frameshift_insertion'
  | 'frameshift_deletion'
  | 'inframe_insertion'
  | 'inframe_deletion'
  | 'splice_donor'
  | 'splice_acceptor'
  | 'start_lost'
  | 'stop_lost'
  | 'tandem_repeat'
  | 'complex';

export type PathogenicityTier = 
  | 'Pathogenic'
  | 'Likely Pathogenic'
  | 'Variant of Uncertain Significance (VUS)'
  | 'Likely Benign'
  | 'Benign';

export type ImpactSeverity = 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER';

export interface AminoAcidInfo {
  code1: string;
  code3: string;
  name: string;
  category: 'Hydrophobic' | 'Polar' | 'Positive' | 'Negative' | 'Aromatic' | 'Special';
  charge: number; // -1, 0, +1
  hydropathy: number; // Kyte-Doolittle scale
  molecularWeight: number;
  color: string;
}

export interface DetectedMutation {
  id: string;
  type: MutationType;
  genomicPos: number; // 1-based index in DNA
  codonPos?: number; // 1-based codon index
  cdsPos?: number; // Coding DNA position
  refNt: string;
  altNt: string;
  refCodon?: string;
  altCodon?: string;
  refAa?: string;
  altAa?: string;
  refAaName?: string;
  altAaName?: string;
  hgvsC: string; // e.g. c.743G>A
  hgvsP: string; // e.g. p.Arg248Gln
  pathogenicity: PathogenicityTier;
  acmgClassification: {
    tier: PathogenicityTier;
    criteriaMet: {
      code: string; // e.g. PVS1, PM1, PM2, PP3, BA1
      strength: 'Very Strong' | 'Strong' | 'Moderate' | 'Supporting' | 'Stand-alone';
      description: string;
      category: 'Pathogenic' | 'Benign';
    }[];
    score: number;
  };
  impact: ImpactSeverity;
  granthamScore?: number; // 0-215
  granthamCategory?: 'Conservative' | 'Moderately Conservative' | 'Moderately Radical' | 'Radical';
  siftScore?: number; // 0.00 to 1.00 (<=0.05 deleterious)
  siftPrediction?: 'Deleterious' | 'Tolerated';
  polyphenScore?: number; // 0.00 to 1.00
  polyphenPrediction?: 'Probably Damaging' | 'Possibly Damaging' | 'Benign';
  caddScore?: number; // Phred scale (0-40+)
  gnomadFreq?: number; // 0 to 1
  clinvarId?: string;
  cosmicId?: string;
  associatedDiseases?: string[];
  associatedDrugs?: {
    drugName: string;
    action: 'Sensitivity' | 'Resistance' | 'FDA Approved' | 'Clinical Trial';
    evidenceLevel: 'Level 1' | 'Level 2' | 'Level 3';
    description: string;
  }[];
  structuralImpactNotes?: string;
  frameshiftDetails?: {
    newProteinLength: number;
    originalProteinLength: number;
    prematureStopCodonPos: number;
    novelPeptideSequence: string;
  };
  spliceDetails?: {
    siteType: 'Donor (5\')' | 'Acceptor (3\')' | 'Branch Point';
    distanceToJunction: number;
    confidence: number;
  };
}

export interface AlignmentMatch {
  refIndex: number;
  altIndex: number;
  refChar: string;
  altChar: string;
  isMatch: boolean;
  isGap: boolean;
  type: 'match' | 'mismatch' | 'insertion' | 'deletion';
  codonGroup?: {
    refCodon: string;
    altCodon: string;
    codonIndex: number;
    refAa: string;
    altAa: string;
    isMutated: boolean;
  };
}

export interface AlignmentResult {
  refAligned: string;
  altAligned: string;
  score: number;
  identityPercentage: number;
  similarityPercentage: number;
  matchesCount: number;
  mismatchesCount: number;
  insertionsCount: number;
  deletionsCount: number;
  alignLength: number;
  pairs: AlignmentMatch[];
  mutations: DetectedMutation[];
}

export interface GeneDomain {
  name: string;
  start: number; // Amino acid residue index
  end: number;
  color: string;
  description: string;
  isHotspotRegion?: boolean;
}

export interface ExonBoundary {
  exonNumber: number;
  startNt: number;
  endNt: number;
}

export interface SampleGeneData {
  id: string;
  geneSymbol: string;
  geneName: string;
  chromosome: string;
  strand: '+' | '-';
  transcriptId: string;
  description: string;
  associatedCancerOrDisease: string;
  wildTypeDna: string;
  sampleMutatedDna: string;
  vcfExample?: string;
  domains: GeneDomain[];
  exons: ExonBoundary[];
  expectedVariants: string[];
}

export interface SangerTracePoint {
  index: number;
  a: number; // 0-100 fluorescence
  c: number;
  g: number;
  t: number;
  calledBase: string;
  quality: number; // 0-60 Phred Q
  secondaryBase?: string;
}

export interface CrisprTargetResult {
  pam: string;
  pamPos: number;
  strand: '+' | '-';
  protospacer: string; // 20nt guide
  gcContent: number;
  onTargetScore: number; // 0-100
  distanceToMutation: number;
  offTargetRisk: 'Low' | 'Moderate' | 'High';
  cutPosition: number;
}
