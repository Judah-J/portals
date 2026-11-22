"use strict";

const FingerPortal = (() => {
  const runtime = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304";
  const model = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
  const styles = [
    { name: "Silver negative", effect: "negative", effectName: "Negative", edge: "#d6faff", low: [9,23,34], high: [224,254,255], negative: true,
      wave: "sine", sample: "silver", transpose: 0, beats: 8, division: 2, pattern: [0,null,2,1,0,null,3,2], blobWave: "triangle", notes: 2, gate: 0.85 },
    { name: "Amber glass", effect: "threshold", effectName: "Threshold", edge: "#ffda8e", low: [46,11,17], high: [255,219,128], levels: 8,
      wave: "triangle", sample: "amber", transpose: -4, beats: 16, division: 1, pattern: [0,2,1,3], blobWave: "sine", notes: 3, gate: 0.92 },
    { name: "Violet prism", effect: "rgb", effectName: "RGB split", edge: "#e8cfff", low: [24,4,72], high: [255,155,236],
      wave: "sawtooth", sample: "violet", transpose: 0, beats: 16, division: 2, pattern: [0,2,null,3,1,null,2,3], blobWave: "triangle", notes: 2, gate: 0.55 },
    { name: "Jade etching", effect: "etch", effectName: "Etching", edge: "#afffd0", low: [1,24,24], high: [200,255,152], levels: 5, contrast: 1.4,
      wave: "sine", sample: "jade", transpose: -5, beats: 8, division: 4, pattern: [0,null,1,null,2,3,null,1], blobWave: "sine", notes: 2, gate: 0.56 },
    { name: "Rose quartz", effect: "halftone", effectName: "Halftone", edge: "#ffd0e0", low: [58,5,31], high: [255,231,226], negative: true, contrast: 1.25,
      wave: "triangle", sample: "rose", transpose: -2, beats: 8, bpm: 100, division: 2, pattern: [0,null,1,2,0,3,null,2], blobWave: "triangle", notes: 2, gate: 1.14 },
    { name: "Cobalt flare", effect: "dither", effectName: "Ordered dither", edge: "#b9d5ff", low: [4,10,62], high: [146,222,255], levels: 12, contrast: 1.55,
      wave: "sawtooth", sample: "cobalt", transpose: -3, beats: 16, division: 4, pattern: [0,null,2,1,null,3,null,2], blobWave: "square", notes: 1, gate: 0.48 },
    { name: "Infrared bloom", effect: "thermal", effectName: "Thermal", edge: "#ffb38d", low: [12,6,35], mid: [198,26,83], high: [255,246,136],
      wave: "sine", sample: "infrared", transpose: 3, beats: 16, division: 2, pattern: [0,1,null,2,3,null,2,1], blobWave: "sine", notes: 2, gate: 0.65 },
    { name: "Mint scanline", effect: "scanline", effectName: "CRT scanlines", edge: "#98ffcf", low: [3,22,20], high: [190,255,217], scanline: true,
      wave: "triangle", sample: "scanline", transpose: 5, beats: 16, bpm: 90, division: 2, pattern: [0,null,3,2,null,1,2,null], blobWave: "triangle", notes: 2, gate: 0.8 },
    { name: "Solar mirror", effect: "solar", effectName: "Solarization", edge: "#ffefae", low: [17,11,50], high: [255,222,109], solar: true,
      wave: "triangle", sample: "solar", transpose: -5, beats: 8, bpm: 100, division: 4, pattern: [0,2,null,1,3,null,2,null], blobWave: "sine", notes: 1, gate: 0.62 },
    { name: "Blue dusk", effect: "teletext", effectName: "Teletext", edge: "#c5bfff", low: [8,12,41], mid: [75,55,160], high: [244,179,215], levels: 7,
      wave: "sine", sample: "dusk", transpose: 1, beats: 16, bpm: 100, division: 2, pattern: [0,null,1,3,2,null,0,2], blobWave: "triangle", notes: 2, gate: 0.97 },
    { name: "Obsidian halo", effect: "ascii", effectName: "ASCII", edge: "#d2c6ff", low: [4,3,15], mid: [48,33,107], high: [225,216,255], contrast: 1.6,
      wave: "sine", sample: "obsidian", transpose: 0, rootMidi: 58, beats: 16, bpm: 90, division: 2, pattern: [0,null,1,2,3,null,0,2], blobWave: "sine", notes: 2, gate: 0.92 },
    { name: "Mercury relief", effect: "emboss", effectName: "Emboss", edge: "#d5f4f2", low: [6,17,19], mid: [83,129,130], high: [241,251,241], levels: 5,
      wave: "sine", sample: "mercury", transpose: 0, rootMidi: 59, beats: 16, bpm: 90, division: 2, pattern: [0,2,null,1,2,3,null,1], blobWave: "triangle", notes: 2, gate: 0.74 },
    { name: "Copper eclipse", effect: "risograph", effectName: "Risograph", edge: "#ffb080", low: [34,6,18], mid: [211,69,31], high: [255,217,166], solar: true,
      wave: "sine", sample: "copper", transpose: 0, rootMidi: 51, beats: 16, bpm: 100, division: 2, pattern: [2,null,3,1,0,2,null,3], blobWave: "sine", notes: 2, gate: 0.48 },
    { name: "Ice fracture", effect: "nokia", effectName: "Nokia LCD", edge: "#b5dcff", low: [7,22,59], mid: [74,146,231], high: [214,247,255], levels: 11, scanline: true,
      wave: "sine", sample: "ice", transpose: 0, rootMidi: 53, beats: 16, bpm: 100, division: 2, pattern: [0,3,null,2,1,null,2,0], blobWave: "triangle", notes: 2, gate: 0.82 },
    { name: "Ink wash", effect: "mosaic", effectName: "Mosaic", edge: "#e0d4bf", low: [11,10,15], mid: [95,85,77], high: [236,229,206], contrast: 1.45,
      wave: "sine", sample: "ink", transpose: 0, rootMidi: 53, beats: 8, bpm: 90, division: 2, pattern: [1,null,2,0,null,3,2,1], blobWave: "sine", notes: 2, gate: 0.62 },
    {"name":"Checker Floor","effect":"checker","effectName":"Checker Floor","edge":"#ffdbb5","low":[21,14,29],"high":[255,187,143],"sample":"terrace1","bank":"terrace","transpose":0,"rootMidi":55,"beats":16,"bpm":124,"division":2,"pattern":[0,2,null,1,3,null,1,2],"blobWave":"sine","notes":2,"gate":0.72},
    {"name":"Signal Bleed","effect":"glitch","effectName":"Signal Bleed","edge":"#ff8fb0","low":[18,5,32],"high":[252,99,159],"sample":"terrace2","bank":"terrace","transpose":0,"rootMidi":55,"beats":16,"bpm":124,"division":2,"pattern":[0,null,3,2,null,1,2,0],"blobWave":"triangle","notes":2,"gate":0.72},
    {"name":"Venetian Glass","effect":"venetian","effectName":"Venetian Glass","edge":"#e8d894","low":[22,29,16],"high":[245,231,167],"sample":"terrace3","bank":"terrace","transpose":0,"rootMidi":55,"beats":16,"bpm":124,"division":2,"pattern":[0,1,3,null,2,null,1,0],"blobWave":"sine","notes":2,"gate":0.72},
    {"name":"Liquid Ribbon","effect":"ribbon","effectName":"Liquid Ribbon","edge":"#a3faff","low":[4,26,42],"high":[126,232,227],"sample":"terrace4","bank":"terrace","transpose":0,"rootMidi":50,"beats":16,"bpm":124,"division":2,"pattern":[1,null,0,3,2,1,null,2],"blobWave":"triangle","notes":2,"gate":0.72},
    {"name":"Prismatic Fold","effect":"fold","effectName":"Prismatic Fold","edge":"#dac1ff","low":[18,9,35],"high":[232,192,255],"sample":"terrace5","bank":"terrace","transpose":0,"rootMidi":50,"beats":32,"bpm":124,"division":2,"pattern":[0,3,null,2,1,null,3,2],"blobWave":"sine","notes":2,"gate":0.72},
    {"name":"Blueprint","effect":"blueprint","effectName":"Blueprint","edge":"#badcff","low":[6,20,59],"high":[173,215,255],"sample":"terrace6","bank":"terrace","transpose":0,"rootMidi":50,"beats":32,"bpm":124,"division":2,"pattern":[0,null,2,1,3,2,null,1],"blobWave":"triangle","notes":2,"gate":0.72},
    {"name":"Ink Stipple","effect":"stipple","effectName":"Ink Stipple","edge":"#f7dac1","low":[26,12,17],"high":[235,216,183],"sample":"terrace7","bank":"terrace","transpose":0,"rootMidi":52,"beats":32,"bpm":124,"division":2,"pattern":[0,1,null,3,0,null,2,1],"blobWave":"sine","notes":2,"gate":0.72},
    {"name":"Chrome Bands","effect":"chrome","effectName":"Chrome Bands","edge":"#d8f9eb","low":[10,14,20],"high":[218,248,248],"sample":"terrace8","bank":"terrace","transpose":0,"rootMidi":55,"beats":16,"bpm":125,"division":2,"pattern":[0,2,3,null,2,1,null,3],"blobWave":"triangle","notes":2,"gate":0.72}
  ];
  const choices = (...entries) => entries.map(([name, sample]) => ({ name, sample }));
  // Key and BPM of each prepared buffer, before the shared preset playback rate.
  const tonalSpecs = {
    silverLoop: ["Am", 115],
    amberLoop: ["C#m", 115],
    violetLoop: ["Am", 115],
    jadeLoop: ["Dm", 115],
    roseLoop: ["Bm", 100],
    cobaltLoop: ["Cm", 115],
    infraredLoop: ["F#m", 115],
    scanlineLoop: ["Em", 90],
    solarLoop: ["Dm", 100],
    duskLoop: ["G#m", 100],
    diateraAm: ["Am", 115],
    amberGraal: ["C#m", 115],
    avolioAm: ["Am", 115],
    incalmo: ["Dm", 115],
    didymiumBm: ["Bm", 100],
    aryballos: ["Cm", 115],
    tessera: ["Cm", 115],
    infraredTempered: ["F#m", 115],
    murrhina: ["Em", 90],
    diateraDm: ["Dm", 100],
    intarsia: ["G#m", 100],
    pontil1: ["C#m", 115],
    pontil2: ["C#m", 115],
    scavo: ["F#m", 115],
    pontil1A115: ["Am", 115],
    pontil2A115: ["Am", 115],
    scavoA115: ["Am", 115],
    scavoCSharp115: ["C#m", 115],
    pontil1D115: ["Dm", 115],
    pontil2D115: ["Dm", 115],
    scavoD115: ["Dm", 115],
    pontil1B100: ["Bm", 100],
    pontil2B100: ["Bm", 100],
    scavoB100: ["Bm", 100],
    pontil1C115: ["Cm", 115],
    pontil2C115: ["Cm", 115],
    scavoC115: ["Cm", 115],
    pontil1FSharp115: ["F#m", 115],
    pontil2FSharp115: ["F#m", 115],
    pontil1E90: ["Em", 90],
    pontil2E90: ["Em", 90],
    scavoE90: ["Em", 90],
    pontil1D100: ["Dm", 100],
    pontil2D100: ["Dm", 100],
    scavoD100: ["Dm", 100],
    pontil1GSharp100: ["G#m", 100],
    pontil2GSharp100: ["G#m", 100],
    scavoGSharp100: ["G#m", 100],
    alembicrose: ["Bm", 100],
    alembicscanline: ["Em", 90],
    alembicdusk: ["G#m", 100],
    obsidianLoop: ["A#m",90],
    obsidianFinial: ["A#m",90],
    obsidianBass: ["A#m",90],
    mercuryLoop: ["Bm",90],
    mercuryVerre: ["Bm",90],
    mercuryBass: ["Bm",90],
    copperLoop: ["D#m",100],
    copperSilica: ["D#m",100],
    copperBass: ["D#m",100],
    iceLoop: ["Fm",100],
    iceGraal: ["Fm",100],
    iceBass: ["Fm",100],
    inkLoop: ["Fm",90],
    inkMosaic: ["Fm",90],
    inkKantharos: ["Fm",90],
    inkBass: ["Fm",90],
    terrace1Loop: ["Gm",124],
    thSynth12402: ["Gm",124],
    thBass124Gm: ["Gm",124],
    terrace2Loop: ["Gm",124],
    thSynth12404: ["Gm",124],
    terrace3Loop: ["Gm",124],
    thSynth12406: ["Gm",124],
    terrace4Loop: ["Dm",124],
    thSynth12408: ["Dm",124],
    thBass124Dm: ["Dm",124],
    terrace5Loop: ["Dm",124],
    thSynth12410: ["Dm",124],
    terrace6Loop: ["Dm",124],
    thSynth12417: ["Dm",124],
    terrace7Loop: ["Em",124],
    thSynth12415: ["Em",124],
    thBass124Em: ["Em",124],
    terrace8Loop: ["Gm",125],
    thSynth12502: ["Gm",125],
    thBass125Gm: ["Gm",125]
  };
  function compatibleChoices(options, dedupePairs = false) {
    const seenPairs = new Set();
    return Object.fromEntries(styles.map(style => {
      const main = style.sample + "Loop";
      const [key, bpm] = tonalSpecs[main];
      const matches = (options[style.sample] ?? []).filter(({ sample }) => {
        const tune = tonalSpecs[sample];
        if (sample === main || tune?.[0] !== key || tune?.[1] !== bpm) return false;
        if (!dedupePairs) return true;
        const pair = [main, sample].sort().join("/");
        if (seenPairs.has(pair)) return false;
        seenPairs.add(pair);
        return true;
      });
      return [style.sample, matches];
    }));
  }
  const matchingLayers = compatibleChoices({
    silver: choices(["Diatera","diateraAm"], ["Anodize","violetLoop"]),
    amber: choices(["Graal","amberGraal"]),
    violet: choices(["Avolio","avolioAm"], ["Diatera","diateraAm"]),
    jade: choices(["Incalmo","incalmo"]),
    rose: choices(["Didymium","didymiumBm"], ["Alembic","alembicrose"]),
    cobalt: choices(["Aryballos","aryballos"], ["Tessera","tessera"]),
    infrared: choices(["Tempered","infraredTempered"]),
    scanline: choices(["Murrhina","murrhina"], ["Alembic","alembicscanline"]),
    solar: choices(["Diatera","diateraDm"]),
    dusk: choices(["Intarsia","intarsia"], ["Alembic","alembicdusk"]),
    obsidian: choices(["Finial","obsidianFinial"]),
    mercury: choices(["Pâte de Verre","mercuryVerre"]),
    copper: choices(["Silica","copperSilica"]),
    ice: choices(["Graal","iceGraal"]),
    ink: choices(["Mosaic","inkMosaic"], ["Kantharos","inkKantharos"]),
    terrace1: choices(["Synth 02","thSynth12402"]),
    terrace2: choices(["Synth 04","thSynth12404"]),
    terrace3: choices(["Synth 06","thSynth12406"]),
    terrace4: choices(["Synth 08","thSynth12408"]),
    terrace5: choices(["Synth 10","thSynth12410"]),
    terrace6: choices(["Synth 17","thSynth12417"]),
    terrace7: choices(["Synth 15","thSynth12415"]),
    terrace8: choices(["Synth 02","thSynth12502"])
  }, true);
  const bassChoices = compatibleChoices({
    silver: choices(["Pontil 1","pontil1A115"], ["Pontil 2","pontil2A115"], ["Scavo","scavoA115"]),
    amber: choices(["Pontil 1","pontil1"], ["Pontil 2","pontil2"], ["Scavo","scavoCSharp115"]),
    violet: choices(["Pontil 1","pontil1A115"], ["Pontil 2","pontil2A115"], ["Scavo","scavoA115"]),
    jade: choices(["Pontil 1","pontil1D115"], ["Pontil 2","pontil2D115"], ["Scavo","scavoD115"]),
    rose: choices(["Pontil 1","pontil1B100"], ["Pontil 2","pontil2B100"], ["Scavo","scavoB100"]),
    cobalt: choices(["Pontil 1","pontil1C115"], ["Pontil 2","pontil2C115"], ["Scavo","scavoC115"]),
    infrared: choices(["Pontil 1","pontil1FSharp115"], ["Pontil 2","pontil2FSharp115"], ["Scavo","scavo"]),
    scanline: choices(["Pontil 1","pontil1E90"], ["Pontil 2","pontil2E90"], ["Scavo","scavoE90"]),
    solar: choices(["Pontil 1","pontil1D100"], ["Pontil 2","pontil2D100"], ["Scavo","scavoD100"]),
    dusk: choices(["Pontil 1","pontil1GSharp100"], ["Pontil 2","pontil2GSharp100"], ["Scavo","scavoGSharp100"]),
    obsidian: choices(["Pontil 2", "obsidianBass"]),
    mercury: choices(["Pontil 2", "mercuryBass"]),
    copper: choices(["Pontil 2", "copperBass"]),
    ice: choices(["Pontil 2", "iceBass"]),
    ink: choices(["Pontil 2", "inkBass"]),
    terrace1: choices(["Terrace bass","thBass124Gm"]),
    terrace2: choices(["Terrace bass","thBass124Gm"]),
    terrace3: choices(["Terrace bass","thBass124Gm"]),
    terrace4: choices(["Terrace bass","thBass124Dm"]),
    terrace5: choices(["Terrace bass","thBass124Dm"]),
    terrace6: choices(["Terrace bass","thBass124Dm"]),
    terrace7: choices(["Terrace bass","thBass124Em"]),
    terrace8: choices(["Terrace bass","thBass125Gm"])
  });
  const percussion = Object.fromEntries([90, 100, 115].map(bpm => [bpm, {
    drums: [1, 2, 3].map(number => ({ name: "Full drums " + number, sample: "full" + bpm + "_" + number })),
    tops: { name: "Tops", sample: "tops" + bpm }
  }]));
  let detectorPromise;
  const terraceDrums = Object.fromEntries([124, 125].map(bpm => [bpm, {
    drums: [1, 2, 3].map(number => ({ name: "Terrace drums " + number, sample: "thDrums" + bpm + "_" + number })),
    tops: { name: "Terrace percussion", sample: "thTops" + bpm }
  }]));
  const samplePromises = new Map();

  function loadDetector() {
    if (!detectorPromise) {
      let timer;
      let expired = false;
      const setup = (async () => {
        const { FilesetResolver, HandLandmarker } = await import(runtime + "/vision_bundle.mjs");
        const files = await FilesetResolver.forVisionTasks(runtime + "/wasm");
        if (expired) return;
        const detector = await HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: model },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        if (expired) detector.close();
        else return detector;
      })();
      const deadline = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          expired = true;
          reject(new Error("Hand tracking took too long to load."));
        }, 15000);
      });
      detectorPromise = Promise.race([setup, deadline]).catch(error => {
        detectorPromise = null;
        throw error;
      }).finally(() => clearTimeout(timer));
    }
    return detectorPromise;
  }

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  function createGesture(bank = "verre") {
    const bankStyles = styles.filter(style => (style.bank ?? "verre") === bank);
    let state = "idle";
    let variant = -1;
    let lastSeen = -Infinity;
    let startSpan = 0;
    let active = null;
    let separationSince = null;
    let layerIndex = -1;
    let drumsIndex = -1;
    let topsOn = false;
    let bassIndex = -1;
    let lastCurl = {};
    let readyToCurl = [{}, {}];
    let previous;

    function update(hands, aspect, now, handedness = []) {
      if (hands.length !== 2) {
        const missing = now - lastSeen;
        separationSince = null;
        if (missing > 280) {
          state = "idle";
          readyToCurl = [{}, {}];
          active = previous = null;
        }
        return active && { ...active, activation: [], visibility: clamp(1 - (missing - 65) / 215, 0, 1) };
      }
      const distance = (a, b) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);
      let ordered = hands;
      if (previous) {
        const direct = distance(hands[0][0], previous[0].wrist) + distance(hands[1][0], previous[1].wrist);
        const crossed = distance(hands[1][0], previous[0].wrist) + distance(hands[0][0], previous[1].wrist);
        if (crossed < direct) ordered = [hands[1], hands[0]];
      }
      const elapsed = Math.max(1, now - lastSeen);
      lastSeen = now;
      const labels = hands.map((hand, index) => handedness[index]?.[0]?.categoryName?.toLowerCase());
      const next = ordered.map((hand, index) => {
        const smooth = (point, last) => {
          if (!last || elapsed > 150) return point;
          const velocity = distance(point, last) * 1000 / elapsed;
          const rate = 12 + Math.min(72, velocity * 42);
          const amount = 1 - Math.exp(-rate * elapsed / 1000);
          return { x: mix(last.x, point.x, amount), y: mix(last.y, point.y, amount) };
        };
        const thumb = smooth(hand[4], previous?.[index].thumb);
        const indexTip = smooth(hand[8], previous?.[index].index);
        const palmWidth = distance(hand[5], hand[17]);
        const palm = Math.max(0.025, distance(hand[0], hand[9]), palmWidth * 0.9);
        // Use raw tips for contact, and damped tips for the visible portal.
        const pads = [hand[4], hand[8]];
        const radius = clamp((palmWidth > 0.015 ? palmWidth : palm * 0.75) * 0.22, 0.009, 0.026);
        const gap = distance(...pads);
        const label = labels[0] !== labels[1] ? labels[hands.indexOf(hand)] : null;
        const side = previous?.[index]?.side ?? (label === "left" || label === "right" ? label : null);
        return { thumb, index: indexTip, wrist: hand[0], center: midpoint(thumb, indexTip), pads, radius, gap, palm, side };
      });
      previous = next;
      const [a, b] = next;
      const palm = (a.palm + b.palm) / 2;
      const span = distance(a.center, b.center);
      const contactSpan = distance(midpoint(...a.pads), midpoint(...b.pads));
      const closest = Math.min(...a.pads.flatMap(first => b.pads.map(second => distance(first, second))));
      const contactSlack = Math.min(0.009, palm * 0.06);
      const touching = a.gap <= a.radius * 2 + contactSlack && b.gap <= b.radius * 2 + contactSlack &&
        closest <= a.radius + b.radius + contactSlack;
      if (touching) {
        startSpan = state === "armed" ? Math.min(startSpan, contactSpan) : contactSpan;
        state = "armed";
        separationSince = null;
        active = null;
        return null;
      }
      if (state === "armed") {
        // Leave a small dead zone so contact jitter cannot switch presets.
        const releaseSlack = Math.max(0.012, palm * 0.14);
        const bothPinchesOpen = a.gap > a.radius * 2 + releaseSlack && b.gap > b.radius * 2 + releaseSlack;
        const handsApart = closest > a.radius + b.radius + releaseSlack &&
          contactSpan > startSpan + Math.max(0.022, palm * 0.25);
        if (handsApart || bothPinchesOpen) {
          separationSince ??= now;
          if (now - separationSince >= 28) {
            state = "open";
            variant = (variant + 1) % bankStyles.length;
            layerIndex = -1;
            drumsIndex = bassIndex = -1;
            topsOn = false;
            lastCurl = {};
            readyToCurl = [{}, {}];
          }
        } else {
          separationSince = null;
        }
      }
      if (state !== "open") return null;

      const style = bankStyles[variant];
      const layerChoices = matchingLayers[style.sample];
      const bassOptions = bassChoices[style.sample];
      const drumOptions = (style.bank === "terrace" ? terraceDrums : percussion)[style.bpm ?? 115];
      const triggered = new Map();
      const activation = [];
      ordered.forEach((hand, slot) => {
        let strongest = null;
        for (const [finger, base] of [["middle",9], ["ring",13], ["pinky",17]]) {
          const joint = hand[base + 1];
          const first = { x: (hand[base].x - joint.x) * aspect, y: hand[base].y - joint.y };
          const second = { x: (hand[base + 3].x - joint.x) * aspect, y: hand[base + 3].y - joint.y };
          const length = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
          if (length < 0.00006) continue;
          const extension = (first.x * second.x + first.y * second.y) / length;
          if (extension < -0.86) readyToCurl[slot][finger] = true;
          if (readyToCurl[slot][finger] && extension > -0.42) {
            readyToCurl[slot][finger] = false;
            if (!strongest || extension > strongest.extension) strongest = { finger, extension };
          }
        }
        if (!strongest) return;
        const trackedSide = next[slot].side;
        const otherSide = next[1 - slot].side;
        const side = trackedSide !== otherSide ? trackedSide ?? (otherSide === "left" ? "right" : "left") : null;
        const control = strongest.finger === "middle" ? "melodic" : side && side + "-" + strongest.finger;
        if (control && !triggered.has(control)) triggered.set(control, { side, finger: strongest.finger });
      });
      for (const [finger, detail] of triggered) {
        if (now - (lastCurl[finger] ?? -Infinity) <= 300) continue;
        lastCurl[finger] = now;
        activation.push({ control: finger, ...detail });
        if (finger === "melodic") {
          layerIndex = layerIndex >= layerChoices.length - 1 ? -1 : layerIndex + 1;
        } else if (finger === "left-ring") {
          drumsIndex = drumsIndex >= drumOptions.drums.length - 1 ? -1 : drumsIndex + 1;
        } else if (finger === "left-pinky") {
          topsOn = !topsOn;
        } else if (finger === "right-ring") {
          bassIndex = bassIndex >= bassOptions.length - 1 ? -1 : bassIndex + 1;
        } else if (finger === "right-pinky") {
          bassIndex = bassIndex < 0 ? bassOptions.length - 1 : bassIndex - 1;
        }
      }

      const center = midpoint(a.center, b.center);
      let points = [a.thumb, a.index, b.thumb, b.index];
      points.sort((p, q) => Math.atan2(p.y - center.y, (p.x - center.x) * aspect) -
        Math.atan2(q.y - center.y, (q.x - center.x) * aspect));
      let area = 0;
      points.forEach((p, i) => {
        const q = points[(i + 1) % points.length];
        area += p.x * q.y - q.x * p.y;
      });
      const shortSide = Math.abs(area) * aspect / (2 * Math.max(0.015, span));
      const thinness = 1 - clamp((shortSide / palm - 0.16) / 0.74, 0, 1);
      if (Math.abs(area) < 0.0018 && span > 0.01) {
        const thickness = clamp(span * 0.065, 0.004, 0.016);
        const dx = -(b.center.y - a.center.y) / span * thickness / aspect;
        const dy = (b.center.x - a.center.x) * aspect / span * thickness;
        points = [
          { x: a.center.x + dx, y: a.center.y + dy },
          { x: b.center.x + dx, y: b.center.y + dy },
          { x: b.center.x - dx, y: b.center.y - dy },
          { x: a.center.x - dx, y: a.center.y - dy }
        ];
      }
      active = {
        center, points, style, activation,
        horizontalWidth: Math.abs(a.center.x - b.center.x),
        layer: layerChoices[layerIndex] ?? null,
        thinness,
        drums: drumOptions.drums[drumsIndex] ?? null,
        tops: topsOn ? drumOptions.tops : null,
        bass: bassOptions[bassIndex] ?? null,
        canLayer: layerChoices.length > 0,
        size: clamp(span / 0.60 + (a.gap + b.gap) * 0.5, 0.08, 1),
        visibility: 1
      };
      return active;
    }

    update.isArmed = () => state === "armed";
    return update;
  }

  const bayer4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const glyphs = " .:-=+*#%@";
  const teletext = [[0,0,0],[227,21,44],[35,222,69],[240,216,38],[33,81,227],[224,42,209],[45,226,221],[239,239,229]];

  function applyPortalEffect(image, width, height, style, palette) {
    const data = image.data;
    const input = data.slice();
    const luma = new Uint8Array(width * height);
    for (let i = 0; i < luma.length; i++) {
      const index = i * 4;
      luma[i] = (54 * input[index] + 183 * input[index + 1] + 19 * input[index + 2]) >> 8;
    }
    const at = (x, y) => clamp(y, 0, height - 1) * width + clamp(x, 0, width - 1);
    const tile = (x, y, cell) => at(x - x % cell + (cell >> 1), y - y % cell + (cell >> 1));
    if (style.effect === "ascii") return luma;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const p = index * 4;
        const light = luma[index];
        let color;
        switch (style.effect) {
          case "checker": {
            const row = Math.floor(y / 8), column = Math.floor(x / 8);
            color = palette[(row + column) % 2 ? light : 255 - light];
            break;
          }
          case "glitch": {
            const shift = Math.floor(y / 5) % 4 === 1 ? 14 : -4;
            color = [input[at(x + shift, y) * 4], input[p + 1], input[at(x - shift, y) * 4 + 2]];
            break;
          }
          case "venetian": {
            const reflected = luma[at(x, y - y % 9 + 8 - y % 9)];
            color = palette[y % 9 === 0 ? 16 : reflected];
            break;
          }
          case "ribbon": {
            const offset = Math.round(Math.sin(y / 12) * 11);
            color = palette[luma[at(x + offset, y)]];
            break;
          }
          case "fold":
            color = palette[luma[at(Math.floor(width / 2) + Math.abs(x - Math.floor(width / 2)), y)]];
            break;
          case "blueprint": {
            const edge = Math.abs(light - luma[at(x + 2, y)]) + Math.abs(light - luma[at(x, y + 2)]);
            color = palette[clamp(edge * 5 + (x % 14 === 0 || y % 14 === 0 ? 58 : 7), 0, 255)];
            break;
          }
          case "stipple": {
            const grain = ((Math.imul(x + 1, 73856093) ^ Math.imul(y + 1, 19349663)) >>> 16) & 255;
            color = palette[light > grain ? 255 : 0];
            break;
          }
          case "chrome": {
            const band = Math.round((.5 + .5 * Math.sin(light / 26 + y / 7)) * 255);
            color = palette[band];
            break;
          }
          case "threshold":
            color = palette[light > 118 ? 255 : 0];
            break;
          case "rgb": {
            const left = at(x - 4, y) * 4;
            const right = at(x + 4, y) * 4;
            color = [input[left], input[p + 1] * .83, input[right + 2]];
            break;
          }
          case "etch": {
            const edge = Math.abs(light - luma[at(x + 1, y)]) + Math.abs(light - luma[at(x, y + 1)]);
            const hatch = light < 105 && (x + y) % 5 === 0 ? 72 : 0;
            color = palette[clamp(239 - edge * 4 - hatch, 0, 255)];
            break;
          }
          case "halftone": {
            const sampled = luma[tile(x, y, 7)];
            const radius = Math.sqrt(1 - sampled / 255) * 4.6;
            color = palette[Math.hypot(x % 7 - 3, y % 7 - 3) < radius ? 0 : 255];
            break;
          }
          case "dither": {
            const threshold = bayer4[(y & 3) * 4 + (x & 3)] * 16 + 8;
            color = palette[light > threshold ? 255 : 0];
            break;
          }
          case "nokia": {
            const sampled = luma[tile(x, y, 4)];
            const level = (x % 4 === 3 || y % 4 === 3) ? 180 : Math.round(sampled / 85) * 85;
            color = [Math.round(17 + level * .43), Math.round(47 + level * .51), Math.round(19 + level * .26)];
            break;
          }
          case "teletext": {
            const cell = at(x - x % 8 + 3, y - y % 5 + 2);
            const i = cell * 4;
            const code = (input[i] > 106 ? 1 : 0) | (input[i + 1] > 106 ? 2 : 0) | (input[i + 2] > 106 ? 4 : 0);
            color = y % 5 === 4 ? [4, 4, 9] : teletext[code];
            break;
          }
          case "mosaic": {
            const i = tile(x, y, 12) * 4;
            color = x % 12 === 0 || y % 12 === 0 ? [13, 12, 15] : [input[i], input[i + 1], input[i + 2]];
            break;
          }
          case "emboss": {
            const difference = light - luma[at(x - 2, y - 2)];
            color = palette[clamp(135 + difference * 2.5, 0, 255) | 0];
            break;
          }
          case "risograph": {
            const red = luma[at(x - 2, y + 1)];
            const blue = luma[at(x + 2, y - 1)];
            const warm = red > bayer4[(y & 3) * 4 + (x & 3)] * 16 + 4;
            const cool = blue > bayer4[(x & 3) * 4 + ((y + 2) & 3)] * 16 + 4;
            color = [warm ? 238 : 118, warm && cool ? 221 : 82, cool ? 218 : 105];
            break;
          }
          case "thermal":
            color = palette[Math.round(Math.sqrt(light / 255) * 255)];
            break;
          case "scanline": {
            const brightness = y % 3 === 0 ? light * .40 : light + (x % 3) * 5;
            color = palette[clamp(brightness, 0, 255) | 0];
            break;
          }
          default:
            color = palette[light];
        }
        data[p] = color[0];
        data[p + 1] = color[1];
        data[p + 2] = color[2];
      }
    }
    return null;
  }

  function drawAscii(context, luma, width, height) {
    context.fillStyle = "#070609";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ddd1ff";
    context.font = "8px monospace";
    context.textBaseline = "top";
    for (let y = 0; y < height; y += 8) {
      for (let x = 0; x < width; x += 5) {
        const light = luma[Math.min(y + 4, height - 1) * width + Math.min(x + 2, width - 1)];
        const glyph = glyphs[Math.round(light * (glyphs.length - 1) / 255)];
        if (glyph !== " ") context.fillText(glyph, x, y);
      }
    }
  }

  function createPalette(style) {
    return Array.from({ length: 256 }, (_, i) => {
      const luminance = i / 255;
      const brightness = style.solar ? 1 - Math.abs(luminance * 2 - 1) : style.negative ? 1 - luminance : luminance;
      const contrasted = clamp((brightness - 0.5) * (style.contrast ?? 1) + 0.5, 0, 1);
      const level = style.levels ? Math.round(contrasted * style.levels) / style.levels : contrasted;
      const start = style.mid && level > 0.5 ? style.mid : style.low;
      const end = style.mid && level <= 0.5 ? style.mid : style.high;
      const amount = style.mid ? (level > 0.5 ? level * 2 - 1 : level * 2) : level;
      return start.map((value, channel) => Math.round(mix(value, end[channel], amount)));
    });
  }

  function createRenderer(canvas) {
    const pen = canvas.getContext("2d");
    const buffer = document.createElement("canvas");
    const view = buffer.getContext("2d", { willReadFrequently: true });
    const palettes = new Map(styles.map(style => [style, createPalette(style)]));

    return (portal, video) => {
      const { width, height } = canvas;
      pen.clearRect(0, 0, width, height);
      if (!portal) return;
      const scale = 220 / Math.max(width, height);
      const w = Math.max(1, Math.round(width * scale));
      const h = Math.max(1, Math.round(height * scale));
      if (buffer.width !== w || buffer.height !== h) {
        buffer.width = w;
        buffer.height = h;
      }
      view.drawImage(video, 0, 0, w, h);
      const image = view.getImageData(0, 0, w, h);
      const ascii = applyPortalEffect(image, w, h, portal.style, palettes.get(portal.style));
      if (ascii) drawAscii(view, ascii, w, h);
      else view.putImageData(image, 0, 0);

      pen.save();
      pen.globalAlpha = portal.visibility;
      pen.beginPath();
      portal.points.forEach(({ x, y }, i) => {
        if (i === 0) pen.moveTo(x * width, y * height);
        else pen.lineTo(x * width, y * height);
      });
      pen.closePath();
      pen.clip();
      const zoom = 1 + portal.size * 0.20;
      pen.drawImage(buffer, portal.center.x * width * (1 - zoom), portal.center.y * height * (1 - zoom),
        width * zoom, height * zoom);
      pen.strokeStyle = portal.style.edge;
      pen.lineWidth = Math.min(2, devicePixelRatio) * (0.75 + portal.size);
      pen.stroke();
      pen.restore();
    };
  }

  async function readLocalSamples(file) {
    const text = (await file.text()).trim();
    const json = text.replace(/^(?:\/\/[^\n]*\n\s*)*window\.MotionVerreSamples\s*=\s*/, "").replace(/;\s*$/, "");
    const samples = JSON.parse(json);
    if (!samples || typeof samples !== "object" || Array.isArray(samples)) {
      throw new Error("The file must contain a Verre sound bundle.");
    }
    const entries = Object.entries(samples);
    if (entries.length === 0 || entries.some(([key, value]) =>
      !/^[a-z][a-z0-9_]*$/i.test(key) || typeof value !== "string" || value.length < 60 ||
      !/^RIFF....WAVE$/s.test(atob(value.slice(0, 16))))) {
      throw new Error("The bundle must contain named WAV samples.");
    }
    return samples;
  }

  function loadSamples(bank) {
    if (!samplePromises.has(bank)) {
      const terrace = bank === "terrace";
      const loading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = terrace ? "terrace-samples.js" : "verre-samples.js";
        script.onload = () => {
          const audio = terrace ? window.MotionTerraceSamples : window.MotionVerreSamples;
          if (audio) resolve(audio);
          else reject(new Error("The selected sound bank is unavailable."));
        };
        script.onerror = () => {
          script.remove();
          reject(new Error("The selected sound bank could not load."));
        };
        document.head.append(script);
      }).catch(error => {
        samplePromises.delete(bank);
        throw error;
      });
      samplePromises.set(bank, loading);
    }
    return samplePromises.get(bank);
  }

  function createGeneratedSounds(context) {
    const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    const intervals = [0, 3, 7, 10, 12];
    const cache = new Map();
    const rate = 22050;
    return (id, style, lane, beats) => {
      const cacheKey = id + "/" + lane + "/" + beats;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      const [key, bpm] = tonalSpecs[id] ?? tonalSpecs[style.sample + "Loop"];
      const beat = 60 / bpm;
      const buffer = context.createBuffer(1, Math.round(beats * beat * rate), rate);
      const samples = buffer.getChannelData(0);
      const root = notes.indexOf(key.slice(0, -1));
      const seed = Array.from(id).reduce((value, char) => (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0, 0);
      let noise = seed;
      const drum = lane === "drums";
      const tops = lane === "tops";
      const bass = lane === "bass";
      const division = tops ? 4 : lane === "lead" ? 1 : 2;
      const spacing = beat / division;
      for (let step = 0; step < beats * division; step++) {
        if (lane === "layer" && (step + seed) % 4 === 3) continue;
        const start = Math.round(step * spacing * rate);
        const degree = bass ? ((step + seed) % 4 === 3 ? 2 : 0) : (step * 3 + seed) % intervals.length;
        const midi = (bass ? 36 : lane === "lead" ? 60 : 72) + root + intervals[degree];
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        const kick = drum && (step % 8 === 0 || step % 8 === (4 + seed % 3));
        const snare = drum && step % 4 === 2;
        const duration = drum || tops ? (kick ? .27 : snare ? .15 : .065) : spacing * .92;
        const length = Math.min(samples.length - start, Math.ceil(duration * rate));
        for (let frame = 0; frame < length; frame++) {
          const t = frame / rate;
          const envelope = Math.min(1, frame / (rate * .012), (length - frame) / (rate * .018));
          let value;
          if (drum || tops) {
            noise = (Math.imul(noise, 1664525) + 1013904223) >>> 0;
            value = kick ? Math.sin(2 * Math.PI * (49 * t + 4 * (1 - Math.exp(-t * 28)))) * .66
              : (noise / 2147483648 - 1) * (snare ? .42 : .14);
            value *= Math.exp(-t * (kick ? 13 : snare ? 21 : 42));
          } else {
            const phase = t * frequency * Math.PI * 2;
            value = (Math.sin(phase) + Math.sin(phase * (bass ? 2 : 2 + seed % 3)) * .23) * (bass ? .39 : .24);
            if (lane === "layer") value *= Math.exp(-t * 7);
          }
          samples[start + frame] += value * envelope;
        }
      }
      cache.set(cacheKey, buffer);
      return buffer;
    };
  }

  function createVoice(context, destination) {
    const filter = context.createBiquadFilter();
    const stereo = context.createStereoPanner();
    filter.Q.value = 0.45;
    filter.connect(stereo).connect(destination);
    let buffers = {};
    const preparing = new Map();
    let manualLibrary = false;
    let active;
    const sequence = MotionSound.createSequence(context, destination);
    const generatedSound = createGeneratedSounds(context);

    function target(parameter, value, time, settle = 0.06) {
      parameter.cancelAndHoldAtTime(time);
      parameter.setTargetAtTime(value, time, settle);
    }

    function release(time) {
      sequence.stop();
      if (!active) return;
      const fading = active;
      active = null;
      target(fading.gain.gain, 0, time, 0.075);
      for (const lane of Object.values(fading.lanes)) retireLayer(lane.layer, time);
      for (const source of fading.sources) {
        source.addEventListener("ended", () => source.disconnect(), { once: true });
        source.stop(time + 0.4);
      }
      setTimeout(() => {
        fading.leadGain.disconnect();
        for (const lane of Object.values(fading.lanes)) lane.bus.disconnect();
        fading.gain.disconnect();
      }, 450);
    }

    function open(style) {
      const gain = context.createGain();
      gain.gain.value = 0;
      gain.connect(filter);
      const loopId = style.sample + "Loop";
      const loopBuffer = buffers?.[loopId] ?? generatedSound(loopId, style, "lead", style.beats);
      const hitBuffer = buffers?.[style.sample + "Hit"];
      const lead = context.createBufferSource();
      const time = context.currentTime;
      lead.buffer = loopBuffer;
      lead.loop = true;
      lead.playbackRate.value = 2 ** (style.transpose / 12);
      const leadGain = context.createGain();
      leadGain.connect(gain);
      lead.connect(leadGain);
      lead.start(time);
      const beatLength = loopBuffer.duration / lead.playbackRate.value / style.beats;
      sequence.start(time, beatLength, style);
      const sources = [lead];
      if (hitBuffer) {
        const hit = context.createBufferSource();
        const accent = context.createGain();
        hit.buffer = hitBuffer;
        hit.playbackRate.value = 2 ** (-3 / 12);
        accent.gain.value = 0.48;
        hit.connect(accent).connect(gain);
        hit.addEventListener("ended", () => {
          hit.disconnect();
          accent.disconnect();
        }, { once: true });
        hit.start(time);
        sources.push(hit);
      }
      const lanes = Object.fromEntries(["melodic", "drums", "tops", "bass"].map(name => {
        const bus = context.createGain();
        bus.gain.value = 0;
        bus.connect(gain);
        return [name, { name, bus, layer: null, layerSelection: null, pending: null }];
      }));
      return { style, gain, leadGain, sources, start: time, beatLength, lanes };
    }

    function updateLayer(lane, selection, time) {
      if (selection === lane.layerSelection) {
        lane.pending = null;
        return;
      }
      const buffer = selection && (buffers?.[selection.sample] ??
        generatedSound(selection.sample, active.style, lane.name === "melodic" ? "layer" : lane.name, 8));
      const barLength = active.beatLength * 4;
      if (!lane.pending || lane.pending.selection !== selection) {
        const nextBar = Math.ceil((time + 0.045 - active.start) / barLength);
        lane.pending = { selection, when: active.start + nextBar * barLength };
      }
      if (lane.pending.when < time) {
        lane.pending.when += Math.ceil((time - lane.pending.when) / barLength) * barLength;
      }
      const when = lane.pending.when;
      if (when > time + 0.10) return;

      retireLayer(lane.layer, when);
      lane.layer = null;
      lane.layerSelection = selection;
      lane.pending = null;
      if (!buffer) return;

      const source = context.createBufferSource();
      const gain = context.createGain();
      const beats = Math.round(buffer.duration * (active.style.bpm ?? 115) / 240) * 4;
      const rate = buffer.duration / (beats * active.beatLength);
      const offset = (((when - active.start) / active.beatLength) % beats) * buffer.duration / beats;
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = rate;
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(1, when + 0.055);
      source.connect(gain).connect(lane.bus);
      source.addEventListener("ended", () => {
        source.disconnect();
        gain.disconnect();
      }, { once: true });
      source.start(when, offset);
      lane.layer = { source, gain };
    }

    function retireLayer(layer, when) {
      if (!layer) return;
      target(layer.gain.gain, 0, when, 0.035);
      layer.source.stop(when + 0.15);
    }

    function voice(portal) {
      let time = context.currentTime;
      if (!portal) {
        release(time);
        return;
      }
      const { style, center, size } = portal;
      if (active?.style !== style) {
        release(time);
        active = open(style);
        time = context.currentTime;
      }
      const { melodic, drums, tops, bass } = active.lanes;
      updateLayer(melodic, portal.layer, time);
      updateLayer(drums, portal.drums, time);
      updateLayer(tops, portal.tops, time);
      updateLayer(bass, portal.bass, time);
      const blend = melodic.layer ? portal.thinness : 0;
      target(active.leadGain.gain, 1 - blend * 0.73, time);
      target(melodic.bus.gain, 0.17 + blend * 0.57, time);
      target(drums.bus.gain, 0.57, time);
      target(tops.bus.gain, 0.35, time);
      const stretch = clamp((portal.horizontalWidth - 0.12) / 0.58, 0, 1);
      target(bass.bus.gain, mix(0.24, 0.78, stretch), time, 0.08);
      target(filter.frequency, 320 + 5200 * (1 - center.y) ** 1.45 + 1700 * size, time);
      target(stereo.pan, clamp(center.x * 2 - 1, -1, 1), time);
      target(active.gain.gain, (0.10 + size * 0.36) * (portal.visibility ?? 1), time);
    }

    voice.follow = tracks => sequence.follow(tracks);

    async function decodeSamples(assets) {
      return Object.fromEntries(await Promise.all(Object.entries(assets).map(async ([key, encoded]) => {
        const binary = atob(encoded);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
        return [key, await context.decodeAudioData(bytes.buffer)];
      })));
    }

    voice.useSamples = async assets => {
      const decoded = await decodeSamples(assets);
      buffers = { ...buffers, ...decoded };
      manualLibrary = true;
    };

    voice.prepare = (bank = "verre") => {
      if (bank === "verre" && manualLibrary) return Promise.resolve();
      if (!preparing.has(bank)) {
        const task = loadSamples(bank).then(decodeSamples).then(decoded => {
          if (bank !== "verre" || !manualLibrary) buffers = { ...buffers, ...decoded };
        }).catch(error => {
          preparing.delete(bank);
          if (bank !== "verre" || !manualLibrary) throw error;
        });
        preparing.set(bank, task);
      }
      return preparing.get(bank);
    };

    return voice;
  }

  return { createGesture, createRenderer, createVoice, loadDetector, readLocalSamples };
})();
