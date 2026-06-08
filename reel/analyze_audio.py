import numpy as np, soundfile as sf, json

WAV = "/root/.claude/uploads/b76df3bb-439f-50b8-91f0-5a2b69caed69/b04cb369-All_In_Toast_Wedding_Recap_Celebration_Mix.wav"
y, sr = sf.read(WAV)
if y.ndim > 1:
    y = y.mean(axis=1)
y = y.astype(np.float64)
dur = len(y) / sr

# ---- Spectral-flux onset envelope ----
n_fft, hop = 2048, 512
win = np.hanning(n_fft)
n_frames = 1 + (len(y) - n_fft) // hop
mag = np.empty((n_fft//2 + 1, n_frames))
for i in range(n_frames):
    seg = y[i*hop : i*hop + n_fft] * win
    mag[:, i] = np.abs(np.fft.rfft(seg))
logmag = np.log1p(10.0 * mag)
flux = np.maximum(0.0, np.diff(logmag, axis=1)).sum(axis=0)
flux = np.concatenate([[0.0], flux])
# smooth + normalize
k = np.hanning(7); k /= k.sum()
flux = np.convolve(flux, k, mode='same')
flux -= flux.min()
if flux.max() > 0: flux /= flux.max()
frame_rate = sr / hop  # frames per second

# ---- Tempo via autocorrelation of onset envelope ----
oss = flux - flux.mean()
ac = np.correlate(oss, oss, mode='full')[len(oss)-1:]
def lag_for_bpm(b): return int(round(60.0 / b * frame_rate))
bpm_lo, bpm_hi = 80, 160
lo, hi = lag_for_bpm(bpm_hi), lag_for_bpm(bpm_lo)
search = ac.copy()
search[:lo] = 0; search[hi+1:] = 0
best_lag = int(np.argmax(search))
bpm = 60.0 / (best_lag / frame_rate)
# fold into 90-150 comfortable range
while bpm < 96: bpm *= 2
while bpm > 152: bpm /= 2

# ---- Beat phase: best offset for a pulse grid at this bpm ----
period = 60.0 / bpm * frame_rate
n_beats = int((n_frames - 1) / period)
best_off, best_score = 0.0, -1
for off in np.linspace(0, period, 40, endpoint=False):
    idx = (off + np.arange(n_beats) * period).round().astype(int)
    idx = idx[idx < len(flux)]
    s = flux[idx].sum()
    if s > best_score:
        best_score, best_off = s, off
beat_frames = (best_off + np.arange(n_beats) * period)
beat_times = (beat_frames / frame_rate)
beat_times = beat_times[beat_times <= dur]

# ---- RMS energy envelope per 0.25s ----
win_s = 0.25
wlen = int(win_s * sr)
n_win = len(y) // wlen
rms = np.array([np.sqrt(np.mean(y[i*wlen:(i+1)*wlen]**2)) for i in range(n_win)])
rms_norm = rms / (rms.max() + 1e-9)
times_rms = np.arange(n_win) * win_s

# crude structure: find biggest sustained energy jump (a "drop")
sm = np.convolve(rms_norm, np.ones(4)/4, mode='same')
d = np.diff(sm)
drop_idx = int(np.argmax(d)) + 1
drop_time = drop_idx * win_s

out = {
    "duration": round(dur,3),
    "bpm": round(bpm,2),
    "beat_period_s": round(60.0/bpm,4),
    "n_beats": int(len(beat_times)),
    "first_beat_s": round(float(beat_times[0]),3) if len(beat_times) else 0,
    "beat_times": [round(float(t),3) for t in beat_times],
    "drop_time_s": round(drop_time,3),
    "energy_per_0.5s": [round(float(x),3) for x in rms_norm[::2]],
}
with open("/home/user/test/reel/audio_analysis.json","w") as f:
    json.dump(out, f, indent=1)

print(f"duration   : {dur:.2f}s")
print(f"tempo      : {bpm:.1f} BPM  (beat every {60.0/bpm:.3f}s)")
print(f"n beats    : {len(beat_times)}  first beat @ {beat_times[0]:.3f}s")
print(f"drop (energy jump) @ ~{drop_time:.2f}s")
print("energy profile (every 1.0s, 0..9):")
e1 = rms_norm[::4]; t1 = times_rms[::4]
line = "".join(str(min(9,int(v*9.5))) for v in e1)
print("  t: " + "".join(f"{int(t):<5}" for t in t1[::5]))
print("  E: " + line)
print("first 24 beat times:", [round(float(t),2) for t in beat_times[:24]])
