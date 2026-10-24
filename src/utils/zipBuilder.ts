export interface ZipFileEntry {

  path: string;

  data: string | Uint8Array;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function buildZipArchive(entries: ZipFileEntry[]): Uint8Array {
  const encoder = new TextEncoder();

  interface PreparedEntry {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc32: number;
    offset: number;
  }

  const prepared: PreparedEntry[] = [];
  let localTotalSize = 0;
  let centralTotalSize = 0;

  for (const entry of entries) {
    const cleanPath = entry.path.replace(/^\/+/, '').replace(/\\/g, '/');
    const nameBytes = encoder.encode(cleanPath);
    const dataBytes =
      typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc32 = computeCrc32(dataBytes);

    prepared.push({
      nameBytes,
      dataBytes,
      crc32,
      offset: localTotalSize,
    });

    localTotalSize += 30 + nameBytes.length + dataBytes.length;

    centralTotalSize += 46 + nameBytes.length;
  }

  const totalSize = localTotalSize + centralTotalSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  let ptr = 0;

  for (const item of prepared) {
    const len = item.dataBytes.length;
    const nameLen = item.nameBytes.length;

    view.setUint32(ptr, 0x04034b50, true);
    view.setUint16(ptr + 4, 20, true);
    view.setUint16(ptr + 6, 0x0800, true);
    view.setUint16(ptr + 8, 0, true);
    view.setUint16(ptr + 10, dosTime, true);
    view.setUint16(ptr + 12, dosDate, true);
    view.setUint32(ptr + 14, item.crc32, true);
    view.setUint32(ptr + 18, len, true);
    view.setUint32(ptr + 22, len, true);
    view.setUint16(ptr + 26, nameLen, true);
    view.setUint16(ptr + 28, 0, true);
    ptr += 30;

    out.set(item.nameBytes, ptr);
    ptr += nameLen;

    out.set(item.dataBytes, ptr);
    ptr += len;
  }

  const centralDirOffset = ptr;

  for (const item of prepared) {
    const len = item.dataBytes.length;
    const nameLen = item.nameBytes.length;

    view.setUint32(ptr, 0x02014b50, true);
    view.setUint16(ptr + 4, 20, true);
    view.setUint16(ptr + 6, 20, true);
    view.setUint16(ptr + 8, 0x0800, true);
    view.setUint16(ptr + 10, 0, true);
    view.setUint16(ptr + 12, dosTime, true);
    view.setUint16(ptr + 14, dosDate, true);
    view.setUint32(ptr + 16, item.crc32, true);
    view.setUint32(ptr + 20, len, true);
    view.setUint32(ptr + 24, len, true);
    view.setUint16(ptr + 28, nameLen, true);
    view.setUint16(ptr + 30, 0, true);
    view.setUint16(ptr + 32, 0, true);
    view.setUint16(ptr + 34, 0, true);
    view.setUint16(ptr + 36, 0, true);
    view.setUint32(ptr + 38, 0, true);
    view.setUint32(ptr + 42, item.offset, true);
    ptr += 46;

    out.set(item.nameBytes, ptr);
    ptr += nameLen;
  }

  view.setUint32(ptr, 0x06054b50, true);
  view.setUint16(ptr + 4, 0, true);
  view.setUint16(ptr + 6, 0, true);
  view.setUint16(ptr + 8, prepared.length, true);
  view.setUint16(ptr + 10, prepared.length, true);
  view.setUint32(ptr + 12, centralTotalSize, true);
  view.setUint32(ptr + 16, centralDirOffset, true);
  view.setUint16(ptr + 20, 0, true);

  return out;
}

export function buildReShadeProxyDllStub(
  dllName: string,
  apiLabel: string,
  arch: '32-bit' | '64-bit',
  gameTitle: string
): Uint8Array {
  const encoder = new TextEncoder();
  const banner = [
    `MZ_RESHADE_PROXY_MODULE`,
    `Target Game: ${gameTitle}`,
    `Injector Hook DLL: ${dllName}`,
    `Graphics Render API: ${apiLabel} (${arch})`,
    `Preset Config: ReShade.ini -> Preset.ini`,
    `LUT Texture Path: reshade-shaders/Textures/SpetLUT.png`,
    `Note: Extract all files into the game executable directory. If ReShade binary is not yet installed, run ReShade_Setup.exe once or replace ${dllName} with the official ReShade ${arch} ${dllName} binary.`,
  ].join('\r\n');

  const payload = encoder.encode(banner);
  const buffer = new Uint8Array(256 + payload.length);

  buffer[0] = 0x4d;
  buffer[1] = 0x5a;
  buffer[2] = 0x90;
  buffer[0x3c] = 0x80;

  buffer[0x80] = 0x50;
  buffer[0x81] = 0x45;
  buffer[0x82] = 0x00;
  buffer[0x83] = 0x00;

  if (arch === '64-bit') {
    buffer[0x84] = 0x64;
    buffer[0x85] = 0x86;
  } else {
    buffer[0x84] = 0x4c;
    buffer[0x85] = 0x01;
  }
  buffer.set(payload, 256);
  return buffer;
}

const dllBinaryCache: Partial<Record<'32-bit' | '64-bit', Uint8Array>> = {};

export async function fetchOfficialReShadeDllBytes(
  arch: '32-bit' | '64-bit',
  dllName: string,
  apiLabel: string,
  gameTitle: string
): Promise<Uint8Array> {
  const cached = dllBinaryCache[arch];
  if (cached && cached.byteLength > 100000) {
    return cached;
  }

  const binaryUrl = arch === '64-bit' ? './reshade/ReShade64.dll' : './reshade/ReShade32.dll';
  try {
    const response = await fetch(binaryUrl);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (bytes.byteLength > 1000000 && bytes[0] === 0x4d && bytes[1] === 0x5a) {
        dllBinaryCache[arch] = bytes;
        return bytes;
      }
    }
  } catch {

  }

  return buildReShadeProxyDllStub(dllName, apiLabel, arch, gameTitle);
}

