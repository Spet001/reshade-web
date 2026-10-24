export interface LabPixel {
  L: number;
  a: number;
  b: number;
}

export interface ChannelStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  p05: number;
  p50: number;
  p95: number;
}

export interface ImageColorStats {
  L: ChannelStats;
  a: ChannelStats;
  b: ChannelStats;
  r: ChannelStats;
  g: ChannelStats;
  bRgb: ChannelStats;
  lumaContrastRatio: number;
  edgeEnergy: number;
  histogram: {
    r: number[];
    g: number[];
    b: number[];
    luma: number[];
  };
}

export type GenericFilterMode = 'none' | 'psx' | 'anti-piss' | 'next-gen';
export type GenericFilterPresetId = GenericFilterMode;

export interface ReShadeParams {
  filterMode: GenericFilterMode;
  enabledShaders: {
    LiftGammaGain: boolean;
    Levels: boolean;
    Curves: boolean;
    Tonemap: boolean;
    Technicolor2: boolean;
    LumaSharpen: boolean;
    LUT: boolean;
    PSXDither: boolean;
    Pixelate?: boolean;
    ClarityPBR: boolean;
    UIMask?: boolean;
  };

  pixelateResolutionScale?: boolean;

  uiMaskAutoMenu?: boolean;
  uiMaskTopBar?: number;
  uiMaskHudGuard?: number;

  transferStrength: number;
  preserveLuminance: number;
  skinSkyProtection?: number;

  rgbLift: [number, number, number];
  rgbGamma: [number, number, number];
  rgbGain: [number, number, number];

  blackPoint: number;
  whitePoint: number;

  curvesMode: number;
  curvesFormula: number;
  curvesContrast: number;

  tonemapGamma: number;
  tonemapExposure: number;
  tonemapSaturation: number;
  tonemapBleach: number;
  tonemapDefog: number;
  defogColor: [number, number, number];

  technicolorColorStrength: [number, number, number];
  technicolorBrightness: number;
  technicolorSaturation: number;
  technicolorStrength: number;

  sharpStrength: number;
  sharpClamp: number;
  offsetBias: number;

  clarityStrength: number;
  vibrance: number;

  psxBitDepth: number;
  psxDitherStrength: number;
  psxPixelScale: number;
}

const PSX_BAYER_4X4: number[][] = [
  [-4, 0, -3, 1],
  [2, -2, 3, -1],
  [-3, 1, -4, 0],
  [3, -1, 2, -2],
];

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function rgbToLab(r255: number, g255: number, b255: number): LabPixel {
  let r = r255 / 255;
  let g = g255 / 255;
  let b = b255 / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

  const fx = x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116;
  const fy = y > 0.008856 ? Math.cbrt(y) : 7.787 * y + 16 / 116;
  const fz = z > 0.008856 ? Math.cbrt(z) : 7.787 * z + 16 / 116;

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function labToRgb(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const x3 = fx * fx * fx;
  const y3 = fy * fy * fy;
  const z3 = fz * fz * fz;

  const x = (x3 > 0.008856 ? x3 : (fx - 16 / 116) / 7.787) * 0.95047;
  const y = (y3 > 0.008856 ? y3 : (fy - 16 / 116) / 7.787) * 1.00000;
  const z = (z3 > 0.008856 ? z3 : (fz - 16 / 116) / 7.787) * 1.08883;

  let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let bRgb = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bRgb = bRgb > 0.0031308 ? 1.055 * Math.pow(bRgb, 1 / 2.4) - 0.055 : 12.92 * bRgb;

  return [
    Math.round(clamp(r * 255, 0, 255)),
    Math.round(clamp(g * 255, 0, 255)),
    Math.round(clamp(bRgb * 255, 0, 255)),
  ];
}

function computeArrayStats(values: Float32Array): ChannelStats {
  const n = values.length;
  if (n === 0) {
    return { mean: 0, std: 1, min: 0, max: 0, p05: 0, p50: 0, p95: 0 };
  }
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < n; i++) {
    const v = values[i];
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const mean = sum / n;
  let varianceSum = 0;
  for (let i = 0; i < n; i++) {
    const d = values[i] - mean;
    varianceSum += d * d;
  }
  const std = Math.max(0.001, Math.sqrt(varianceSum / n));

  const sorted = new Float32Array(values);
  sorted.sort();
  const p05 = sorted[Math.floor(n * 0.05)];
  const p50 = sorted[Math.floor(n * 0.50)];
  const p95 = sorted[Math.floor(n * 0.95)];

  return { mean, std, min, max, p05, p50, p95 };
}

export function analyzeImageBuffer(
  rgba: Uint8ClampedArray,
  width: number,
  height: number
): ImageColorStats {
  const totalPixels = width * height;
  const stride = Math.max(1, Math.floor(totalPixels / 16384));
  const sampleCount = Math.ceil(totalPixels / stride);

  const lArr = new Float32Array(sampleCount);
  const aArr = new Float32Array(sampleCount);
  const bArr = new Float32Array(sampleCount);
  const rArr = new Float32Array(sampleCount);
  const gArr = new Float32Array(sampleCount);
  const bRgbArr = new Float32Array(sampleCount);

  const bins = 64;
  const histR = new Array<number>(bins).fill(0);
  const histG = new Array<number>(bins).fill(0);
  const histB = new Array<number>(bins).fill(0);
  const histLuma = new Array<number>(bins).fill(0);

  let sampleIdx = 0;
  for (let i = 0; i < totalPixels; i += stride) {
    const idx = i * 4;
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];

    const lab = rgbToLab(r, g, b);
    lArr[sampleIdx] = lab.L;
    aArr[sampleIdx] = lab.a;
    bArr[sampleIdx] = lab.b;
    rArr[sampleIdx] = r;
    gArr[sampleIdx] = g;
    bRgbArr[sampleIdx] = b;
    sampleIdx++;

    const rBin = Math.min(bins - 1, Math.floor((r / 256) * bins));
    const gBin = Math.min(bins - 1, Math.floor((g / 256) * bins));
    const bBin = Math.min(bins - 1, Math.floor((b / 256) * bins));
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const lBin = Math.min(bins - 1, Math.floor((luma / 256) * bins));

    histR[rBin]++;
    histG[gBin]++;
    histB[bBin]++;
    histLuma[lBin]++;
  }

  const maxHist = Math.max(1, ...histR, ...histG, ...histB, ...histLuma);

  let edgeSum = 0;
  let edgeSamples = 0;
  const stepY = Math.max(1, Math.floor(height / 64));
  const stepX = Math.max(1, Math.floor(width / 64));
  for (let y = 1; y < height - 1; y += stepY) {
    for (let x = 1; x < width - 1; x += stepX) {
      const cIdx = (y * width + x) * 4;
      const rIdx = (y * width + (x + 1)) * 4;
      const dIdx = ((y + 1) * width + x) * 4;
      const lumaC = 0.299 * rgba[cIdx] + 0.587 * rgba[cIdx + 1] + 0.114 * rgba[cIdx + 2];
      const lumaR = 0.299 * rgba[rIdx] + 0.587 * rgba[rIdx + 1] + 0.114 * rgba[rIdx + 2];
      const lumaD = 0.299 * rgba[dIdx] + 0.587 * rgba[dIdx + 1] + 0.114 * rgba[dIdx + 2];
      edgeSum += Math.hypot(lumaR - lumaC, lumaD - lumaC) / 255;
      edgeSamples++;
    }
  }
  const edgeEnergy = edgeSamples > 0 ? edgeSum / edgeSamples : 0.05;

  const L = computeArrayStats(lArr.subarray(0, sampleIdx));
  const a = computeArrayStats(aArr.subarray(0, sampleIdx));
  const b = computeArrayStats(bArr.subarray(0, sampleIdx));
  const r = computeArrayStats(rArr.subarray(0, sampleIdx));
  const g = computeArrayStats(gArr.subarray(0, sampleIdx));
  const bRgb = computeArrayStats(bRgbArr.subarray(0, sampleIdx));

  return {
    L,
    a,
    b,
    r,
    g,
    bRgb,
    lumaContrastRatio: (L.p95 - L.p05) / 100,
    edgeEnergy,
    histogram: {
      r: histR.map((v) => v / maxHist),
      g: histG.map((v) => v / maxHist),
      b: histB.map((v) => v / maxHist),
      luma: histLuma.map((v) => v / maxHist),
    },
  };
}

