import { AminoAcidInfo } from '../types/genomics';

export const CODON_TABLE: Record<string, string> = {
  // Phenylalanine & Leucine
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L',
  // Leucine
  CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  // Isoleucine & Methionine (Start)
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M',
  // Valine
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  // Serine
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S',
  // Proline
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  // Threonine
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  // Alanine
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  // Tyrosine & Stop
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*',
  // Histidine & Glutamine
  CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  // Asparagine & Lysine
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K',
  // Aspartate & Glutamate
  GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  // Cysteine, Stop & Tryptophan
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W',
  // Arginine
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  // Serine & Arginine
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R',
  // Glycine
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
};

export const AMINO_ACID_MAP: Record<string, AminoAcidInfo> = {
  A: { code1: 'A', code3: 'Ala', name: 'Alanine', category: 'Hydrophobic', charge: 0, hydropathy: 1.8, molecularWeight: 89.09, color: '#3b82f6' },
  R: { code1: 'R', code3: 'Arg', name: 'Arginine', category: 'Positive', charge: 1, hydropathy: -4.5, molecularWeight: 174.20, color: '#ef4444' },
  N: { code1: 'N', code3: 'Asn', name: 'Asparagine', category: 'Polar', charge: 0, hydropathy: -3.5, molecularWeight: 132.12, color: '#10b981' },
  D: { code1: 'D', code3: 'Asp', name: 'Aspartate', category: 'Negative', charge: -1, hydropathy: -3.5, molecularWeight: 133.10, color: '#8b5cf6' },
  C: { code1: 'C', code3: 'Cys', name: 'Cysteine', category: 'Special', charge: 0, hydropathy: 2.5, molecularWeight: 121.16, color: '#f59e0b' },
  Q: { code1: 'Q', code3: 'Gln', name: 'Glutamine', category: 'Polar', charge: 0, hydropathy: -3.5, molecularWeight: 146.15, color: '#10b981' },
  E: { code1: 'E', code3: 'Glu', name: 'Glutamate', category: 'Negative', charge: -1, hydropathy: -3.5, molecularWeight: 147.13, color: '#8b5cf6' },
  G: { code1: 'G', code3: 'Gly', name: 'Glycine', category: 'Special', charge: 0, hydropathy: -0.4, molecularWeight: 75.07, color: '#6b7280' },
  H: { code1: 'H', code3: 'His', name: 'Histidine', category: 'Positive', charge: 0.5, hydropathy: -3.2, molecularWeight: 155.16, color: '#ef4444' },
  I: { code1: 'I', code3: 'Ile', name: 'Isoleucine', category: 'Hydrophobic', charge: 0, hydropathy: 4.5, molecularWeight: 131.18, color: '#3b82f6' },
  L: { code1: 'L', code3: 'Leu', name: 'Leucine', category: 'Hydrophobic', charge: 0, hydropathy: 3.8, molecularWeight: 131.18, color: '#3b82f6' },
  K: { code1: 'K', code3: 'Lys', name: 'Lysine', category: 'Positive', charge: 1, hydropathy: -3.9, molecularWeight: 146.19, color: '#ef4444' },
  M: { code1: 'M', code3: 'Met', name: 'Methionine', category: 'Hydrophobic', charge: 0, hydropathy: 1.9, molecularWeight: 149.21, color: '#3b82f6' },
  F: { code1: 'F', code3: 'Phe', name: 'Phenylalanine', category: 'Aromatic', charge: 0, hydropathy: 2.8, molecularWeight: 165.19, color: '#ec4899' },
  P: { code1: 'P', code3: 'Pro', name: 'Proline', category: 'Special', charge: 0, hydropathy: -1.6, molecularWeight: 115.13, color: '#f59e0b' },
  S: { code1: 'S', code3: 'Ser', name: 'Serine', category: 'Polar', charge: 0, hydropathy: -0.8, molecularWeight: 105.09, color: '#10b981' },
  T: { code1: 'T', code3: 'Thr', name: 'Threonine', category: 'Polar', charge: 0, hydropathy: -0.7, molecularWeight: 119.12, color: '#10b981' },
  W: { code1: 'W', code3: 'Trp', name: 'Tryptophan', category: 'Aromatic', charge: 0, hydropathy: -0.9, molecularWeight: 204.23, color: '#ec4899' },
  Y: { code1: 'Y', code3: 'Tyr', name: 'Tyrosine', category: 'Aromatic', charge: 0, hydropathy: -1.3, molecularWeight: 181.19, color: '#ec4899' },
  V: { code1: 'V', code3: 'Val', name: 'Valine', category: 'Hydrophobic', charge: 0, hydropathy: 4.2, molecularWeight: 117.15, color: '#3b82f6' },
  '*': { code1: '*', code3: 'Ter', name: 'Stop Codon (Termination)', category: 'Special', charge: 0, hydropathy: 0, molecularWeight: 0, color: '#dc2626' },
  '?': { code1: '?', code3: 'Unk', name: 'Unknown / Ambiguous', category: 'Special', charge: 0, hydropathy: 0, molecularWeight: 0, color: '#9ca3af' },
};

