# Motion Harmonizer

Motion Harmonizer turns video motion and two-hand gestures into sound. It runs in the browser with no build step.

## Run locally

Open this folder in VS Code and start Live Server from `index.html`. You can also serve the folder with Python 3.

```sh
python -m http.server 5500 --bind 127.0.0.1
```

Open [http://127.0.0.1:5500/](http://127.0.0.1:5500/). Allow camera access in your browser's permissions for the site. Use HTTPS to run camera mode from another device. Enabling the finger portal downloads a MediaPipe runtime and hand model. Camera frames and uploaded videos are processed on the device.

## Play

- **Video** — Open a recorded clip to track its motion, hear the synth, and download a stereo WAV.
- **Camera** — Enable the finger portal or switch on live blob tracking.
- **Portal** — Pinch both thumbs and index fingers, touch the pinches together, then spread them apart. Each opening advances to the next filter.
- **Audio layers** — Curl either middle finger to cycle the melody. Left ring cycles full drums, left pinky toggles tops, and right ring and pinky cycle bass forward and backward. Loop changes land on the next bar.

## Audio and GitHub

In camera mode, **Change frequencies** lets you choose Verre, Terrace House, or Deep House. When served beside the page, the sample bundles load automatically. Terrace House adds eight filters at 124 or 125 BPM. Deep House adds ten filters with Deep Tech-House loops at 124 BPM.

The repo plays built-in generated sounds on a clean checkout. On GitHub Pages or locally, select **Load local sounds** and choose your own `verre-samples.js` bundle. The page reads it on your device and uses the samples for the current browser session. An existing bundle beside `index.html` is still recognized on a local server.

Keep the local Verre bundle and raw audio files out of the repo and any published site files. The Git ignore rules cover the bundle and common audio formats. [Black Octopus Sound sample terms](https://blackoctopus-sound.com/support/)

Initialize Git from this folder, with `index.html` as the entry point. Before committing, use `git diff --cached --name-only` to review the staged files. The list should include the README, ignore rules, HTML, CSS, and JavaScript sources. Check that the local bundle appears under ignored files in `git status --ignored --short`.