export function deriveReShadeParameters(
  src: ImageColorStats,
  ref: ImageColorStats,
  transferStrength = 0.85,
  preserveLuminance = 0.20,
  enablePsxHardware = false,
  presetProfile:
    | 'default'
    | 'wasteland-remaster'
    | 'gothic-nextgen'
    | 'stylized-nextgen'
    | 'tactical-nextgen' = 'default'
): ReShadeParams {

  if (presetProfile === 'wasteland-remaster') {
    return {
      filterMode: 'none',
      enabledShaders: {
        LiftGammaGain: true,
        Levels: true,
        Curves: true,
        Tonemap: true,
        Technicolor2: false,
        LumaSharpen: true,
        LUT: true,
        PSXDither: false,
        ClarityPBR: true,
      },
      transferStrength,
      preserveLuminance,
      rgbLift: [0.97, 0.99, 1.04],
      rgbGamma: [0.96, 1.00, 1.06],
      rgbGain: [0.98, 1.01, 1.06],
      blackPoint: 5,
      whitePoint: 251,
      curvesMode: 0,
      curvesFormula: 4,
      curvesContrast: 0.16,
      tonemapGamma: 0.99,
      tonemapExposure: 0.01,
      tonemapSaturation: 0.10,
      tonemapBleach: 0.0,
      tonemapDefog: 0.045,
      defogColor: [0.84, 0.74, 0.22],
      technicolorColorStrength: [0.38, 0.38, 0.38],
      technicolorBrightness: 1.0,
      technicolorSaturation: 1.04,
      technicolorStrength: 0.0,
      sharpStrength: 1.10,
      sharpClamp: 0.036,
      offsetBias: 1.0,
      clarityStrength: 0.36,
      vibrance: 0.24,
      psxBitDepth: 8,
      psxDitherStrength: 0.0,
      psxPixelScale: 1,
    };
  }

  if (presetProfile === 'gothic-nextgen') {
    return {
      filterMode: 'none',
      enabledShaders: {
        LiftGammaGain: true,
        Levels: true,
        Curves: true,
        Tonemap: true,
        Technicolor2: false,
        LumaSharpen: true,
        LUT: true,
        PSXDither: false,
        ClarityPBR: true,
      },
      transferStrength,
      preserveLuminance,
      rgbLift: [0.97, 0.99, 1.03],
      rgbGamma: [0.96, 0.99, 1.05],
      rgbGain: [0.99, 1.01, 1.05],
      blackPoint: 5,
      whitePoint: 250,
      curvesMode: 0,
      curvesFormula: 4,
      curvesContrast: 0.18,
      tonemapGamma: 1.00,
      tonemapExposure: 0.01,
      tonemapSaturation: 0.08,
      tonemapBleach: 0.0,
      tonemapDefog: 0.040,
      defogColor: [0.80, 0.72, 0.26],
      technicolorColorStrength: [0.38, 0.38, 0.38],
      technicolorBrightness: 1.0,
      technicolorSaturation: 1.04,
      technicolorStrength: 0.0,
      sharpStrength: 1.15,
      sharpClamp: 0.038,
      offsetBias: 1.0,
      clarityStrength: 0.40,
      vibrance: 0.20,
      psxBitDepth: 8,
      psxDitherStrength: 0.0,
      psxPixelScale: 1,
    };
  }

  if (presetProfile === 'stylized-nextgen') {
    return {
      filterMode: 'none',
      enabledShaders: {
        LiftGammaGain: true,
        Levels: true,
        Curves: true,
        Tonemap: true,
        Technicolor2: false,
        LumaSharpen: true,
        LUT: false,
        PSXDither: false,
        ClarityPBR: true,
      },
      transferStrength: 0.0,
      preserveLuminance: 0.85,
      rgbLift: [0.97, 0.99, 1.03],
      rgbGamma: [0.98, 1.01, 1.04],
      rgbGain: [1.01, 1.02, 1.04],
      blackPoint: 4,
      whitePoint: 252,
      curvesMode: 2,
      curvesFormula: 4,
      curvesContrast: 0.16,
      tonemapGamma: 0.99,
      tonemapExposure: 0.01,
      tonemapSaturation: 0.12,
      tonemapBleach: 0.0,
      tonemapDefog: 0.035,
      defogColor: [0.76, 0.74, 0.28],
      technicolorColorStrength: [0.35, 0.35, 0.35],
      technicolorBrightness: 1.0,
      technicolorSaturation: 1.05,
      technicolorStrength: 0.0,
      sharpStrength: 0.95,
      sharpClamp: 0.032,
      offsetBias: 1.0,
      clarityStrength: 0.38,
      vibrance: 0.28,
      psxBitDepth: 8,
      psxDitherStrength: 0.0,
      psxPixelScale: 1,
    };
  }

  if (presetProfile === 'tactical-nextgen') {
    return {
      filterMode: 'none',
      enabledShaders: {
        LiftGammaGain: true,
        Levels: true,
        Curves: true,
        Tonemap: true,
        Technicolor2: false,
        LumaSharpen: true,
        LUT: false,
        PSXDither: false,
        ClarityPBR: true,
      },
      transferStrength: 0.0,
      preserveLuminance: 0.85,
      rgbLift: [0.98, 0.99, 1.02],
      rgbGamma: [0.96, 1.00, 1.05],
      rgbGain: [0.98, 1.01, 1.05],
      blackPoint: 4,
      whitePoint: 251,
      curvesMode: 0,
      curvesFormula: 4,
      curvesContrast: 0.15,
      tonemapGamma: 0.99,
      tonemapExposure: 0.01,
      tonemapSaturation: 0.05,
      tonemapBleach: 0.0,
      tonemapDefog: 0.055,
      defogColor: [0.82, 0.74, 0.24],
      technicolorColorStrength: [0.4, 0.4, 0.4],
      technicolorBrightness: 1.0,
      technicolorSaturation: 1.0,
      technicolorStrength: 0.0,
      sharpStrength: 1.05,
      sharpClamp: 0.035,
      offsetBias: 1.0,
      clarityStrength: 0.42,
      vibrance: 0.20,
      psxBitDepth: 8,
      psxDitherStrength: 0.0,
      psxPixelScale: 1,
    };
  }

  const lP05Delta = ref.L.p05 - src.L.p05;
  const lP95Delta = ref.L.p95 - src.L.p95;

  const blackPoint = Math.round(clamp(Math.max(0, -lP05Delta * 0.25), 0, 16));
  const whitePoint = Math.round(clamp(255 - Math.max(0, -lP95Delta * 0.25), 235, 255));

  const calcLift = (s: ChannelStats, t: ChannelStats) =>
    Number(clamp(1.0 + ((t.p05 - s.p05) / 255) * 0.28 * transferStrength, 0.86, 1.14).toFixed(3));
  const calcGain = (s: ChannelStats, t: ChannelStats) =>
    Number(clamp(1.0 + ((t.p95 - s.p95) / 255) * 0.28 * transferStrength, 0.86, 1.16).toFixed(3));
  const calcGamma = (s: ChannelStats, t: ChannelStats) =>
    Number(clamp(1.0 + ((t.mean - s.mean) / 255) * 0.24 * transferStrength, 0.88, 1.14).toFixed(3));

  const rgbLift: [number, number, number] = [
    calcLift(src.r, ref.r),
    calcLift(src.g, ref.g),
    calcLift(src.bRgb, ref.bRgb),
  ];
  const rgbGamma: [number, number, number] = [
    calcGamma(src.r, ref.r),
    calcGamma(src.g, ref.g),
    calcGamma(src.bRgb, ref.bRgb),
  ];
  const rgbGain: [number, number, number] = [
    calcGain(src.r, ref.r),
    calcGain(src.g, ref.g),
    calcGain(src.bRgb, ref.bRgb),
  ];

  const stdRatioL = ref.L.std / Math.max(1, src.L.std);
  const curvesContrast = Number(
    clamp((stdRatioL - 1.0) * 0.45 * transferStrength + (enablePsxHardware ? 0.18 : 0.08), -0.45, 0.55).toFixed(3)
  );

  const lMeanDelta = (ref.L.mean - src.L.mean) * (1 - preserveLuminance);
  const tonemapExposure = Number(clamp((lMeanDelta / 150) * transferStrength, -0.25, 0.25).toFixed(3));
  const tonemapGamma = Number(clamp(1.0 - (lMeanDelta / 300) * transferStrength, 0.88, 1.14).toFixed(3));

  const srcChroma = Math.hypot(src.a.std, src.b.std);
  const refChroma = Math.hypot(ref.a.std, ref.b.std);
  const chromaRatio = refChroma / Math.max(1, srcChroma);
  const tonemapSaturation = Number(
    clamp((chromaRatio - 1.0) * 0.45 * transferStrength + (enablePsxHardware ? 0.22 : 0), -0.45, 0.65).toFixed(3)
  );
  const tonemapBleach = Number(
    clamp(chromaRatio < 0.9 ? (0.9 - chromaRatio) * 0.3 : 0.02, 0, 0.35).toFixed(3)
  );

  const [tintR, tintG, tintB] = labToRgb(65, ref.a.mean - src.a.mean, ref.b.mean - src.b.mean);
  const defogColor: [number, number, number] = [
    Number((tintR / 255).toFixed(3)),
    Number((tintG / 255).toFixed(3)),
    Number((tintB / 255).toFixed(3)),
  ];
  const tonemapDefog = Number(
    clamp((Math.hypot(ref.a.mean - src.a.mean, ref.b.mean - src.b.mean) / 220) * 0.05, 0, 0.07).toFixed(3)
  );

  const meanSum = Math.max(1, ref.r.mean + ref.g.mean + ref.bRgb.mean);
  const technicolorColorStrength: [number, number, number] = [
    Number(clamp(1.0 - (ref.r.mean / meanSum) * 1.8, 0.15, 0.85).toFixed(3)),
    Number(clamp(1.0 - (ref.g.mean / meanSum) * 1.8, 0.15, 0.85).toFixed(3)),
    Number(clamp(1.0 - (ref.bRgb.mean / meanSum) * 1.8, 0.15, 0.85).toFixed(3)),
  ];
  const technicolorSaturation = Number(clamp(0.95 + chromaRatio * 0.15, 0.75, 1.35).toFixed(3));
  const technicolorBrightness = Number(clamp(0.98 + (ref.L.mean / 100) * 0.1, 0.9, 1.15).toFixed(3));
  const technicolorStrength = Number(clamp(0.14 * transferStrength, 0.0, 0.5).toFixed(3));

  const edgeRatio = ref.edgeEnergy / Math.max(0.01, src.edgeEnergy);
  const sharpStrength = Number(clamp(0.85 + (edgeRatio - 1.0) * 0.85, 0.35, 2.4).toFixed(2));
  const sharpClamp = Number(clamp(0.038 + (edgeRatio - 1.0) * 0.015, 0.015, 0.085).toFixed(3));

  return {
    filterMode: 'none',
    enabledShaders: {
      LiftGammaGain: true,
      Levels: true,
      Curves: true,
      Tonemap: true,
      Technicolor2: true,
      LumaSharpen: true,
      LUT: true,
      PSXDither: enablePsxHardware,
      Pixelate: enablePsxHardware,
      ClarityPBR: false,
      UIMask: true,
    },
    pixelateResolutionScale: true,
    uiMaskAutoMenu: true,
    uiMaskTopBar: 0.072,
    uiMaskHudGuard: 0.80,
    transferStrength,
    preserveLuminance,
    skinSkyProtection: enablePsxHardware ? 0.25 : 0.65,
    rgbLift,
    rgbGamma,
    rgbGain,
    blackPoint: enablePsxHardware ? Math.max(8, blackPoint) : blackPoint,
    whitePoint,
    curvesMode: 0,
    curvesFormula: 4,
    curvesContrast,
    tonemapGamma,
    tonemapExposure,
    tonemapSaturation,
    tonemapBleach,
    tonemapDefog,
    defogColor,
    technicolorColorStrength,
    technicolorBrightness,
    technicolorSaturation,
    technicolorStrength,
    sharpStrength: enablePsxHardware ? 1.15 : sharpStrength,
    sharpClamp,
    offsetBias: 1.0,
    clarityStrength: 0.0,
    vibrance: 0.0,
    psxBitDepth: 5,
    psxDitherStrength: enablePsxHardware ? 0.62 : 0.0,
    psxPixelScale: enablePsxHardware ? 2.55 : 1.0,
  };
}

