import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rgbToLab,
  labToRgb,
  analyzeImageBuffer,
  deriveReShadeParameters,
  buildGenericFilterParams,
  applyPsxHardwareQuantization,
  transformPixelThroughPipeline,
  generate3DLutRgba,
  compileReShadeIni,
} from './colorMath';
import { resolveGameApiLocally } from './gameApiDatabase';
import {
  buildZipArchive,
  buildReShadeProxyDllStub,
  buildReShadeShaderEntries,
  buildReShadeConfigIni,
} from './zipBuilder';

test('rgbToLab and labToRgb round-trip accurately within 1 sRGB unit', () => {
  const samples: [number, number, number][] = [
    [0, 0, 0],
    [255, 255, 255],
    [128, 128, 128],
    [214, 92, 45],
    [32, 140, 195],
    [85, 160, 72],
  ];

  for (const [r, g, b] of samples) {
    const lab = rgbToLab(r, g, b);
    const [rt, gt, bt] = labToRgb(lab.L, lab.a, lab.b);
    assert.ok(Math.abs(r - rt) <= 1, `Red mismatch: ${r} vs ${rt}`);
    assert.ok(Math.abs(g - gt) <= 1, `Green mismatch: ${g} vs ${gt}`);
    assert.ok(Math.abs(b - bt) <= 1, `Blue mismatch: ${b} vs ${bt}`);
  }
});

test('applyPsxHardwareQuantization quantizes 8-bit channels into 5-bit RGB555 levels with Bayer dither', () => {
  const [qR, qG, qB] = applyPsxHardwareQuantization(123, 201, 44, 2, 1, 5, 1.0, 1);
  const step = 255 / 31;
  assert.ok(Math.abs(qR - Math.round(qR / step) * step) <= 1);
  assert.ok(Math.abs(qG - Math.round(qG / step) * step) <= 1);
  assert.ok(Math.abs(qB - Math.round(qB / step) * step) <= 1);
});

test('buildGenericFilterParams generates valid PSX, Anti-Piss, and Next-Gen filter presets', () => {
  const width = 16;
  const height = 16;
  const sepiaBuf = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    sepiaBuf[idx] = 155;
    sepiaBuf[idx + 1] = 140;
    sepiaBuf[idx + 2] = 85;
    sepiaBuf[idx + 3] = 255;
  }
  const srcStats = analyzeImageBuffer(sepiaBuf, width, height);

  const psx = buildGenericFilterParams('psx', srcStats);
  assert.equal(psx.enabledShaders.PSXDither, true);
  assert.equal(psx.psxBitDepth, 5);

  const antiPiss = buildGenericFilterParams('anti-piss', srcStats);
  assert.ok(antiPiss.rgbGain[2] > antiPiss.rgbGain[0], 'Anti-Piss filter must boost blue gain over red');
  assert.ok(antiPiss.tonemapDefog > 0, 'Anti-Piss filter must apply yellow-ochre defog');

  const nextGen = buildGenericFilterParams('next-gen', srcStats);
  assert.equal(nextGen.enabledShaders.ClarityPBR, true);
  assert.ok(nextGen.clarityStrength >= 0.25 && nextGen.clarityStrength <= 0.6, 'Next-Gen filter must enable balanced local clarity without clipping');
  assert.ok(nextGen.whitePoint >= 250, 'Next-Gen filter must preserve highlight headroom');
});

test('deriveReShadeParameters supports stylized-nextgen, tactical-nextgen, wasteland-remaster, and gothic-nextgen profiles', () => {
  const width = 16;
  const height = 16;
  const srcBuf = new Uint8ClampedArray(width * height * 4).fill(120);
  const refBuf = new Uint8ClampedArray(width * height * 4).fill(100);

  const srcStats = analyzeImageBuffer(srcBuf, width, height);
  const refStats = analyzeImageBuffer(refBuf, width, height);

  const crash4Params = deriveReShadeParameters(srcStats, refStats, 0.38, 0.55, false, 'stylized-nextgen');
  assert.equal(crash4Params.enabledShaders.ClarityPBR, true);
  assert.ok(crash4Params.vibrance >= 0.15 && crash4Params.vibrance <= 0.45);
  assert.ok(crash4Params.whitePoint >= 250);

  const bo7Params = deriveReShadeParameters(srcStats, refStats, 0.42, 0.45, false, 'tactical-nextgen');
  assert.equal(bo7Params.enabledShaders.ClarityPBR, true);
  assert.ok(bo7Params.rgbGamma[2] > bo7Params.rgbGamma[0], 'BO7 tactical profile must cool yellow midtones');

  const fnvFo4Params = deriveReShadeParameters(srcStats, refStats, 0.84, 0.68, false, 'wasteland-remaster');
  assert.equal(fnvFo4Params.enabledShaders.LUT, true);
  assert.equal(fnvFo4Params.enabledShaders.ClarityPBR, true);
  assert.ok(fnvFo4Params.rgbGamma[2] > fnvFo4Params.rgbGamma[0], 'Wasteland remaster profile must cool Mojave amber midtones');

  const ds3ErParams = deriveReShadeParameters(srcStats, refStats, 0.82, 0.70, false, 'gothic-nextgen');
  assert.equal(ds3ErParams.enabledShaders.LUT, true);
  assert.equal(ds3ErParams.enabledShaders.ClarityPBR, true);
  assert.ok(ds3ErParams.clarityStrength >= 0.35, 'Gothic next-gen profile must enhance stone & armor micro-contrast');

  const ini = compileReShadeIni('FNV_Commonwealth_Daylight_FO4.ini', fnvFo4Params, srcStats, refStats);
  assert.ok(ini.includes('[Clarity.fx]'));
  assert.ok(ini.includes('[Vibrance.fx]'));
  assert.ok(ini.includes('[LUT.fx]'));
  assert.ok(ini.includes('fLUT_TextureName="SpetLUT.png"'));

  const lut = generate3DLutRgba(srcStats, refStats, fnvFo4Params);
  assert.equal(lut.width, 1024);
  assert.equal(lut.height, 32);
});

