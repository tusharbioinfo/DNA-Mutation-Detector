import { AlignmentResult, AlignmentMatch, DetectedMutation, MutationType } from '../types/genomics';
import { CODON_TABLE, AMINO_ACID_MAP, getGranthamScore } from './geneticCode';
import { evaluatePathogenicity } from './pathogenicity';

/**
 * Needleman-Wunsch Global Sequence Alignment Algorithm
 */
export function alignSequences(
  seq1: string,
  seq2: string,
  options = { match: 2, mismatch: -1, gap: -2 }
): { refAligned: string; altAligned: string; score: number } {
  const s1 = seq1.toUpperCase();
  const s2 = seq2.toUpperCase();
  const n = s1.length;
  const m = s2.length;

  if (n === 0) return { refAligned: '-'.repeat(m), altAligned: s2, score: m * options.gap };
  if (m === 0) return { refAligned: s1, altAligned: '-'.repeat(n), score: n * options.gap };

  // For very long sequences, if they are identical or nearly identical with few edits,
  // we optimize or run full dynamic programming
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * options.gap;
  for (let j = 0; j <= m; j++) dp[0][j] = j * options.gap;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const matchScore = s1[i - 1] === s2[j - 1] ? options.match : options.mismatch;
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + matchScore, // Match/Mismatch
        dp[i - 1][j] + options.gap,     // Deletion in seq2
        dp[i][j - 1] + options.gap      // Insertion in seq2
      );
    }
  }

  // Traceback
  let align1 = '';
  let align2 = '';
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? options.match : options.mismatch)) {
      align1 = s1[i - 1] + align1;
      align2 = s2[j - 1] + align2;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + options.gap) {
      align1 = s1[i - 1] + align1;
      align2 = '-' + align2;
      i--;
    } else {
      align1 = '-' + align1;
      align2 = s2[j - 1] + align2;
      j--;
    }
  }

  return {
    refAligned: align1,
    altAligned: align2,
    score: dp[n][m],
  };
}

/**
 * Detects all mutations and generates detailed annotations & HGVS terms
 */
