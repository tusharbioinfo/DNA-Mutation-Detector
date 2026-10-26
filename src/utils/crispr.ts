import { CrisprTargetResult } from '../types/genomics';
import { calculateGcContent, reverseComplement } from './geneticCode';

export function scanCrisprGuides(
  dnaSequence: string,
  mutationPos: number, // 1-based index
  window = 40
): CrisprTargetResult[] {
  const cleanDna = dnaSequence.toUpperCase().replace(/[^ATCG]/g, '');
  const results: CrisprTargetResult[] = [];

  const startIdx = Math.max(0, mutationPos - window);
  const endIdx = Math.min(cleanDna.length, mutationPos + window);

  // 1. SpCas9 Forward Strand Scan: 20nt protospacer + NGG PAM
  for (let i = startIdx + 20; i <= endIdx - 3; i++) {
    const pam = cleanDna.slice(i, i + 3);
    if (pam[1] === 'G' && pam[2] === 'G') {
      const protospacer = cleanDna.slice(i - 20, i);
      if (protospacer.length === 20) {
        const cutPos = i - 3; // Cas9 cuts 3bp upstream of PAM
        const dist = Math.abs(cutPos - (mutationPos - 1));
        const gc = calculateGcContent(protospacer);

        // Heuristic scoring (optimal GC 40-60%, penalty for poly-T, penalty for distance from cut)
        let score = 85;
        if (gc < 35 || gc > 75) score -= 20;
        if (protospacer.includes('TTTT')) score -= 25; // Polymerase III termination
        if (protospacer.endsWith('T')) score -= 5;
        if (dist === 0) score += 10;
        else if (dist <= 3) score += 5;
        else score -= Math.min(30, dist * 2);

        score = Math.max(10, Math.min(99, score));

        let offTargetRisk: 'Low' | 'Moderate' | 'High' = 'Low';
        if (score < 50) offTargetRisk = 'High';
        else if (score < 75) offTargetRisk = 'Moderate';

        results.push({
          pam,
          pamPos: i + 1,
          strand: '+',
          protospacer,
          gcContent: gc,
          onTargetScore: score,
          distanceToMutation: dist,
          offTargetRisk,
          cutPosition: cutPos + 1,
        });
      }
    }
  }

  // 2. Reverse Strand Scan (PAM = CCN on reverse complement, or looking for CCN on forward strand)
  for (let i = startIdx; i <= endIdx - 23; i++) {
    const pam = cleanDna.slice(i, i + 3);
    if (pam[0] === 'C' && pam[1] === 'C') {
      const targetRegion = cleanDna.slice(i, i + 23);
      const revTarget = reverseComplement(targetRegion);
      const protospacer = revTarget.slice(0, 20);
      const pamSeq = revTarget.slice(20, 23);

      const cutPos = i + 23 - 3;
      const dist = Math.abs(cutPos - (mutationPos - 1));
      const gc = calculateGcContent(protospacer);

      let score = 80;
      if (gc < 35 || gc > 75) score -= 20;
      if (protospacer.includes('TTTT')) score -= 25;
      if (dist <= 3) score += 5;
      else score -= Math.min(30, dist * 2);

      score = Math.max(10, Math.min(99, score));

      results.push({
        pam: pamSeq,
        pamPos: i + 1,
        strand: '-',
        protospacer,
        gcContent: gc,
        onTargetScore: score,
        distanceToMutation: dist,
        offTargetRisk: score > 75 ? 'Low' : score > 50 ? 'Moderate' : 'High',
        cutPosition: cutPos + 1,
      });
    }
  }

  // Sort by on-target score and proximity to mutation
  return results.sort((a, b) => b.onTargetScore - a.onTargetScore).slice(0, 8);
}