export function buildReShadeFxhSource(): string {
  return `#pragma once

#define BUFFER_PIXEL_SIZE float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT)
#define BUFFER_SCREEN_SIZE float2(BUFFER_WIDTH, BUFFER_HEIGHT)
#define BUFFER_ASPECT_RATIO (BUFFER_WIDTH * BUFFER_RCP_HEIGHT)

namespace ReShade
{
  float GetAspectRatio() { return BUFFER_WIDTH * BUFFER_RCP_HEIGHT; }
  float2 GetPixelSize() { return float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT); }
  float2 GetScreenSize() { return float2(BUFFER_WIDTH, BUFFER_HEIGHT); }
  #define AspectRatio GetAspectRatio()
  #define PixelSize GetPixelSize()
  #define ScreenSize GetScreenSize()

  texture BackBufferTex : COLOR;
  texture DepthBufferTex : DEPTH;

  sampler BackBuffer { Texture = BackBufferTex; };
  sampler DepthBuffer { Texture = DepthBufferTex; };
}

void PostProcessVS(in uint id : SV_VertexID, out float4 position : SV_Position, out float2 texcoord : TEXCOORD)
{
  texcoord.x = (id == 2) ? 2.0 : 0.0;
  texcoord.y = (id == 1) ? 2.0 : 0.0;
  position = float4(texcoord * float2(2.0, -2.0) + float2(-1.0, 1.0), 0.0, 1.0);
}
`;
}

export function buildLutFxShaderSource(): string {
  return `#include "ReShade.fxh"

#ifndef fLUT_TextureName
  #define fLUT_TextureName "SpetLUT.png"
#endif
#ifndef fLUT_TileSizeXY
  #define fLUT_TileSizeXY 32
#endif
#ifndef fLUT_TileAmount
  #define fLUT_TileAmount 32
#endif
#ifndef SPET_PSX_ENABLE
  #define SPET_PSX_ENABLE 0
#endif
#ifndef SPET_PSX_SCALE
  #define SPET_PSX_SCALE 2.55
#endif
#ifndef SPET_PSX_BITS
  #define SPET_PSX_BITS 8
#endif
#ifndef SPET_RES_SCALE
  #define SPET_RES_SCALE 1
#endif

uniform float fLUT_AmountChroma <
  ui_type = "slider";
  ui_min = 0.00; ui_max = 1.00;
  ui_label = "LUT Chroma Amount";
> = 1.00;

uniform float fLUT_AmountLuma <
  ui_type = "slider";
  ui_min = 0.00; ui_max = 1.00;
  ui_label = "LUT Luma Amount";
> = 1.00;

uniform float iLUT_PixelScale <
  ui_type = "slider";
  ui_min = 1.00; ui_max = 6.00; ui_step = 0.05;
  ui_label = "PSX Resolution Pixel Scale (Float)";
> = SPET_PSX_SCALE;

uniform int iLUT_ResolutionScale <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Scale Pixel Size by Screen Resolution (1080p Base)";
> = SPET_RES_SCALE;

uniform int iLUT_BitDepth <
  ui_type = "slider";
  ui_min = 4; ui_max = 8;
  ui_label = "PSX Color Bit Depth (5 = 15-bit RGB555)";
> = SPET_PSX_BITS;

uniform float fLUT_DitherStrength <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 1.5; ui_step = 0.05;
  ui_label = "PSX Ordered 4x4 Bayer Dither";
> = 0.62;

texture texLUT < source = fLUT_TextureName; > {
  Width = fLUT_TileSizeXY * fLUT_TileAmount;
  Height = fLUT_TileSizeXY;
  Format = RGBA8;
};

sampler SamplerLUT {
  Texture = texLUT;
  AddressU = CLAMP;
  AddressV = CLAMP;
  AddressW = CLAMP;
  MinFilter = LINEAR;
  MagFilter = LINEAR;
  MipFilter = LINEAR;
};

void PS_LUT_Apply(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float activeScale = iLUT_PixelScale;
  int activeBits = iLUT_BitDepth;

  float resFactor = (iLUT_ResolutionScale == 1) ? clamp(BUFFER_HEIGHT / 1080.0, 0.5, 4.0) : 1.0;
  float effScale = (activeScale > 1.01) ? max(1.0, activeScale * resFactor) : 1.0;

  float2 screenPos = texcoord.xy * float2(BUFFER_WIDTH, BUFFER_HEIGHT);
  float2 blockCoord = floor(screenPos / effScale);
  float2 sampleUv = (effScale > 1.01)
    ? ((blockCoord * effScale + 0.5 * effScale) * float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT))
    : texcoord.xy;

  float4 color = tex2D(ReShade::BackBuffer, sampleUv);
  float2 texelsize = 1.0 / fLUT_TileSizeXY;
  texelsize.x /= fLUT_TileAmount;

  float3 lutcoord = float3(
    (color.xy * fLUT_TileSizeXY - color.xy + 0.5) * texelsize.xy,
    color.z * fLUT_TileSizeXY - color.z
  );

  float lerpfact = frac(lutcoord.z);
  lutcoord.x += (lutcoord.z - lerpfact) * texelsize.y;

  float3 lutcolor = lerp(
    tex2D(SamplerLUT, lutcoord.xy).xyz,
    tex2D(SamplerLUT, float2(lutcoord.x + texelsize.y, lutcoord.y)).xyz,
    lerpfact
  );

  float3 graded = lerp(color.xyz, lutcolor.xyz, fLUT_AmountChroma);
  float origLuma = dot(color.xyz, float3(0.2126, 0.7152, 0.0722));
  float lutLuma = dot(graded, float3(0.2126, 0.7152, 0.0722));
  color.xyz = saturate(graded + (origLuma - lutLuma) * (1.0 - fLUT_AmountLuma));

  if (activeBits < 8) {
    float bx = floor(frac(blockCoord.x * 0.25) * 4.0 + 0.1);
    float by = floor(frac(blockCoord.y * 0.25) * 4.0 + 0.1);
    float4 row0 = float4(-4.0,  0.0, -3.0,  1.0);
    float4 row1 = float4( 2.0, -2.0,  3.0, -1.0);
    float4 row2 = float4(-3.0,  1.0, -4.0,  0.0);
    float4 row3 = float4( 3.0, -1.0,  2.0, -2.0);
    float4 row = (by < 0.5) ? row0 : ((by < 1.5) ? row1 : ((by < 2.5) ? row2 : row3));
    float bayer = (bx < 0.5) ? row.x : ((bx < 1.5) ? row.y : ((bx < 2.5) ? row.z : row.w));

    float ditherOffset = (bayer * fLUT_DitherStrength * 1.00) / 255.0;
    float levels = (activeBits <= 4) ? 15.0 : ((activeBits == 5) ? 31.0 : ((activeBits == 6) ? 63.0 : ((activeBits == 7) ? 127.0 : 255.0)));
    color.xyz = saturate(color.xyz + ditherOffset);
    color.xyz = floor(color.xyz * levels + 0.5) / levels;
  }

  res.xyz = saturate(color.xyz);
  res.w = 1.0;
}

technique LUT {
  pass LUT_Apply {
    VertexShader = PostProcessVS;
    PixelShader = PS_LUT_Apply;
  }
}
`;
}

