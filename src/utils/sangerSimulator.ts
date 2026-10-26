export interface SangerTracePoint {
  x: number;
  a: number; // 0-100 fluorescence
  c: number;
  g: number;
  t: number;
}

export interface SangerBaseCall {
  base: string;
  position: number;
  quality: number;
  isHeterozygous?: boolean;
  secondaryBase?: string;
  isMutated?: boolean;
}

export function generateSangerTrace(
  sequence: string,
  mutatedPositions: { pos: number; altBase: string; isHeterozygous: boolean }[] = [],
  pointsPerBase = 12
): {
  tracePoints: SangerTracePoint[];
  baseCalls: SangerBaseCall[];
} {
  const clean = sequence.toUpperCase().replace(/[^ATCG]/g, '');
  const tracePoints: SangerTracePoint[] = [];
  const baseCalls: SangerBaseCall[] = [];

  const mutMap = new Map<number, { altBase: string; isHeterozygous: boolean }>();
  mutatedPositions.forEach(m => mutMap.set(m.pos, m));

  for (let baseIdx = 0; baseIdx < clean.length; baseIdx++) {
    const origBase = clean[baseIdx];
    const mutInfo = mutMap.get(baseIdx + 1);

    let primaryBase = origBase;
    let secondaryBase: string | undefined = undefined;
    let isHetero = false;
    let isMut = false;

    if (mutInfo) {
      isMut = true;
      if (mutInfo.isHeterozygous) {
        isHetero = true;
        primaryBase = origBase;
        secondaryBase = mutInfo.altBase;
      } else {
        primaryBase = mutInfo.altBase;
      }
    }

    baseCalls.push({
      base: isHetero ? `${primaryBase}/${secondaryBase}` : primaryBase,
      position: baseIdx + 1,
      quality: isHetero ? 38 : Math.floor(45 + Math.random() * 12),
      isHeterozygous: isHetero,
      secondaryBase,
      isMutated: isMut,
    });

    const centerPoint = baseIdx * pointsPerBase + pointsPerBase / 2;

    for (let p = 0; p < pointsPerBase; p++) {
      const globalX = baseIdx * pointsPerBase + p;
      const dist = (globalX - centerPoint) / (pointsPerBase * 0.32);
      const gaussian = Math.exp(-0.5 * dist * dist);

      // Noise floor
      const noise = () => Math.random() * 2 + 1;

      let a = noise();
      let c = noise();
      let g = noise();
      let t = noise();

      const applyBasePeak = (b: string, height: number) => {
        if (b === 'A') a += height * gaussian;
        else if (b === 'C') c += height * gaussian;
        else if (b === 'G') g += height * gaussian;
        else if (b === 'T') t += height * gaussian;
      };

      if (isHetero && secondaryBase) {
        applyBasePeak(primaryBase, 48 + Math.random() * 4);
        applyBasePeak(secondaryBase, 46 + Math.random() * 4);
      } else {
        applyBasePeak(primaryBase, 90 + Math.random() * 8);
      }

      tracePoints.push({
        x: globalX,
        a: Math.min(100, a),
        c: Math.min(100, c),
        g: Math.min(100, g),
        t: Math.min(100, t),
      });
    }
  }

  return { tracePoints, baseCalls };
}
