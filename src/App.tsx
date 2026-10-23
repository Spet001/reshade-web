import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  PRACTICAL_CASE_PRESETS,
  GENERIC_FILTERS,
  PracticalCasePreset,
  GenericFilterItem,
  CropRect,
} from './utils/syntheticScenes';
import {
  analyzeImageBuffer,
  deriveReShadeParameters,
  buildGenericFilterParams,
  GenericFilterPresetId,
  ImageColorStats,
  ReShadeParams,
} from './utils/colorMath';
import { SplitViewport } from './components/SplitViewport';
import { ShaderRack } from './components/ShaderRack';
import { LutAndIniPanel } from './components/LutAndIniPanel';

const WORK_WIDTH = 960;
const WORK_HEIGHT = 540;

function loadImageWithCrop(
  url: string,
  crop?: CropRect
): Promise<{ imageData: ImageData; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = WORK_WIDTH;
      canvas.height = WORK_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('2D context unavailable'));
        return;
      }

      const sx = crop ? Math.round(img.width * crop.x) : 0;
      const sy = crop ? Math.round(img.height * crop.y) : 0;
      const sw = crop ? Math.round(img.width * crop.w) : img.width;
      const sh = crop ? Math.round(img.height * crop.h) : img.height;

      const srcAspect = sw / sh;
      const dstAspect = WORK_WIDTH / WORK_HEIGHT;

      let finalSx = sx;
      let finalSy = sy;
      let finalSw = sw;
      let finalSh = sh;

      if (srcAspect > dstAspect) {
        finalSw = Math.round(sh * dstAspect);
        finalSx = sx + Math.round((sw - finalSw) * 0.5);
      } else if (srcAspect < dstAspect) {
        finalSh = Math.round(sw / dstAspect);
        finalSy = sy + Math.round((sh - finalSh) * 0.5);
      }

      ctx.drawImage(img, finalSx, finalSy, finalSw, finalSh, 0, 0, WORK_WIDTH, WORK_HEIGHT);
      resolve({
        imageData: ctx.getImageData(0, 0, WORK_WIDTH, WORK_HEIGHT),
        previewUrl: canvas.toDataURL('image/jpeg', 0.88),
      });
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export default function App() {
  const [activeCaseId, setActiveCaseId] = useState<string>(PRACTICAL_CASE_PRESETS[0].id);
  const [activeGenericFilter, setActiveGenericFilter] = useState<GenericFilterPresetId>('none');

  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);
  const [targetImageData, setTargetImageData] = useState<ImageData | null>(null);

  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string>('');
  const [targetPreviewUrl, setTargetPreviewUrl] = useState<string>('');

  const [sourceLabel, setSourceLabel] = useState<string>(PRACTICAL_CASE_PRESETS[0].sourceTitle);
  const [targetLabel, setTargetLabel] = useState<string>(PRACTICAL_CASE_PRESETS[0].targetTitle);
  const [presetName, setPresetName] = useState<string>(PRACTICAL_CASE_PRESETS[0].iniFileName);

  const [srcStats, setSrcStats] = useState<ImageColorStats | null>(null);
  const [refStats, setRefStats] = useState<ImageColorStats | null>(null);

  const [params, setParams] = useState<ReShadeParams | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'after' | 'before' | 'reference'>('split');
  const [inspectorTab, setInspectorTab] = useState<'presets' | 'shaders'>('presets');

  const sourceInputRef = useRef<HTMLInputElement | null>(null);
  const targetInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);

  const loadPracticalCase = useCallback(async (preset: PracticalCasePreset) => {
    try {
      const [srcRes, refRes] = await Promise.all([
        loadImageWithCrop(preset.sourceUrl, preset.sourceCrop),
        loadImageWithCrop(preset.targetUrl, preset.targetCrop),
      ]);

      const sStats = analyzeImageBuffer(
        srcRes.imageData.data,
        srcRes.imageData.width,
        srcRes.imageData.height
      );
      const rStats = analyzeImageBuffer(
        refRes.imageData.data,
        refRes.imageData.width,
        refRes.imageData.height
      );

      const derived = deriveReShadeParameters(
        sStats,
        rStats,
        preset.defaultTransferStrength,
        preset.defaultPreserveLuma,
        preset.enablePsxHardware,
        preset.presetProfile
      );

      setActiveCaseId(preset.id);
      setActiveGenericFilter('none');
      setSourceImageData(srcRes.imageData);
      setTargetImageData(refRes.imageData);
      setSourcePreviewUrl(srcRes.previewUrl);
      setTargetPreviewUrl(refRes.previewUrl);
      setSourceLabel(preset.sourceTitle);
      setTargetLabel(preset.targetTitle);
      setPresetName(preset.iniFileName);
      setSrcStats(sStats);
      setRefStats(rStats);
      setParams(derived);
    } catch (err) {
      console.error('Error loading case study:', err);
    }
  }, []);

  useEffect(() => {
    loadPracticalCase(PRACTICAL_CASE_PRESETS[0]);
  }, [loadPracticalCase]);

  const handleSelectGenericFilter = (filterItem: GenericFilterItem) => {
    if (!srcStats) return;
    const filterParams = buildGenericFilterParams(filterItem.id, srcStats);
    setActiveGenericFilter(filterItem.id);
    setActiveCaseId('generic');
    setTargetLabel(filterItem.title);
    setPresetName(filterItem.iniSuffix);
    setParams(filterParams);
  };

  const handleResetSolver = () => {
    if (!srcStats || !refStats) return;
    if (activeGenericFilter !== 'none') {
      setParams(buildGenericFilterParams(activeGenericFilter, srcStats));
      return;
    }
    const currentCase = PRACTICAL_CASE_PRESETS.find((p) => p.id === activeCaseId);
    const derived = deriveReShadeParameters(
      srcStats,
      refStats,
      currentCase ? currentCase.defaultTransferStrength : 0.85,
      currentCase ? currentCase.defaultPreserveLuma : 0.35,
      currentCase ? currentCase.enablePsxHardware : false,
      currentCase ? currentCase.presetProfile : 'default'
    );
    setParams(derived);
  };

  const handleUploadImage = (role: 'source' | 'target', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await loadImageWithCrop(reader.result as string);
        const cleanName = file.name.replace(/\.[^/.]+$/, '');

        if (role === 'source') {
          const sStats = analyzeImageBuffer(
            res.imageData.data,
            res.imageData.width,
            res.imageData.height
          );
          setSourceImageData(res.imageData);
          setSourcePreviewUrl(res.previewUrl);
          setSourceLabel(cleanName);
          setSrcStats(sStats);
          if (activeGenericFilter !== 'none') {
            setParams(buildGenericFilterParams(activeGenericFilter, sStats));
          } else if (refStats) {
            setParams(deriveReShadeParameters(sStats, refStats, 0.75, 0.35, false, 'default'));
          }
        } else {
          const rStats = analyzeImageBuffer(
            res.imageData.data,
            res.imageData.width,
            res.imageData.height
          );
          setTargetImageData(res.imageData);
          setTargetPreviewUrl(res.previewUrl);
          setTargetLabel(cleanName);
          setPresetName(`Match_${cleanName}.ini`);
          setActiveGenericFilter('none');
          setActiveCaseId('custom');
          setRefStats(rStats);
          if (srcStats) {
            setParams(deriveReShadeParameters(srcStats, rStats, 0.75, 0.35, false, 'default'));
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#0B0F17] bg-industrial-base text-[#F1F5F9] flex flex-col overflow-hidden">
      <input
        ref={sourceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUploadImage('source', e)}
      />
      <input
        ref={targetInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUploadImage('target', e)}
      />

      <header className="min-h-12 py-1.5 bg-[#141820] bg-industrial-panel border-b border-[#2A3242] shadow-[inset_0_-1px_0_rgba(0,0,0,0.7)] px-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="font-display text-base font-bold tracking-tight text-[#F1F5F9] flex items-center gap-2 truncate">
            <span>Spet&apos;s ReShade Studio</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#E05A3A]/20 text-[#FF9472] border border-[#E05A3A]/60 leading-none">
              BETA
            </span>
            <span className="text-[11px] font-mono font-normal text-[#94A3B8] leading-none">
              v1.0.0
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <span className="hidden md:inline text-[11px] text-[#94A3B8] truncate">
            Open-source project — any improvements to the ReShade preset generation algorithm are welcome!
          </span>
          <a
            href="https://github.com/Spet001/reshade-web"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="github-repo-link"
            title="Open-source project — any improvements to the ReShade preset generation algorithm are welcome!"
            className="bevel-btn px-2.5 py-1 flex items-center gap-2 text-xs font-medium text-[#F1F5F9] hover:text-white transition-colors duration-150 shrink-0"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="w-3.5 h-3.5 fill-current text-[#CBD5E1]"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {params && (
          <SplitViewport
            sourceImageData={sourceImageData}
            targetImageData={targetImageData}
            srcStats={srcStats}
            refStats={refStats}
            params={params}
            sourceLabel={sourceLabel}
            targetLabel={targetLabel}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        <aside className="w-full lg:w-[380px] xl:w-[400px] bg-[#141820] bg-industrial-panel border-t lg:border-t-0 lg:border-l border-[#2A3242] shadow-[inset_1px_0_0_rgba(255,255,255,0.06)] flex flex-col min-h-0 shrink-0">
          {/* Inspector Top Tabs (Sharp bevelled industrial tabs) */}
          <div className="grid grid-cols-2 gap-1.5 p-2.5 border-b border-[#2A3242] bg-[#0B0F17] shrink-0">
            <button
              type="button"
              onClick={() => {
                setInspectorTab('presets');
                if (sidebarScrollRef.current) sidebarScrollRef.current.scrollTop = 0;
              }}
              className={`py-1.5 px-3 text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                inspectorTab === 'presets'
                  ? 'bevel-accent text-white'
                  : 'bevel-btn text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Presets &amp; Frames
            </button>
            <button
              type="button"
              onClick={() => {
                setInspectorTab('shaders');
                if (sidebarScrollRef.current) sidebarScrollRef.current.scrollTop = 0;
              }}
              className={`py-1.5 px-3 text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                inspectorTab === 'shaders'
                  ? 'bevel-accent text-white'
                  : 'bevel-btn text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Shader Stack (.fx)
            </button>
          </div>

          <div
            ref={sidebarScrollRef}
            className="industrial-scrollbar flex-1 overflow-y-auto p-4 space-y-5 min-h-0"
          >
            {inspectorTab === 'presets' ? (
              <>
                {/* 1. Source & Reference Upload Slots */}
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-medium text-[#94A3B8]">
                      Source &amp; Reference Frames
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      data-testid="upload-source-card"
                      onClick={() => sourceInputRef.current?.click()}
                      className="group text-left bevel-panel hover:border-[#475569] p-2 transition-colors duration-150 cursor-pointer flex flex-col gap-2"
                    >
                      <div className="relative w-full aspect-video overflow-hidden bevel-recessed">
                        {sourcePreviewUrl && (
                          <img
                            src={sourcePreviewUrl}
                            alt="Current Source Frame"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="px-0.5">
                        <div className="text-[11px] text-[#94A3B8]">Source Frame</div>
                        <div className="text-xs font-medium text-[#F1F5F9] group-hover:text-white truncate">
                          Upload Image
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="upload-reference-card"
                      onClick={() => targetInputRef.current?.click()}
                      className="group text-left bevel-panel hover:border-[#475569] p-2 transition-colors duration-150 cursor-pointer flex flex-col gap-2"
                    >
                      <div className="relative w-full aspect-video overflow-hidden bevel-recessed">
                        {targetPreviewUrl && (
                          <img
                            src={targetPreviewUrl}
                            alt="Current Reference Frame"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="px-0.5">
                        <div className="text-[11px] text-[#94A3B8]">Reference Target</div>
                        <div className="text-xs font-medium text-[#F1F5F9] group-hover:text-white truncate">
                          Upload Reference
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Standalone Filters */}
                <div>
                  <span className="block text-xs font-medium text-[#94A3B8] mb-2">
                    Standalone Filters
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1.5 bevel-recessed">
                    {GENERIC_FILTERS.map((f) => {
                      const isSelected = activeGenericFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          data-testid={`quick-filter-${f.id}`}
                          onClick={() => handleSelectGenericFilter(f)}
                          className={`py-2 px-2 text-xs font-medium text-center transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bevel-accent text-white'
                              : 'bevel-btn text-[#CBD5E1] hover:text-white'
                          }`}
                        >
                          {f.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Reference Comparison */}
                <div>
                  <span className="block text-xs font-medium text-[#94A3B8] mb-2">
                    Reference Presets
                  </span>

                  <div className="space-y-2.5">
                    {PRACTICAL_CASE_PRESETS.map((preset) => {
                      const isSelected =
                        activeCaseId === preset.id && activeGenericFilter === 'none';
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          data-testid={`quick-demo-${preset.id}`}
                          onClick={() => loadPracticalCase(preset)}
                          className={`w-full text-left p-3 bevel-panel transition-colors duration-150 cursor-pointer ${
                            isSelected
                              ? '!border-[#E05A3A] shadow-[inset_0_0_0_1px_rgba(224,90,58,0.45)]'
                              : 'hover:border-[#475569]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="text-xs font-semibold text-[#F1F5F9] truncate">
                              {preset.shortTitle}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative w-full aspect-video overflow-hidden bevel-recessed">
                              <img
                                src={preset.sourceUrl}
                                alt={preset.sourceTitle}
                                referrerPolicy="no-referrer"
                                className={`w-full h-full object-cover ${
                                  preset.sourceCrop ? 'scale-[1.36] origin-center' : ''
                                }`}
                              />
                              <span className="absolute bottom-1 left-1 bg-[#0B0F17]/90 border border-[#2A3242] px-1.5 py-0.5 text-[10px] text-[#CBD5E1]">
                                Source
                              </span>
                            </div>
                            <div className="relative w-full aspect-video overflow-hidden bevel-recessed">
                              <img
                                src={preset.targetUrl}
                                alt={preset.targetTitle}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1 bg-[#0B0F17]/90 border border-[#2A3242] px-1.5 py-0.5 text-[10px] text-[#CBD5E1]">
                                Target
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              params && (
                <ShaderRack
                  params={params}
                  onChange={setParams}
                  onResetToAuto={handleResetSolver}
                />
              )
            )}
          </div>

          {params && (
            <LutAndIniPanel
              params={params}
              srcStats={srcStats}
              refStats={refStats}
              presetName={presetName}
              onPresetNameChange={setPresetName}
              defaultGameQuery={sourceLabel.replace(/\s*\(.*?\)\s*/g, '').trim()}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
