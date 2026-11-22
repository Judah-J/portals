"use strict";

(() => {
  const byId = id => document.getElementById(id);
  const video = byId("video");
  const frame = byId("frame");
  const stage = document.querySelector(".stage");
  const studio = document.querySelector(".studio");
  const overlay = byId("overlay");
  const pen = overlay.getContext("2d");
  const portalCanvas = byId("portal");
  const portalStatus = byId("portal-status");
  const portalControls = byId("portal-controls");
  const gestureStatus = byId("portal-gesture-status");
  const controlRows = portalControls.querySelectorAll("[data-portal-control]");
  const renderPortal = FingerPortal.createRenderer(portalCanvas);
  const pinchHint = "Pinch your thumb and index finger on both hands. Bring the pinches together, then pull apart to open a portal.";
  let portalVoice;
  let handTimestamp = -1;
  const fileInput = byId("file");
  const play = byId("play");
  const timelineInput = byId("timeline");
  const original = byId("original");
  const volume = byId("volume");
  const exportButton = byId("export");
  const cancel = byId("cancel");
  const progress = byId("progress");
  const status = byId("status");
  const loadSounds = byId("load-sounds");
  const soundFile = byId("sound-file");
  const soundStatus = byId("sound-status");
  const { sampledFps, createTracker } = MotionTracking;
  const showTracks = byId("show-tracks");
  const liveBlobs = byId("live-blobs");
  const cameraButton = byId("camera");
  const switchCamera = byId("switch-camera");
  const transport = byId("transport");
  const enableSound = byId("enable-sound");
  const enablePortal = byId("enable-portal");
  const changeFrequencies = byId("change-frequencies");
  const deepHouse = byId("deep-house");
  const frequencyStatus = byId("frequency-status");
  let soundBank = "verre";
  const bankNames = { verre: "Verre", terrace: "Terrace House", deep: "Deep House" };
  let camera = null;
  let lastDrawn;

  let clip = null;
  let audioContext;
  let synth;
  let lastAudioIndex = -1;
  let animationFrame = 0;
  let playing = false;

  function mediaEvent(media, event, signal, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      signal.throwIfAborted();
      const listeners = new AbortController();
      const finish = error => {
        clearTimeout(timeout);
        listeners.abort();
        if (error) reject(error);
        else resolve();
      };
      const timeout = setTimeout(() => finish(new Error("The browser timed out while decoding this video.")), timeoutMs);
      const options = { signal: listeners.signal };
      media.addEventListener(event, () => finish(), options);
      media.addEventListener("error", () => finish(new Error("This video could not be decoded. Try an MP4 or WebM video.")), options);
      signal.addEventListener("abort", () => finish(signal.reason), options);
    });
  }

  function sampleForward(decoder, timeline, total, capture, signal) {
    if (!decoder.requestVideoFrameCallback || total <= 1) return Promise.resolve();
    return new Promise((resolve, reject) => {
      signal.throwIfAborted();
      const listeners = new AbortController();
      let callback = 0;
      let timer = 0;
      let finished = false;
      const finish = error => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        decoder.cancelVideoFrameCallback(callback);
        listeners.abort();
        decoder.pause();
        if (error) reject(error);
        else resolve();
      };
      const refreshTimeout = () => {
        clearTimeout(timer);
        timer = setTimeout(() => finish(), 3000);
      };
      const sample = (now, { mediaTime }) => {
        try {
          const index = Math.min(total - 1, Math.floor(mediaTime * sampledFps + 0.00001));
          if (index >= timeline.length) {
            while (index > timeline.length) timeline.push(timeline.at(-1));
            capture();
            refreshTimeout();
          }
          if (timeline.length === total) finish();
          else callback = decoder.requestVideoFrameCallback(sample);
        } catch (error) {
          finish(error);
        }
      };
      const options = { signal: listeners.signal };
      decoder.addEventListener("ended", () => finish(), options);
      decoder.addEventListener("error", () => finish(new Error("The video stopped decoding during analysis.")), options);
      signal.addEventListener("abort", () => finish(signal.reason), options);
      decoder.playbackRate = 3;
      refreshTimeout();
      callback = decoder.requestVideoFrameCallback(sample);
      decoder.play().catch(() => finish());
    });
  }

  function createFrameSampler(decoder) {
    const { videoWidth, videoHeight } = decoder;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 320 / Math.max(videoWidth, videoHeight));
    canvas.width = Math.max(1, Math.round(videoWidth * scale));
    canvas.height = Math.max(1, Math.round(videoHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const track = createTracker(canvas.width, canvas.height);
    return () => {
      context.drawImage(decoder, 0, 0, canvas.width, canvas.height);
      return track(context.getImageData(0, 0, canvas.width, canvas.height).data);
    };
  }

  async function analyze(decoder, signal) {
    const { duration, videoWidth, videoHeight } = decoder;
    if (!Number.isFinite(duration) || duration <= 0 || !videoWidth || !videoHeight) {
      throw new Error("Select a video file with a known duration.");
    }
    const sample = createFrameSampler(decoder);
    const timeline = [];
    const total = Math.ceil(duration * sampledFps);
    let lastProgress = 0;
    const capture = () => {
      timeline.push(sample());
      if (performance.now() - lastProgress > 100) {
        lastProgress = performance.now();
        progress.value = timeline.length / total;
      }
    };
    capture();
    await sampleForward(decoder, timeline, total, capture, signal);
    while (timeline.length < total) {
      await seek(decoder, timeline.length / sampledFps, signal);
      capture();
    }
    return timeline;
  }

  async function seek(decoder, position, signal) {
    signal.throwIfAborted();
    if (!decoder.seeking && Math.abs(decoder.currentTime - position) <= 0.00001) return;
    const sought = mediaEvent(decoder, "seeked", signal);
    decoder.currentTime = position;
    await sought;
  }

  function sizeOverlay() {
    if (!video.videoWidth || !video.videoHeight) return;
    const ratio = Math.min(stage.clientWidth / video.videoWidth, stage.clientHeight / video.videoHeight);
    const width = Math.max(1, Math.floor(video.videoWidth * ratio));
    const height = Math.max(1, Math.floor(video.videoHeight * ratio));
    const density = Math.min(2, devicePixelRatio);
    frame.style.width = width + "px";
    frame.style.height = height + "px";
    overlay.width = Math.round(width * density);
    overlay.height = Math.round(height * density);
    portalCanvas.width = overlay.width;
    portalCanvas.height = overlay.height;
    lastDrawn = undefined;
    sync();
  }

  function draw(tracks) {
    const visibleSample = showTracks.checked ? tracks : null;
    if (lastDrawn === visibleSample) return;
    lastDrawn = visibleSample;
    const { width, height } = overlay;
    pen.clearRect(0, 0, width, height);
    if (!visibleSample) return;

    const density = Math.min(2, devicePixelRatio);
    const points = visibleSample.filter(Boolean).map(track => ({
      x: track.x * width,
      y: track.y * height,
      label: "0x" + track.id.toString(16).toUpperCase().padStart(4, "0")
    }));
    pen.lineWidth = density;
    pen.strokeStyle = "rgba(255, 255, 255, .26)";
    pen.beginPath();
    points.forEach((point, index) => {
      let closest;
      let distance = Infinity;
      for (const other of points.slice(0, index)) {
        const gap = Math.hypot(point.x - other.x, point.y - other.y);
        if (gap < distance) {
          distance = gap;
          closest = other;
        }
      }
      if (closest) {
        pen.moveTo(point.x, point.y);
        pen.lineTo(closest.x, closest.y);
      }
    });
    pen.stroke();

    const half = 4 * density;
    const labelHeight = 13 * density;
    const inset = 2 * density;
    const placed = [];
    pen.font = 9 * density + "px monospace";
    pen.textBaseline = "middle";
    for (const { x, y, label } of points) {
      pen.strokeStyle = "#111";
      pen.lineWidth = 3 * density;
      pen.strokeRect(x - half, y - half, half * 2, half * 2);
      pen.strokeStyle = "#fff";
      pen.lineWidth = density;
      pen.strokeRect(x - half, y - half, half * 2, half * 2);

      const labelWidth = pen.measureText(label).width + inset * 2;
      const right = x + half + inset;
      const left = x - half - inset - labelWidth;
      const above = y - half - labelHeight - inset;
      const below = y + half + inset;
      const offsets = [[right, above], [left, above], [right, below], [left, below],
        [right, above - labelHeight], [left, above - labelHeight],
        [right, below + labelHeight], [left, below + labelHeight]];
      const boxes = offsets.map(([rawX, rawY]) => ({
        x: Math.max(0, Math.min(width - labelWidth, rawX)),
        y: Math.max(0, Math.min(height - labelHeight, rawY)),
        width: labelWidth
      }));
      const box = boxes.find(candidate => placed.every(other =>
        candidate.x + candidate.width <= other.x || other.x + other.width <= candidate.x ||
        Math.abs(candidate.y - other.y) >= labelHeight
      )) || boxes[0];
      placed.push(box);
      pen.fillStyle = "rgba(12, 12, 12, .82)";
      pen.fillRect(box.x, box.y, box.width, labelHeight);
      pen.fillStyle = "#fff";
      pen.fillText(label, box.x + inset, box.y + labelHeight / 2);
    }
  }

  function formatTime(seconds) {
    const whole = Math.floor(seconds || 0);
    return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
  }

  function sync() {
    if (camera) {
      draw(camera.tracks);
      return;
    }
    if (!clip?.timeline) return;
    const time = video.currentTime;
    const index = Math.min(clip.timeline.length - 1, Math.floor(time * sampledFps + 0.00001));
    const tracks = clip.timeline[index];
    timelineInput.value = time;
    byId("time").value = formatTime(time) + " / " + formatTime(video.duration);
    draw(tracks);
    if (synth && playing && !video.paused && !video.seeking && index !== lastAudioIndex) {
      synth.apply(tracks, audioContext.currentTime, true);
      lastAudioIndex = index;
    }
  }

  function tick() {
    sync();
    animationFrame = playing ? requestAnimationFrame(tick) : 0;
  }

  function silence() {
    playing = false;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastAudioIndex = -1;
    if (synth) synth.apply(null, audioContext.currentTime, true);
    portalVoice?.(null);
  }

  function reset(message) {
    if (camera) {
      const job = camera;
      camera = null;
      job.cancelFrame?.();
      job.controller.abort();
      job.stream?.getTracks().forEach(track => track.stop());
      video.pause();
      video.srcObject = null;
      silence();
    }
    renderPortal(null);
    portalStatus.hidden = true;
    portalControls.hidden = true;
    gestureStatus.textContent = "";
    liveBlobs.checked = false;
    liveBlobs.closest("label").hidden = true;
    showTracks.closest("label").hidden = false;
    enablePortal.hidden = true;
    changeFrequencies.hidden = true;
    changeFrequencies.disabled = false;
    deepHouse.hidden = true;
    deepHouse.disabled = false;
    frequencyStatus.hidden = true;
    enablePortal.disabled = false;
    enablePortal.textContent = "Enable portal";
    switchCamera.hidden = true;
    cameraButton.textContent = "Open camera";
    transport.hidden = false;
    exportButton.hidden = false;
    original.closest("label").hidden = false;
    enableSound.hidden = true;
    if (clip) {
      clip.controller.abort();
      video.pause();
      silence();
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(clip.url);
      clip = null;
    }
    frame.hidden = true;
    byId("placeholder").hidden = false;
    play.disabled = timelineInput.disabled = original.disabled = exportButton.disabled = true;
    play.textContent = "Play";
    original.checked = false;
    video.muted = true;
    video.playbackRate = 1;
    timelineInput.value = 0;
    byId("time").value = "0:00 / 0:00";
    cancel.hidden = progress.hidden = true;
    draw(null);
    status.textContent = message;
  }

  function initializeAudio() {
    if (!audioContext) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      audioContext = new Audio();
      synth = MotionSound.createSynth(audioContext);
    }
  }

  function startAudio() {
    initializeAudio();
    synth.setVolume(Number(volume.value), audioContext.currentTime);
    if (camera && !portalVoice) {
      portalVoice = FingerPortal.createVoice(audioContext, synth.input);
      if (camera.detector) void portalVoice.prepare(soundBank).catch(() => {});
    }
    return audioContext.resume();
  }

  function cameraError(error) {
    switch (error.name) {
      case "NotAllowedError": return "Camera access was denied. Allow Camera for this site in your browser, check the camera privacy settings on your device if needed, then reload.";
      case "NotFoundError": return "No camera was found on this device.";
      case "NotReadableError": return "The camera is busy or unavailable. Try closing other apps that use it.";
      default: return "The camera could not start. Try opening it again.";
    }
  }

  function updatePortalControls(job, portal, now) {
    const selections = {
      melodic: portal?.layer?.name,
      "left-ring": portal?.drums?.name,
      "left-pinky": portal?.tops?.name,
      "right-ring": portal?.bass?.name
    };
    const accepted = portal?.activation ?? [];
    if (accepted.length) {
      const labels = accepted.map(({ side, finger }) => {
        const hand = side ? side.charAt(0).toUpperCase() + side.slice(1) : "Detected";
        return hand + " " + finger;
      });
      gestureStatus.textContent = "Last gesture · " + labels.join(" + ");
      job.highlightedControls = accepted.map(action => action.control);
      job.highlightUntil = now + 1400;
    }
    const highlighted = now < job.highlightUntil ? job.highlightedControls ?? [] : [];
    for (const row of controlRows) {
      const { portalControl } = row.dataset;
      const value = row.querySelector("[data-portal-value]");
      const label = portal ? " · " + (selections[portalControl] ?? "Off") : "";
      if (value && value.textContent !== label) value.textContent = label;
      const active = highlighted.includes(portalControl) ||
        portalControl === "pinch" && job.gesture.isArmed();
      row.toggleAttribute("data-activated", active);
    }
  }

  function updatePortal(job, now) {
    if (!job.detector) return;
    try {
      handTimestamp = Math.max(handTimestamp + 1, Math.floor(performance.now()));
      const result = job.detector.detectForVideo(video, handTimestamp);
      const portal = job.gesture(result.landmarks, video.videoWidth / video.videoHeight, now, result.handedness ?? result.handednesses);
      renderPortal(portal, video);
      if (portal && !job.portalActive) synth?.apply(null, audioContext.currentTime, true);
      job.portalActive = Boolean(portal);
      portalVoice?.(portal);
      updatePortalControls(job, portal, now);
      const message = portal ? portal.style.name + " · " + portal.style.effectName :
        job.gesture.isArmed() ? "Pinch detected · Pull your fingertips apart." : pinchHint;
      if (message !== job.portalTitle) {
        job.portalTitle = message;
        portalStatus.textContent = message;
      }
    } catch {
      job.detector = null;
      portalControls.hidden = true;
      job.portalActive = false;
      renderPortal(null);
      portalVoice?.(null);
      enablePortal.hidden = false;
      portalStatus.textContent = "Hand tracking stopped. The camera is still active.";
      enablePortal.textContent = "Retry finger portal";
    }
  }

  function watchCamera(job) {
    let nextSample = 0;
    let nextPortalSample = 0;
    let lastPortalFrame = -1;
    let sampleWidth = 0;
    let sampleHeight = 0;
    let capture;
    const frameCallback = typeof video.requestVideoFrameCallback === "function";
    function tick(now) {
      if (camera !== job) return;
      try {
        if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            video.videoWidth && video.videoHeight) {
          if (sampleWidth !== video.videoWidth || sampleHeight !== video.videoHeight) {
            sampleWidth = video.videoWidth;
            sampleHeight = video.videoHeight;
            capture = null;
            sizeOverlay();
          }
          if (!liveBlobs.checked) capture = null;
          if (liveBlobs.checked && now >= nextSample) {
            capture ??= createFrameSampler(video);
            nextSample = now + 1000 / sampledFps - 2;
            job.tracks = capture();
            draw(job.tracks);
            if (!job.portalActive) synth?.apply(job.tracks, audioContext.currentTime, true);
          }
          if (job.detector && now >= nextPortalSample && video.currentTime !== lastPortalFrame) {
            lastPortalFrame = video.currentTime;
            const started = performance.now();
            updatePortal(job, now);
            nextPortalSample = started + Math.max(29, (performance.now() - started) * 1.5);
          }
          if (job.portalActive && liveBlobs.checked) portalVoice?.follow(job.tracks);
        }
        const handle = frameCallback ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
        job.cancelFrame = frameCallback
          ? () => video.cancelVideoFrameCallback(handle)
          : () => cancelAnimationFrame(handle);
      } catch {
        if (camera === job) reset("Live tracking stopped. Open the camera to try again.");
      }
    }
    tick(performance.now());
  }

  function isMobileCamera() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  const savedCameraKey = "motion-harmonizer.laptop-camera";
  const excludedCamera = /virtual|\bIR\b|infrared|S24|phone/i;

  function rememberedCamera(id) {
    try {
      if (id === undefined) return localStorage.getItem(savedCameraKey);
      if (id) localStorage.setItem(savedCameraKey, id);
      else localStorage.removeItem(savedCameraKey);
    } catch {
      return null;
    }
  }

  async function cameraConstraints(facing = "user") {
    const size = { width: { ideal: 640 }, height: { ideal: 480 } };
    if (isMobileCamera()) return { ...size, facingMode: { exact: facing } };
    const devices = await navigator.mediaDevices.enumerateDevices();
    const webcams = devices.filter(({ kind, label, deviceId }) => kind === "videoinput" && deviceId && deviceId !== "default" && label &&
      !excludedCamera.test(label));
    const builtIn = webcams.find(({ label }) => /HP 5MP Camera/i.test(label)) ||
      webcams.find(({ label }) => /built.in|integrated|internal/i.test(label));
    if (builtIn) return { ...size, deviceId: { exact: builtIn.deviceId } };
    if (webcams.length === 1) return { ...size, deviceId: { exact: webcams[0].deviceId } };
    const previous = rememberedCamera();
    const blocked = devices.some(device => device.deviceId === previous && excludedCamera.test(device.label));
    return previous && !blocked ? { ...size, deviceId: { exact: previous } } : null;
  }

  function facingLabel(facing) {
    return facing === "environment" ? "rear" : "front";
  }

  async function openCamera({ facing = "user", restore = null, previousFacing = null } = {}) {
    if (!window.isSecureContext) {
      status.textContent = "Camera access requires a secure page. Use HTTPS, or open the app at localhost or 127.0.0.1 on this device.";
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = "Camera access is unavailable here. Open this page directly in a browser that supports webcam access.";
      return;
    }
    const mobile = isMobileCamera();
    reset(previousFacing ? "Switching to " + facingLabel(facing) + " camera…" : "Finding your camera…");
    const job = { facing, stream: null, tracks: null, cancelFrame: null, controller: new AbortController() };
    camera = job;
    cameraButton.textContent = "Cancel camera";
    let audioReady;
    try {
      audioReady = startAudio().then(() => true, () => false);
    } catch {
      audioReady = Promise.resolve(false);
    }
    const permissionTimer = setTimeout(() => {
      if (camera === job) reset("No response from the camera. Check the browser’s camera permission and try again.");
    }, 25000);
    try {
      const constraints = await cameraConstraints(facing);
      if (camera !== job) return;
      if (!constraints) {
        reset("The app could not identify your laptop webcam. Allow Camera in the browser permissions for this site, then reload. If access is already allowed, check that the webcam is connected.");
        return;
      }
      status.textContent = "Waiting for camera permission…";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: constraints });
      clearTimeout(permissionTimer);
      if (camera !== job || document.hidden) {
        stream.getTracks().forEach(track => track.stop());
        if (camera === job) reset("Camera stopped. Open it again when you’re ready.");
        return;
      }
      job.stream = stream;
      const selectedTrack = stream.getVideoTracks()[0];
      if (!isMobileCamera() && (!selectedTrack?.label || excludedCamera.test(selectedTrack.label))) {
        rememberedCamera(null);
        reset("The selected source could not be verified as a laptop webcam. Check the site’s camera settings and try again.");
        return;
      }
      for (const track of stream.getVideoTracks()) {
        track.addEventListener("ended", () => {
          if (camera === job) reset("The camera disconnected. Open it again to resume.");
        }, { once: true });
      }
      status.textContent = "Starting camera preview…";
      video.srcObject = stream;
      cameraButton.textContent = "Stop camera";
      transport.hidden = true;
      exportButton.hidden = true;
      original.closest("label").hidden = true;
      frame.hidden = false;
      byId("placeholder").hidden = true;
      const playingEvent = mediaEvent(video, "playing", job.controller.signal, 8000);
      await Promise.all([video.play(), playingEvent]);
      if (camera !== job) return;
      const source = selectedTrack?.label;
      if (!isMobileCamera() && constraints.deviceId?.exact) rememberedCamera(constraints.deviceId.exact);
      const cameraName = mobile ? facingLabel(facing) + " camera" : source;
      const liveMessage = cameraName ? "Camera live · " + cameraName : "Camera live";
      status.textContent = restore?.notice ? restore.notice + " " + liveMessage : liveMessage;
      if (mobile) {
        switchCamera.textContent = "Switch to " + facingLabel(facing === "user" ? "environment" : "user") + " camera";
        switchCamera.hidden = false;
      }
      enableSound.hidden = audioContext?.state === "running";
      void audioReady.then(ready => {
        if (camera === job) enableSound.hidden = ready && audioContext.state === "running";
      });
      enablePortal.hidden = false;
      changeFrequencies.hidden = false;
      deepHouse.hidden = false;
      deepHouse.setAttribute("aria-pressed", String(soundBank === "deep"));
      frequencyStatus.textContent = "Sound bank: " + bankNames[soundBank];
      frequencyStatus.hidden = false;
      liveBlobs.closest("label").hidden = false;
      liveBlobs.checked = Boolean(restore?.blobs);
      showTracks.closest("label").hidden = !liveBlobs.checked;
      watchCamera(job);
      if (restore?.portal) void togglePortal();
    } catch (error) {
      if (camera !== job) return;
      if (mobile && previousFacing) {
        return openCamera({ facing: previousFacing, restore: { ...restore, notice: "Could not open the " + facingLabel(facing) + " camera." } });
      }
      if (error.name === "OverconstrainedError") {
        rememberedCamera(null);
        reset(isMobileCamera()
          ? "The " + facingLabel(facing) + " camera is unavailable. Check this site has camera permission and try again."
          : "The saved webcam is unavailable. Check that the webcam is connected and that this site has camera permission, then try again.");
      } else {
        reset(job.stream ? "The camera connected, but no preview started. Close other apps using the camera and try again." : cameraError(error));
      }
    } finally {
      clearTimeout(permissionTimer);
    }
  }


  async function openVideo(file) {
    reset("Opening " + file.name + "…");
    const job = { file, url: URL.createObjectURL(file), controller: new AbortController(), timeline: null };
    clip = job;
    const { signal } = job.controller;
    progress.value = 0;
    cancel.hidden = progress.hidden = false;
    try {
      const loaded = mediaEvent(video, "loadeddata", signal);
      video.src = job.url;
      video.preload = "auto";
      video.load();
      await loaded;
      signal.throwIfAborted();
      sizeOverlay();
      frame.hidden = false;
      byId("placeholder").hidden = true;
      status.textContent = "Tracking movement in " + file.name + "…";
      const timeline = await analyze(video, signal);
      signal.throwIfAborted();
      video.playbackRate = 1;
      await seek(video, 0, signal);
      job.timeline = timeline;
      job.readyMessage = timeline.some(tracks => tracks.some(Boolean))
        ? "Ready to play · " + file.name
        : "No qualifying motion detected. The generated soundtrack is silent.";
      timelineInput.max = video.duration;
      play.disabled = timelineInput.disabled = original.disabled = exportButton.disabled = false;
      cancel.hidden = progress.hidden = true;
      status.textContent = job.readyMessage;
      sync();
    } catch (error) {
      if (clip === job) reset(error.message || "The video could not be analyzed.");
    }
  }

  loadSounds.addEventListener("click", () => soundFile.click());
  soundFile.addEventListener("change", async () => {
    const [file] = soundFile.files;
    soundFile.value = "";
    if (!file) return;
    loadSounds.disabled = true;
    soundStatus.textContent = "Loading local sounds…";
    try {
      const samples = await FingerPortal.readLocalSamples(file);
      initializeAudio();
      portalVoice ??= FingerPortal.createVoice(audioContext, synth.input);
      await portalVoice.useSamples(samples);
      soundStatus.textContent = "Local sounds loaded for this session. Open a new portal to hear them.";
    } catch {
      soundStatus.textContent = "Could not load local sounds. Choose a valid verre-samples.js bundle.";
    } finally {
      loadSounds.disabled = false;
    }
  });
  cameraButton.addEventListener("click", () => {
    if (camera) reset("Camera stopped.");
    else void openCamera();
  });
  switchCamera.addEventListener("click", () => {
    const job = camera;
    if (!job?.stream || !isMobileCamera()) return;
    const facing = job.facing === "user" ? "environment" : "user";
    void openCamera({ facing, previousFacing: job.facing, restore: {
      blobs: liveBlobs.checked,
      portal: Boolean(job.detector || job.portalLoad)
    } });
  });
  changeFrequencies.addEventListener("click", () => void selectSoundBank(soundBank === "verre" ? "terrace" : "verre"));
  deepHouse.addEventListener("click", () => void selectSoundBank("deep"));

  async function selectSoundBank(next) {
    const job = camera;
    if (!job?.stream || changeFrequencies.disabled || next === soundBank) return;
    changeFrequencies.disabled = deepHouse.disabled = true;
    frequencyStatus.textContent = "Loading " + bankNames[next] + "…";
    try {
      initializeAudio();
      portalVoice ??= FingerPortal.createVoice(audioContext, synth.input);
      await portalVoice.prepare(next);
      if (camera !== job) return;
      soundBank = next;
      deepHouse.setAttribute("aria-pressed", String(soundBank === "deep"));
      renderPortal(null);
      portalVoice(null);
      job.portalActive = false;
      job.portalTitle = null;
      if (job.detector) job.gesture = FingerPortal.createGesture(soundBank);
      gestureStatus.textContent = "";
      job.highlightedControls = [];
      frequencyStatus.textContent = "Sound bank: " + bankNames[soundBank];
    } catch {
      if (camera === job) frequencyStatus.textContent = "Could not load " + bankNames[next] + ". Still using " + bankNames[soundBank] + ".";
    } finally {
      if (camera === job) changeFrequencies.disabled = deepHouse.disabled = false;
    }
  }
  enablePortal.addEventListener("click", togglePortal);

  async function togglePortal() {
    const job = camera;
    if (!job?.stream) return;
    if (job.detector || job.portalLoad) {
      job.portalLoad = null;
      job.detector = null;
      job.gesture = null;
      job.portalActive = false;
      job.portalTitle = null;
      renderPortal(null);
      portalVoice?.(null);
      portalStatus.hidden = true;
      portalControls.hidden = true;
      gestureStatus.textContent = "";
      enablePortal.textContent = "Enable portal";
      return;
    }
    const attempt = {};
    job.portalLoad = attempt;
    enablePortal.textContent = "Disable finger portal";
    portalStatus.hidden = false;
    portalStatus.textContent = "Loading hand tracking…";
    if (portalVoice) void portalVoice.prepare(soundBank).catch(() => {});
    try {
      const detector = await FingerPortal.loadDetector();
      if (camera !== job || job.portalLoad !== attempt) return;
      job.gesture = FingerPortal.createGesture(soundBank);
      job.detector = detector;
      job.highlightedControls = [];
      job.highlightUntil = 0;
      portalControls.hidden = false;
      updatePortalControls(job, null, performance.now());
      portalStatus.textContent = pinchHint;
    } catch {
      if (camera !== job || job.portalLoad !== attempt) return;
      enablePortal.textContent = "Retry finger portal";
      portalStatus.textContent = "Hand tracking could not load. The camera is still active.";
    } finally {
      if (camera === job && job.portalLoad === attempt) job.portalLoad = null;
    }
  }
  enableSound.addEventListener("click", async () => {
    const job = camera;
    try {
      await startAudio();
      if (camera === job) enableSound.hidden = true;
    } catch {
      if (camera === job) status.textContent = "Audio is unavailable. Live tracking is still running.";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && camera?.stream) reset("Camera stopped when you left the page.");
  });
  window.addEventListener("pagehide", () => {
    if (camera) reset("Camera stopped.");
  });
  byId("choose").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const [file] = fileInput.files;
    fileInput.value = "";
    if (file) openVideo(file);
  });
  const isFileDrag = event => event.dataTransfer.types.includes("Files");
  studio.addEventListener("dragover", event => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    studio.classList.add("drop-target");
    event.dataTransfer.dropEffect = "copy";
  });
  studio.addEventListener("dragleave", event => {
    if (!studio.contains(event.relatedTarget)) studio.classList.remove("drop-target");
  });
  studio.addEventListener("drop", event => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    studio.classList.remove("drop-target");
    const [file] = event.dataTransfer.files;
    if (file) openVideo(file);
  });
  cancel.addEventListener("click", () => reset("Analysis canceled. Open a video to start again."));
  new ResizeObserver(sizeOverlay).observe(stage);

  play.addEventListener("click", async () => {
    if (!video.paused) {
      video.pause();
      return;
    }
    const job = clip;
    try {
      if (video.ended) video.currentTime = 0;
      await Promise.all([startAudio(), video.play()]);
    } catch {
      if (clip === job) {
        video.pause();
        status.textContent = "Playback could not start. Press Play to try again.";
      }
    }
  });
  video.addEventListener("playing", () => {
    if (!clip?.timeline || video.paused) return;
    playing = true;
    play.textContent = "Pause";
    if (!animationFrame) tick();
  });
  for (const event of ["pause", "ended", "waiting", "seeking"]) {
    video.addEventListener(event, () => {
      silence();
      play.textContent = video.paused || video.ended ? "Play" : "Pause";
      sync();
    });
  }
  video.addEventListener("seeked", () => {
    if (clip?.timeline && !video.paused && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      playing = true;
      if (!animationFrame) tick();
    }
    sync();
  });
  video.addEventListener("timeupdate", sync);
  timelineInput.addEventListener("input", () => {
    video.currentTime = Number(timelineInput.value);
    sync();
  });
  original.addEventListener("change", () => { video.muted = !original.checked; });
  liveBlobs.addEventListener("change", () => {
    if (!camera?.stream) return;
    showTracks.closest("label").hidden = !liveBlobs.checked;
    if (!liveBlobs.checked) {
      camera.tracks = null;
      draw(null);
      synth?.apply(null, audioContext.currentTime, true);
    }
  });
  showTracks.addEventListener("change", sync);
  volume.addEventListener("input", () => {
    if (synth) synth.setVolume(Number(volume.value), audioContext.currentTime);
  });

  exportButton.addEventListener("click", async () => {
    const job = clip;
    exportButton.disabled = true;
    status.textContent = "Rendering WAV…";
    try {
      const wave = await MotionSound.exportWav(job.timeline, video.duration, Number(volume.value), job.controller.signal);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(wave);
      link.download = job.file.name.replace(/\.[^.]+$/, "") + "-harmonies.wav";
      document.body.append(link);
      link.click();
      link.remove();
      const downloadUrl = link.href;
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 30000);
      status.textContent = "WAV ready · " + link.download;
    } catch (error) {
      if (clip === job) status.textContent = error.message || "The WAV could not be rendered.";
    } finally {
      if (clip === job) exportButton.disabled = false;
    }
  });
})();
