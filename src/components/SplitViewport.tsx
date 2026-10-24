import React, { useEffect, useRef, useState } from 'react';
import {
  ImageColorStats,
  ReShadeParams,
  transformPixelThroughPipeline,
  applyPsxHardwareQuantization,
  clamp,
} from '../utils/colorMath';

interface SplitViewportProps {
  sourceImageData: ImageData | null;
  targetImageData: ImageData | null;
  srcStats: ImageColorStats | null;
  refStats: ImageColorStats | null;
  params: ReShadeParams;
  sourceLabel: string;
  targetLabel: string;
  viewMode: 'split' | 'after' | 'before' | 'reference';
  onViewModeChange: (mode: 'split' | 'after' | 'before' | 'reference') => void;
}

const FoundryStageBackdrop: React.FC = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const renderBackdrop = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(320, Math.floor(rect.height));

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
      baseGrad.addColorStop(0, '#0B0F17');
      baseGrad.addColorStop(0.7, '#0E131D');
      baseGrad.addColorStop(1, '#141820');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.lineWidth = 1;
      const hatchStep = 14;
      const maxDim = w + h;
      ctx.beginPath();
      for (let offset = -h; offset < maxDim; offset += hatchStep) {
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + h, h);
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset - h, h);
      }
      ctx.stroke();
      ctx.restore();

      const nebulaLeft = ctx.createRadialGradient(
        w * 0.22,
        h * 0.22,
        10,
        w * 0.22,
        h * 0.22,
        w * 0.42
      );
      nebulaLeft.addColorStop(0, 'rgba(224, 90, 58, 0.075)');
      nebulaLeft.addColorStop(0.5, 'rgba(180, 52, 34, 0.025)');
      nebulaLeft.addColorStop(1, 'rgba(11, 15, 23, 0)');
      ctx.fillStyle = nebulaLeft;
      ctx.fillRect(0, 0, w, h);

      const nebulaRight = ctx.createRadialGradient(
        w * 0.78,
        h * 0.18,
        10,
        w * 0.78,
        h * 0.18,
        w * 0.36
      );
      nebulaRight.addColorStop(0, 'rgba(255, 148, 114, 0.055)');
      nebulaRight.addColorStop(0.5, 'rgba(224, 90, 58, 0.02)');
      nebulaRight.addColorStop(1, 'rgba(11, 15, 23, 0)');
      ctx.fillStyle = nebulaRight;
      ctx.fillRect(0, 0, w, h);

      const starCount = 120;
      for (let i = 0; i < starCount; i++) {
        const rx = ((i * 1.61803398875 * 97.31) % 1);
        const ry = ((i * 2.41421356237 * 53.17) % 1);
        const sx = rx * w;
        const sy = ry * (h * 0.86);
        const isWarm = i % 3 === 0;
        const radius = (i % 7 === 0) ? 1.45 : (i % 3 === 0) ? 1.05 : 0.7;
        const alpha = 0.14 + ((i * 17) % 52) / 100;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = isWarm
          ? `rgba(255, 148, 114, ${(alpha * 0.8).toFixed(3)})`
          : `rgba(226, 232, 240, ${(alpha * 0.6).toFixed(3)})`;
        ctx.fill();
      }

      const glowGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.92,
        w * 0.04,
        w * 0.5,
        h * 0.92,
        w * 0.65
      );
      glowGrad.addColorStop(0, 'rgba(224, 90, 58, 0.25)');
      glowGrad.addColorStop(0.42, 'rgba(180, 52, 34, 0.09)');
      glowGrad.addColorStop(1, 'rgba(11, 15, 23, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      const planetRadius = Math.max(w, h) * 1.65;
      const planetCenterY = h * 0.88 + planetRadius;
      const planetCenterX = w * 0.5;

      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#080B11';
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius, Math.PI * 1.15, Math.PI * 1.85);
      const rimGrad = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
      rimGrad.addColorStop(0, 'rgba(224, 90, 58, 0)');
      rimGrad.addColorStop(0.25, 'rgba(224, 90, 58, 0.5)');
      rimGrad.addColorStop(0.5, 'rgba(255, 158, 122, 0.9)');
      rimGrad.addColorStop(0.75, 'rgba(224, 90, 58, 0.5)');
      rimGrad.addColorStop(1, 'rgba(224, 90, 58, 0)');
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 1.75;
      ctx.shadowColor = 'rgba(224, 90, 58, 0.7)';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    };

    renderBackdrop();
    window.addEventListener('resize', renderBackdrop);
    return () => window.removeEventListener('resize', renderBackdrop);
  }, []);

  return (
    <canvas
      ref={bgCanvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full block"
    />
  );
};

