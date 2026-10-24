export type ReShadeDllName =
  | 'd3d9.dll'
  | 'd3d11.dll'
  | 'd3d12.dll'
  | 'dxgi.dll'
  | 'opengl32.dll'
  | 'vulkan-1.dll'
  | 'ddraw.dll';

export interface GameApiProfile {
  title: string;
  aliases?: string[];
  renderApi: string;
  dllName: ReShadeDllName;
  architecture: '32-bit' | '64-bit';
  exePath: string;
  notes?: string;
  source?: 'online-pcgamingwiki' | 'verified-db' | 'heuristic';
}

export const VERIFIED_GAME_API_DB: GameApiProfile[] = [

  {
    title: 'Dragon Age: Origins',
    aliases: [
      'dragon age origins',
      'dao',
      'dragon age 1',
      'dragon age origins ultimate edition',
      'dragon age awakening',
    ],
    renderApi: 'Direct3D 9 (Eclipse Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin_ship/ (daorigins.exe)',
    notes: 'Extract d3d9.dll and Preset.ini into the /bin_ship/ folder next to daorigins.exe.',
    source: 'verified-db',
  },
  {
    title: 'Dragon Age II',
    aliases: ['dragon age 2', 'da2', 'dragon age ii'],
    renderApi: 'Direct3D 9 / Direct3D 11',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin_ship/ (DragonAge2.exe)',
    notes: 'Uses d3d9.dll in DX9 mode or d3d11.dll in DX11 mode.',
    source: 'verified-db',
  },
  {
    title: 'Dragon Age: Inquisition',
    aliases: ['dragon age inquisition', 'dai', 'dragon age 3'],
    renderApi: 'Direct3D 11 (Frostbite 3)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DragonAgeInquisition.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dragon Age: The Veilguard',
    aliases: ['dragon age the veilguard', 'dragon age veilguard', 'dragon age 4', 'datv'],
    renderApi: 'Direct3D 12 (Frostbite)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Dragon Age The Veilguard.exe)',
    source: 'verified-db',
  },
  {
    title: 'Mass Effect (2007)',
    aliases: ['mass effect', 'mass effect 1', 'me1'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/ (MassEffect.exe)',
    source: 'verified-db',
  },
  {
    title: 'Mass Effect 2 (2010)',
    aliases: ['mass effect 2', 'me2'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/ (MassEffect2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Mass Effect 3 (2012)',
    aliases: ['mass effect 3', 'me3'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/Win32/ (MassEffect3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Mass Effect Legendary Edition',
    aliases: ['mass effect legendary', 'mele'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game/ME1|ME2|ME3/Binaries/Win64/',
    source: 'verified-db',
  },
  {
    title: 'Star Wars: Knights of the Old Republic',
    aliases: ['kotor', 'kotor 1', 'knights of the old republic', 'swkotor'],
    renderApi: 'OpenGL',
    dllName: 'opengl32.dll',
    architecture: '32-bit',
    exePath: 'Game Root (swkotor.exe)',
    source: 'verified-db',
  },
  {
    title: 'Star Wars: Knights of the Old Republic II',
    aliases: ['kotor 2', 'kotor ii', 'swkotor2', 'the sith lords'],
    renderApi: 'OpenGL',
    dllName: 'opengl32.dll',
    architecture: '32-bit',
    exePath: 'Game Root (swkotor2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Jade Empire: Special Edition',
    aliases: ['jade empire'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (JadeEmpire.exe)',
    source: 'verified-db',
  },

  {
    title: 'Call of Duty 2',
    aliases: ['cod 2', 'cod2', 'call of duty ii'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (CoD2SP_s.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty 4: Modern Warfare (2007)',
    aliases: ['cod 4', 'cod4', 'call of duty 4', 'modern warfare 2007', 'cod4 mw', 'iw3mp'],
    renderApi: 'Direct3D 9 (IW 3.0)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (iw3sp.exe / iw3mp.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: World at War',
    aliases: ['world at war', 'cod waw', 'waw', 'cod 5', 'call of duty 5'],
    renderApi: 'Direct3D 9 (IW 3.0)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (CoDWaW.exe / CoDWaWmp.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Modern Warfare 2 (2009)',
    aliases: ['modern warfare 2', 'mw2', 'cod mw2', 'mw2 2009', 'iw4x'],
    renderApi: 'Direct3D 9 (IW 4.0)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (iw4sp.exe / iw4mp.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Black Ops (2010)',
    aliases: ['black ops', 'black ops 1', 'bo1', 'cod bo1', 'cod black ops', 'plutonium t5'],
    renderApi: 'Direct3D 9 (Treyarch NGL)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (BlackOps.exe / BlackOpsMP.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Modern Warfare 3 (2011)',
    aliases: ['modern warfare 3', 'mw3', 'cod mw3', 'mw3 2011', 'plutonium iw5'],
    renderApi: 'Direct3D 9 (IW 5.0)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (iw5sp.exe / iw5mp.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Black Ops II',
    aliases: [
      'black ops 2',
      'black ops ii',
      'bo2',
      'cod bo2',
      'cod black ops 2',
      'call of duty black ops 2',
      'plutonium t6',
    ],
    renderApi: 'Direct3D 11 (T6 Engine / MS Store & Steam)',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'Game Root (t6sp.exe / t6mp.exe / t6zm.exe)',
    notes: 'Uses d3d11.dll across Steam, MS Store, and Plutonium T6 builds.',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Ghosts',
    aliases: ['cod ghosts', 'call of duty ghosts'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (iw6sp64_ship.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Advanced Warfare',
    aliases: ['cod aw', 'advanced warfare'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (s1_sp64_ship.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Black Ops III',
    aliases: ['black ops 3', 'black ops iii', 'bo3', 'cod bo3', 'call of duty black ops 3'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (BlackOps3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: WWII',
    aliases: ['cod ww2', 'cod wwii', 'call of duty ww2'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (s2_sp64_ship.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Black Ops Cold War',
    aliases: ['black ops cold war', 'cold war', 'bocw', 'cod cold war'],
    renderApi: 'Direct3D 12',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (BlackOpsColdWar.exe)',
    source: 'verified-db',
  },
  {
    title: 'Call of Duty: Black Ops 6 / 7 (IW 9.0)',
    aliases: ['black ops 6', 'bo6', 'black ops 7', 'bo7', 'cod bo6', 'cod bo7', 'warzone'],
    renderApi: 'Direct3D 12',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (cod.exe)',
    source: 'verified-db',
  },

  {
    title: 'Yakuza 0',
    aliases: ['yakuza 0', 'yakuza zero', 'ryu ga gotoku 0'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'media/ (Yakuza0.exe)',
    notes: 'Extract d3d11.dll and Preset.ini into the /media/ subfolder next to Yakuza0.exe.',
    source: 'verified-db',
  },
  {
    title: 'Yakuza Kiwami',
    aliases: ['yakuza kiwami', 'yakuza kiwami 1', 'kiwami 1'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'media/ (YakuzaKiwami.exe)',
    source: 'verified-db',
  },
  {
    title: 'Yakuza Kiwami 2',
    aliases: ['yakuza kiwami 2', 'kiwami 2'],
    renderApi: 'Direct3D 11 (Dragon Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (YakuzaKiwami2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Yakuza 3 Remastered',
    aliases: ['yakuza 3', 'yakuza 3 remastered'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Yakuza3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Yakuza 4 Remastered',
    aliases: ['yakuza 4', 'yakuza 4 remastered'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Yakuza4.exe)',
    source: 'verified-db',
  },
  {
    title: 'Yakuza 5 Remastered',
    aliases: ['yakuza 5', 'yakuza 5 remastered'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'main/ (Yakuza5.exe)',
    source: 'verified-db',
  },
  {
    title: 'Yakuza 6: The Song of Life',
    aliases: ['yakuza 6', 'the song of life'],
    renderApi: 'Direct3D 11 (Dragon Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Yakuza6.exe)',
    source: 'verified-db',
  },
  {
    title: 'Yakuza: Like a Dragon',
    aliases: ['yakuza like a dragon', 'yakuza 7', 'like a dragon'],
    renderApi: 'Direct3D 11 (Dragon Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'runtime/media/ (YakuzaLikeADragon.exe)',
    source: 'verified-db',
  },
  {
    title: 'Like a Dragon: Infinite Wealth',
    aliases: ['infinite wealth', 'yakuza 8', 'like a dragon 8'],
    renderApi: 'Direct3D 12 (Dragon Engine)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'runtime/media/ (LikeADragon8.exe)',
    source: 'verified-db',
  },
  {
    title: 'Judgment',
    aliases: ['judgment', 'judge eyes'],
    renderApi: 'Direct3D 12 (Dragon Engine)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'runtime/media/ (Judgment.exe)',
    source: 'verified-db',
  },
  {
    title: 'Lost Judgment',
    aliases: ['lost judgment'],
    renderApi: 'Direct3D 12 (Dragon Engine)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'runtime/media/ (LostJudgment.exe)',
    source: 'verified-db',
  },
  {
    title: 'Persona 4 Golden',
    aliases: ['persona 4', 'persona 4 golden', 'p4g'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (P4G.exe)',
    source: 'verified-db',
  },
  {
    title: 'Persona 5 Royal',
    aliases: ['persona 5', 'persona 5 royal', 'p5r'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (P5R.exe)',
    source: 'verified-db',
  },
  {
    title: 'Persona 3 Reload',
    aliases: ['persona 3 reload', 'p3r'],
    renderApi: 'Direct3D 12 (Unreal Engine 4)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'P3R/Binaries/Win64/ (P3R.exe)',
    source: 'verified-db',
  },

  {
    title: "Assassin's Creed (2007)",
    aliases: ['assassins creed', 'assassins creed 1', 'assasins creed', 'assasins creed 1', 'ac1'],
    renderApi: 'Direct3D 9 / Direct3D 10',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (AssassinsCreed_Dx9.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed II",
    aliases: ['assassins creed 2', 'assassins creed ii', 'assasins creed 2', 'assasins creed ii', 'ac2'],
    renderApi: 'Direct3D 9 (Anvil)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (AssassinsCreedIIGame.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed: Brotherhood",
    aliases: ['assassins creed brotherhood', 'assasins creed brotherhood', 'ac brotherhood', 'acb'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (ACBSP.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed: Revelations",
    aliases: ['assassins creed revelations', 'assasins creed revelations', 'ac revelations', 'acr'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (ACRSP.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed III",
    aliases: ['assassins creed 3', 'assassins creed iii', 'assasins creed 3', 'assasins creed iii', 'ac3'],
    renderApi: 'Direct3D 11 (AnvilNext)',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'Game Root (AC3SP.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed IV: Black Flag",
    aliases: [
      'assassins creed 4',
      'assassins creed iv',
      'assasins creed 4',
      'assasins creed iv',
      'assassins creed black flag',
      'assasins creed black flag',
      'black flag',
      'ac4',
      'ac iv',
    ],
    renderApi: 'Direct3D 11 (AnvilNext)',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'Game Root (AC4BFSP.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Rogue",
    aliases: ['assassins creed rogue', 'assasins creed rogue', 'ac rogue'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACC.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Unity",
    aliases: ['assassins creed unity', 'assasins creed unity', 'ac unity', 'acu'],
    renderApi: 'Direct3D 11 (AnvilNext 2.0)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACU.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Syndicate",
    aliases: ['assassins creed syndicate', 'assasins creed syndicate', 'ac syndicate', 'acs'],
    renderApi: 'Direct3D 11 (AnvilNext 2.0)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACS.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Origins",
    aliases: ['assassins creed origins', 'assasins creed origins', 'ac origins'],
    renderApi: 'Direct3D 11 (AnvilNext 2.0)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACOrigins.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Odyssey",
    aliases: ['assassins creed odyssey', 'assasins creed odyssey', 'ac odyssey'],
    renderApi: 'Direct3D 11 (AnvilNext 2.0)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACOdyssey.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Valhalla",
    aliases: ['assassins creed valhalla', 'assasins creed valhalla', 'ac valhalla'],
    renderApi: 'Direct3D 12 (Ubisoft Anvil)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACValhalla.exe)',
    source: 'verified-db',
  },
  {
    title: "Assassin's Creed Mirage",
    aliases: ['assassins creed mirage', 'assasins creed mirage', 'ac mirage'],
    renderApi: 'Direct3D 12 (Ubisoft Anvil)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ACMirage.exe)',
    source: 'verified-db',
  },
  {
    title: 'Far Cry 2',
    aliases: ['far cry 2', 'farcry 2', 'fc2'],
    renderApi: 'Direct3D 9 (Dunia Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin/ (FarCry2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Far Cry 3',
    aliases: ['far cry 3', 'farcry 3', 'fc3'],
    renderApi: 'Direct3D 11 / Direct3D 9',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'bin/ (farcry3_d3d11.exe / farcry3.exe)',
    notes: 'Use d3d11.dll for farcry3_d3d11.exe (DX11) or d3d9.dll for farcry3.exe (DX9).',
    source: 'verified-db',
  },
  {
    title: 'Far Cry 4',
    aliases: ['far cry 4', 'farcry 4', 'fc4'],
    renderApi: 'Direct3D 11 (Dunia 2)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'bin/ (FarCry4.exe)',
    source: 'verified-db',
  },
  {
    title: 'Far Cry 5',
    aliases: ['far cry 5', 'farcry 5', 'fc5'],
    renderApi: 'Direct3D 11 (Dunia 2)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'bin/ (FarCry5.exe)',
    source: 'verified-db',
  },
  {
    title: 'Watch Dogs',
    aliases: ['watch dogs', 'watch dogs 1'],
    renderApi: 'Direct3D 11 (Disrupt)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'bin/ (Watch_Dogs.exe)',
    source: 'verified-db',
  },
  {
    title: 'Watch Dogs 2',
    aliases: ['watch dogs 2'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'bin/ (WatchDogs2.exe)',
    source: 'verified-db',
  },

  {
    title: 'Fallout: New Vegas',
    aliases: ['fallout new vegas', 'new vegas', 'fnv', 'fallout nv'],
    renderApi: 'Direct3D 9 (SM 3.0)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (FalloutNV.exe)',
    notes: 'Use d3d9.dll in game root (or vulkan-1.dll if using DXVK).',
    source: 'verified-db',
  },
  {
    title: 'Fallout 3',
    aliases: ['fo3', 'fallout 3 goty'],
    renderApi: 'Direct3D 9 (SM 3.0)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Fallout3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Fallout 4',
    aliases: ['fo4', 'fallout 4'],
    renderApi: 'Direct3D 11 (Creation Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Fallout4.exe)',
    source: 'verified-db',
  },
  {
    title: 'Fallout 76',
    aliases: ['fo76', 'fallout 76'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Fallout76.exe)',
    source: 'verified-db',
  },
  {
    title: 'The Elder Scrolls III: Morrowind',
    aliases: ['morrowind', 'tes3', 'tes 3', 'elder scrolls 3'],
    renderApi: 'Direct3D 9 (MGE XE / D3D8to9)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Morrowind.exe)',
    source: 'verified-db',
  },
  {
    title: 'The Elder Scrolls IV: Oblivion',
    aliases: ['oblivion', 'tes4', 'tes 4', 'elder scrolls 4'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Oblivion.exe)',
    source: 'verified-db',
  },
  {
    title: 'The Elder Scrolls V: Skyrim (2011 Legendary)',
    aliases: ['skyrim', 'skyrim le', 'oldrim', 'tes5', 'tesv', 'skyrim 2011', 'skyrim legendary edition'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (TESV.exe)',
    source: 'verified-db',
  },
  {
    title: 'The Elder Scrolls V: Skyrim Special Edition',
    aliases: ['skyrim se', 'skyrim special edition', 'skyrim ae', 'skyrim anniversary edition'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (SkyrimSE.exe)',
    source: 'verified-db',
  },
  {
    title: 'Starfield',
    aliases: ['starfield'],
    renderApi: 'Direct3D 12 (Creation Engine 2)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Starfield.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dishonored (2012)',
    aliases: ['dishonored', 'dishonored 1'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/Win32/ (Dishonored.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dishonored 2',
    aliases: ['dishonored 2', 'dishonored ii'],
    renderApi: 'Direct3D 11 (Void Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Dishonored2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Prey (2017)',
    aliases: ['prey', 'prey 2017'],
    renderApi: 'Direct3D 11 (CryEngine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Binaries/Danielle/x64/Release/ (Prey.exe)',
    source: 'verified-db',
  },
  {
    title: 'DOOM (2016)',
    aliases: ['doom 2016'],
    renderApi: 'Vulkan / OpenGL',
    dllName: 'vulkan-1.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DOOMx64vk.exe)',
    source: 'verified-db',
  },
  {
    title: 'DOOM Eternal',
    aliases: ['doom eternal'],
    renderApi: 'Vulkan (id Tech 7)',
    dllName: 'vulkan-1.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DOOMEternalx64vk.exe)',
    source: 'verified-db',
  },
  {
    title: 'DOOM 3',
    aliases: ['doom 3', 'doom iii'],
    renderApi: 'OpenGL (id Tech 4)',
    dllName: 'opengl32.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Doom3.exe)',
    source: 'verified-db',
  },

  {
    title: 'Dark Souls: Prepare to Die Edition',
    aliases: ['dark souls', 'dark souls 1', 'ds1', 'dark souls ptde', 'prepare to die'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'DATA/ (DATA.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dark Souls: Remastered',
    aliases: ['dark souls remastered', 'dsr', 'ds1 remastered'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DarkSoulsRemastered.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dark Souls II (2014 Original)',
    aliases: ['dark souls 2', 'dark souls ii', 'ds2'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game/ (DarkSoulsII.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dark Souls II: Scholar of the First Sin',
    aliases: ['scholar of the first sin', 'sotfs', 'dark souls 2 sotfs', 'ds2 sotfs'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game/ (DarkSoulsII.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dark Souls III',
    aliases: ['dark souls 3', 'ds3', 'dark souls iii'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game/ (DarkSoulsIII.exe)',
    notes: 'Extract into the /Game/ subfolder next to DarkSoulsIII.exe.',
    source: 'verified-db',
  },
  {
    title: 'Sekiro: Shadows Die Twice',
    aliases: ['sekiro', 'shadows die twice'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (sekiro.exe)',
    source: 'verified-db',
  },
  {
    title: 'Elden Ring',
    aliases: ['elden ring', 'er'],
    renderApi: 'Direct3D 12',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game/ (eldenring.exe)',
    notes: 'Extract into the /Game/ subfolder next to eldenring.exe.',
    source: 'verified-db',
  },
  {
    title: 'Armored Core VI: Fires of Rubicon',
    aliases: ['armored core 6', 'armored core vi', 'ac6'],
    renderApi: 'Direct3D 12',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game/ (armoredcore6.exe)',
    source: 'verified-db',
  },

  {
    title: 'The Witcher: Enhanced Edition',
    aliases: ['the witcher', 'the witcher 1', 'witcher 1'],
    renderApi: 'Direct3D 9 (Aurora Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'System/ (witcher.exe)',
    source: 'verified-db',
  },
  {
    title: 'The Witcher 2: Assassins of Kings',
    aliases: ['the witcher 2', 'witcher 2', 'tw2'],
    renderApi: 'Direct3D 9 (REDengine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin/ (witcher2.exe)',
    source: 'verified-db',
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    aliases: ['the witcher 3', 'witcher 3', 'tw3'],
    renderApi: 'Direct3D 11 / Direct3D 12',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'bin/x64/ or bin/x64_dx12/ (witcher3.exe)',
    notes: 'Use d3d11.dll in bin/x64/ (DX11) or d3d12.dll in bin/x64_dx12/ (DX12).',
    source: 'verified-db',
  },
  {
    title: 'Cyberpunk 2077',
    aliases: ['cyberpunk', 'cp2077'],
    renderApi: 'Direct3D 12 (REDengine 4)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'bin/x64/ (Cyberpunk2077.exe)',
    notes: 'Place inside bin/x64/ folder.',
    source: 'verified-db',
  },
  {
    title: "Baldur's Gate 3",
    aliases: ['baldurs gate 3', 'bg3'],
    renderApi: 'Direct3D 11 / Vulkan',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'bin/ (bg3_dx11.exe)',
    source: 'verified-db',
  },

  {
    title: 'Grand Theft Auto III',
    aliases: ['gta 3', 'gta iii', 'gta3', 'grand theft auto 3'],
    renderApi: 'Direct3D 9 (via D3D8to9 / SilentPatch)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (gta3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Grand Theft Auto: Vice City',
    aliases: ['gta vc', 'vice city', 'gta vice city'],
    renderApi: 'Direct3D 9 (via D3D8to9 / SilentPatch)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (gta-vc.exe)',
    source: 'verified-db',
  },
  {
    title: 'Grand Theft Auto: San Andreas',
    aliases: ['gta sa', 'san andreas', 'gta san andreas', 'gtasa'],
    renderApi: 'Direct3D 9 (RenderWare)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (gta_sa.exe)',
    source: 'verified-db',
  },
  {
    title: 'Grand Theft Auto IV (GTA IV)',
    aliases: ['gta 4', 'gta iv', 'gta4', 'grand theft auto 4', 'grand theft auto iv'],
    renderApi: 'Direct3D 9 (RAGE)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (GTAIV.exe)',
    notes: 'Uses d3d9.dll natively, or vulkan-1.dll with DXVK.',
    source: 'verified-db',
  },
  {
    title: 'Grand Theft Auto V (GTA V)',
    aliases: ['gta 5', 'gta v', 'gta5', 'grand theft auto 5', 'grand theft auto v'],
    renderApi: 'Direct3D 11 (RAGE)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (GTA5.exe)',
    source: 'verified-db',
  },
  {
    title: 'Red Dead Redemption (PC 2024)',
    aliases: ['red dead redemption', 'rdr', 'rdr1', 'red dead redemption 1'],
    renderApi: 'Direct3D 12 (RAGE)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (RDR.exe)',
    source: 'verified-db',
  },
  {
    title: 'Red Dead Redemption 2',
    aliases: ['rdr2', 'red dead redemption ii', 'red dead 2'],
    renderApi: 'Vulkan / Direct3D 12',
    dllName: 'vulkan-1.dll',
    architecture: '64-bit',
    exePath: 'Game Root (RDR2.exe)',
    notes: 'Default API is Vulkan (use d3d12.dll if switched to DX12 in settings).',
    source: 'verified-db',
  },
  {
    title: 'Max Payne (2001)',
    aliases: ['max payne', 'max payne 1'],
    renderApi: 'Direct3D 9 (via D3D8to9 wrapper)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (MaxPayne.exe)',
    source: 'verified-db',
  },
  {
    title: 'Max Payne 2: The Fall of Max Payne',
    aliases: ['max payne 2', 'max payne ii'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (MaxPayne2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Max Payne 3',
    aliases: ['max payne 3', 'max payne iii'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'Game Root (MaxPayne3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Bully: Scholarship Edition',
    aliases: ['bully', 'canis canem edit'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Bully.exe)',
    source: 'verified-db',
  },
  {
    title: 'L.A. Noire',
    aliases: ['la noire'],
    renderApi: 'Direct3D 9 / Direct3D 11',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (LANoire.exe)',
    source: 'verified-db',
  },

  {
    title: 'Half-Life 2',
    aliases: ['half life 2', 'hl2'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin/ or Game Root (hl2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Black Mesa',
    aliases: ['black mesa'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (bms.exe)',
    source: 'verified-db',
  },
  {
    title: 'Portal (2007)',
    aliases: ['portal', 'portal 1'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (hl2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Portal 2',
    aliases: ['portal 2', 'portal ii'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin/ or Game Root (portal2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Left 4 Dead',
    aliases: ['left 4 dead', 'left 4 dead 1', 'l4d', 'l4d1'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (left4dead.exe)',
    source: 'verified-db',
  },
  {
    title: 'Left 4 Dead 2',
    aliases: ['left 4 dead 2', 'l4d2'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (left4dead2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Team Fortress 2',
    aliases: ['tf2', 'team fortress 2'],
    renderApi: 'Direct3D 9 (Source x64)',
    dllName: 'd3d9.dll',
    architecture: '64-bit',
    exePath: 'bin/x64/ (tf_win64.exe)',
    source: 'verified-db',
  },
  {
    title: "Garry's Mod",
    aliases: ['garrys mod', 'gmod'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin/ (hl2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Vampire: The Masquerade - Bloodlines',
    aliases: ['vtmb', 'vampire bloodlines', 'vampire the masquerade bloodlines'],
    renderApi: 'Direct3D 9 (Source Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Vampire.exe)',
    source: 'verified-db',
  },

  {
    title: 'Resident Evil 4 (2005 / UHD)',
    aliases: ['resident evil 4 2005', 're4 2005', 're4 uhd', 'resident evil 4 classic', 'biohazard 4'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Bin32/ (bio4.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil 4 (2023 Remake)',
    aliases: ['resident evil 4', 'resident evil 4 remake', 're4', 're4 remake', 're4r'],
    renderApi: 'Direct3D 12 (RE Engine)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (re4.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil 5',
    aliases: ['resident evil 5', 're5'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (re5dx9.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil 6',
    aliases: ['resident evil 6', 're6'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (BH6.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil 2 (2019 Remake)',
    aliases: ['resident evil 2', 'resident evil 2 remake', 're2', 're2 remake'],
    renderApi: 'Direct3D 11 / 12 (RE Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (re2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil 3 (2020 Remake)',
    aliases: ['resident evil 3', 'resident evil 3 remake', 're3', 're3 remake'],
    renderApi: 'Direct3D 11 / 12 (RE Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (re3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil 7: Biohazard',
    aliases: ['resident evil 7', 're7'],
    renderApi: 'Direct3D 11 (RE Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (re7.exe)',
    source: 'verified-db',
  },
  {
    title: 'Resident Evil Village',
    aliases: ['resident evil 8', 're8', 'resident evil village'],
    renderApi: 'Direct3D 12 (RE Engine)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (re8.exe)',
    source: 'verified-db',
  },
  {
    title: 'Devil May Cry 3: Special Edition',
    aliases: ['devil may cry 3', 'dmc3', 'dmc 3'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (dmc3se.exe)',
    source: 'verified-db',
  },
  {
    title: 'Devil May Cry 4',
    aliases: ['devil may cry 4', 'dmc4', 'dmc 4'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (DevilMayCry4_DX9.exe)',
    source: 'verified-db',
  },
  {
    title: 'Devil May Cry 5',
    aliases: ['devil may cry 5', 'dmc5', 'dmc 5'],
    renderApi: 'Direct3D 11 / 12 (RE Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DevilMayCry5.exe)',
    source: 'verified-db',
  },
  {
    title: "Dragon's Dogma: Dark Arisen",
    aliases: ['dragons dogma', 'dragons dogma dark arisen', 'ddda', 'dragons dogma 1'],
    renderApi: 'Direct3D 9 (MT Framework)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (DDDA.exe)',
    source: 'verified-db',
  },
  {
    title: "Dragon's Dogma 2",
    aliases: ['dragons dogma 2', 'dd2'],
    renderApi: 'Direct3D 12 (RE Engine)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DD2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Monster Hunter: World',
    aliases: ['monster hunter world', 'mhw'],
    renderApi: 'Direct3D 11 / 12',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (MonsterHunterWorld.exe)',
    source: 'verified-db',
  },
  {
    title: 'Silent Hill 2: Enhanced Edition',
    aliases: ['silent hill 2', 'sh2', 'silent hill 2 enhanced edition', 'sh2ee'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (sh2pc.exe)',
    source: 'verified-db',
  },
  {
    title: 'Silent Hill 3 (PC)',
    aliases: ['silent hill 3', 'sh3'],
    renderApi: 'Direct3D 9 (via D3D8to9)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (sh3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Silent Hill 2 Remake (2024)',
    aliases: ['silent hill 2 remake', 'sh2 remake', 'silent hill 2 2024'],
    renderApi: 'Direct3D 12 (Unreal Engine 5)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'SHProto/Binaries/Win64/ (SHProto-Win64-Shipping.exe)',
    source: 'verified-db',
  },
  {
    title: 'Metal Gear Rising: Revengeance',
    aliases: ['metal gear rising', 'mgr', 'mgrr', 'revengeance'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (METAL GEAR RISING REVENGEANCE.exe)',
    source: 'verified-db',
  },
  {
    title: 'Metal Gear Solid V: The Phantom Pain',
    aliases: ['metal gear solid 5', 'mgsv', 'mgs5', 'the phantom pain'],
    renderApi: 'Direct3D 11 (Fox Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (mgsvtpp.exe)',
    source: 'verified-db',
  },

  {
    title: 'BioShock (2007)',
    aliases: ['bioshock', 'bioshock 1'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Builds/Release/ (Bioshock.exe)',
    source: 'verified-db',
  },
  {
    title: 'BioShock 2 (2010)',
    aliases: ['bioshock 2', 'bioshock ii'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'SP/Builds/Binaries/ (Bioshock2.exe)',
    source: 'verified-db',
  },
  {
    title: 'BioShock Infinite',
    aliases: ['bioshock infinite', 'bioshock 3'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'Binaries/Win32/ (BioShockInfinite.exe)',
    source: 'verified-db',
  },
  {
    title: 'Borderlands (2009)',
    aliases: ['borderlands', 'borderlands 1', 'bl1'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/ (Borderlands.exe)',
    source: 'verified-db',
  },
  {
    title: 'Borderlands 2',
    aliases: ['borderlands 2', 'bl2'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/Win32/ (Borderlands2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Borderlands 3',
    aliases: ['borderlands 3', 'bl3'],
    renderApi: 'Direct3D 11 / 12',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'OakGame/Binaries/Win64/ (Borderlands3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dead Space (2008)',
    aliases: ['dead space', 'dead space 1', 'dead space 2008'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Dead Space.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dead Space 2 (2011)',
    aliases: ['dead space 2', 'dead space ii'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (deadspace2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dead Space 3 (2013)',
    aliases: ['dead space 3', 'dead space iii'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (deadspace3.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dead Space (2023 Remake)',
    aliases: ['dead space remake', 'dead space 2023'],
    renderApi: 'Direct3D 12 (Frostbite)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (Dead Space.exe)',
    source: 'verified-db',
  },
  {
    title: "Mirror's Edge (2009)",
    aliases: ['mirrors edge', 'mirrors edge 1'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/ (MirrorsEdge.exe)',
    source: 'verified-db',
  },
  {
    title: "Mirror's Edge Catalyst",
    aliases: ['mirrors edge catalyst', 'mirrors edge 2'],
    renderApi: 'Direct3D 11 (Frostbite 3)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (MirrorsEdgeCatalyst.exe)',
    source: 'verified-db',
  },
  {
    title: 'Need for Speed: Underground 2',
    aliases: ['nfs underground 2', 'nfsu2', 'need for speed underground 2'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (speed2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Need for Speed: Most Wanted (2005)',
    aliases: ['need for speed most wanted', 'nfs most wanted', 'nfsmw', 'most wanted 2005'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (speed.exe)',
    source: 'verified-db',
  },
  {
    title: 'Need for Speed: Carbon',
    aliases: ['need for speed carbon', 'nfs carbon', 'nfsc'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (NFSC.exe)',
    source: 'verified-db',
  },
  {
    title: 'Batman: Arkham Asylum',
    aliases: ['batman arkham asylum', 'arkham asylum'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/ (ShippingPC-BmGame.exe)',
    source: 'verified-db',
  },
  {
    title: 'Batman: Arkham City',
    aliases: ['batman arkham city', 'arkham city'],
    renderApi: 'Direct3D 9 / Direct3D 11',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/Win32/ (BatmanAC.exe)',
    source: 'verified-db',
  },
  {
    title: 'Batman: Arkham Origins',
    aliases: ['batman arkham origins', 'arkham origins'],
    renderApi: 'Direct3D 9 / Direct3D 11',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'SinglePlayer/Binaries/Win32/ (BatmanOrigins.exe)',
    source: 'verified-db',
  },
  {
    title: 'Batman: Arkham Knight',
    aliases: ['batman arkham knight', 'arkham knight'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Binaries/Win64/ (BatmanAK.exe)',
    source: 'verified-db',
  },
  {
    title: 'Dying Light',
    aliases: ['dying light', 'dying light 1'],
    renderApi: 'Direct3D 11 (Chrome Engine 6)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (DyingLightGame.exe)',
    source: 'verified-db',
  },
  {
    title: 'Deus Ex: Human Revolution',
    aliases: ['deus ex human revolution', 'dxhr', 'human revolution'],
    renderApi: 'Direct3D 11 / Direct3D 9',
    dllName: 'd3d11.dll',
    architecture: '32-bit',
    exePath: 'Game Root (dxhr.exe / DXHRDC.exe)',
    notes: 'Uses d3d11.dll in DX11 / Director Cut mode or d3d9.dll in legacy DX9.',
    source: 'verified-db',
  },
  {
    title: 'Deus Ex: Mankind Divided',
    aliases: ['deus ex mankind divided', 'mankind divided', 'dxmd'],
    renderApi: 'Direct3D 11 (Dawn Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'retail/ (DXMD.exe)',
    source: 'verified-db',
  },
  {
    title: 'NieR: Automata',
    aliases: ['nier automata', 'nier'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (NieRAutomata.exe)',
    source: 'verified-db',
  },
  {
    title: 'Final Fantasy VII Remake Intergrade',
    aliases: ['final fantasy 7 remake', 'ff7 remake', 'ff7r'],
    renderApi: 'Direct3D 12 / Direct3D 11',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'End/Binaries/Win64/ (ff7remake_.exe)',
    source: 'verified-db',
  },
  {
    title: 'Final Fantasy XIV Online',
    aliases: ['final fantasy 14', 'ff14', 'ffxiv'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'game/ (ffxiv_dx11.exe)',
    source: 'verified-db',
  },
  {
    title: 'Final Fantasy XV',
    aliases: ['final fantasy 15', 'ff15', 'ffxv'],
    renderApi: 'Direct3D 11 (Luminous Engine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (ffxv_s.exe)',
    source: 'verified-db',
  },
  {
    title: 'Sleeping Dogs: Definitive Edition',
    aliases: ['sleeping dogs'],
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root (SDHDShip.exe)',
    source: 'verified-db',
  },
  {
    title: 'S.T.A.L.K.E.R.: Shadow of Chernobyl',
    aliases: ['stalker', 'stalker shadow of chernobyl', 'stalker soc', 'shadow of chernobyl'],
    renderApi: 'Direct3D 9 (X-Ray Engine)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'bin/ (XR_3DA.exe)',
    source: 'verified-db',
  },
  {
    title: 'Metro 2033 (2010)',
    aliases: ['metro 2033'],
    renderApi: 'Direct3D 9 / Direct3D 11',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (metro2033.exe)',
    source: 'verified-db',
  },
  {
    title: 'Metro Exodus',
    aliases: ['metro exodus'],
    renderApi: 'Direct3D 12 / Direct3D 11',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (MetroExodus.exe)',
    source: 'verified-db',
  },
  {
    title: 'Mount & Blade: Warband',
    aliases: ['mount and blade warband', 'warband'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (mb_warband.exe)',
    source: 'verified-db',
  },
  {
    title: 'Kingdom Come: Deliverance',
    aliases: ['kingdom come deliverance', 'kingdom come', 'kcd'],
    renderApi: 'Direct3D 11 (CryEngine)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Bin/Win64/ (KingdomCome.exe)',
    source: 'verified-db',
  },
  {
    title: 'F.E.A.R. (2005)',
    aliases: ['fear', 'f.e.a.r.', 'fear 1'],
    renderApi: 'Direct3D 9 (Lithtech Jupiter EX)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (FEAR.exe)',
    source: 'verified-db',
  },
  {
    title: 'Alan Wake (2012)',
    aliases: ['alan wake', 'alan wake 1'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (AlanWake.exe)',
    source: 'verified-db',
  },
  {
    title: 'Alan Wake 2',
    aliases: ['alan wake 2', 'alan wake ii'],
    renderApi: 'Direct3D 12 (Northlight)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'Game Root (AlanWake2.exe)',
    source: 'verified-db',
  },
  {
    title: 'Prototype (2009)',
    aliases: ['prototype', 'prototype 1'],
    renderApi: 'Direct3D 9',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (prototypef.exe)',
    source: 'verified-db',
  },
  {
    title: 'Spec Ops: The Line',
    aliases: ['spec ops the line', 'spec ops'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Binaries/Win32/ (SpecOpsTheLine.exe)',
    source: 'verified-db',
  },
  {
    title: 'Alice: Madness Returns',
    aliases: ['alice madness returns'],
    renderApi: 'Direct3D 9 (Unreal Engine 3)',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game/Alice2/Binaries/Win32/ (AliceMadnessReturns.exe)',
    source: 'verified-db',
  },
  {
    title: 'Crysis (2007)',
    aliases: ['crysis', 'crysis 1'],
    renderApi: 'Direct3D 9 / Direct3D 10',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Bin32/ (Crysis.exe)',
    source: 'verified-db',
  },
  {
    title: '101 Dalmatians: Escape from DeVil Manor',
    aliases: ['101 dalmatians', 'escape from devil manor'],
    renderApi: 'Direct3D 9 / DGVoodoo2 Wrapper',
    dllName: 'd3d9.dll',
    architecture: '32-bit',
    exePath: 'Game Root (Dalmatians.exe)',
    notes: 'Uses d3d9.dll (or ddraw.dll on unpatched retail CD).',
    source: 'verified-db',
  },
  {
    title: 'Sparky Rush',
    aliases: ['sparky rush', 'sparkyrush'],
    renderApi: 'Direct3D 12 / 11 (Unity 6)',
    dllName: 'dxgi.dll',
    architecture: '64-bit',
    exePath: 'Game Root (SparkyRush.exe)',
    notes:
      'Unity 6 (DX12 default, also supports DX11). Uses official ReShade 6.8.0 64-bit binary as dxgi.dll to hook both DX12 and DX11 swapchains.',
    source: 'verified-db',
  },
  {
    title: 'Crash Bandicoot 4: It’s About Time',
    aliases: ['crash bandicoot 4', 'crash 4'],
    renderApi: 'Direct3D 11 (Unreal Engine 4)',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Lava/Binaries/Win64/ (CrashBandicoot4.exe)',
    source: 'verified-db',
  },
  {
    title: 'Minecraft (Java Edition)',
    aliases: ['minecraft', 'minecraft java'],
    renderApi: 'OpenGL',
    dllName: 'opengl32.dll',
    architecture: '64-bit',
    exePath: 'Java Runtime bin/ (javaw.exe)',
    source: 'verified-db',
  },
  {
    title: 'Black Myth: Wukong',
    aliases: ['black myth wukong', 'wukong'],
    renderApi: 'Direct3D 12 (Unreal Engine 5)',
    dllName: 'd3d12.dll',
    architecture: '64-bit',
    exePath: 'b1/Binaries/Win64/ (b1-Win64-Shipping.exe)',
    source: 'verified-db',
  },
];

const ROMAN_TO_ARABIC: Record<string, string> = {
  ii: '2',
  iii: '3',
  iv: '4',
  vi: '6',
  vii: '7',
  viii: '8',
};

function normalizeTitle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['’`:.,!?()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (ROMAN_TO_ARABIC[word]) return ROMAN_TO_ARABIC[word];
      if (/^\d+$/.test(word)) return word;
      return word.replace(/([a-z])\1+/g, '$1');
    })
    .join(' ');
}

function tokenMatchesFuzzy(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let edits = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else {
        i++;
        j++;
      }
    }
  }
  if (i < a.length || j < b.length) edits++;
  return edits <= 1;
}

function extractSpecifiers(norm: string): string[] {
  const words = norm.split(' ');
  return words.filter(
    (w) =>
      /^\d+$/.test(w) ||
      w === 'origins' ||
      w === 'inquisition' ||
      w === 'veilguard' ||
      w === 'remake' ||
      w === 'remastered' ||
      w === 'infinite' ||
      w === 'eternal' ||
      w === 'vegas' ||
      w === 'kiwami' ||
      w === 'valhala' ||
      w === 'odysey' ||
      w === 'unity' ||
      w === 'syndicate'
  );
}

export function findVerifiedGameMatch(query: string): GameApiProfile | null {
  const normQuery = normalizeTitle(query);
  if (!normQuery) return null;

  for (const entry of VERIFIED_GAME_API_DB) {
    if (normalizeTitle(entry.title) === normQuery) {
      return entry;
    }
    if (entry.aliases?.some((a) => normalizeTitle(a) === normQuery)) {
      return entry;
    }
  }

  const querySpecs = extractSpecifiers(normQuery);
  for (const entry of VERIFIED_GAME_API_DB) {
    const candidateStrings = [entry.title, ...(entry.aliases || [])].map(normalizeTitle);
    for (const cand of candidateStrings) {
      if (cand.includes(normQuery) || normQuery.includes(cand)) {
        const candSpecs = extractSpecifiers(cand);
        const specsMatch =
          querySpecs.length === 0
            ? candSpecs.filter((s) => /^\d+$/.test(s)).length === 0
            : querySpecs.every(
                (s) => candSpecs.includes(s) || normalizeTitle(entry.title).split(' ').includes(s)
              );
        if (specsMatch && Math.min(cand.length, normQuery.length) >= 4) {
          return entry;
        }
      }
    }
  }

  const queryTokens = normQuery.split(' ').filter((w) => w.length >= 1);
  if (queryTokens.length === 0) return null;

  let bestEntry: GameApiProfile | null = null;
  let bestRatio = 0;

  for (const entry of VERIFIED_GAME_API_DB) {
    const candidateStrings = [entry.title, ...(entry.aliases || [])].map(normalizeTitle);
    for (const cand of candidateStrings) {
      const candWords = cand.split(' ');
      const candSet = new Set(candWords);

      if (querySpecs.length > 0 && !querySpecs.every((s) => candSet.has(s))) {
        continue;
      }

      let matchedCount = 0;
      for (const qt of queryTokens) {
        if (candSet.has(qt) || candWords.some((cw) => tokenMatchesFuzzy(qt, cw))) {
          matchedCount++;
        }
      }

      const ratio = matchedCount / queryTokens.length;
      if (
        ratio >= 0.66 &&
        (matchedCount >= 2 || (queryTokens.length === 1 && queryTokens[0].length >= 5)) &&
        ratio > bestRatio
      ) {
        bestRatio = ratio;
        bestEntry = entry;
      }
    }
  }

  return bestEntry;
}

export function resolveGameApiLocally(query: string): GameApiProfile {
  const trimmed = query.trim();
  if (!trimmed) {
    return VERIFIED_GAME_API_DB[0];
  }

  const verified = findVerifiedGameMatch(trimmed);
  if (verified) {
    return verified;
  }

  const q = normalizeTitle(trimmed);

  if (
    q.includes('vulkan') ||
    q.includes('doom') ||
    q.includes('wolfenstein') ||
    q.includes('rdr2') ||
    q.includes('no mans sky') ||
    q.includes('detroit become human') ||
    q.includes('path of exile')
  ) {
    return {
      title: trimmed,
      renderApi: 'Vulkan',
      dllName: 'vulkan-1.dll',
      architecture: '64-bit',
      exePath: 'Game Root (next to main .exe)',
      source: 'heuristic',
    };
  }

  if (
    q.includes('opengl') ||
    q.includes('minecraft') ||
    q.includes('quake') ||
    q.includes('kotor') ||
    q.includes('knights of the old republic') ||
    q.includes('amnesia') ||
    q.includes('cry of fear') ||
    q.includes('half life 1') ||
    q.includes('counter strike 1 6')
  ) {
    return {
      title: trimmed,
      renderApi: 'OpenGL',
      dllName: 'opengl32.dll',
      architecture: '32-bit',
      exePath: 'Game Root (next to main .exe)',
      source: 'heuristic',
    };
  }

  if (
    q.includes('dragon age origins') ||
    q.includes('dragon age 2') ||
    q.includes('black ops 1') ||
    q.includes('modern warfare 2') ||
    q.includes('modern warfare 3') ||
    q.includes('world at war') ||
    q.includes('ps1') ||
    q.includes('ps2') ||
    q.includes('2003') ||
    q.includes('2004') ||
    q.includes('2005') ||
    q.includes('2006') ||
    q.includes('2007') ||
    q.includes('2008') ||
    q.includes('2009') ||
    q.includes('2010') ||
    q.includes('2011') ||
    q.includes('dx9') ||
    q.includes('d3d9') ||
    q.includes('source') ||
    q.includes('left 4 dead') ||
    q.includes('portal') ||
    q.includes('bioshock 1') ||
    q.includes('bioshock 2') ||
    q.includes('mass effect') ||
    q.includes('dead space') ||
    q.includes('borderlands 1') ||
    q.includes('borderlands 2') ||
    q.includes('max payne 1') ||
    q.includes('max payne 2') ||
    q.includes('gothic') ||
    q.includes('splinter cel') ||
    q.includes('prince of persia') ||
    q.includes('sims 2') ||
    q.includes('sims 3') ||
    q.includes('silent hil')
  ) {
    return {
      title: trimmed,
      renderApi: 'Direct3D 9 (SM 3.0)',
      dllName: 'd3d9.dll',
      architecture: '32-bit',
      exePath: 'Game Root (next to main .exe)',
      source: 'heuristic',
    };
  }

  if (q.includes('dx12') || q.includes('d3d12') || q.includes('unreal engine 5')) {
    return {
      title: trimmed,
      renderApi: 'Direct3D 12',
      dllName: 'd3d12.dll',
      architecture: '64-bit',
      exePath: 'Game Root or Binaries/Win64/',
      source: 'heuristic',
    };
  }

  return {
    title: trimmed,
    renderApi: 'Direct3D 11',
    dllName: 'd3d11.dll',
    architecture: '64-bit',
    exePath: 'Game Root or Binaries/Win64/',
    notes: 'Direct3D 11 standard ReShade hook (d3d11.dll).',
    source: 'heuristic',
  };
}

export async function lookupGameReShadeApi(query: string): Promise<GameApiProfile> {
  const trimmed = query.trim();
  if (!trimmed) {
    return VERIFIED_GAME_API_DB[0];
  }

  const verifiedMatch = findVerifiedGameMatch(trimmed);
  if (verifiedMatch) {
    return verifiedMatch;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const searchUrl = `https://www.pcgamingwiki.com/w/api.php?action=opensearch&search=${encodeURIComponent(
      trimmed
    )}&limit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, { signal: controller.signal });
    if (searchRes.ok) {
      const searchJson = (await searchRes.json()) as [string, string[]];
      const matchedPage = searchJson?.[1]?.[0];

      if (matchedPage) {

        const canonicalVerified = findVerifiedGameMatch(matchedPage);
        if (canonicalVerified) {
          clearTimeout(timer);
          return canonicalVerified;
        }

        const parseUrl = `https://www.pcgamingwiki.com/w/api.php?action=parse&page=${encodeURIComponent(
          matchedPage
        )}&prop=wikitext&format=json&origin=*`;
        const parseRes = await fetch(parseUrl, { signal: controller.signal });
        clearTimeout(timer);

        if (parseRes.ok) {
          const parseJson = (await parseRes.json()) as {
            parse?: { wikitext?: { '*'?: string } };
          };
          const wikitext = parseJson?.parse?.wikitext?.['*'] || '';
          if (wikitext) {
            const d3dMatch = wikitext.match(/\|direct3d versions\s*=\s*([^\n|}]+)/i);
            const vkMatch = wikitext.match(/\|vulkan versions\s*=\s*([^\n|}]+)/i);
            const oglMatch = wikitext.match(/\|opengl versions\s*=\s*([^\n|}]+)/i);
            const win64Match = wikitext.match(/\|windows 64-bit executable\s*=\s*([^\n|}]+)/i);

            const d3d = (d3dMatch?.[1] || '').trim();
            const vk = (vkMatch?.[1] || '').trim();
            const ogl = (oglMatch?.[1] || '').trim();
            const win64Val = (win64Match?.[1] || '').trim().toLowerCase();

            if (d3d || vk || ogl) {
              const is64 = win64Val.includes('true') || win64Val.includes('hackable');
              const arch: '32-bit' | '64-bit' = is64 ? '64-bit' : '32-bit';

              let dllName: ReShadeDllName = 'd3d11.dll';
              let renderApi = 'Direct3D 11';

              if (d3d.includes('11')) {
                dllName = 'd3d11.dll';
                renderApi = `Direct3D ${d3d}`;
              } else if (d3d.includes('12')) {
                dllName = 'd3d12.dll';
                renderApi = `Direct3D 12`;
              } else if (d3d.includes('9') || d3d.includes('8')) {
                dllName = 'd3d9.dll';
                renderApi = `Direct3D ${d3d}`;
              } else if (d3d.includes('10')) {
                dllName = 'dxgi.dll';
                renderApi = `Direct3D ${d3d}`;
              } else if (vk) {
                dllName = 'vulkan-1.dll';
                renderApi = `Vulkan (${vk})`;
              } else if (ogl) {
                dllName = 'opengl32.dll';
                renderApi = `OpenGL (${ogl})`;
              }

              return {
                title: matchedPage,
                renderApi,
                dllName,
                architecture: arch,
                exePath: 'Game Root (next to main .exe)',
                notes: `Detected via PCGamingWiki (${renderApi}, ${arch}).`,
                source: 'online-pcgamingwiki',
              };
            }
          }
        }
      }
    }
    clearTimeout(timer);
  } catch {

  }

  return resolveGameApiLocally(trimmed);
}
