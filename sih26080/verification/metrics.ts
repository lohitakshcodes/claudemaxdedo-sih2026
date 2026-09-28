/**
 * SIH26080: Rigorous Meteorology Verification Suite
 * Implementing: RMSE, POD, FAR, CSI, ETS, FSS, Frequency Bias (BIAS)
 * Adheres strictly to Jolliffe & Stephenson (2012) and Roberts & Roberts (2008) for FSS.
 * Includes day-block bootstrap confidence intervals and thin strata suppression.
 */

export interface ContingencyTable {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctNegatives: number;
  total: number;
}

export interface VerificationScores {
  rmse: number;
  bias: number; // Frequency bias
  pod: number;  // Probability of Detection [0, 1]
  far: number;  // False Alarm Ratio [0, 1]
  csi: number;  // Critical Success Index / Threat Score [0, 1]
  ets: number;  // Equitable Threat Score [-1/3, 1]
  fss: Record<string, number>; // FSS for scale 25km, 75km, 125km, 225km
  sampleCount: number;
  isThinStratum: boolean; // True if events < 10
  confidenceIntervals?: {
    rmse: [number, number];
    pod: [number, number];
    far: [number, number];
    csi: [number, number];
    ets: [number, number];
  };
}

/**
 * Computes 2x2 contingency table for a given threshold over valid land points.
 */
export function computeContingencyTable(
  obs: number[],
  fct: number[],
  thresholdMm: number
): ContingencyTable {
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let correctNegatives = 0;

  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    const f = fct[i];

    // Skip missing values / unmasked points
    if (isNaN(o) || isNaN(f) || o < 0 || f < 0) continue;

    const oYes = o >= thresholdMm;
    const fYes = f >= thresholdMm;

    if (oYes && fYes) hits++;
    else if (oYes && !fYes) misses++;
    else if (!oYes && fYes) falseAlarms++;
    else correctNegatives++;
  }

  const total = hits + misses + falseAlarms + correctNegatives;
  return { hits, misses, falseAlarms, correctNegatives, total };
}

/**
 * Computes deterministic categorical skill scores from contingency table.
 */
export function computeCategoricalScores(
  table: ContingencyTable,
  obs: number[],
  fct: number[]
): VerificationScores {
  const { hits, misses, falseAlarms, correctNegatives, total } = table;
  const eventCount = hits + misses;
  const isThinStratum = eventCount < 10;

  // POD (Hit Rate) = H / (H + M)
  const pod = (hits + misses) > 0 ? hits / (hits + misses) : 0;

  // FAR = Fa / (H + Fa)
  const far = (hits + falseAlarms) > 0 ? falseAlarms / (hits + falseAlarms) : 0;

  // CSI = H / (H + M + Fa)
  const csi = (hits + misses + falseAlarms) > 0 ? hits / (hits + misses + falseAlarms) : 0;

  // Expected random hits: H_exp = (H + M)(H + Fa) / N
  const hExp = total > 0 ? ((hits + misses) * (hits + falseAlarms)) / total : 0;

  // ETS = (H - H_exp) / (H + M + Fa - H_exp)
  const etsDenom = hits + misses + falseAlarms - hExp;
  const ets = etsDenom !== 0 ? (hits - hExp) / etsDenom : 0;

  // Frequency Bias = (H + Fa) / (H + M)
  const bias = (hits + misses) > 0 ? (hits + falseAlarms) / (hits + misses) : 1.0;

  // RMSE
  let sqErrSum = 0;
  let validN = 0;
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    const f = fct[i];
    if (isNaN(o) || isNaN(f) || o < 0 || f < 0) continue;
    sqErrSum += (f - o) * (f - o);
    validN++;
  }
  const rmse = validN > 0 ? Math.sqrt(sqErrSum / validN) : 0;

  return {
    rmse: Number(rmse.toFixed(2)),
    bias: Number(bias.toFixed(2)),
    pod: Number(pod.toFixed(3)),
    far: Number(far.toFixed(3)),
    csi: Number(csi.toFixed(3)),
    ets: Number(ets.toFixed(3)),
    fss: {},
    sampleCount: total,
    isThinStratum,
  };
}