export const SplitViewport: React.FC<SplitViewportProps> = ({
  sourceImageData,
  targetImageData,
  srcStats,
  refStats,
  params,
  sourceLabel,
  targetLabel,
  viewMode,
  onViewModeChange,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedBufferRef = useRef<ImageData | null>(null);

  const [splitPos, setSplitPos] = useState<number>(0.50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!sourceImageData || !srcStats || !refStats) return;

    const w = sourceImageData.width;
    const h = sourceImageData.height;
    const srcData = sourceImageData.data;

    const pass1Out = new Uint8ClampedArray(srcData);
    if (params.enabledShaders.ClarityPBR && params.clarityStrength > 0.01) {
      const cStrength = params.clarityStrength * 0.28;
      const rad = 3;
      for (let y = rad; y < h - rad; y++) {
        for (let x = rad; x < w - rad; x++) {
          const idx = (y * w + x) * 4;
          const nIdx = ((y - rad) * w + x) * 4;
          const sIdx = ((y + rad) * w + x) * 4;
          const wIdx = (y * w + (x - rad)) * 4;
          const eIdx = (y * w + (x + rad)) * 4;
          const nwIdx = ((y - rad) * w + (x - rad)) * 4;
          const neIdx = ((y - rad) * w + (x + rad)) * 4;
          const swIdx = ((y + rad) * w + (x - rad)) * 4;
          const seIdx = ((y + rad) * w + (x + rad)) * 4;

          const lumaC = 0.2126 * srcData[idx] + 0.7152 * srcData[idx + 1] + 0.0722 * srcData[idx + 2];
          const avgR =
            (srcData[nIdx] + srcData[sIdx] + srcData[wIdx] + srcData[eIdx] +
              srcData[nwIdx] + srcData[neIdx] + srcData[swIdx] + srcData[seIdx]) * 0.125;
          const avgG =
            (srcData[nIdx + 1] + srcData[sIdx + 1] + srcData[wIdx + 1] + srcData[eIdx + 1] +
              srcData[nwIdx + 1] + srcData[neIdx + 1] + srcData[swIdx + 1] + srcData[seIdx + 1]) * 0.125;
          const avgB =
            (srcData[nIdx + 2] + srcData[sIdx + 2] + srcData[wIdx + 2] + srcData[eIdx + 2] +
              srcData[nwIdx + 2] + srcData[neIdx + 2] + srcData[swIdx + 2] + srcData[seIdx + 2]) * 0.125;

          const lumaSurround = 0.2126 * avgR + 0.7152 * avgG + 0.0722 * avgB;
          const normL = lumaC / 255;
          const midWeight = 0.25 + 0.75 * (4.0 * normL * (1.0 - normL));
          const localDetail = clamp((lumaC - lumaSurround) * cStrength * midWeight, -16, 16);

          pass1Out[idx] = Math.round(clamp(srcData[idx] + localDetail, 0, 255));
          pass1Out[idx + 1] = Math.round(clamp(srcData[idx + 1] + localDetail, 0, 255));
          pass1Out[idx + 2] = Math.round(clamp(srcData[idx + 2] + localDetail, 0, 255));
        }
      }
    }

    const pass2Out = new Uint8ClampedArray(pass1Out);
    if (params.enabledShaders.LumaSharpen && params.sharpStrength > 0.01) {
      const strength = params.sharpStrength * 0.65;
      const maxClamp = params.sharpClamp * 255;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          const nIdx = ((y - 1) * w + x) * 4;
          const sIdx = ((y + 1) * w + x) * 4;
          const wIdx = (y * w + (x - 1)) * 4;
          const eIdx = (y * w + (x + 1)) * 4;

          const lumaC = 0.2126 * pass1Out[idx] + 0.7152 * pass1Out[idx + 1] + 0.0722 * pass1Out[idx + 2];
          const lumaBlur =
            0.25 *
            (0.2126 * (pass1Out[nIdx] + pass1Out[sIdx] + pass1Out[wIdx] + pass1Out[eIdx]) +
              0.7152 * (pass1Out[nIdx + 1] + pass1Out[sIdx + 1] + pass1Out[wIdx + 1] + pass1Out[eIdx + 1]) +
              0.0722 * (pass1Out[nIdx + 2] + pass1Out[sIdx + 2] + pass1Out[wIdx + 2] + pass1Out[eIdx + 2]));

          const sharpDiff = clamp((lumaC - lumaBlur) * strength, -maxClamp, maxClamp);
          pass2Out[idx] = Math.round(clamp(pass1Out[idx] + sharpDiff, 0, 255));
          pass2Out[idx + 1] = Math.round(clamp(pass1Out[idx + 1] + sharpDiff, 0, 255));
          pass2Out[idx + 2] = Math.round(clamp(pass1Out[idx + 2] + sharpDiff, 0, 255));
        }
      }
    }

    const finalOut = new Uint8ClampedArray(srcData.length);
    const pixelateEnabled =
      (params.enabledShaders.Pixelate ?? params.enabledShaders.PSXDither) &&
      params.psxPixelScale > 1.01;
    const pixelScale = pixelateEnabled ? Math.max(1.0, params.psxPixelScale) : 1.0;

    for (let y = 0; y < h; y++) {
      const sampleY =
        pixelScale > 1.01
          ? Math.min(h - 1, Math.floor((Math.floor(y / pixelScale) + 0.5) * pixelScale))
          : y;
      for (let x = 0; x < w; x++) {
        const sampleX =
          pixelScale > 1.01
            ? Math.min(w - 1, Math.floor((Math.floor(x / pixelScale) + 0.5) * pixelScale))
            : x;
        const srcIdx = (sampleY * w + sampleX) * 4;
        const dstIdx = (y * w + x) * 4;

        let [r, g, b] = transformPixelThroughPipeline(
          pass2Out[srcIdx],
          pass2Out[srcIdx + 1],
          pass2Out[srcIdx + 2],
          srcStats,
          refStats,
          params
        );

        if (params.enabledShaders.PSXDither) {
          [r, g, b] = applyPsxHardwareQuantization(
            r,
            g,
            b,
            x,
            y,
            params.psxBitDepth,
            params.psxDitherStrength,
            pixelScale
          );
        }

        finalOut[dstIdx] = r;
        finalOut[dstIdx + 1] = g;
        finalOut[dstIdx + 2] = b;
        finalOut[dstIdx + 3] = 255;
      }
    }

    if (params.enabledShaders.UIMask !== false) {
      const sampleLumaSat = (u: number, v: number) => {
        const px = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
        const py = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
        const i = (py * w + px) * 4;
        const r = srcData[i] / 255;
        const g = srcData[i + 1] / 255;
        const b = srcData[i + 2] / 255;
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const s = Math.max(r, g, b) - Math.min(r, g, b);
        return { r, g, b, l, s };
      };

      const probes = [
        sampleLumaSat(0.30, 0.25),
        sampleLumaSat(0.50, 0.25),
        sampleLumaSat(0.70, 0.25),
        sampleLumaSat(0.30, 0.50),
        sampleLumaSat(0.50, 0.50),
        sampleLumaSat(0.70, 0.50),
        sampleLumaSat(0.30, 0.72),
        sampleLumaSat(0.50, 0.72),
        sampleLumaSat(0.70, 0.72),
      ];

      let darkCount = 0;
      for (const p of probes) {
        if (p.l < 0.19 && p.s < 0.28) darkCount++;
      }

      const leftP = sampleLumaSat(0.05, 0.50);
      const rightP = sampleLumaSat(0.95, 0.50);
      const hasPillarbox = leftP.l < 0.12 && rightP.l < 0.12;
      const isMenuScreen = params.uiMaskAutoMenu !== false && darkCount >= 7;
      const topBarLimit = Math.floor((params.uiMaskTopBar ?? 0.072) * h);

      if (isMenuScreen) {
        finalOut.set(srcData);
      } else if (hasPillarbox) {
        const leftLimit = Math.floor(0.155 * w);
        const rightLimit = Math.floor(0.845 * w);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (y < topBarLimit || x < leftLimit || x > rightLimit) {
              const i = (y * w + x) * 4;
              finalOut[i] = srcData[i];
              finalOut[i + 1] = srcData[i + 1];
              finalOut[i + 2] = srcData[i + 2];
            }
          }
        }
      }
    }

    const processedImg = new ImageData(finalOut, w, h);
    processedBufferRef.current = processedImg;
  }, [sourceImageData, srcStats, refStats, params]);

  useEffect(() => {
    const canvas = displayCanvasRef.current;
    const processed = processedBufferRef.current;
    if (!canvas || !sourceImageData || !processed) return;

    const w = sourceImageData.width;
    const h = sourceImageData.height;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (viewMode === 'before') {
      ctx.putImageData(sourceImageData, 0, 0);
      return;
    }
    if (viewMode === 'after') {
      ctx.putImageData(processed, 0, 0);
      return;
    }
    if (viewMode === 'reference' && targetImageData) {
      ctx.putImageData(targetImageData, 0, 0);
      return;
    }

    ctx.putImageData(processed, 0, 0);
    const splitX = Math.floor(w * splitPos);
    ctx.putImageData(sourceImageData, 0, 0, 0, 0, splitX, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(splitX - 1, 0, 2, h);
  }, [sourceImageData, targetImageData, splitPos, viewMode, params, srcStats, refStats]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || viewMode !== 'split') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSplitPos(clamp((e.clientX - rect.left) / rect.width, 0.02, 0.98));
  };

  return (
    <section
      aria-label="Color Grading Viewport Stage"
      className="relative flex-1 min-h-[420px] bg-[#0B0F17] bg-industrial-base flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden select-none"
    >

      <FoundryStageBackdrop />

      <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap items-center gap-1 bevel-panel bg-[#141820]/95 px-1.5 py-1">
        {(
          [
            { id: 'split', label: 'SPLIT' },
            { id: 'after', label: 'OUTPUT' },
            { id: 'before', label: 'SOURCE' },
            { id: 'reference', label: 'REFERENCE' },
          ] as const
        ).map((tab) => {
          const active = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewModeChange(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                active
                  ? 'bevel-accent text-white'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {viewMode === 'split' && (
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[#2A3242]">
            <input
              type="range"
              aria-label="Split Wipe Position"
              min={2}
              max={98}
              value={Math.round(splitPos * 100)}
              onChange={(e) => setSplitPos(Number(e.target.value) / 100)}
              className="w-20 foundry-slider"
            />
            <span className="font-mono text-[10px] tabular-nums text-[#94A3B8] w-7">
              {Math.round(splitPos * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div
          className="relative w-full aspect-video overflow-hidden bevel-viewport cursor-ew-resize"
          onPointerDown={(e) => {
            if (viewMode === 'split') {
              setIsDragging(true);
              const rect = e.currentTarget.getBoundingClientRect();
              setSplitPos(clamp((e.clientX - rect.left) / rect.width, 0.02, 0.98));
            }
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          <canvas
            ref={displayCanvasRef}
            data-testid="reshade-preview-canvas"
            className="w-full h-full block object-cover"
            style={{ imageRendering: params.enabledShaders.PSXDither ? 'pixelated' : 'auto' }}
          />

          {viewMode === 'split' && (
            <>
              <div className="pointer-events-none absolute top-3 left-3 bevel-panel bg-[#0B0F17]/90 px-2.5 py-1 text-[11px] font-medium text-[#CBD5E1]">
                {sourceLabel}
              </div>
              <div className="pointer-events-none absolute top-3 right-3 bevel-panel bg-[#0B0F17]/90 px-2.5 py-1 text-[11px] font-medium text-[#F1F5F9]">
                {targetLabel}
              </div>
              <div
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-10 bg-[#E05A3A] border border-white shadow-md"
                style={{ left: `${splitPos * 100}%` }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};
