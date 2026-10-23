import React, { useEffect, useRef, useState } from 'react';
import {
  ImageColorStats,
  ReShadeParams,
  generate3DLutRgba,
  compileReShadeIni,
} from '../utils/colorMath';
import {
  GameApiProfile,
  ReShadeDllName,
  lookupGameReShadeApi,
  resolveGameApiLocally,
} from '../utils/gameApiDatabase';
import {
  buildZipArchive,
  fetchOfficialReShadeDllBytes,
  buildReShadeShaderEntries,
  buildReShadeConfigIni,
} from '../utils/zipBuilder';

interface LutAndIniPanelProps {
  presetName: string;
  onPresetNameChange: (name: string) => void;
  defaultGameQuery?: string;
  srcStats: ImageColorStats | null;
  refStats: ImageColorStats | null;
  params: ReShadeParams;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(',');
  const base64 = parts.length > 1 ? parts[1] : parts[0];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const LutAndIniPanel: React.FC<LutAndIniPanelProps> = ({
  presetName,
  onPresetNameChange,
  defaultGameQuery = 'Fallout: New Vegas',
  srcStats,
  refStats,
  params,
}) => {
  const lutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedIni, setCopiedIni] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const [gameQuery, setGameQuery] = useState(defaultGameQuery);
  const [gameProfile, setGameProfile] = useState<GameApiProfile>(() =>
    resolveGameApiLocally(defaultGameQuery)
  );
  const [selectedDll, setSelectedDll] = useState<ReShadeDllName>(
    () => resolveGameApiLocally(defaultGameQuery).dllName
  );
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [isPackagingZip, setIsPackagingZip] = useState(false);

  // Sync when active reference preset changes defaultGameQuery
  useEffect(() => {
    if (!defaultGameQuery) return;
    setGameQuery(defaultGameQuery);
    const local = resolveGameApiLocally(defaultGameQuery);
    setGameProfile(local);
    setSelectedDll(local.dllName);
  }, [defaultGameQuery]);

  // Pre-warm official ReShade 6.8.0 binary in memory cache for instant ZIP export
  useEffect(() => {
    void fetchOfficialReShadeDllBytes(
      gameProfile.architecture,
      selectedDll,
      gameProfile.renderApi,
      gameProfile.title
    );
  }, [gameProfile.architecture, selectedDll, gameProfile.renderApi, gameProfile.title]);