export function buildGenericFilterParams(
  mode: 'psx' | 'anti-piss' | 'next-gen',
  src: ImageColorStats
): ReShadeParams {
  if (mode === 'psx') {
    return {
      filterMode: 'psx',
      enabledShaders: {
        LiftGammaGain: true,
        Levels: true,
        Curves: true,
        Tonemap: true,
        Technicolor2: false,
        LumaSharpen: true,
        LUT: false,
        PSXDither: true,
        Pixelate: true,
        ClarityPBR: false,
        UIMask: true,
      },
      pixelateResolutionScale: true,
      uiMaskAutoMenu: true,
      uiMaskTopBar: 0.072,
      uiMaskHudGuard: 0.80,
      transferStrength: 0.0,
      preserveLuminance: 0.5,
      skinSkyProtection: 0.25,
      rgbLift: [0.96, 0.96, 0.98],
      rgbGamma: [1.02, 1.04, 1.03],
      rgbGain: [1.08, 1.11, 1.12],
      blackPoint: 10,
      whitePoint: 244,
      curvesMode: 0,
      curvesFormula: 4,
      curvesContrast: 0.28,
      tonemapGamma: 0.96,
      tonemapExposure: 0.05,
      tonemapSaturation: 0.42,
      tonemapBleach: 0.0,
      tonemapDefog: 0.0,
      defogColor: [0.5, 0.5, 0.5],
      technicolorColorStrength: [0.4, 0.4, 0.4],
      technicolorBrightness: 1.0,
      technicolorSaturation: 1.1,
      technicolorStrength: 0.0,
      sharpStrength: 1.20,
      sharpClamp: 0.048,
      offsetBias: 1.0,
      clarityStrength: 0.0,
      vibrance: 0.25,
      psxBitDepth: 5,
      psxDitherStrength: 0.62,
      psxPixelScale: 2.55,
    };
  }

  if (mode === 'anti-piss') {
    const yellowExcess = clamp(src.b.mean / 24, 0.15, 0.75);
    const greenRedExcess = clamp((src.r.mean - src.bRgb.mean) / 80, 0.1, 0.65);

    return {
      filterMode: 'anti-piss',
      enabledShaders: {
        LiftGammaGain: true,
        Levels: true,
        Curves: true,
        Tonemap: true,
        Technicolor2: false,
        LumaSharpen: true,
        LUT: false,
        PSXDither: false,
        Pixelate: false,
        ClarityPBR: true,
      },
      pixelateResolutionScale: true,
      transferStrength: 0.0,
      preserveLuminance: 0.5,
      skinSkyProtection: 0.65,
      rgbLift: [
        Number((0.98 - greenRedExcess * 0.02).toFixed(3)),
        Number((0.99 - yellowExcess * 0.015).toFixed(3)),
        Number((1.02 + yellowExcess * 0.03).toFixed(3)),
      ],
      rgbGamma: [
        Number((0.97 - greenRedExcess * 0.03).toFixed(3)),
        Number((0.99 - yellowExcess * 0.01).toFixed(3)),
        Number((1.04 + yellowExcess * 0.045).toFixed(3)),
      ],
      rgbGain: [
        Number((0.98 - greenRedExcess * 0.025).toFixed(3)),
        Number((1.00).toFixed(3)),
        Number((1.05 + yellowExcess * 0.05).toFixed(3)),
      ],
      blackPoint: 4,
      whitePoint: 252,
      curvesMode: 0,
      curvesFormula: 4,
      curvesContrast: 0.12,
      tonemapGamma: 0.99,
      tonemapExposure: 0.01,
      tonemapSaturation: 0.02,
      tonemapBleach: 0.0,
      tonemapDefog: Number(clamp(0.03 + yellowExcess * 0.035, 0.03, 0.07).toFixed(3)),
      defogColor: [0.82, 0.74, 0.24],
      technicolorColorStrength: [0.4, 0.4, 0.4],
      technicolorBrightness: 1.0,
      technicolorSaturation: 1.0,
      technicolorStrength: 0.0,
      sharpStrength: 0.90,
      sharpClamp: 0.032,
      offsetBias: 1.0,
      clarityStrength: 0.28,
      vibrance: 0.14,
      psxBitDepth: 8,
      psxDitherStrength: 0.0,
      psxPixelScale: 1,
    };
  }

  const yellowCast = clamp(Math.max(0, src.b.mean) / 28, 0.0, 0.65);
  return {
    filterMode: 'next-gen',
    enabledShaders: {
      LiftGammaGain: true,
      Levels: true,
      Curves: true,
      Tonemap: true,
      Technicolor2: false,
      LumaSharpen: true,
      LUT: false,
      PSXDither: false,
      Pixelate: false,
      ClarityPBR: true,
    },
    pixelateResolutionScale: true,
    transferStrength: 0.0,
    preserveLuminance: 0.5,
    skinSkyProtection: 0.65,
    rgbLift: [0.97, 0.99, 1.03],
    rgbGamma: [
      Number((0.98 - yellowCast * 0.025).toFixed(3)),
      Number((1.00 - yellowCast * 0.01).toFixed(3)),
      Number((1.03 + yellowCast * 0.035).toFixed(3)),
    ],
    rgbGain: [
      Number((1.00 - yellowCast * 0.02).toFixed(3)),
      Number((1.01).toFixed(3)),
      Number((1.03 + yellowCast * 0.04).toFixed(3)),
    ],
    blackPoint: 4,
    whitePoint: 252,
    curvesMode: 2,
    curvesFormula: 4,
    curvesContrast: 0.16,
    tonemapGamma: 0.99,
    tonemapExposure: 0.01,
    tonemapSaturation: 0.08,
    tonemapBleach: 0.0,
    tonemapDefog: Number((0.02 + yellowCast * 0.03).toFixed(3)),
    defogColor: [0.78, 0.72, 0.30],
    technicolorColorStrength: [0.35, 0.35, 0.35],
    technicolorBrightness: 1.0,
    technicolorSaturation: 1.05,
    technicolorStrength: 0.0,
    sharpStrength: 1.00,
    sharpClamp: 0.035,
    offsetBias: 1.0,
    clarityStrength: 0.38,
    vibrance: 0.24,
    psxBitDepth: 8,
    psxDitherStrength: 0.0,
    psxPixelScale: 1,
  };
}