test('Reinhard Luma Preservation and Skin/Sky Protection prevent white clipping on extreme monochrome reference', () => {
  const width = 16;
  const height = 16;
  const srcBuf = new Uint8ClampedArray(width * height * 4);
  const extremeRedRefBuf = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    srcBuf[idx] = 140;
    srcBuf[idx + 1] = 145;
    srcBuf[idx + 2] = 150;
    srcBuf[idx + 3] = 255;

    // Extreme red reference image
    extremeRedRefBuf[idx] = 240;
    extremeRedRefBuf[idx + 1] = 15;
    extremeRedRefBuf[idx + 2] = 15;
    extremeRedRefBuf[idx + 3] = 255;
  }

  const srcStats = analyzeImageBuffer(srcBuf, width, height);
  const refStats = analyzeImageBuffer(extremeRedRefBuf, width, height);
  const params = deriveReShadeParameters(srcStats, refStats, 0.9, 1.0, false);
  params.skinSkyProtection = 1.0;

  // Test bright white highlight pixel [246, 246, 246]
  const [outR, outG, outB] = transformPixelThroughPipeline(246, 246, 246, srcStats, refStats, params);
  const outLab = rgbToLab(outR, outG, outB);
  assert.ok(outLab.L >= 88, `Highlight luminance should be preserved with Luma Preservation=100%, got L*=${outLab.L}`);
  assert.ok(outG >= 180 && outB >= 180, `Highlight white should not turn pure neon red when Skin/Sky Protection=100%: [${outR},${outG},${outB}]`);
});

test('Game API resolver and PKZIP bundler produce valid ReShade bundle with DLL, INI, and SpetLUT.png', () => {
  const dao = resolveGameApiLocally('Dragon Age: origins');
  assert.equal(dao.dllName, 'd3d9.dll', 'Dragon Age: Origins must resolve to d3d9.dll');
  assert.equal(dao.architecture, '32-bit');

  const bo2 = resolveGameApiLocally('Black Ops 2');
  assert.equal(bo2.dllName, 'd3d11.dll', 'Black Ops 2 must resolve to d3d11.dll');

  const ac4 = resolveGameApiLocally('Assasins Creed IV');
  assert.equal(ac4.dllName, 'd3d11.dll', 'Assasins Creed IV (with typo) must resolve to d3d11.dll');
  assert.equal(ac4.title, "Assassin's Creed IV: Black Flag");

  const yakuza0 = resolveGameApiLocally('Yakuza 0');
  assert.equal(yakuza0.dllName, 'd3d11.dll', 'Yakuza 0 must resolve to d3d11.dll');
  assert.equal(yakuza0.architecture, '64-bit');

  const bo1 = resolveGameApiLocally('Call of Duty: Black Ops');
  assert.equal(bo1.dllName, 'd3d9.dll');
  assert.equal(bo1.architecture, '32-bit');

  const fo3 = resolveGameApiLocally('Fallout 3');
  assert.equal(fo3.dllName, 'd3d9.dll');
  assert.equal(fo3.architecture, '32-bit');

  const fnv = resolveGameApiLocally('Fallout: New Vegas');
  assert.equal(fnv.dllName, 'd3d9.dll');
  assert.equal(fnv.architecture, '32-bit');

  const er = resolveGameApiLocally('Elden Ring');
  assert.equal(er.dllName, 'd3d12.dll');
  assert.equal(er.architecture, '64-bit');

  const dai = resolveGameApiLocally('Dragon Age: Inquisition');
  assert.equal(dai.dllName, 'd3d11.dll');
  assert.equal(dai.architecture, '64-bit');

  const doom = resolveGameApiLocally('DOOM Eternal');
  assert.equal(doom.dllName, 'vulkan-1.dll');

  const mc = resolveGameApiLocally('Minecraft');
  assert.equal(mc.dllName, 'opengl32.dll');

  const sparky = resolveGameApiLocally('Sparky Rush');
  assert.equal(sparky.dllName, 'dxgi.dll', 'Sparky Rush (Unity 6 DX12/DX11) must resolve to dxgi.dll');
  assert.equal(sparky.architecture, '64-bit');

  const dllBytes = buildReShadeProxyDllStub(fnv.dllName, fnv.renderApi, fnv.architecture, fnv.title);
  assert.equal(dllBytes[0], 0x4d); // 'M'
  assert.equal(dllBytes[1], 0x5a); // 'Z'

  const shaderEntries = buildReShadeShaderEntries();
  assert.ok(shaderEntries.some((e) => e.path === 'reshade-shaders/Shaders/ReShade.fxh'));
  assert.ok(shaderEntries.some((e) => e.path === 'reshade-shaders/Shaders/LUT.fx'));
  assert.ok(shaderEntries.some((e) => e.path === 'reshade-shaders/Shaders/Dither.fx'));
  assert.ok(shaderEntries.some((e) => e.path === 'reshade-shaders/Shaders/LumaSharpen.fx'));

  const zip = buildZipArchive([
    { path: 'Preset.ini', data: '[LUT.fx]\nfLUT_AmountChroma=1.0\n' },
    { path: 'ReShade.ini', data: buildReShadeConfigIni('Preset.ini') },
    { path: 'reshade-shaders/Textures/SpetLUT.png', data: new Uint8Array([137, 80, 78, 71]) },
    ...shaderEntries,
    { path: fnv.dllName, data: dllBytes },
  ]);

  // Verify PKZIP Local File Header signature (0x04034b50 = PK\x03\x04)
  assert.equal(zip[0], 0x50);
  assert.equal(zip[1], 0x4b);
  assert.equal(zip[2], 0x03);
  assert.equal(zip[3], 0x04);
  assert.ok(zip.byteLength > 500);
});