// Grantham's Distance Matrix (Grantham R. Science 1974; 185:862-864)
// Evaluates physicochemical distance between amino acids: composition, polarity, molecular volume
const GRANTHAM_MATRIX: Record<string, Record<string, number>> = {
  A: { A:0, R:112, N:111, D:126, C:195, Q:91, E:107, G:60, H:86, I:94, L:96, K:106, M:84, F:113, P:27, S:99, T:58, W:148, Y:112, V:64 },
  R: { A:112, R:0, N:86, D:96, C:180, Q:43, E:54, G:125, H:29, I:97, L:102, K:26, M:91, F:97, P:103, S:110, T:71, W:101, Y:77, V:96 },
  N: { A:111, R:86, N:0, D:23, C:139, Q:46, E:42, G:80, H:68, I:149, L:153, K:94, M:142, F:158, P:91, S:46, T:65, W:174, Y:143, V:133 },
  D: { A:126, R:96, N:23, D:0, C:154, Q:61, E:45, G:81, H:81, I:168, L:172, K:101, M:160, F:177, P:108, S:65, T:85, W:181, Y:160, V:152 },
  C: { A:195, R:180, N:139, D:154, C:0, Q:154, E:170, G:159, H:174, I:198, L:198, K:202, M:196, F:205, P:169, S:112, T:149, W:215, Y:194, V:192 },
  Q: { A:91, R:43, N:46, D:61, C:154, Q:0, E:29, G:87, H:24, I:109, L:113, K:53, M:101, F:116, P:76, S:68, T:42, W:130, Y:99, V:96 },
  E: { A:107, R:54, N:42, D:45, C:170, Q:29, E:0, G:98, H:40, I:134, L:138, K:56, M:126, F:140, P:93, S:80, T:65, W:152, Y:122, V:121 },
  G: { A:60, R:125, N:80, D:81, C:159, Q:87, E:98, G:0, H:98, I:135, L:138, K:127, M:127, F:153, P:42, S:56, T:59, W:184, Y:147, V:109 },
  H: { A:86, R:29, N:68, D:81, C:174, Q:24, E:40, G:98, H:0, I:94, L:99, K:32, M:87, F:100, P:77, S:89, T:47, W:115, Y:83, V:84 },
  I: { A:94, R:97, N:149, D:168, C:198, Q:109, E:134, G:135, H:94, I:0, L:5, K:102, M:10, F:21, P:95, S:142, T:89, W:61, Y:33, V:29 },
  L: { A:96, R:102, N:153, D:172, C:198, Q:113, E:138, G:138, H:99, I:5, L:0, K:107, M:15, F:22, P:98, S:145, T:92, W:61, Y:36, V:32 },
  K: { A:106, R:26, N:94, D:101, C:202, Q:53, E:56, G:127, H:32, I:102, L:107, K:0, M:95, F:102, P:103, S:121, T:78, W:110, Y:85, V:97 },
  M: { A:84, R:91, N:142, D:160, C:196, Q:101, E:126, G:127, H:87, I:10, L:15, K:95, M:0, F:18, P:87, S:135, T:81, W:67, Y:36, V:21 },
  F: { A:113, R:97, N:158, D:177, C:205, Q:116, E:140, G:153, H:100, I:21, L:22, K:102, M:18, F:0, P:114, S:155, T:103, W:40, Y:22, V:50 },
  P: { A:27, R:103, N:91, D:108, C:169, Q:76, E:93, G:42, H:77, I:95, L:98, K:103, M:87, F:114, P:0, S:74, T:38, W:147, Y:110, V:68 },
  S: { A:99, R:110, N:46, D:65, C:112, Q:68, E:80, G:56, H:89, I:142, L:145, K:121, M:135, F:155, P:74, S:0, T:58, W:177, Y:144, V:124 },
  T: { A:58, R:71, N:65, D:85, C:149, Q:42, E:65, G:59, H:47, I:89, L:92, K:78, M:81, F:103, P:38, S:58, T:0, W:128, Y:92, V:69 },
  W: { A:148, R:101, N:174, D:181, C:215, Q:130, E:152, G:184, H:115, I:61, L:61, K:110, M:67, F:40, P:147, S:177, T:128, W:0, Y:37, V:88 },
  Y: { A:112, R:77, N:143, D:160, C:194, Q:99, E:122, G:147, H:83, I:33, L:36, K:85, M:36, F:22, P:110, S:144, T:92, W:37, Y:0, V:55 },
  V: { A:64, R:96, N:133, D:152, C:192, Q:96, E:121, G:109, H:84, I:29, L:32, K:97, M:21, F:50, P:68, S:124, T:69, W:88, Y:55, V:0 },
};