export function buildReShadeShaderEntries(): ZipFileEntry[] {
  const pixelateFx = `#include "ReShade.fxh"

#ifndef SPET_PSX_SCALE
  #define SPET_PSX_SCALE 2.55
#endif
#ifndef SPET_RES_SCALE
  #define SPET_RES_SCALE 1
#endif

uniform int iPixelate_Enable <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Enable Low-Res Texel Pixelation";
> = 1;

uniform float iPixelate_CellSize <
  ui_type = "slider";
  ui_min = 1.00; ui_max = 6.00; ui_step = 0.05;
  ui_label = "Texel Cell Size (Float, e.g. 2.55)";
> = SPET_PSX_SCALE;

uniform int iPixelate_ResolutionScale <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Scale Cell Size by Resolution (BUFFER_HEIGHT / 1080p)";
> = SPET_RES_SCALE;

void PS_Pixelate(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  if (iPixelate_Enable == 0 || iPixelate_CellSize <= 1.01) {
    res = float4(tex2D(ReShade::BackBuffer, texcoord).rgb, 1.0);
    return;
  }

  float resFactor = (iPixelate_ResolutionScale == 1) ? clamp(BUFFER_HEIGHT / 1080.0, 0.5, 4.0) : 1.0;
  float effScale = max(1.0, iPixelate_CellSize * resFactor);

  float2 screenPos = texcoord.xy * float2(BUFFER_WIDTH, BUFFER_HEIGHT);
  float2 blockCoord = floor(screenPos / effScale);
  float2 blockCenter = (blockCoord + 0.5) * effScale;
  float2 rcpScreen = float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT);

  float2 d = effScale * 0.18;
  float3 c0 = tex2D(ReShade::BackBuffer, (blockCenter + float2(-d.x, -d.y)) * rcpScreen).rgb;
  float3 c1 = tex2D(ReShade::BackBuffer, (blockCenter + float2( d.x, -d.y)) * rcpScreen).rgb;
  float3 c2 = tex2D(ReShade::BackBuffer, (blockCenter + float2(-d.x,  d.y)) * rcpScreen).rgb;
  float3 c3 = tex2D(ReShade::BackBuffer, (blockCenter + float2( d.x,  d.y)) * rcpScreen).rgb;

  res = float4(0.25 * (c0 + c1 + c2 + c3), 1.0);
}

technique Pixelate {
  pass PixelatePass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Pixelate;
  }
}
`;

  const ditherFx = `#include "ReShade.fxh"

#ifndef SPET_LUT_HANDLES_PSX
  #define SPET_LUT_HANDLES_PSX 0
#endif
#ifndef SPET_RES_SCALE
  #define SPET_RES_SCALE 1
#endif

uniform int fDitherBitDepth <
  ui_type = "slider";
  ui_min = 4; ui_max = 8;
  ui_label = "PSX Color Bit Depth (5 = 15-bit RGB555)";
> = 5;

uniform float fDitherStrength <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 1.5; ui_step = 0.05;
  ui_label = "Ordered Bayer Dither Strength";
> = 0.62;

uniform float iDitherPixelScale <
  ui_type = "slider";
  ui_min = 1.00; ui_max = 6.00; ui_step = 0.05;
  ui_label = "PSX Resolution Pixel Scale (Float)";
> = 2.55;

uniform int iDitherResolutionScale <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Scale Dither Grid by Resolution (BUFFER_HEIGHT / 1080p)";
> = SPET_RES_SCALE;

void PS_Dither(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
#if SPET_LUT_HANDLES_PSX == 1
  res = float4(tex2D(ReShade::BackBuffer, texcoord).rgb, 1.0);
#else
  float resFactor = (iDitherResolutionScale == 1) ? clamp(BUFFER_HEIGHT / 1080.0, 0.5, 4.0) : 1.0;
  float effScale = (iDitherPixelScale > 1.01) ? max(1.0, iDitherPixelScale * resFactor) : 1.0;
  float2 screenPos = texcoord.xy * float2(BUFFER_WIDTH, BUFFER_HEIGHT);
  float2 blockCoord = floor(screenPos / effScale);
  float2 sampleUv = (effScale > 1.01)
    ? ((blockCoord * effScale + 0.5 * effScale) * float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT))
    : texcoord.xy;
  float3 col = tex2D(ReShade::BackBuffer, sampleUv).rgb;

  if (fDitherBitDepth < 8) {
    float bx = floor(frac(blockCoord.x * 0.25) * 4.0 + 0.1);
    float by = floor(frac(blockCoord.y * 0.25) * 4.0 + 0.1);
    float4 row0 = float4(-4.0,  0.0, -3.0,  1.0);
    float4 row1 = float4( 2.0, -2.0,  3.0, -1.0);
    float4 row2 = float4(-3.0,  1.0, -4.0,  0.0);
    float4 row3 = float4( 3.0, -1.0,  2.0, -2.0);
    float4 row = (by < 0.5) ? row0 : ((by < 1.5) ? row1 : ((by < 2.5) ? row2 : row3));
    float bayer = (bx < 0.5) ? row.x : ((bx < 1.5) ? row.y : ((bx < 2.5) ? row.z : row.w));

    float ditherOffset = (bayer * fDitherStrength * 1.00) / 255.0;
    float levels = (fDitherBitDepth <= 4) ? 15.0 : ((fDitherBitDepth == 5) ? 31.0 : ((fDitherBitDepth == 6) ? 63.0 : ((fDitherBitDepth == 7) ? 127.0 : 255.0)));
    col = saturate(col + ditherOffset);
    col = floor(col * levels + 0.5) / levels;
  }

  res = float4(saturate(col), 1.0);
#endif
}

technique Dither {
  pass DitherPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Dither;
  }
}
`;

  const lumaSharpenFx = `#include "ReShade.fxh"

uniform float sharp_strength <
  ui_type = "slider";
  ui_min = 0.1; ui_max = 3.0;
  ui_label = "Sharpening Strength";
> = 1.05;

uniform float sharp_clamp <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 1.0;
  ui_label = "Sharpening Clamp";
> = 0.035;

uniform int pattern <
  ui_type = "combo";
  ui_items = "Fast\\0Normal\\0Wider\\0Pyramid\\0";
> = 1;

uniform float offset_bias <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 6.0;
> = 1.0;

uniform int show_sharpen <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
> = 0;

void PS_LumaSharpen(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 ori = tex2D(ReShade::BackBuffer, texcoord).rgb;
  float2 px = BUFFER_PIXEL_SIZE * max(0.5, offset_bias);

  float3 n = tex2D(ReShade::BackBuffer, texcoord + float2(0.0, -px.y)).rgb;
  float3 s = tex2D(ReShade::BackBuffer, texcoord + float2(0.0,  px.y)).rgb;
  float3 w = tex2D(ReShade::BackBuffer, texcoord + float2(-px.x, 0.0)).rgb;
  float3 e = tex2D(ReShade::BackBuffer, texcoord + float2( px.x, 0.0)).rgb;

  float3 blur = 0.25 * (n + s + w + e);
  float lumaOri = dot(ori, float3(0.2126, 0.7152, 0.0722));
  float lumaBlur = dot(blur, float3(0.2126, 0.7152, 0.0722));

  float diff = clamp((lumaOri - lumaBlur) * (sharp_strength * 0.65), -sharp_clamp, sharp_clamp);
  res = float4( (show_sharpen == 1) ? float3(0.5 + diff * 4.0, 0.5 + diff * 4.0, 0.5 + diff * 4.0) : saturate(ori + diff), 1.0);
}

technique LumaSharpen {
  pass LumaSharpenPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_LumaSharpen;
  }
}
`;

  const clarityFx = `#include "ReShade.fxh"

uniform int ClarityRadius < ui_type = "slider"; ui_min = 1; ui_max = 8; > = 3;
uniform int ClarityBlendMode < ui_type = "slider"; ui_min = 0; ui_max = 3; > = 2;
uniform float ClarityStrength < ui_type = "slider"; ui_min = 0.0; ui_max = 1.0; > = 0.40;
uniform float ClarityDarkIntensity < ui_type = "slider"; ui_min = 0.0; ui_max = 1.0; > = 0.45;
uniform float ClarityLightIntensity < ui_type = "slider"; ui_min = 0.0; ui_max = 1.0; > = 0.45;

void PS_Clarity(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
  float2 rad = BUFFER_PIXEL_SIZE * float(max(1, ClarityRadius));

  float3 sum = 0.0;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2(0.0, -rad.y)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2(0.0,  rad.y)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2(-rad.x, 0.0)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2( rad.x, 0.0)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2(-rad.x, -rad.y)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2( rad.x, -rad.y)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2(-rad.x,  rad.y)).rgb;
  sum += tex2D(ReShade::BackBuffer, texcoord + float2( rad.x,  rad.y)).rgb;
  float3 surround = sum * 0.125;

  float lumaC = dot(c, float3(0.2126, 0.7152, 0.0722));
  float lumaS = dot(surround, float3(0.2126, 0.7152, 0.0722));
  float midWeight = 0.25 + 0.75 * (4.0 * lumaC * (1.0 - lumaC));
  float detail = clamp((lumaC - lumaS) * (ClarityStrength * 0.28) * midWeight, -0.0625, 0.0625);

  res = float4(saturate(c + detail), 1.0);
}

technique Clarity {
  pass ClarityPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Clarity;
  }
}
`;

  const levelsFx = `#include "ReShade.fxh"
#ifndef SPET_LUT_BAKED_PIPELINE
  #define SPET_LUT_BAKED_PIPELINE 0
#endif

uniform int BlackPoint < ui_type = "slider"; ui_min = 0; ui_max = 255; > = 0;
uniform int WhitePoint < ui_type = "slider"; ui_min = 0; ui_max = 255; > = 255;
uniform int HighlightClipping < ui_type = "slider"; ui_min = 0; ui_max = 1; > = 0;

void PS_Levels(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
#if SPET_LUT_BAKED_PIPELINE == 0
  float bp = float(BlackPoint) / 255.0;
  float wp = float(WhitePoint) / 255.0;
  c = saturate((c - bp) / max(0.05, wp - bp));
#endif
  res = float4(c, 1.0);
}

technique Levels {
  pass LevelsPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Levels;
  }
}
`;

  const liftGammaGainFx = `#include "ReShade.fxh"
#ifndef SPET_LUT_BAKED_PIPELINE
  #define SPET_LUT_BAKED_PIPELINE 0
#endif

uniform float3 RGB_Lift < ui_type = "slider"; ui_min = 0.0; ui_max = 2.0; > = float3(1.0, 1.0, 1.0);
uniform float3 RGB_Gamma < ui_type = "slider"; ui_min = 0.0; ui_max = 2.0; > = float3(1.0, 1.0, 1.0);
uniform float3 RGB_Gain < ui_type = "slider"; ui_min = 0.0; ui_max = 2.0; > = float3(1.0, 1.0, 1.0);

void PS_LiftGammaGain(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
#if SPET_LUT_BAKED_PIPELINE == 0
  c = c * (1.5 - 0.5 * RGB_Lift) + 0.5 * RGB_Lift - 0.5;
  c = saturate(c) * RGB_Gain;
  c = pow(max(1e-5, saturate(c)), 1.0 / max(0.2, RGB_Gamma));
#endif
  res = float4(saturate(c), 1.0);
}

technique LiftGammaGain {
  pass LiftGammaGainPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_LiftGammaGain;
  }
}
`;

  const curvesFx = `#include "ReShade.fxh"
#ifndef SPET_LUT_BAKED_PIPELINE
  #define SPET_LUT_BAKED_PIPELINE 0
#endif

uniform int Mode < ui_type = "slider"; ui_min = 0; ui_max = 2; > = 0;
uniform int Formula < ui_type = "slider"; ui_min = 0; ui_max = 10; > = 4;
uniform float Contrast < ui_type = "slider"; ui_min = -1.0; ui_max = 1.0; > = 0.0;

void PS_Curves(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
#if SPET_LUT_BAKED_PIPELINE == 0
  float3 sCurve = c * c * (3.0 - 2.0 * c);
  c = saturate(c + (sCurve - c) * Contrast);
#endif
  res = float4(c, 1.0);
}

technique Curves {
  pass CurvesPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Curves;
  }
}
`;

  const tonemapFx = `#include "ReShade.fxh"
#ifndef SPET_LUT_BAKED_PIPELINE
  #define SPET_LUT_BAKED_PIPELINE 0
#endif

uniform float Gamma < ui_type = "slider"; ui_min = 0.2; ui_max = 2.0; > = 1.0;
uniform float Exposure < ui_type = "slider"; ui_min = -1.0; ui_max = 1.0; > = 0.0;
uniform float Saturation < ui_type = "slider"; ui_min = -1.0; ui_max = 1.0; > = 0.0;
uniform float Bleach < ui_type = "slider"; ui_min = 0.0; ui_max = 1.0; > = 0.0;
uniform float Defog < ui_type = "slider"; ui_min = 0.0; ui_max = 1.0; > = 0.0;
uniform float3 FogColor < ui_type = "color"; > = float3(1.0, 1.0, 1.0);

void PS_Tonemap(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
#if SPET_LUT_BAKED_PIPELINE == 0
  c = saturate(c - Defog * FogColor);
  c = pow(max(1e-5, saturate(c * exp2(Exposure * 0.5))), max(0.2, Gamma));
  float luma = dot(c, float3(0.2126, 0.7152, 0.0722));
  c = saturate(luma + (c - luma) * (1.0 + Saturation * 0.5));
#endif
  res = float4(c, 1.0);
}

technique Tonemap {
  pass TonemapPass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Tonemap;
  }
}
`;

  const vibranceFx = `#include "ReShade.fxh"
#ifndef SPET_LUT_BAKED_PIPELINE
  #define SPET_LUT_BAKED_PIPELINE 0
#endif

uniform float Vibrance < ui_type = "slider"; ui_min = -1.0; ui_max = 1.0; > = 0.15;

void PS_Vibrance(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
#if SPET_LUT_BAKED_PIPELINE == 0
  float maxC = max(c.r, max(c.g, c.b));
  float minC = min(c.r, min(c.g, c.b));
  float sat = maxC - minC;
  float luma = dot(c, float3(0.2126, 0.7152, 0.0722));
  float midMask = 4.0 * luma * (1.0 - luma);
  float boost = 1.0 + Vibrance * 0.45 * (1.0 - sat) * (0.35 + 0.65 * midMask);
  c = saturate(luma + (c - luma) * boost);
#endif
  res = float4(c, 1.0);
}

technique Vibrance {
  pass VibrancePass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Vibrance;
  }
}
`;

  const technicolor2Fx = `#include "ReShade.fxh"
#ifndef SPET_LUT_BAKED_PIPELINE
  #define SPET_LUT_BAKED_PIPELINE 0
#endif

uniform float3 ColorStrength < ui_type = "color"; > = float3(0.2, 0.2, 0.2);
uniform float Brightness < ui_type = "slider"; ui_min = 0.5; ui_max = 1.5; > = 1.0;
uniform float Saturation < ui_type = "slider"; ui_min = 0.0; ui_max = 1.5; > = 1.0;
uniform float Strength < ui_type = "slider"; ui_min = 0.0; ui_max = 1.0; > = 0.0;

void PS_Technicolor2(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 c = tex2D(ReShade::BackBuffer, texcoord).rgb;
#if SPET_LUT_BAKED_PIPELINE == 0
  float3 t = saturate(c * (1.0 - ColorStrength * 0.25) * Brightness);
  c = lerp(c, t, saturate(Strength));
#endif
  res = float4(c, 1.0);
}

technique Technicolor2 {
  pass Technicolor2Pass {
    VertexShader = PostProcessVS;
    PixelShader = PS_Technicolor2;
  }
}
`;

  const uiMaskFx = `#include "ReShade.fxh"

uniform int iUIMask_Enable <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Enable UI & Menu Protection";
> = 1;

uniform int iUIMask_AutoMenuBypass <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Auto Bypass on Main Menus & Pause Screens";
> = 1;

uniform float fUIMask_TopBarHeight <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 0.15;
  ui_label = "Top Menu / Window Bar Safe Zone";
> = 0.072;

uniform float fUIMask_BottomBarHeight <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 0.15;
  ui_label = "Bottom Status Bar Safe Zone";
> = 0.00;

uniform int iUIMask_PillarboxGuard <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Protect 4:3 Pillarbox / Side Overlay Borders";
> = 1;

uniform int iUIMask_HudProtection <
  ui_type = "slider";
  ui_min = 0; ui_max = 1;
  ui_label = "Protect In-Game HUD & Crisp 1px UI Text";
> = 1;

uniform float fUIMask_TextSharpnessThreshold <
  ui_type = "slider";
  ui_min = 0.0; ui_max = 1.0;
  ui_label = "UI Text & HUD Restoration Strength";
> = 0.80;

texture texSpetOrigBackBuffer {
  Width = BUFFER_WIDTH;
  Height = BUFFER_HEIGHT;
  Format = RGBA8;
};

sampler SamplerSpetOrigBackBuffer {
  Texture = texSpetOrigBackBuffer;
  AddressU = CLAMP;
  AddressV = CLAMP;
  MinFilter = LINEAR;
  MagFilter = LINEAR;
};

void PS_KeepUI_Pre(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  res = tex2D(ReShade::BackBuffer, texcoord);
}

void PS_KeepUI_Post(float4 vpos : SV_Position, float2 texcoord : TEXCOORD, out float4 res : SV_Target0) {
  float3 gradedColor = tex2D(ReShade::BackBuffer, texcoord).rgb;
  if (iUIMask_Enable == 0) {
    res = float4(gradedColor, 1.0);
    return;
  }

  float3 origColor = tex2D(SamplerSpetOrigBackBuffer, texcoord).rgb;
  float uiMask = 0.0;

  if (texcoord.y < fUIMask_TopBarHeight) {
    uiMask = 1.0;
  }
  if (fUIMask_BottomBarHeight > 0.001 && texcoord.y > (1.0 - fUIMask_BottomBarHeight)) {
    uiMask = 1.0;
  }

  if (iUIMask_PillarboxGuard == 1 && (texcoord.x < 0.155 || texcoord.x > 0.845)) {
    float3 leftProbe = tex2D(SamplerSpetOrigBackBuffer, float2(0.05, 0.50)).rgb;
    float3 rightProbe = tex2D(SamplerSpetOrigBackBuffer, float2(0.95, 0.50)).rgb;
    float lLeft = dot(leftProbe, float3(0.2126, 0.7152, 0.0722));
    float lRight = dot(rightProbe, float3(0.2126, 0.7152, 0.0722));
    if (lLeft < 0.12 && lRight < 0.12) {
      uiMask = 1.0;
    }
  }

  if (iUIMask_AutoMenuBypass == 1 && uiMask < 0.99) {
    float3 c0 = tex2D(SamplerSpetOrigBackBuffer, float2(0.30, 0.25)).rgb;
    float3 c1 = tex2D(SamplerSpetOrigBackBuffer, float2(0.50, 0.25)).rgb;
    float3 c2 = tex2D(SamplerSpetOrigBackBuffer, float2(0.70, 0.25)).rgb;
    float3 c3 = tex2D(SamplerSpetOrigBackBuffer, float2(0.30, 0.50)).rgb;
    float3 c4 = tex2D(SamplerSpetOrigBackBuffer, float2(0.50, 0.50)).rgb;
    float3 c5 = tex2D(SamplerSpetOrigBackBuffer, float2(0.70, 0.50)).rgb;
    float3 c6 = tex2D(SamplerSpetOrigBackBuffer, float2(0.30, 0.72)).rgb;
    float3 c7 = tex2D(SamplerSpetOrigBackBuffer, float2(0.50, 0.72)).rgb;
    float3 c8 = tex2D(SamplerSpetOrigBackBuffer, float2(0.70, 0.72)).rgb;

    float l0 = dot(c0, float3(0.2126, 0.7152, 0.0722));
    float l1 = dot(c1, float3(0.2126, 0.7152, 0.0722));
    float l2 = dot(c2, float3(0.2126, 0.7152, 0.0722));
    float l3 = dot(c3, float3(0.2126, 0.7152, 0.0722));
    float l4 = dot(c4, float3(0.2126, 0.7152, 0.0722));
    float l5 = dot(c5, float3(0.2126, 0.7152, 0.0722));
    float l6 = dot(c6, float3(0.2126, 0.7152, 0.0722));
    float l7 = dot(c7, float3(0.2126, 0.7152, 0.0722));
    float l8 = dot(c8, float3(0.2126, 0.7152, 0.0722));

    float s0 = max(c0.r, max(c0.g, c0.b)) - min(c0.r, min(c0.g, c0.b));
    float s1 = max(c1.r, max(c1.g, c1.b)) - min(c1.r, min(c1.g, c1.b));
    float s2 = max(c2.r, max(c2.g, c2.b)) - min(c2.r, min(c2.g, c2.b));
    float s3 = max(c3.r, max(c3.g, c3.b)) - min(c3.r, min(c3.g, c3.b));
    float s4 = max(c4.r, max(c4.g, c4.b)) - min(c4.r, min(c4.g, c4.b));
    float s5 = max(c5.r, max(c5.g, c5.b)) - min(c5.r, min(c5.g, c5.b));
    float s6 = max(c6.r, max(c6.g, c6.b)) - min(c6.r, min(c6.g, c6.b));
    float s7 = max(c7.r, max(c7.g, c7.b)) - min(c7.r, min(c7.g, c7.b));
    float s8 = max(c8.r, max(c8.g, c8.b)) - min(c8.r, min(c8.g, c8.b));

    float darkCount = 0.0;
    darkCount += (l0 < 0.19 && s0 < 0.28) ? 1.0 : 0.0;
    darkCount += (l1 < 0.19 && s1 < 0.28) ? 1.0 : 0.0;
    darkCount += (l2 < 0.19 && s2 < 0.28) ? 1.0 : 0.0;
    darkCount += (l3 < 0.19 && s3 < 0.28) ? 1.0 : 0.0;
    darkCount += (l4 < 0.19 && s4 < 0.28) ? 1.0 : 0.0;
    darkCount += (l5 < 0.19 && s5 < 0.28) ? 1.0 : 0.0;
    darkCount += (l6 < 0.19 && s6 < 0.28) ? 1.0 : 0.0;
    darkCount += (l7 < 0.19 && s7 < 0.28) ? 1.0 : 0.0;
    darkCount += (l8 < 0.19 && s8 < 0.28) ? 1.0 : 0.0;

    float flatPairs = 0.0;
    flatPairs += (abs(c0.r - c1.r) + abs(c0.g - c1.g) + abs(c0.b - c1.b) < 0.035) ? 1.0 : 0.0;
    flatPairs += (abs(c1.r - c2.r) + abs(c1.g - c2.g) + abs(c1.b - c2.b) < 0.035) ? 1.0 : 0.0;
    flatPairs += (abs(c3.r - c4.r) + abs(c3.g - c4.g) + abs(c3.b - c4.b) < 0.035) ? 1.0 : 0.0;
    flatPairs += (abs(c4.r - c5.r) + abs(c4.g - c5.g) + abs(c4.b - c5.b) < 0.035) ? 1.0 : 0.0;
    flatPairs += (abs(c6.r - c7.r) + abs(c6.g - c7.g) + abs(c6.b - c7.b) < 0.035) ? 1.0 : 0.0;
    flatPairs += (abs(c7.r - c8.r) + abs(c7.g - c8.g) + abs(c7.b - c8.b) < 0.035) ? 1.0 : 0.0;

    if (darkCount >= 6.5 || flatPairs >= 5.0) {
      uiMask = 1.0;
    }
  }

  if (iUIMask_HudProtection == 1 && uiMask < 0.99) {
    float2 px4 = BUFFER_PIXEL_SIZE * 4.0;
    float3 n4 = tex2D(SamplerSpetOrigBackBuffer, texcoord + float2(0.0, -px4.y)).rgb;
    float3 s4 = tex2D(SamplerSpetOrigBackBuffer, texcoord + float2(0.0,  px4.y)).rgb;
    float3 w4 = tex2D(SamplerSpetOrigBackBuffer, texcoord + float2(-px4.x, 0.0)).rgb;
    float3 e4 = tex2D(SamplerSpetOrigBackBuffer, texcoord + float2( px4.x, 0.0)).rgb;

    float origLuma = dot(origColor, float3(0.2126, 0.7152, 0.0722));
    float origSat = max(origColor.r, max(origColor.g, origColor.b)) - min(origColor.r, min(origColor.g, origColor.b));
    float ln4 = dot(n4, float3(0.2126, 0.7152, 0.0722));
    float ls4 = dot(s4, float3(0.2126, 0.7152, 0.0722));
    float lw4 = dot(w4, float3(0.2126, 0.7152, 0.0722));
    float le4 = dot(e4, float3(0.2126, 0.7152, 0.0722));
    float minLuma4 = min(min(ln4, ls4), min(lw4, le4));
    float maxLuma4 = max(max(ln4, ls4), max(lw4, le4));

    if (texcoord.x >= 0.17 && texcoord.x <= 0.37 && texcoord.y >= 0.14 && texcoord.y <= 0.29) {
      if (origLuma < 0.045 || minLuma4 < 0.045) {
        uiMask = max(uiMask, fUIMask_TextSharpnessThreshold);
      }
    }

    if (texcoord.x >= 0.33 && texcoord.x <= 0.67 && texcoord.y >= 0.88 && texcoord.y <= 0.975) {
      if (origLuma < 0.18 || minLuma4 < 0.18 || origLuma > 0.56 || (maxLuma4 - minLuma4) > 0.20) {
        uiMask = 1.0;
      }
    }

    if (texcoord.x >= 0.24 && texcoord.x <= 0.76 && texcoord.y >= 0.18 && texcoord.y <= 0.82) {
      float3 cm0 = tex2D(SamplerSpetOrigBackBuffer, float2(0.36, 0.48)).rgb;
      float3 cm1 = tex2D(SamplerSpetOrigBackBuffer, float2(0.50, 0.48)).rgb;
      float3 cm2 = tex2D(SamplerSpetOrigBackBuffer, float2(0.64, 0.48)).rgb;
      float lcm0 = dot(cm0, float3(0.2126, 0.7152, 0.0722));
      float lcm1 = dot(cm1, float3(0.2126, 0.7152, 0.0722));
      float lcm2 = dot(cm2, float3(0.2126, 0.7152, 0.0722));
      float scm1 = max(cm1.r, max(cm1.g, cm1.b)) - min(cm1.r, min(cm1.g, cm1.b));
      if (lcm0 < 0.15 && lcm1 < 0.15 && lcm2 < 0.15 && scm1 < 0.20) {
        uiMask = max(uiMask, fUIMask_TextSharpnessThreshold);
      }
    }
  }

  res = float4(lerp(gradedColor, origColor, saturate(uiMask)), 1.0);
}

technique KeepUI_Pre {
  pass SaveOriginalFrame {
    VertexShader = PostProcessVS;
    PixelShader = PS_KeepUI_Pre;
    RenderTarget = texSpetOrigBackBuffer;
  }
}

technique KeepUI_Post {
  pass RestoreUIMask {
    VertexShader = PostProcessVS;
    PixelShader = PS_KeepUI_Post;
  }
}
`;

  return [
    { path: 'reshade-shaders/Shaders/ReShade.fxh', data: buildReShadeFxhSource() },
    { path: 'reshade-shaders/Shaders/UIMask.fx', data: uiMaskFx },
    { path: 'reshade-shaders/Shaders/Pixelate.fx', data: pixelateFx },
    { path: 'reshade-shaders/Shaders/LUT.fx', data: buildLutFxShaderSource() },
    { path: 'reshade-shaders/Shaders/Dither.fx', data: ditherFx },
    { path: 'reshade-shaders/Shaders/LumaSharpen.fx', data: lumaSharpenFx },
    { path: 'reshade-shaders/Shaders/Clarity.fx', data: clarityFx },
    { path: 'reshade-shaders/Shaders/Levels.fx', data: levelsFx },
    { path: 'reshade-shaders/Shaders/LiftGammaGain.fx', data: liftGammaGainFx },
    { path: 'reshade-shaders/Shaders/Curves.fx', data: curvesFx },
    { path: 'reshade-shaders/Shaders/Tonemap.fx', data: tonemapFx },
    { path: 'reshade-shaders/Shaders/Vibrance.fx', data: vibranceFx },
    { path: 'reshade-shaders/Shaders/Technicolor2.fx', data: technicolor2Fx },
  ];
}

export function buildReShadeConfigIni(presetFileName: string): string {
  const cleanPreset = presetFileName.endsWith('.ini')
    ? presetFileName
    : `${presetFileName}.ini`;
  return `[GENERAL]
EffectSearchPaths=.\\reshade-shaders\\Shaders\\**
TextureSearchPaths=.\\reshade-shaders\\Textures\\**
PresetPath=.\\${cleanPreset}
PresetTransitionDelay=0
SkipLoadingDisabledEffects=0
PerformanceMode=0

[INPUT]
KeyOverlay=36,0,0,0
KeyEffects=35,0,0,0
`;
}
