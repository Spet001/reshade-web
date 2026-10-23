/**
 * Practical Game Comparison Preset & Generic Filter Definitions
 */

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PresetProfileId =
  | 'default'
  | 'wasteland-remaster'
  | 'gothic-nextgen'
  | 'stylized-nextgen'
  | 'tactical-nextgen';

export interface PracticalCasePreset {
  id: string;
  shortTitle: string;
  chipLabel: string;
  sourceTitle: string;
  targetTitle: string;
  sourceUrl: string;
  targetUrl: string;
  sourceCrop?: CropRect;
  targetCrop?: CropRect;
  enablePsxHardware: boolean;
  presetProfile: PresetProfileId;
  defaultTransferStrength: number;
  defaultPreserveLuma: number;
  iniFileName: string;
  technicalNote: string;
}

export const PRACTICAL_CASE_PRESETS: PracticalCasePreset[] = [
  {
    id: 'sparky-to-dalmatians-ps1',
    shortTitle: 'Sparky Rush → 101 Dalmatians (PS1)',
    chipLabel: 'sparky_ps1 · RGB555',
    sourceTitle: 'Sparky Rush',
    targetTitle: '101 Dalmatians (PS1)',
    sourceUrl: './assets/aistudio/image_87bffab5.png',
    targetUrl: './assets/aistudio/image_8553d7da.png',
    sourceCrop: { x: 0.155, y: 0.072, w: 0.69, h: 0.918 },
    enablePsxHardware: true,
    presetProfile: 'default',
    defaultTransferStrength: 0.92,
    defaultPreserveLuma: 0.15,
    iniFileName: 'SparkyRush_TruePS1_Dalmatians.ini',
    technicalNote:
      'CIE LAB Reinhard color match + 15-bit RGB555 quantization & 4×4 Ordered Bayer GPU dithering.',
  },
  {
    id: 'fnv-to-fo4-wasteland',
    shortTitle: 'Fallout: New Vegas → Fallout 4',
    chipLabel: 'fnv_fo4 · Anti-Amber LUT',
    sourceTitle: 'Fallout: New Vegas',
    targetTitle: 'Fallout 4',
    sourceUrl: './assets/games/fnv_source.jpg',
    targetUrl: './assets/games/fo4_target.jpg',
    enablePsxHardware: false,
    presetProfile: 'wasteland-remaster',
    defaultTransferStrength: 0.84,
    defaultPreserveLuma: 0.68,
    iniFileName: 'FNV_Commonwealth_Daylight_FO4.ini',
    technicalNote:
      'Strips 7th-gen Mojave amber/ochre tint via CIE LAB transfer + Tonemap Defog and restores clean Commonwealth sky & asphalt micro-contrast.',
  },
  {
    id: 'ds3-to-eldenring-gothic',
    shortTitle: 'Dark Souls III → Elden Ring',
    chipLabel: 'ds3_er · Gothic Slate LUT',
    sourceTitle: 'Dark Souls III',
    targetTitle: 'Elden Ring',
    sourceUrl: './assets/games/ds3_source.jpg',
    targetUrl: './assets/games/er_target.jpg',
    enablePsxHardware: false,
    presetProfile: 'gothic-nextgen',
    defaultTransferStrength: 0.82,
    defaultPreserveLuma: 0.70,
    iniFileName: 'DS3_Stormveil_Gothic_EldenRing.ini',
    technicalNote:
      'Neutralizes washed-out Lothric yellow-ashen haze into Stormveil cold steel-indigo shadows, deep gothic contrast, and crisp metallic specular clarity.',
  },
];

export interface GenericFilterItem {
  id: 'psx' | 'anti-piss' | 'next-gen';
  chipLabel: string;
  title: string;
  subtitle: string;
  iniSuffix: string;
}

export const GENERIC_FILTERS: GenericFilterItem[] = [
  {
    id: 'psx',
    chipLabel: 'filter_psx',
    title: 'PSX Filter',
    subtitle: '15-bit RGB555 quantization + 4×4 Bayer matrix dither.',
    iniSuffix: 'Generic_PSX_Hardware.ini',
  },
  {
    id: 'anti-piss',
    chipLabel: 'filter_antipiss',
    title: 'Anti-Piss',
    subtitle: 'Neutralizes 7th-gen ochre/sepia tint and balances white point.',
    iniSuffix: 'Generic_AntiPiss_7thGen.ini',
  },
  {
    id: 'next-gen',
    chipLabel: 'filter_nextgen',
    title: 'Next-Gen',
    subtitle: 'Midtone micro-contrast (Clarity.fx), vibrance, and LumaSharpen.',
    iniSuffix: 'Generic_NextGen_PBR.ini',
  },
];