export function getGranthamScore(aa1: string, aa2: string): { score: number; category: 'Conservative' | 'Moderately Conservative' | 'Moderately Radical' | 'Radical' } {
  if (aa1 === aa2) return { score: 0, category: 'Conservative' };
  if (aa1 === '*' || aa2 === '*' || !GRANTHAM_MATRIX[aa1] || !GRANTHAM_MATRIX[aa1][aa2]) {
    return { score: 215, category: 'Radical' };
  }
  const score = GRANTHAM_MATRIX[aa1][aa2];
  let category: 'Conservative' | 'Moderately Conservative' | 'Moderately Radical' | 'Radical' = 'Conservative';
  if (score > 150) category = 'Radical';
  else if (score > 100) category = 'Moderately Radical';
  else if (score > 60) category = 'Moderately Conservative';
  return { score, category };
}

export function cleanSequence(raw: string): string {
  // Strip FASTA header if present
  let seq = raw.trim();
  if (seq.startsWith('>')) {
    const lines = seq.split('\n');
    seq = lines.slice(1).join('');
  }
  return seq.toUpperCase().replace(/[^A-Z]/g, '');
}

export function reverseComplement(dna: string): string {
  const complement: Record<string, string> = {
    A: 'T', T: 'A', C: 'G', G: 'C', U: 'A',
    R: 'Y', Y: 'R', S: 'S', W: 'W', K: 'M', M: 'K',
    B: 'V', D: 'H', H: 'D', V: 'B', N: 'N', '-': '-'
  };
  return dna
    .toUpperCase()
    .split('')
    .reverse()
    .map(base => complement[base] || 'N')
    .join('');
}

export function dnaToRna(dna: string): string {
  return dna.toUpperCase().replace(/T/g, 'U');
}

export function rnaToDna(rna: string): string {
  return rna.toUpperCase().replace(/U/g, 'T');
}

export function translateDna(dna: string, readingFrame: number = 0): {
  protein: string;
  codons: string[];
  aminoAcids: AminoAcidInfo[];
} {
  const clean = dna.toUpperCase().replace(/[^ATCGU]/g, '');
  const rnaClean = clean.replace(/U/g, 'T');
  const codons: string[] = [];
  const aaList: AminoAcidInfo[] = [];
  let protein = '';

  for (let i = readingFrame; i + 2 < rnaClean.length; i += 3) {
    const codon = rnaClean.slice(i, i + 3);
    codons.push(codon);
    const aaChar = CODON_TABLE[codon] || '?';
    protein += aaChar;
    aaList.push(AMINO_ACID_MAP[aaChar] || AMINO_ACID_MAP['?']);
  }

  return { protein, codons, aminoAcids: aaList };
}

export function calculateGcContent(seq: string): number {
  if (!seq) return 0;
  const clean = seq.toUpperCase().replace(/[^ATCG]/g, '');
  if (!clean.length) return 0;
  const gcCount = (clean.match(/[GC]/g) || []).length;
  return Number(((gcCount / clean.length) * 100).toFixed(1));
}

export function calculateMeltingTemp(seq: string): number {
  const clean = seq.toUpperCase().replace(/[^ATCG]/g, '');
  if (clean.length < 14) {
    const a = (clean.match(/A/g) || []).length;
    const t = (clean.match(/T/g) || []).length;
    const g = (clean.match(/G/g) || []).length;
    const c = (clean.match(/C/g) || []).length;
    return (a + t) * 2 + (g + c) * 4;
  }
  // Nearest-neighbor approximation for longer oligos
  const gc = calculateGcContent(clean);
  return Number((64.9 + 41 * (gc / 100 - 16.4 / clean.length)).toFixed(1));
}