export function applyPsxHardwareQuantization(
  r255: number,
  g255: number,
  b255: number,
  x: number,
  y: number,
  bitDepth: number,
  ditherStrength: number,
  pixelScale = 1
): [number, number, number] {
  if (bitDepth >= 8 && ditherStrength <= 0.001) {
    return [r255, g255, b255];
  }
  const bx = Math.floor(x / Math.max(1, pixelScale)) & 3;
  const by = Math.floor(y / Math.max(1, pixelScale)) & 3;

  const ditherOffset = PSX_BAYER_4X4[by][bx] * ditherStrength * 1.00;

  const levels = Math.pow(2, clamp(bitDepth, 4, 8)) - 1;
  const step = 255 / levels;

  const quantize = (c: number) => {
    const dithered = clamp(c + ditherOffset, 0, 255);
    return Math.round(Math.round(dithered / step) * step);
  };

  return [quantize(r255), quantize(g255), quantize(b255)];
}

export function transformPixelThroughPipeline(
  r255: number,
  g255: number,
  b255: number,
  src: ImageColorStats,
  ref: ImageColorStats,
  params: ReShadeParams
): [number, number, number] {
  let r = r255;
  let g = g255;
  let b = b255;

  const hasLutTransfer = params.enabledShaders.LUT && params.transferStrength > 0;
  const preserveLuma = clamp(params.preserveLuminance, 0, 1);
  const skinSkyProt = clamp(
    params.skinSkyProtection ?? (params.enabledShaders.PSXDither ? 0.25 : 0.65),
    0,
    1
  );

  const lumaAnalyticalDamp = hasLutTransfer ? 1.0 - preserveLuma * 0.72 : 1.0;

  const analyticalWeight = hasLutTransfer
    ? params.enabledShaders.ClarityPBR
      ? 0.48
      : 0.35
    : params.enabledShaders.ClarityPBR
    ? 0.90
    : 1.0;

  if (hasLutTransfer) {
    const lab = rgbToLab(r, g, b);
    const isPsx = params.enabledShaders.PSXDither;
    const scaleL = clamp(
      Math.max(1.0, ref.L.std) / Math.max(1.0, src.L.std),
      isPsx ? 0.45 : 0.76,
      isPsx ? 2.6 : 1.24
    );
    const scaleA = clamp(
      Math.max(1.0, ref.a.std) / Math.max(1.0, src.a.std),
      isPsx ? 0.45 : 0.72,
      isPsx ? 3.4 : 1.38
    );
    const scaleB = clamp(
      Math.max(1.0, ref.b.std) / Math.max(1.0, src.b.std),
      isPsx ? 0.45 : 0.72,
      isPsx ? 3.4 : 1.38
    );

    const targetL = (lab.L - src.L.mean) * scaleL + ref.L.mean;
    const meanShiftWeight = isPsx ? 1.0 : 0.86;
    const targetA =
      (lab.a - src.a.mean) * scaleA +
      (src.a.mean + (ref.a.mean - src.a.mean) * meanShiftWeight);
    const targetB =
      (lab.b - src.b.mean) * scaleB +
      (src.b.mean + (ref.b.mean - src.b.mean) * meanShiftWeight);

    const highlightRollOff =
      lab.L > 72
        ? clamp(1.0 - ((lab.L - 72) / 28) * (0.45 + 0.50 * skinSkyProt), 0.12, 1.0)
        : 1.0;

    const isSkinCluster =
      lab.L >= 28 &&
      lab.L <= 86 &&
      lab.a >= 4 &&
      lab.a <= 28 &&
      lab.b >= 6 &&
      lab.b <= 38;

    const isSkyCluster = lab.L >= 48 && lab.b < -5 && Math.abs(lab.a) < 22;

    const clusterGuard =
      isSkinCluster || isSkyCluster ? 1.0 - skinSkyProt * 0.52 : 1.0;

    const lMix =
      params.transferStrength *
      (1 - preserveLuma) *
      (lab.L > 80 ? clamp(1.0 - ((lab.L - 80) / 20) * skinSkyProt * 0.75, 0.2, 1.0) : 1.0);
    const abMix = params.transferStrength * highlightRollOff * clusterGuard;

    let finalL = clamp(lab.L * (1 - lMix) + targetL * lMix, 0, 100);
    let finalA = clamp(lab.a * (1 - abMix) + targetA * abMix, -128, 127);
    let finalB = clamp(lab.b * (1 - abMix) + targetB * abMix, -128, 127);

    if (skinSkyProt > 0.05) {
      const maxChroma = 102 - skinSkyProt * 26 - (finalL > 80 ? (finalL - 80) * 1.4 * skinSkyProt : 0);
      const chroma = Math.hypot(finalA, finalB);
      if (chroma > maxChroma && chroma > 0.001) {
        const ratio = Math.max(12, maxChroma) / chroma;
        finalA *= ratio;
        finalB *= ratio;
      }
      if (preserveLuma > 0.85) {
        finalL = lab.L * preserveLuma + finalL * (1 - preserveLuma);
      }
    }

    const transferred = labToRgb(finalL, finalA, finalB);
    r = transferred[0];
    g = transferred[1];
    b = transferred[2];
  }

  let rf = r / 255;
  let gf = g / 255;
  let bf = b / 255;

  const effLumaWeight = analyticalWeight * lumaAnalyticalDamp;

  if (params.enabledShaders.Levels) {
    const bp = (params.blackPoint / 255) * effLumaWeight;
    const wp = 1.0 - (1.0 - params.whitePoint / 255) * effLumaWeight;
    const span = Math.max(0.05, wp - bp);
    rf = clamp((rf - bp) / span, 0, 1);
    gf = clamp((gf - bp) / span, 0, 1);
    bf = clamp((bf - bp) / span, 0, 1);
  }

  if (params.enabledShaders.LiftGammaGain) {
    const applyLGG = (c: number, liftRaw: number, gammaRaw: number, gainRaw: number) => {
      const lift = 1.0 + (liftRaw - 1.0) * effLumaWeight;
      const gamma = 1.0 + (gammaRaw - 1.0) * effLumaWeight;
      const gain = 1.0 + (gainRaw - 1.0) * effLumaWeight;
      const lifted = c * (1.5 - 0.5 * lift) + 0.5 * lift - 0.5;
      const gained = clamp(lifted, 0, 1) * gain;
      return Math.pow(clamp(gained, 0, 1), 1.0 / Math.max(0.2, gamma));
    };
    rf = applyLGG(rf, params.rgbLift[0], params.rgbGamma[0], params.rgbGain[0]);
    gf = applyLGG(gf, params.rgbLift[1], params.rgbGamma[1], params.rgbGain[1]);
    bf = applyLGG(bf, params.rgbLift[2], params.rgbGamma[2], params.rgbGain[2]);
  }

  if (params.enabledShaders.Curves && Math.abs(params.curvesContrast) > 0.001) {
    const effContrast = params.curvesContrast * effLumaWeight;
    const applyCurve = (x: number) => {
      const sCurve = x * x * (3.0 - 2.0 * x);
      return clamp(x + (sCurve - x) * effContrast, 0, 1);
    };
    rf = applyCurve(rf);
    gf = applyCurve(gf);
    bf = applyCurve(bf);
  }

  if (params.enabledShaders.Tonemap) {
    const defogAmt = params.tonemapDefog * effLumaWeight;
    rf = clamp(rf - defogAmt * params.defogColor[0], 0, 1);
    gf = clamp(gf - defogAmt * params.defogColor[1], 0, 1);
    bf = clamp(bf - defogAmt * params.defogColor[2], 0, 1);

    const expScale = Math.pow(2.0, params.tonemapExposure * 0.5 * effLumaWeight);
    const effGamma = 1.0 + (params.tonemapGamma - 1.0) * effLumaWeight;
    rf = Math.pow(clamp(rf * expScale, 0, 1), effGamma);
    gf = Math.pow(clamp(gf * expScale, 0, 1), effGamma);
    bf = Math.pow(clamp(bf * expScale, 0, 1), effGamma);

    const luma = 0.2126 * rf + 0.7152 * gf + 0.0722 * bf;
    const satMult = 1.0 + params.tonemapSaturation * 0.5 * analyticalWeight;
    rf = clamp(luma + (rf - luma) * satMult, 0, 1);
    gf = clamp(luma + (gf - luma) * satMult, 0, 1);
    bf = clamp(luma + (bf - luma) * satMult, 0, 1);
  }

  if (params.enabledShaders.ClarityPBR && Math.abs(params.vibrance) > 0.001) {
    const maxC = Math.max(rf, gf, bf);
    const minC = Math.min(rf, gf, bf);
    const sat = maxC - minC;
    const luma = 0.2126 * rf + 0.7152 * gf + 0.0722 * bf;
    const midtoneMask = 4.0 * luma * (1.0 - luma);
    const vibBoost = 1.0 + params.vibrance * 0.45 * (1.0 - sat) * (0.35 + 0.65 * midtoneMask);
    rf = clamp(luma + (rf - luma) * vibBoost, 0, 1);
    gf = clamp(luma + (gf - luma) * vibBoost, 0, 1);
    bf = clamp(luma + (bf - luma) * vibBoost, 0, 1);
  }

  if (params.enabledShaders.Technicolor2 && params.technicolorStrength > 0.001) {
    const effTech = params.technicolorStrength * analyticalWeight;
    const tr = clamp(rf * (1.0 - params.technicolorColorStrength[0] * 0.25) * params.technicolorBrightness, 0, 1);
    const tg = clamp(gf * (1.0 - params.technicolorColorStrength[1] * 0.25) * params.technicolorBrightness, 0, 1);
    const tb = clamp(bf * (1.0 - params.technicolorColorStrength[2] * 0.25) * params.technicolorBrightness, 0, 1);
    rf = rf * (1 - effTech) + tr * effTech;
    gf = gf * (1 - effTech) + tg * effTech;
    bf = bf * (1 - effTech) + tb * effTech;
  }

  return [
    Math.round(clamp(rf * 255, 0, 255)),
    Math.round(clamp(gf * 255, 0, 255)),
    Math.round(clamp(bf * 255, 0, 255)),
  ];
}

