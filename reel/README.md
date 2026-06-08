# Jason & Sherry — Wedding Recap Reel (05.29.2026)

A 9:16 beat-synced cinematic wedding recap reel built from 5 stills + a
celebration-mix track, rendered entirely with `ffmpeg`.

**Deliverables (two cuts, same edit):**
- `Jason_and_Sherry_Wedding_Reel.mp4` — **9:16 vertical**, 1080 × 1920 (Reels/TikTok/Shorts)
- `Jason_and_Sherry_Wedding_Reel_4x3.mp4` — **4:3 horizontal**, 1440 × 1080

| Spec | Delivered |
|---|---|
| Aspect ratio | 9:16 (1080 × 1920) **and** 4:3 (1440 × 1080) |
| Duration | **57.5 s** (within the 45–59 s target) |
| Frame rate | 30 fps |
| Audio | beat-synced to the supplied mix (**119.7 BPM**, cuts on detected beats) |
| Codec | H.264 / AAC, `+faststart` |

## Narrative arc (5 segments)

1. **Getting Ready / Anticipation** — processional + bride's joy (soft, building)
2. **Ceremony** — altar moments, tightening cuts (emotional, reverent)
3. **First Kiss** — white flash in + slow-mo push (peak)
4. **Dancing** — fast 0.5 s cuts, shake/zoom energy
5. **Celebration** — toasts & cheers, euphoric finale → freeze-frame close

## Text overlays

`One Perfect Day` · `· THE WEDDING OF ·` · `Jason & Sherry` · `05.29.2026`
· `One Incredible Celebration` · `Forever Starts Here ♥`
(Playfair Display for titles, Montserrat for the date stamp.)

## Techniques

- **Beat-synced cuts** — every cut snaps to a detected beat (0.5 / 1.0 / 1.5 s),
  pacing builds from ~1.5 s holds to 0.5 s in the finale.
- **White flash transitions** at all 5 sequence changes.
- **Speed-ramp feel** — decelerating slow push on the kiss into accelerating
  fast zooms on the dance floor.
- **Cinematic push-in zooms + Ken Burns** with simulated handheld shake / drift,
  via `zoompan` on supersampled crops.
- **Blurred-background composites** keep wide group shots fully visible in 9:16.
- **Warm golden grade** — `colortemperature` + `eq` + filmic `curves` +
  `unsharp` + `vignette`.

## Rebuild

```bash
python3 analyze_audio.py            # -> audio_analysis.json (tempo + beat grid + energy)
python3 build_reel.py               # 9:16 vertical (default)
REEL_ASPECT=4:3 python3 build_reel.py   # 4:3 horizontal
# re-iterate only the grade/text/audio pass over an existing seg_all*.mp4:
REEL_ASPECT=4:3 python3 finalize.py
```

Geometry, color grade, and text typography live in `reel_lib.py` (aspect-aware),
shared by both `build_reel.py` and `finalize.py`.

`cutsheet.txt` lists every cut (section, photo, crop, motion, start, duration).

### Assets / notes

- `assets/photo01–05.jpg` — the 5 source stills.
- `fonts/` — Playfair Display & Montserrat (SIL OFL).
- The audio track (`b04cb369-All_In_Toast_Wedding_Recap_Celebration_Mix.wav`) is
  the user-supplied upload; `build_reel.py`/`finalize.py` reference its upload
  path. Place the WAV there (or edit the `WAV` constant) to rebuild.
- Source constraint: only 5 landscape photos were available (no dedicated
  getting-ready or confetti frames), so each photo is reused with distinct
  crops, motion, and treatments to drive the fast cut rhythm — a standard
  photo-reel technique.