test('3D LUT and Preset.ini maintain 1:1 mathematical parity with web preview without double quantization or duplicate shader passes', () => {
  const width = 16;
  const height = 16;
  const srcBuf = new Uint8ClampedArray(width * height * 4).fill(128);
  const srcStats = analyzeImageBuffer(srcBuf, width, height);
  const psxParams = buildGenericFilterParams('psx', srcStats);

  // Verify SpetLUT.png lattice vertices match transformPixelThroughPipeline 1:1 without premature quantization
  const lut = generate3DLutRgba(srcStats, srcStats, psxParams);
  const rCol = 10;
  const gRow = 18;
  const bSlice = 22;
  const rVal = Math.round((rCol / 31) * 255);
  const gVal = Math.round((gRow / 31) * 255);
  const bVal = Math.round((bSlice / 31) * 255);
  const [expR, expG, expB] = transformPixelThroughPipeline(rVal, gVal, bVal, srcStats, srcStats, psxParams);

  const lutX = bSlice * 32 + rCol;
  const lutY = gRow;
  const idx = (lutY * 1024 + lutX) * 4;
  assert.equal(lut.data[idx], expR);
  assert.equal(lut.data[idx + 1], expG);
  assert.equal(lut.data[idx + 2], expB);

  // Verify Preset.ini wraps pipeline with KeepUI_Pre@UIMask.fx, Pixelate@Pixelate.fx, and KeepUI_Post@UIMask.fx
  assert.equal(psxParams.psxPixelScale, 2.55);
  assert.equal(psxParams.enabledShaders.Pixelate, true);
  assert.equal(psxParams.psxDitherStrength, 0.62);
  const ini = compileReShadeIni('PSX_Retro_Hardware_15Bit.ini', psxParams, srcStats, srcStats);
  assert.ok(
    ini.includes(
      'Techniques=KeepUI_Pre@UIMask.fx,LumaSharpen@LumaSharpen.fx,Pixelate@Pixelate.fx,LUT@LUT.fx,Dither@Dither.fx,KeepUI_Post@UIMask.fx'
    ),
    'Techniques must run KeepUI_Pre -> LumaSharpen.fx -> Pixelate.fx -> LUT.fx -> Dither.fx -> KeepUI_Post'
  );
  assert.ok(ini.includes('[UIMask.fx]'));
  assert.ok(ini.includes('[Pixelate.fx]'));
  assert.ok(ini.includes('iPixelate_CellSize=2.550000'));
  assert.ok(ini.includes('iPixelate_ResolutionScale=1'));
  assert.ok(ini.includes('iUIMask_AutoMenuBypass=1'));
  assert.ok(ini.includes('iLUT_PixelScale=2.550000'));
  assert.ok(ini.includes('iDitherPixelScale=2.550000'));

  // Verify no generated ReShadeFX shader uses unsupported fmod() or round() intrinsics
  const shaders = buildReShadeShaderEntries();
  assert.ok(shaders.some((s) => s.path === 'reshade-shaders/Shaders/UIMask.fx'));
  assert.ok(shaders.some((s) => s.path === 'reshade-shaders/Shaders/Pixelate.fx'));
  for (const s of shaders) {
    const src = typeof s.data === 'string' ? s.data : new TextDecoder().decode(s.data);
    assert.ok(!src.includes('fmod('), `${s.path} must not use fmod() in ReShadeFX`);
    assert.ok(!src.includes('round('), `${s.path} must not use round() in ReShadeFX`);
  }
});




