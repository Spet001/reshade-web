import React from 'react';
import { ReShadeParams } from '../utils/colorMath';
import { Tooltip } from './Tooltip';

interface ShaderRackProps {
  params: ReShadeParams;
  onChange: (next: ReShadeParams) => void;
  onResetToAuto: () => void;
}

export const ShaderRack: React.FC<ShaderRackProps> = ({ params, onChange, onResetToAuto }) => {
  const toggleShader = (key: keyof ReShadeParams['enabledShaders']) => {
    onChange({
      ...params,
      enabledShaders: {
        ...params.enabledShaders,
        [key]: !params.enabledShaders[key],
      },
    });
  };

  const setRGBVec = (
    field: 'rgbLift' | 'rgbGamma' | 'rgbGain',
    idx: 0 | 1 | 2,
    val: number
  ) => {
    const nextVec: [number, number, number] = [...params[field]] as [number, number, number];
    nextVec[idx] = val;
    onChange({ ...params, [field]: nextVec });
  };

  const skinSkyProt = params.skinSkyProtection ?? 0.65;

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A3242]">
        <span className="text-xs font-medium text-[#94A3B8]">Shader Parameters (.fx)</span>
        <button
          type="button"
          onClick={onResetToAuto}
          className="px-2.5 py-1 bevel-btn text-[11px] font-medium text-[#F1F5F9] transition-colors duration-150 cursor-pointer whitespace-nowrap"
        >
          Reset Defaults
        </button>
      </div>

      <div className="p-3 bevel-panel space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#F1F5F9]">Reinhard LAB Transfer (LUT.fx)</span>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">
              Lock L* luminance or guard skin &amp; skies on extreme color references
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="Toggle CIE LAB LUT Transfer"
            checked={params.enabledShaders.LUT}
            onChange={() => toggleShader('LUT')}
            className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer shrink-0"
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...params,
                transferStrength: 0.9,
                preserveLuminance: 0.25,
                skinSkyProtection: 0.65,
                enabledShaders: { ...params.enabledShaders, LUT: true },
              })
            }
            className="py-1 px-1.5 bevel-btn text-[10px] font-medium text-[#CBD5E1] hover:text-white cursor-pointer truncate"
          >
            Standard LAB
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...params,
                transferStrength: 0.92,
                preserveLuminance: 1.0,
                skinSkyProtection: 0.75,
                enabledShaders: { ...params.enabledShaders, LUT: true },
              })
            }
            className="py-1 px-1.5 bevel-btn text-[10px] font-medium text-[#CBD5E1] hover:text-white cursor-pointer truncate"
            title="Preserves 100% of original source luminance L* and transfers only LAB A/B color channels"
          >
            Chroma Only (A/B)
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...params,
                transferStrength: 0.8,
                preserveLuminance: 0.85,
                skinSkyProtection: 1.0,
                enabledShaders: { ...params.enabledShaders, LUT: true },
              })
            }
            className="py-1 px-1.5 bevel-btn text-[10px] font-medium text-[#CBD5E1] hover:text-white cursor-pointer truncate"
            title="Prevents white clipping and color casts on skies & skin tones for extreme monochrome references"
          >
            Extreme Ref Safe
          </button>
        </div>

        <div className="space-y-2 pt-0.5">
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Controls how strongly the target reference's CIE LAB color statistics (mean & standard deviation) are blended into the source frame.">
                Transfer Strength / Blend
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {Math.round(params.transferStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="Transfer Strength / Blend"
              min={0}
              max={1}
              step={0.01}
              value={params.transferStrength}
              onChange={(e) =>
                onChange({
                  ...params,
                  transferStrength: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, LUT: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>

          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Locks original scene brightness (L* channel) so only chromaticity (A* green-red and B* blue-yellow) is transferred from the reference.">
                Luma Preservation (Lock L*, Transfer A/B)
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {Math.round(params.preserveLuminance * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="Luma Preservation"
              min={0}
              max={1}
              step={0.01}
              value={params.preserveLuminance}
              onChange={(e) =>
                onChange({
                  ...params,
                  preserveLuminance: parseFloat(e.target.value),
                })
              }
              className="w-full foundry-slider"
            />
          </label>

          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Applies a soft-knee roll-off in CIE LAB space to prevent highlight clipping, blown-out skies, and unnatural skin-tone shifts.">
                Skin &amp; Sky / Highlight Anti-Clip Protection
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {Math.round(skinSkyProt * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="Skin and Sky Protection"
              min={0}
              max={1}
              step={0.01}
              value={skinSkyProt}
              onChange={(e) =>
                onChange({
                  ...params,
                  skinSkyProtection: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, LUT: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
        </div>
      </div>

      <div className="p-3 bevel-panel space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#F1F5F9]">Clarity &amp; Vibrance</span>
          <input
            type="checkbox"
            aria-label="Toggle Clarity and Vibrance"
            checked={params.enabledShaders.ClarityPBR}
            onChange={() => toggleShader('ClarityPBR')}
            className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Enhances local midtone detail and surface relief (Clarity.fx) using a 3px surround luminance mask without clipping shadows or highlights.">
                Micro-Contrast
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {params.clarityStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.2}
              step={0.02}
              value={params.clarityStrength}
              onChange={(e) =>
                onChange({
                  ...params,
                  clarityStrength: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, ClarityPBR: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip
                align="right"
                content="Selectively boosts muted colors (Vibrance.fx) while protecting already-saturated pixels and skin tones from oversaturation."
              >
                Vibrance
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {params.vibrance.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-0.4}
              max={0.8}
              step={0.02}
              value={params.vibrance}
              onChange={(e) =>
                onChange({
                  ...params,
                  vibrance: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, ClarityPBR: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
        </div>
      </div>

      <div className="p-3 bevel-panel space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#F1F5F9]">
              PSX RGB555 Dither &amp; Pixelate.fx
            </span>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">
              15-bit ordered Bayer quantization + resolution-scaled texel snap
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-[#CBD5E1]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                aria-label="Toggle Pixelate.fx Shader"
                checked={params.enabledShaders.Pixelate ?? params.enabledShaders.PSXDither}
                onChange={() =>
                  onChange({
                    ...params,
                    psxPixelScale:
                      !(params.enabledShaders.Pixelate ?? params.enabledShaders.PSXDither) &&
                      params.psxPixelScale <= 1.01
                        ? 2.55
                        : params.psxPixelScale,
                    enabledShaders: {
                      ...params.enabledShaders,
                      Pixelate: !(params.enabledShaders.Pixelate ?? params.enabledShaders.PSXDither),
                    },
                  })
                }
                className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer"
              />
              <span>Pixelate.fx</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                aria-label="Toggle PSX Hardware Dither"
                checked={params.enabledShaders.PSXDither}
                onChange={() => toggleShader('PSXDither')}
                className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer"
              />
              <span>Dither.fx</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#CBD5E1]">
          <Tooltip content="Automatically scales the pixelation and Bayer dither grid relative to 1080p (BUFFER_HEIGHT / 1080.0) for consistent block density across resolutions.">
            Auto Scale Cell Size by Resolution (1080p Base)
          </Tooltip>
          <input
            type="checkbox"
            aria-label="Toggle Pixelate Resolution Scaling"
            checked={params.pixelateResolutionScale !== false}
            onChange={() =>
              onChange({
                ...params,
                pixelateResolutionScale: params.pixelateResolutionScale === false,
              })
            }
            className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Color bit depth per RGB channel (5b = authentic PS1 15-bit RGB555 with 32 levels per channel; 8b = full 24-bit sRGB).">
                Bits
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">{params.psxBitDepth}b</span>
            </div>
            <input
              type="range"
              min={4}
              max={8}
              step={1}
              value={params.psxBitDepth}
              onChange={(e) =>
                onChange({
                  ...params,
                  psxBitDepth: parseInt(e.target.value, 10),
                  enabledShaders: { ...params.enabledShaders, PSXDither: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip
                align="center"
                content="Continuous float pixelation & Bayer dither cell size (e.g. 2.55×) with 4-tap sub-cell antialiasing in Pixelate.fx."
              >
                Texel
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {params.psxPixelScale.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={6.0}
              step={0.05}
              value={params.psxPixelScale}
              onChange={(e) => {
                const nextScale = parseFloat(e.target.value);
                onChange({
                  ...params,
                  psxPixelScale: nextScale,
                  enabledShaders: {
                    ...params.enabledShaders,
                    Pixelate: nextScale > 1.01,
                  },
                });
              }}
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip
                align="right"
                content="Controls the amplitude of the 4×4 ordered Bayer dithering matrix used to smooth quantized 15-bit RGB555 color bands."
              >
                Bayer
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {params.psxDitherStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={params.psxDitherStrength}
              onChange={(e) =>
                onChange({
                  ...params,
                  psxDitherStrength: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, PSXDither: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
        </div>
      </div>

      <div className="p-3 bevel-panel space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#F1F5F9]">
              UI, Main Menu &amp; Pause Guard (UIMask.fx)
            </span>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">
              Keeps Main Menus, Pause Screens, Top Bars &amp; 1px UI Text razor-sharp
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="Toggle UI and Menu Protection"
            checked={params.enabledShaders.UIMask !== false}
            onChange={() =>
              onChange({
                ...params,
                enabledShaders: {
                  ...params.enabledShaders,
                  UIMask: params.enabledShaders.UIMask === false,
                },
              })
            }
            className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer shrink-0"
          />
        </div>

        <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#CBD5E1]">
          <Tooltip content="Samples a 9-point viewport probe to automatically bypass shaders during full-screen Main Menus, Pause Screens, and loading overlays.">
            Auto Main Menu &amp; Pause Screen Bypass
          </Tooltip>
          <input
            type="checkbox"
            aria-label="Toggle Auto Main Menu Bypass"
            checked={params.uiMaskAutoMenu !== false}
            onChange={() =>
              onChange({
                ...params,
                uiMaskAutoMenu: params.uiMaskAutoMenu === false,
                enabledShaders: { ...params.enabledShaders, UIMask: true },
              })
            }
            className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Vertical screen percentage at the top of the frame kept in native ungraded resolution to protect window bars and menus.">
                Top UI Bar Safe Zone
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {Math.round((params.uiMaskTopBar ?? 0.072) * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="Top UI Bar Safe Zone"
              min={0}
              max={0.15}
              step={0.005}
              value={params.uiMaskTopBar ?? 0.072}
              onChange={(e) =>
                onChange({
                  ...params,
                  uiMaskTopBar: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, UIMask: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip
                align="right"
                content="Restores native sharpness on high-contrast HUD portraits, health bars, and bottom interaction prompts (KeepUI_Post)."
              >
                HUD &amp; 1px Text Guard
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {Math.round((params.uiMaskHudGuard ?? 0.8) * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="HUD and Text Guard Strength"
              min={0}
              max={1}
              step={0.05}
              value={params.uiMaskHudGuard ?? 0.8}
              onChange={(e) =>
                onChange({
                  ...params,
                  uiMaskHudGuard: parseFloat(e.target.value),
                  enabledShaders: { ...params.enabledShaders, UIMask: true },
                })
              }
              className="w-full foundry-slider"
            />
          </label>
        </div>
      </div>

      <div className="p-3 bevel-panel space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#F1F5F9]">LiftGammaGain.fx</span>
          <input
            type="checkbox"
            aria-label="Toggle LiftGammaGain"
            checked={params.enabledShaders.LiftGammaGain}
            onChange={() => toggleShader('LiftGammaGain')}
            className="accent-[#E05A3A] w-3.5 h-3.5 rounded-none cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 pt-0.5">
          {(
            [
              {
                label: 'Lift',
                field: 'rgbLift',
                tip: 'Adjusts RGB shadow floor and dark tones per channel (Red, Green, Blue).',
              },
              {
                label: 'Gamma',
                field: 'rgbGamma',
                tip: 'Adjusts RGB midtone power curve and color balance per channel.',
              },
              {
                label: 'Gain',
                field: 'rgbGain',
                tip: 'Adjusts RGB highlight multiplier and peak white tint per channel.',
              },
            ] as const
          ).map(({ label, field, tip }) => (
            <div key={field} className="grid grid-cols-4 gap-1.5 items-center">
              <span className="text-[11px] text-[#94A3B8]">
                <Tooltip content={tip}>{label}</Tooltip>
              </span>
              {[0, 1, 2].map((ch) => (
                <input
                  key={ch}
                  type="number"
                  step={0.01}
                  min={0.5}
                  max={1.5}
                  aria-label={`${label} Channel ${ch}`}
                  value={params[field][ch]}
                  onChange={(e) =>
                    setRGBVec(field, ch as 0 | 1 | 2, parseFloat(e.target.value) || 1.0)
                  }
                  className="bevel-recessed px-1.5 py-1 text-[11px] font-mono tabular-nums text-center text-[#F1F5F9] focus:border-[#E05A3A] outline-none"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bevel-panel space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#F1F5F9]">Levels &amp; Sharpness</span>
          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={params.enabledShaders.Levels}
                onChange={() => toggleShader('Levels')}
                className="accent-[#E05A3A] rounded-none"
              />
              Lvl
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={params.enabledShaders.Curves}
                onChange={() => toggleShader('Curves')}
                className="accent-[#E05A3A] rounded-none"
              />
              Crv
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={params.enabledShaders.LumaSharpen}
                onChange={() => toggleShader('LumaSharpen')}
                className="accent-[#E05A3A] rounded-none"
              />
              Shp
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Remaps input shadow levels below this threshold (0–255) to pure black (Levels.fx) to deepen crushed or hazy shadows.">
                Black Point
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">{params.blackPoint}</span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={params.blackPoint}
              onChange={(e) => onChange({ ...params, blackPoint: parseInt(e.target.value, 10) })}
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip
                align="right"
                content="Remaps input highlight levels above this threshold (0–255) to pure white (Levels.fx) to boost peak luminance."
              >
                White Point
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">{params.whitePoint}</span>
            </div>
            <input
              type="range"
              min={225}
              max={255}
              step={1}
              value={params.whitePoint}
              onChange={(e) => onChange({ ...params, whitePoint: parseInt(e.target.value, 10) })}
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip content="Applies a smooth cubic S-curve contrast formula (Curves.fx) to separate midtones without clipping extremes.">
                S-Curve
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {params.curvesContrast.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-0.3}
              max={0.5}
              step={0.01}
              value={params.curvesContrast}
              onChange={(e) => onChange({ ...params, curvesContrast: parseFloat(e.target.value) })}
              className="w-full foundry-slider"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
              <Tooltip
                align="right"
                content="Controls LumaSharpen.fx edge sharpening intensity applied prior to LUT grading and PSX texel quantization."
              >
                Acutance
              </Tooltip>
              <span className="font-mono tabular-nums text-[#F1F5F9]">
                {params.sharpStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2.0}
              step={0.05}
              value={params.sharpStrength}
              onChange={(e) => onChange({ ...params, sharpStrength: parseFloat(e.target.value) })}
              className="w-full foundry-slider"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