  // Auto-resolve online/verified API whenever user types a game title (debounced 280ms)
  useEffect(() => {
    const trimmed = gameQuery.trim();
    if (!trimmed) return;

    // Immediate local resolution so badge & select never lag behind input
    const local = resolveGameApiLocally(trimmed);
    setGameProfile(local);
    setSelectedDll(local.dllName);

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const resolved = await lookupGameReShadeApi(trimmed);
        if (!cancelled) {
          setGameProfile(resolved);
          setSelectedDll(resolved.dllName);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingApi(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [gameQuery]);

  useEffect(() => {
    const canvas = lutCanvasRef.current;
    if (!canvas || !srcStats || !refStats) return;

    const lut = generate3DLutRgba(srcStats, refStats, params);
    canvas.width = lut.width;
    canvas.height = lut.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = new ImageData(new Uint8ClampedArray(lut.data), lut.width, lut.height);
      ctx.putImageData(imgData, 0, 0);
    }
  }, [srcStats, refStats, params]);

  if (!srcStats || !refStats) return null;

  const iniContent = compileReShadeIni(presetName, params, srcStats, refStats);

  const handleSearchGameApi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gameQuery.trim()) return;
    setIsSearchingApi(true);
    try {
      const resolved = await lookupGameReShadeApi(gameQuery);
      setGameProfile(resolved);
      setSelectedDll(resolved.dllName);
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleDownloadLutPng = () => {
    const canvas = lutCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SpetLUT.png';
    a.click();
  };

  const handleDownloadIni = () => {
    const blob = new Blob([iniContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = presetName.endsWith('.ini') ? presetName : `${presetName}.ini`;
    a.download = safeName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZipBundle = async () => {
    const canvas = lutCanvasRef.current;
    if (!canvas || isPackagingZip) return;

    setIsPackagingZip(true);
    try {
      const lutPngBytes = dataUrlToUint8Array(canvas.toDataURL('image/png'));
      const safeIniName = presetName.endsWith('.ini') ? presetName : `${presetName}.ini`;
      const dllBytes = await fetchOfficialReShadeDllBytes(
        gameProfile.architecture,
        selectedDll,
        gameProfile.renderApi,
        gameProfile.title
      );

      const officialBinaryLabel =
        gameProfile.architecture === '64-bit'
          ? 'Official ReShade 6.8.0 (ReShade64.dll)'
          : 'Official ReShade 6.8.0 (ReShade32.dll)';

      const installReadme = [
        `====================================================================`,
        ` SPET'S RESHADE STUDIO - OFFICIAL RESHADE 6.8.0 AUTO-BUNDLE`,
        `====================================================================`,
        `Target Game : ${gameProfile.title}`,
        `Render API  : ${gameProfile.renderApi} (${gameProfile.architecture})`,
        `ReShade DLL : ${selectedDll} [${officialBinaryLabel}]`,
        `Target Dir  : ${gameProfile.exePath}`,
        ``,
        `QUICK INSTALL (2 STEPS):`,
        `1. Place SpetLUT.png inside reshade-shaders/Textures/ and Preset.ini in the game root folder.`,
        `   (Or simply extract ALL files from this .ZIP directly into ${gameProfile.exePath})`,
        `2. Launch the game and press HOME to open ReShade 6.8.0 with ${safeIniName} active.`,
        ``,
        `INCLUDED FILES:`,
        `- ${selectedDll} (${officialBinaryLabel} renamed for ${gameProfile.renderApi})`,
        `- Preset.ini & ${safeIniName} (ReShade Preset configuration)`,
        `- ReShade.ini (Auto-loads ${safeIniName} and shader/texture paths)`,
        `- reshade-shaders/Textures/SpetLUT.png (1024x32 3D LUT Texture)`,
        `- reshade-shaders/Shaders/ (ReShade.fxh, LUT.fx, Dither.fx, Clarity.fx, LumaSharpen.fx, etc.)`,
        `====================================================================`,
      ].join('\r\n');

      const entries = [
        { path: 'Preset.ini', data: iniContent },
        ...(safeIniName.toLowerCase() !== 'preset.ini'
          ? [{ path: safeIniName, data: iniContent }]
          : []),
        { path: 'ReShade.ini', data: buildReShadeConfigIni(safeIniName) },
        { path: 'reshade-shaders/Textures/SpetLUT.png', data: lutPngBytes },
        ...buildReShadeShaderEntries(),
        { path: selectedDll, data: dllBytes },
        { path: 'INSTALL_README.txt', data: installReadme },
      ];

      const zipBytes = buildZipArchive(entries);
      const blob = new Blob([zipBytes as unknown as BlobPart], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanSlug = presetName
        .replace(/\.ini$/i, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_');
      a.href = url;
      a.download = `${cleanSlug}_${selectedDll.replace('.dll', '')}_ReShade_Bundle.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsPackagingZip(false);
    }
  };

  const handleCopyIni = async () => {
    try {
      await navigator.clipboard.writeText(iniContent);
      setCopiedIni(true);
      setTimeout(() => setCopiedIni(false), 1800);
    } catch {
      setCopiedIni(true);
      setTimeout(() => setCopiedIni(false), 1800);
    }
  };

  return (
    <div className="border-t border-[#2A3242] bg-[#0B0F17] bg-industrial-base p-3.5 space-y-2.5 shrink-0">
      {/* Live 3D LUT Strip (1024x32) */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-medium text-[#94A3B8] mb-1">
          <span>3D LUT Strip (1024×32 · SpetLUT.png)</span>
          <span className="font-mono text-[10px] text-[#CBD5E1]">32³ Slices</span>
        </div>
        <div className="p-1 bevel-recessed">
          <canvas
            ref={lutCanvasRef}
            data-testid="lut-strip-canvas"
            className="w-full h-4 block"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Auto ReShade Version / Render API Search by Game */}
      <div className="p-2.5 bevel-panel space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#F1F5F9]">
            Auto Game API &amp; DLL Search
          </span>
          <span
            data-testid="detected-dll-badge"
            className="font-mono text-[10px] text-[#E05A3A] font-semibold"
          >
            {selectedDll} · {gameProfile.architecture}
          </span>
        </div>

        <form onSubmit={handleSearchGameApi} className="flex gap-1.5">
          <input
            type="text"
            aria-label="Game Title for ReShade API Search"
            placeholder="Game title (e.g. Black Ops 2, Assassin's Creed IV, Yakuza 0)..."
            value={gameQuery}
            onChange={(e) => {
              const val = e.target.value;
              setGameQuery(val);
              if (val.trim()) {
                const local = resolveGameApiLocally(val);
                setGameProfile(local);
                setSelectedDll(local.dllName);
              }
            }}
            className="flex-1 min-w-0 bevel-recessed px-2 py-1 text-[11px] text-[#F1F5F9] placeholder-[#64748B] focus:border-[#E05A3A] outline-none"
          />
          <button
            type="submit"
            disabled={isSearchingApi}
            className="px-2.5 py-1 bevel-btn text-[11px] font-medium text-[#F1F5F9] hover:text-white cursor-pointer whitespace-nowrap"
          >
            {isSearchingApi ? 'Searching...' : 'Detect API'}
          </button>
        </form>

        <div className="flex items-center justify-between gap-2 text-[10px] text-[#94A3B8]">
          <div className="truncate" title={`${gameProfile.title} — ${gameProfile.renderApi}`}>
            <span className="text-[#CBD5E1] font-medium">{gameProfile.title}</span>
            {' · '}
            <span className="text-[#94A3B8]">{gameProfile.renderApi}</span>
          </div>
          <select
            aria-label="Override ReShade DLL"
            value={selectedDll}
            onChange={(e) => setSelectedDll(e.target.value as ReShadeDllName)}
            className="bevel-recessed px-1.5 py-0.5 font-mono text-[10px] text-[#F1F5F9] bg-[#090C12] outline-none cursor-pointer shrink-0"
          >
            <option value="d3d9.dll">d3d9.dll (DX9)</option>
            <option value="d3d11.dll">d3d11.dll (DX11)</option>
            <option value="d3d12.dll">d3d12.dll (DX12)</option>
            <option value="vulkan-1.dll">vulkan-1.dll (Vulkan)</option>
            <option value="opengl32.dll">opengl32.dll (OpenGL)</option>
            <option value="dxgi.dll">dxgi.dll (DXGI)</option>
          </select>
        </div>
      </div>

      {/* Concise 2-Line Beginner Install Notice */}
      <div
        data-testid="reshade-install-hint"
        className="p-2 bevel-recessed text-[10px] leading-snug text-[#CBD5E1]"
      >
        <p className="font-mono text-[#F1F5F9]">
          Place SpetLUT.png inside reshade-shaders/Textures/ and Preset.ini in the game root folder.
        </p>
        <p className="text-[#94A3B8] mt-0.5">
          Bundle (.ZIP) packages Official ReShade 6.8.0 ({selectedDll}), Preset.ini, SpetLUT.png &amp; Shaders.
        </p>
      </div>

      {/* Collapsible .INI Source Drawer */}
      {showCodeModal && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex gap-1.5">
            <input
              type="text"
              aria-label="Preset Filename"
              value={presetName}
              onChange={(e) => onPresetNameChange(e.target.value)}
              className="flex-1 bevel-recessed px-2.5 py-1 text-xs font-mono text-[#F1F5F9] focus:border-[#E05A3A] outline-none"
            />
            <button
              type="button"
              onClick={handleCopyIni}
              className="px-2.5 py-1 bevel-btn text-[11px] font-medium text-[#CBD5E1] hover:text-white cursor-pointer whitespace-nowrap"
            >
              {copiedIni ? 'Copied' : 'Copy .INI'}
            </button>
          </div>
          <pre
            data-testid="ini-output-code"
            className="p-2.5 bevel-recessed font-mono text-[10px] text-[#CBD5E1] overflow-x-auto max-h-40 leading-relaxed"
          >
            {iniContent}
          </pre>
        </div>
      )}

      {/* Primary Export Action: Auto-Packaged .ZIP Bundle */}
      <button
        type="button"
        disabled={isPackagingZip}
        onClick={handleDownloadZipBundle}
        className="w-full py-2 px-3 bevel-accent text-white font-medium text-xs transition-colors duration-150 cursor-pointer whitespace-nowrap"
      >
        {isPackagingZip
          ? `Packaging Official ReShade 6.8.0 (${selectedDll})...`
          : `Export ReShade Bundle (.ZIP · INI + SpetLUT + ${selectedDll})`}
      </button>

      {/* Secondary Actions (Sharp bevelled buttons, zero icon clutter) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={handleDownloadIni}
          className="py-1.5 px-2 bevel-btn text-[11px] font-medium text-[#CBD5E1] hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap"
        >
          Export .INI
        </button>
        <button
          type="button"
          onClick={handleDownloadLutPng}
          className="py-1.5 px-2 bevel-btn text-[11px] font-medium text-[#CBD5E1] hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap"
        >
          Save SpetLUT.png
        </button>
        <button
          type="button"
          onClick={() => setShowCodeModal((v) => !v)}
          className={`py-1.5 px-2 text-[11px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
            showCodeModal
              ? 'bevel-accent text-white'
              : 'bevel-btn text-[#CBD5E1] hover:text-white'
          }`}
        >
          {showCodeModal ? 'Hide .INI' : 'View .INI'}
        </button>
      </div>
    </div>
  );
};