export function analyzeMutations(
  refDna: string,
  altDna: string,
  geneSymbol = 'GENE',
  readingFrame = 0
): AlignmentResult {
  const cleanRef = refDna.toUpperCase().replace(/[^ATCGU]/g, '').replace(/U/g, 'T');
  const cleanAlt = altDna.toUpperCase().replace(/[^ATCGU]/g, '').replace(/U/g, 'T');

  const { refAligned, altAligned, score } = alignSequences(cleanRef, cleanAlt);

  const pairs: AlignmentMatch[] = [];
  let refCount = 0;
  let altCount = 0;
  let matchesCount = 0;
  let mismatchesCount = 0;
  let insertionsCount = 0;
  let deletionsCount = 0;

  for (let idx = 0; idx < refAligned.length; idx++) {
    const rChar = refAligned[idx];
    const aChar = altAligned[idx];

    let matchType: 'match' | 'mismatch' | 'insertion' | 'deletion' = 'match';
    if (rChar === '-') {
      matchType = 'insertion';
      insertionsCount++;
    } else if (aChar === '-') {
      matchType = 'deletion';
      deletionsCount++;
    } else if (rChar !== aChar) {
      matchType = 'mismatch';
      mismatchesCount++;
    } else {
      matchesCount++;
    }

    const currentRefIndex = rChar !== '-' ? refCount + 1 : refCount;
    const currentAltIndex = aChar !== '-' ? altCount + 1 : altCount;

    if (rChar !== '-') refCount++;
    if (aChar !== '-') altCount++;

    pairs.push({
      refIndex: currentRefIndex,
      altIndex: currentAltIndex,
      refChar: rChar,
      altChar: aChar,
      isMatch: rChar === aChar,
      isGap: rChar === '-' || aChar === '-',
      type: matchType,
    });
  }

  const identityPercentage = Number(((matchesCount / (refAligned.length || 1)) * 100).toFixed(1));
  const similarityPercentage = Number((((matchesCount + mismatchesCount) / (refAligned.length || 1)) * 100).toFixed(1));

  // Extract high-level mutation objects
  const mutations: DetectedMutation[] = [];
  let pIdx = 0;

  while (pIdx < pairs.length) {
    const pair = pairs[pIdx];

    if (pair.type === 'mismatch') {
      // SNV / Point mutation
      const genomicPos = pair.refIndex;
      const refBase = pair.refChar;
      const altBase = pair.altChar;

      // Codon calculation (0-indexed base relative to reading frame)
      const baseOffset = genomicPos - 1 - readingFrame;
      let mutationType: MutationType = 'missense';
      let hgvsC = `c.${genomicPos}${refBase}>${altBase}`;
      let hgvsP = '';
      let refAa = '';
      let altAa = '';
      let refCodon = '';
      let altCodon = '';
      let codonIndex = 1;

      if (baseOffset >= 0 && baseOffset < cleanRef.length) {
        codonIndex = Math.floor(baseOffset / 3) + 1;
        const codonStartInRef = readingFrame + (codonIndex - 1) * 3;
        refCodon = cleanRef.slice(codonStartInRef, codonStartInRef + 3);

        // Build alt codon
        const posInCodon = baseOffset % 3;
        const altCodonArr = refCodon.split('');
        if (altCodonArr.length === 3) {
          altCodonArr[posInCodon] = altBase;
          altCodon = altCodonArr.join('');

          refAa = CODON_TABLE[refCodon] || '?';
          altAa = CODON_TABLE[altCodon] || '?';

          const refAa3 = AMINO_ACID_MAP[refAa]?.code3 || refAa;
          const altAa3 = AMINO_ACID_MAP[altAa]?.code3 || altAa;

          if (refAa === altAa) {
            mutationType = 'synonymous';
            hgvsP = `p.${refAa3}${codonIndex}=`;
          } else if (altAa === '*') {
            mutationType = 'nonsense';
            hgvsP = `p.${refAa3}${codonIndex}*`;
          } else if (refAa === '*' && altAa !== '*') {
            mutationType = 'stop_lost';
            hgvsP = `p.*${codonIndex}${altAa3}ext*?`;
          } else if (codonIndex === 1 && refAa === 'M' && altAa !== 'M') {
            mutationType = 'start_lost';
            hgvsP = `p.Met1?`;
          } else {
            mutationType = 'missense';
            hgvsP = `p.${refAa3}${codonIndex}${altAa3}`;
          }
        }
      }

      const grantham = refAa && altAa ? getGranthamScore(refAa, altAa) : { score: 0, category: 'Conservative' as const };

      const mutation: DetectedMutation = {
        id: `mut-${genomicPos}-${refBase}-${altBase}`,
        type: mutationType,
        genomicPos,
        codonPos: codonIndex,
        cdsPos: genomicPos,
        refNt: refBase,
        altNt: altBase,
        refCodon,
        altCodon,
        refAa,
        altAa,
        refAaName: AMINO_ACID_MAP[refAa]?.name || refAa,
        altAaName: AMINO_ACID_MAP[altAa]?.name || altAa,
        hgvsC,
        hgvsP: hgvsP || `p.?`,
        pathogenicity: 'Likely Pathogenic', // evaluated below
        acmgClassification: { tier: 'Variant of Uncertain Significance (VUS)', criteriaMet: [], score: 0 },
        impact: mutationType === 'nonsense' ? 'HIGH' : mutationType === 'missense' ? 'MODERATE' : 'LOW',
        granthamScore: grantham.score,
        granthamCategory: grantham.category,
      };

      // Run ACMG & computational predictor
      const acmgResult = evaluatePathogenicity(mutation, geneSymbol, cleanRef, cleanAlt);
      mutation.acmgClassification = acmgResult.acmg;
      mutation.pathogenicity = acmgResult.acmg.tier;
      mutation.siftScore = acmgResult.siftScore;
      mutation.siftPrediction = acmgResult.siftPrediction;
      mutation.polyphenScore = acmgResult.polyphenScore;
      mutation.polyphenPrediction = acmgResult.polyphenPrediction;
      mutation.caddScore = acmgResult.caddScore;
      mutation.associatedDiseases = acmgResult.diseases;
      mutation.associatedDrugs = acmgResult.drugs;
      mutation.structuralImpactNotes = acmgResult.structuralNotes;

      mutations.push(mutation);
      pIdx++;
    } else if (pair.type === 'deletion') {
      // Collect contiguous deletion stretch
      let delStartRef = pair.refIndex;
      let delRefBases = '';
      while (pIdx < pairs.length && pairs[pIdx].type === 'deletion') {
        delRefBases += pairs[pIdx].refChar;
        pIdx++;
      }
      const delLength = delRefBases.length;
      const isFrameshift = delLength % 3 !== 0;
      const mutationType: MutationType = isFrameshift ? 'frameshift_deletion' : 'inframe_deletion';

      const delEndRef = delStartRef + delLength - 1;
      const hgvsC = delLength === 1
        ? `c.${delStartRef}del${delRefBases}`
        : `c.${delStartRef}_${delEndRef}del${delRefBases}`;

      const codonPos = Math.floor((delStartRef - 1 - readingFrame) / 3) + 1;

      // Handle frameshift peptide and premature stop codon
      let frameshiftDetails = undefined;
      let hgvsP = `p.del${delLength}bp`;

      if (isFrameshift) {
        // Calculate novel peptide translation after frameshift
        const altShiftDna = cleanAlt.slice(Math.max(0, delStartRef - 1));
        let novelPeptide = '';
        let stopFoundAt = -1;

        for (let k = 0; k + 2 < altShiftDna.length; k += 3) {
          const c = altShiftDna.slice(k, k + 3);
          const aa = CODON_TABLE[c] || '?';
          if (aa === '*') {
            stopFoundAt = Math.floor(k / 3) + 1;
            break;
          }
          novelPeptide += aa;
        }

        const initialRefCodonStart = readingFrame + (codonPos - 1) * 3;
        const initialRefCodon = cleanRef.slice(initialRefCodonStart, initialRefCodonStart + 3);
        const refAa = CODON_TABLE[initialRefCodon] || 'X';
        const refAa3 = AMINO_ACID_MAP[refAa]?.code3 || refAa;

        const stopDist = stopFoundAt > 0 ? stopFoundAt : 15;
        hgvsP = `p.${refAa3}${codonPos}fs*${stopDist}`;

        frameshiftDetails = {
          newProteinLength: codonPos + stopDist,
          originalProteinLength: Math.floor(cleanRef.length / 3),
          prematureStopCodonPos: codonPos + stopDist,
          novelPeptideSequence: novelPeptide.slice(0, 20),
        };
      } else {
        // In-frame deletion (e.g., Phe508del)
        const initialRefCodonStart = readingFrame + (codonPos - 1) * 3;
        const initialRefCodon = cleanRef.slice(initialRefCodonStart, initialRefCodonStart + 3);
        const refAa = CODON_TABLE[initialRefCodon] || 'X';
        const refAa3 = AMINO_ACID_MAP[refAa]?.code3 || refAa;
        hgvsP = `p.${refAa3}${codonPos}del`;
      }

      const mutation: DetectedMutation = {
        id: `del-${delStartRef}-${delLength}`,
        type: mutationType,
        genomicPos: delStartRef,
        codonPos,
        cdsPos: delStartRef,
        refNt: delRefBases,
        altNt: '-',
        hgvsC,
        hgvsP,
        pathogenicity: isFrameshift ? 'Pathogenic' : 'Likely Pathogenic',
        acmgClassification: { tier: isFrameshift ? 'Pathogenic' : 'Likely Pathogenic', criteriaMet: [], score: 0 },
        impact: isFrameshift ? 'HIGH' : 'MODERATE',
        frameshiftDetails,
      };

      const acmgResult = evaluatePathogenicity(mutation, geneSymbol, cleanRef, cleanAlt);
      mutation.acmgClassification = acmgResult.acmg;
      mutation.pathogenicity = acmgResult.acmg.tier;
      mutation.associatedDiseases = acmgResult.diseases;
      mutation.associatedDrugs = acmgResult.drugs;
      mutation.structuralImpactNotes = isFrameshift 
        ? 'Loss-of-function (LOF) truncation via premature termination codon (PTC); prone to Nonsense-Mediated Decay (NMD).'
        : `In-frame deletion of ${delLength / 3} amino acid(s); causes local backbone strain and domain destabilization.`;

      mutations.push(mutation);
    } else if (pair.type === 'insertion') {
      // Contiguous insertion stretch
      const insStartPos = pair.refIndex;
      let insAltBases = '';
      while (pIdx < pairs.length && pairs[pIdx].type === 'insertion') {
        insAltBases += pairs[pIdx].altChar;
        pIdx++;
      }
      const insLength = insAltBases.length;
      const isFrameshift = insLength % 3 !== 0;
      const mutationType: MutationType = isFrameshift ? 'frameshift_insertion' : 'inframe_insertion';

      const hgvsC = `c.${insStartPos}_${insStartPos + 1}ins${insAltBases}`;
      const codonPos = Math.floor((insStartPos - 1 - readingFrame) / 3) + 1;

      let hgvsP = `p.ins${insLength}bp`;
      let frameshiftDetails = undefined;

      if (isFrameshift) {
        const altShiftDna = cleanAlt.slice(Math.max(0, pair.altIndex - 1));
        let stopDist = 12;
        let novelPeptide = '';
        for (let k = 0; k + 2 < altShiftDna.length; k += 3) {
          const c = altShiftDna.slice(k, k + 3);
          const aa = CODON_TABLE[c] || '?';
          if (aa === '*') {
            stopDist = Math.floor(k / 3) + 1;
            break;
          }
          novelPeptide += aa;
        }

        const initialRefCodonStart = readingFrame + (codonPos - 1) * 3;
        const initialRefCodon = cleanRef.slice(initialRefCodonStart, initialRefCodonStart + 3);
        const refAa = CODON_TABLE[initialRefCodon] || 'X';
        const refAa3 = AMINO_ACID_MAP[refAa]?.code3 || refAa;
        hgvsP = `p.${refAa3}${codonPos}fs*${stopDist}`;

        frameshiftDetails = {
          newProteinLength: codonPos + stopDist,
          originalProteinLength: Math.floor(cleanRef.length / 3),
          prematureStopCodonPos: codonPos + stopDist,
          novelPeptideSequence: novelPeptide.slice(0, 20),
        };
      }

      const mutation: DetectedMutation = {
        id: `ins-${insStartPos}-${insLength}`,
        type: mutationType,
        genomicPos: insStartPos,
        codonPos,
        cdsPos: insStartPos,
        refNt: '-',
        altNt: insAltBases,
        hgvsC,
        hgvsP,
        pathogenicity: isFrameshift ? 'Pathogenic' : 'Likely Pathogenic',
        acmgClassification: { tier: isFrameshift ? 'Pathogenic' : 'Likely Pathogenic', criteriaMet: [], score: 0 },
        impact: isFrameshift ? 'HIGH' : 'MODERATE',
        frameshiftDetails,
      };

      const acmgResult = evaluatePathogenicity(mutation, geneSymbol, cleanRef, cleanAlt);
      mutation.acmgClassification = acmgResult.acmg;
      mutation.pathogenicity = acmgResult.acmg.tier;
      mutation.associatedDiseases = acmgResult.diseases;
      mutation.associatedDrugs = acmgResult.drugs;
      mutation.structuralImpactNotes = isFrameshift 
        ? 'Frameshift insertion leading to complete disruption of downstream amino acid sequence and premature truncation.'
        : `In-frame insertion of ${insLength / 3} novel residue(s).`;

      mutations.push(mutation);
    } else {
      pIdx++;
    }
  }

  return {
    refAligned,
    altAligned,
    score,
    identityPercentage,
    similarityPercentage,
    matchesCount,
    mismatchesCount,
    insertionsCount,
    deletionsCount,
    alignLength: refAligned.length,
    pairs,
    mutations,
  };
}
