# Spet's ReShade Studio

> **Live Web Application:** Available directly in the browser at [spet01.dev/tools/reshade-studio](https://spet01.dev/tools/reshade-studio/) and [spet01.dev/reshade-web](https://spet01.dev/reshade-web/) (part of the [spet01.dev/tools](https://spet01.dev/tools/) suite). 100% client-side deterministic mathematical execution, zero server uploads, zero generative AI.

**Spet's ReShade Studio** is a deterministic color-grading, 3D Lookup Table (`3D LUT`), and ReShade 6.8.0 preset bundle compiler executed entirely in the browser. Given a clean game screenshot (**Source**) and a visual reference frame (**Target**)—or a standalone hardware/generation filter—it computes exact statistical color transfers in **CIE $L^*a^*b^*$** perceptual space (Reinhard et al.), solves per-channel RGB percentile histograms, previews the complete post-processing pipeline in an interactive split-screen viewport, and compiles ready-to-drop **ReShade 6.8.0 `.ZIP` bundles** containing the target DirectX/OpenGL/Vulkan hook DLL (`d3d9.dll`, `d3d11.dll`, `d3d12.dll`, `dxgi.dll`, `opengl32.dll`), `Preset.ini`, `SpetLUT.png` ($1024 \times 32$), and self-contained ReShadeFX (`.fx`) HLSL shaders.

---

## System Architecture

The studio operates as a zero-backend, deterministic pixel-processing and HLSL code generation pipeline:

```text
+-----------------------------------------------------------------------------------+
|                                  Main UI Thread                                   |
|  - React 19 Industrial Workbench (Split Viewport + Shader Rack + LUT/INI Panel)   |
|  - Interactive Before / After Curtain, RGB / Luma Histograms & CIE LAB Telemetry  |
+-----------------------------------------+-----------------------------------------+
                                          |
           +------------------------------+------------------------------+
           |                              |                              |
           v                              v                              v
+----------------------+    +---------------------------+    +----------------------+
| CIE LAB & RGB Solver |    | 3D LUT & Pixel Pipeline   |    | ReShade ZIP Compiler |
| - sRGB <-> CIE XYZ   |    | - 32x32x32 Neutral Lattice|    | - Auto Game API DB   |
| - CIE L*a*b* Mean/Std|    | - Skin & Sky Protection   |    | - Official ReShade   |
| - P05/P50/P95 Quant. |    | - RGB555 + 4x4 Bayer Dith.|    |   6.8.0 32/64-bit DLL|
| - Sobel Edge Energy  |    | - 1024x32 SpetLUT.png Gen |    | - PKZIP Store Engine |
+----------------------+    +---------------------------+    +----------------------+
```

---

## Core Engineering Capabilities

### 1. Dual-Image Statistical Color Transfer (CIE $L^*a^*b^*$)
- Converts 8-bit sRGB pixel buffers into linear RGB, **CIE XYZ (D65)**, and **CIE $L^*a^*b^*$** perceptual space.
- Extracts channel means ($\mu_L, \mu_a, \mu_b$), standard deviations ($\sigma_L, \sigma_a, \sigma_b$), dynamic range percentiles ($P_{05}, P_{50}, P_{95}$), luma contrast ratio, and $3\times 3$ Sobel high-frequency edge energy.
- Applies damped Reinhard statistical color transfer with configurable **Transfer Strength**, **Preserve Source Luminance**, and **Skin/Sky Hue Protection** (preventing orange skin-tone clipping and cyan sky banding).

### 2. Built-In Game Comparison Presets & Standalone Filters
- **Practical Game Conversions:**
  - **Sparky Rush $\rightarrow$ 101 Dalmatians (PS1):** CIE LAB palette transfer + true 5th-gen 15-bit `RGB555` color quantization and $4\times 4$ ordered Bayer hardware dithering.
  - **Fallout: New Vegas $\rightarrow$ Fallout 4:** Strips the 7th-gen Mojave amber/ochre tint via CIE LAB transfer + `Tonemap.fx` Defog and restores clean Commonwealth daylight sky & micro-contrast.
  - **Dark Souls III $\rightarrow$ Elden Ring:** Neutralizes washed-out Lothric yellow-ashen haze into Stormveil cold steel-indigo shadows, gothic contrast, and crisp metallic specular clarity.
- **Standalone 1-Click Filters (Source Only):**
  - **PSX Filter (`filter_psx`):** Authentic PlayStation 1 15-bit (`RGB555`, 32,768 colors) quantization, $4\times 4$ Bayer matrix ordered dithering, resolution-adaptive mosaic pixelation (`Pixelate.fx`), and HUD/UI protection (`UIMask.fx`).
  - **Anti-Piss Filter (`filter_antipiss`):** Automatically measures excessive $+b^*$ yellow/ochre cast and $+a^*$ brown tint in 7th-gen titles (PS3/Xbox 360 era) and synthesizes inverse `Defog`, cool blue-channel gamma recovery, and neutral white balance.
  - **Next-Gen Remaster (`filter_nextgen`):** Applies ACES filmic S-curve contrast, local unsharp-mask clarity (`Clarity.fx` pseudo-SSAO micro-contrast), intelligent vibrance, and specular highlight recovery.

### 3. Complete ReShadeFX (`.fx`) Shader Stack & `1024×32` 3D LUT Baking
Every parameter solved by the mathematical engine or tuned manually in the **Shader Stack (`.fx`)** tab is simultaneously:
1. Previewed in real time on the canvas (`Split`, `Output`, `Source`, `Reference` modes).
2. Baked into a $32 \times 32 \times 32$ **3D Lookup Table** exported as a lossless $1024 \times 32$ `SpetLUT.png` strip.
3. Compiled into a deterministic ReShade `.ini` configuration targeting:
   - `UIMask.fx` (`KeepUI_Pre` / `KeepUI_Post` automatic HUD & menu bypass)
   - `LiftGammaGain.fx` (`RGB_Lift`, `RGB_Gamma`, `RGB_Gain`)
   - `Levels.fx` (`BlackPoint`, `WhitePoint`)
   - `Curves.fx` (Luma/Chroma S-Curve formulas)
   - `Tonemap.fx` (`Gamma`, `Exposure`, `Saturation`, `Bleach`, `Defog`, `FogColor`)
   - `Vibrance.fx` (`Vibrance`)
   - `Technicolor2.fx` (3-strip color strength, brightness, saturation)
   - `Clarity.fx` (Local micro-contrast / pseudo-SSAO)
   - `LumaSharpen.fx` (`sharp_strength`, `sharp_clamp`, `offset_bias`)
   - `Pixelate.fx` (Resolution-adaptive mosaic downsampling)
   - `LUT.fx` (`SpetLUT.png` trilinear hardware interpolation)
   - `Dither.fx` ($4\times 4$ Bayer matrix + 15-bit `RGB555` quantization)

### 4. Auto Game Graphics API Resolver & 1-Click ReShade 6.8.0 `.ZIP` Bundle
- Includes a verified database of **200+ PC games** (plus live fallback queries to the **PCGamingWiki Cargo API**) that automatically identifies the game's rendering API (`Direct3D 9`, `Direct3D 10/11`, `Direct3D 12`, `OpenGL`, `Vulkan`), binary architecture (`32-bit` vs `64-bit`), exact ReShade hook DLL filename (`d3d9.dll`, `d3d11.dll`, `d3d12.dll`, `dxgi.dll`, `opengl32.dll`, `vulkan-1.dll`), and executable installation folder.
- Clicking **Export ReShade Bundle (`.ZIP`)** packages the official signed **ReShade 6.8.0** binary (`ReShade32.dll` / `ReShade64.dll` renamed to the game's target hook DLL), `ReShade.ini`, your custom `<Preset>.ini`, `reshade-shaders/Textures/SpetLUT.png`, and all required `.fx` shaders into a single zero-dependency archive ready to extract into the game directory.

---

## Local Development & Verification

### Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10.x or higher

### Installation
```bash
npm ci
```

### Run Unit Test Suite
Validates CIE $L^*a^*b^*$ round-trip accuracy, Reinhard parameter derivation, PS1 `RGB555` Bayer quantization, $1024\times 32$ 3D LUT generation, ReShadeFX HLSL intrinsic compliance, and PKZIP CRC-32 archive construction:
```bash
npm test
```

### Production Build
```bash
npm run build
```
Production static assets are emitted to `dist/` with relative asset paths (`base: './'`).

---

## Online Access

- **Portfolio Tools Suite:** [https://spet01.dev/tools/reshade-studio/](https://spet01.dev/tools/reshade-studio/)
- **GitHub Pages Mirror:** [https://spet01.dev/reshade-web/](https://spet01.dev/reshade-web/)
- **All SpetDev Tools:** [https://spet01.dev/tools/](https://spet01.dev/tools/)