export function generate3DLutRgba(
  src: ImageColorStats,
  ref: ImageColorStats,
  params: ReShadeParams
): { width: number; height: number; data: Uint8ClampedArray } {
  const size = 32;
  const width = size * size;
  const height = size;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let bSlice = 0; bSlice < size; bSlice++) {
    const bVal = Math.round((bSlice / (size - 1)) * 255);
    for (let gRow = 0; gRow < size; gRow++) {
      const gVal = Math.round((gRow / (size - 1)) * 255);
      for (let rCol = 0; rCol < size; rCol++) {
        const rVal = Math.round((rCol / (size - 1)) * 255);
        const [outR, outG, outB] = transformPixelThroughPipeline(
          rVal,
          gVal,
          bVal,
          src,
          ref,
          params
        );
        const x = bSlice * size + rCol;
        const y = gRow;
        const idx = (y * width + x) * 4;
        data[idx] = outR;
        data[idx + 1] = outG;
        data[idx + 2] = outB;
        data[idx + 3] = 255;
      }
    }
  }

  return { width, height, data };
}

export function compileReShadeIni(
  presetName: string,
  params: ReShadeParams,
  src: ImageColorStats,
  ref: ImageColorStats
): string {
  const uiMaskActive = params.enabledShaders.UIMask !== false;
  const uiAutoMenu = params.uiMaskAutoMenu !== false ? 1 : 0;
  const uiTopBar = params.uiMaskTopBar ?? 0.072;
  const uiHudGuard = params.uiMaskHudGuard ?? 0.80;
  const pixelateActive =
    (params.enabledShaders.Pixelate ?? params.enabledShaders.PSXDither) &&
    params.psxPixelScale > 1;
  const resScaleActive = params.pixelateResolutionScale !== false ? 1 : 0;

  const activeTechniques: string[] = [];
  if (uiMaskActive) activeTechniques.push('KeepUI_Pre@UIMask.fx');
  if (params.enabledShaders.ClarityPBR) activeTechniques.push('Clarity@Clarity.fx');
  if (params.enabledShaders.LumaSharpen) activeTechniques.push('LumaSharpen@LumaSharpen.fx');
  if (pixelateActive) activeTechniques.push('Pixelate@Pixelate.fx');
  activeTechniques.push('LUT@LUT.fx');
  if (params.enabledShaders.PSXDither) activeTechniques.push('Dither@Dither.fx');
  if (uiMaskActive) activeTechniques.push('KeepUI_Post@UIMask.fx');

  const sortingOrder: string[] = [
    'KeepUI_Pre@UIMask.fx',
    'Clarity@Clarity.fx',
    'LumaSharpen@LumaSharpen.fx',
    'Pixelate@Pixelate.fx',
    'LUT@LUT.fx',
    'Dither@Dither.fx',
    'KeepUI_Post@UIMask.fx',
    'Levels@Levels.fx',
    'LiftGammaGain@LiftGammaGain.fx',
    'Curves@Curves.fx',
    'Tonemap@Tonemap.fx',
    'Vibrance@Vibrance.fx',
    'Technicolor2@Technicolor2.fx',
  ];

  const f3 = (arr: [number, number, number]) =>
    `${arr[0].toFixed(6)},${arr[1].toFixed(6)},${arr[2].toFixed(6)}`;

  const psxEnabled = params.enabledShaders.PSXDither ? 1 : 0;
  const effPsxScale = pixelateActive ? Math.max(1.0, params.psxPixelScale) : 1.0;
  const effPsxBits = params.enabledShaders.PSXDither ? params.psxBitDepth : 8;
  const effPsxDither = params.enabledShaders.PSXDither ? params.psxDitherStrength : 0.0;

  return `; Spet's ReShade Studio
; Preset: ${presetName}
; Install: Place SpetLUT.png inside reshade-shaders/Textures/ and Preset.ini in the game root folder
; Mode: ${params.filterMode === 'none' ? 'CIE LAB Reference Match' : params.filterMode.toUpperCase()}
; Source L* Mean/Std: ${src.L.mean.toFixed(2)} / ${src.L.std.toFixed(2)} | Target L* Mean/Std: ${ref.L.mean.toFixed(2)} / ${ref.L.std.toFixed(2)}

PreprocessorDefinitions=fLUT_TextureName="SpetLUT.png",fLUT_TileSizeXY=32,fLUT_TileAmount=32,SPET_LUT_BAKED_PIPELINE=1,SPET_PSX_ENABLE=${psxEnabled},SPET_PIXELATE_ACTIVE=${pixelateActive ? 1 : 0},SPET_PSX_SCALE=${effPsxScale.toFixed(2)},SPET_PSX_BITS=${effPsxBits},SPET_RES_SCALE=${resScaleActive},SPET_LUT_HANDLES_PSX=1,SPET_SHADER_REV=8
Techniques=${activeTechniques.join(',')}
TechniqueSorting=${sortingOrder.join(',')}

[UIMask.fx]
iUIMask_Enable=${uiMaskActive ? 1 : 0}
iUIMask_AutoMenuBypass=${uiAutoMenu}
fUIMask_TopBarHeight=${uiTopBar.toFixed(6)}
fUIMask_BottomBarHeight=0.000000
iUIMask_PillarboxGuard=1
iUIMask_HudProtection=${uiHudGuard > 0.01 ? 1 : 0}
fUIMask_TextSharpnessThreshold=${uiHudGuard.toFixed(6)}

[Pixelate.fx]
iPixelate_Enable=${pixelateActive ? 1 : 0}
fPixelate_CellSize=${effPsxScale.toFixed(6)}
iPixelate_CellSize=${effPsxScale.toFixed(6)}
iPixelate_ResolutionScale=${resScaleActive}

[LUT.fx]
fLUT_AmountChroma=1.000000
fLUT_AmountLuma=1.000000
fLUT_PixelScale=${effPsxScale.toFixed(6)}
iLUT_PixelScale=${effPsxScale.toFixed(6)}
iLUT_ResolutionScale=${resScaleActive}
iLUT_BitDepth=${effPsxBits}
fLUT_DitherStrength=${effPsxDither.toFixed(6)}

[Levels.fx]
BlackPoint=${params.blackPoint}
WhitePoint=${params.whitePoint}
HighlightClipping=0

[LiftGammaGain.fx]
RGB_Lift=${f3(params.rgbLift)}
RGB_Gamma=${f3(params.rgbGamma)}
RGB_Gain=${f3(params.rgbGain)}

[Curves.fx]
Mode=${params.curvesMode}
Formula=${params.curvesFormula}
Contrast=${params.curvesContrast.toFixed(6)}

[Tonemap.fx]
Gamma=${params.tonemapGamma.toFixed(6)}
Exposure=${params.tonemapExposure.toFixed(6)}
Saturation=${params.tonemapSaturation.toFixed(6)}
Bleach=${params.tonemapBleach.toFixed(6)}
Defog=${params.tonemapDefog.toFixed(6)}
FogColor=${f3(params.defogColor)}

[Clarity.fx]
ClarityRadius=3
ClarityBlendMode=2
ClarityStrength=${params.clarityStrength.toFixed(6)}
ClarityDarkIntensity=0.450000
ClarityLightIntensity=0.450000

[Vibrance.fx]
Vibrance=${params.vibrance.toFixed(6)}

[Technicolor2.fx]
ColorStrength=${f3(params.technicolorColorStrength)}
Brightness=${params.technicolorBrightness.toFixed(6)}
Saturation=${params.technicolorSaturation.toFixed(6)}
Strength=${params.technicolorStrength.toFixed(6)}

[Dither.fx]
fDitherBitDepth=${params.psxBitDepth}
fDitherStrength=${params.psxDitherStrength.toFixed(6)}
fDitherPixelScale=${effPsxScale.toFixed(6)}
iDitherPixelScale=${effPsxScale.toFixed(6)}
iDitherResolutionScale=${resScaleActive}

[LumaSharpen.fx]
sharp_strength=${params.sharpStrength.toFixed(6)}
sharp_clamp=${params.sharpClamp.toFixed(6)}
pattern=1
offset_bias=${params.offsetBias.toFixed(6)}
show_sharpen=0
`;
}