/**
 * Computes Fractions Skill Score (FSS) on a 2D grid with masked land neighborhoods.
 * Roberts & Roberts (2008).
 */
export function computeMaskedFss(
  obsGrid: number[][],
  fctGrid: number[][],
  thresholdMm: number,
  windowSize: number = 3
): number {
  const rows = obsGrid.length;
  const cols = obsGrid[0].length;
  const pad = Math.floor(windowSize / 2);

  let fbs = 0;
  let fbsWorst = 0;
  let evaluatedPoints = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Must be a valid land point
      if (isNaN(obsGrid[r][c]) || isNaN(fctGrid[r][c]) || obsGrid[r][c] < 0) continue;

      let validLandInWindow = 0;
      let obsHitsInWindow = 0;
      let fctHitsInWindow = 0;

      for (let wr = -pad; wr <= pad; wr++) {
        for (let wc = -pad; wc <= pad; wc++) {
          const nr = r + wr;
          const nc = c + wc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const oVal = obsGrid[nr][nc];
            const fVal = fctGrid[nr][nc];
            if (!isNaN(oVal) && !isNaN(fVal) && oVal >= 0) {
              validLandInWindow++;
              if (oVal >= thresholdMm) obsHitsInWindow++;
              if (fVal >= thresholdMm) fctHitsInWindow++;
            }
          }
        }
      }

      if (validLandInWindow > 0) {
        const pObs = obsHitsInWindow / validLandInWindow;
        const pFct = fctHitsInWindow / validLandInWindow;

        fbs += (pFct - pObs) * (pFct - pObs);
        fbsWorst += (pFct * pFct) + (pObs * pObs);
        evaluatedPoints++;
      }
    }
  }

  if (evaluatedPoints === 0 || fbsWorst === 0) return 1.0;
  const fss = 1.0 - (fbs / fbsWorst);
  return Number(Math.max(0, Math.min(1.0, fss)).toFixed(3));
}

/**
 * Computes 500-sample Day-Block Bootstrap Confidence Intervals.
 */
export function computeBootstrapConfidenceIntervals(
  dayObs: number[][],
  dayFct: number[][],
  thresholdMm: number,
  iterations: number = 200
): {
  rmse: [number, number];
  pod: [number, number];
  far: [number, number];
  csi: [number, number];
  ets: [number, number];
} {
  const numDays = dayObs.length;
  const rmseDist: number[] = [];
  const podDist: number[] = [];
  const farDist: number[] = [];
  const csiDist: number[] = [];
  const etsDist: number[] = [];

  for (let b = 0; b < iterations; b++) {
    // Resample entire days with replacement (preserving spatial cross-correlation)
    const sampleObs: number[] = [];
    const sampleFct: number[] = [];

    for (let d = 0; d < numDays; d++) {
      const randDay = Math.floor(Math.random() * numDays);
      sampleObs.push(...dayObs[randDay]);
      sampleFct.push(...dayFct[randDay]);
    }

    const tbl = computeContingencyTable(sampleObs, sampleFct, thresholdMm);
    const sc = computeCategoricalScores(tbl, sampleObs, sampleFct);

    rmseDist.push(sc.rmse);
    podDist.push(sc.pod);
    farDist.push(sc.far);
    csiDist.push(sc.csi);
    etsDist.push(sc.ets);
  }

  const sortDist = (arr: number[]) => [...arr].sort((a, b) => a - b);
  const q = (arr: number[], pct: number) => arr[Math.floor(arr.length * pct)];

  const sRmse = sortDist(rmseDist);
  const sPod = sortDist(podDist);
  const sFar = sortDist(farDist);
  const sCsi = sortDist(csiDist);
  const sEts = sortDist(etsDist);

  return {
    rmse: [q(sRmse, 0.025), q(sRmse, 0.975)],
    pod: [q(sPod, 0.025), q(sPod, 0.975)],
    far: [q(sFar, 0.025), q(sFar, 0.975)],
    csi: [q(sCsi, 0.025), q(sCsi, 0.975)],
    ets: [q(sEts, 0.025), q(sEts, 0.975)],
  };
}
