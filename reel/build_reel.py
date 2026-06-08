#!/usr/bin/env python3
"""Build a beat-synced wedding recap reel for Jason & Sherry (05.29.2026) from
5 stills + the supplied celebration-mix track. Aspect via REEL_ASPECT env
(9:16 default, or 4:3). Geometry/grade/text live in reel_lib.py."""
import json, os, subprocess
from concurrent.futures import ThreadPoolExecutor
import reel_lib as L

cfg   = L.config()
OUT, SS, RATIO = cfg['OUT'], cfg['SS'], cfg['ratio']
ROOT  = L.ROOT
A     = f"{ROOT}/assets"
SEG   = cfg['segdir']
FPS   = 30
os.makedirs(SEG, exist_ok=True)
print(f"ASPECT={cfg['aspect']}  OUT={OUT[0]}x{OUT[1]}")

beats = json.load(open(f"{ROOT}/audio_analysis.json"))["beat_times"]
def beat_at(t): return min(range(len(beats)), key=lambda i: abs(beats[i]-t))

# ---------- zoompan expression builders ----------
def zexpr(z0, z1, ease, N):
    nd = max(N-1, 1); p = f"(on/{nd})"
    e = {"out": f"(1-(1-{p})*(1-{p}))", "in": f"({p}*{p})"}.get(ease, p)
    return f"{z0:.4f}+({z1-z0:.4f})*{e}"
def xexpr(dx, sh, N):
    nd = max(N-1, 1); s = "iw/2-(iw/zoom)/2"
    if dx: s += f"+({dx:.1f})*((on/{nd})-0.5)"
    if sh: s += f"+({sh:.1f})*sin(on*0.80)"
    return f"clip({s},0,iw-iw/zoom)"
def yexpr(dy, sh, N):
    nd = max(N-1, 1); s = "ih/2-(ih/zoom)/2"
    if dy: s += f"+({dy:.1f})*((on/{nd})-0.5)"
    if sh: s += f"+({sh*0.8:.1f})*cos(on*0.93)"
    return f"clip({s},0,ih-ih/zoom)"

# motion presets: (z0,z1,ease,dx,dy,shake)
M = {
 "push_slow": (1.00,1.06,"out",0,0,0),  "push": (1.00,1.10,"lin",0,0,0),
 "push_fast": (1.03,1.20,"in",0,0,7),   "drift_up": (1.10,1.13,"lin",0,-120,0),
 "drift_l":   (1.10,1.12,"lin",-130,0,0),"drift_r": (1.10,1.12,"lin",130,0,0),
 "hot":       (1.05,1.17,"in",0,0,15),  "hot2": (1.06,1.18,"in",60,0,13),
 "kiss_slow": (1.00,1.055,"out",0,0,0), "freeze": (1.00,1.015,"out",0,0,0),
}

# shot = (photo, mode, cx, cy, hfrac, motion)
GR = [("photo03","blur",0,0,0,"push_slow"),
      ("photo02","fill",0.30,0.46,0.62,"push_slow"),
      ("photo03","fill",0.34,0.64,0.52,"drift_up"),
      ("photo02","fill",0.46,0.60,0.55,"push"),
      ("photo03","fill",0.26,0.44,0.50,"push_slow")]
CER= [("photo02","fill",0.46,0.42,0.58,"push"),
      ("photo02","blur",0,0,0,"drift_r"),
      ("photo02","fill",0.60,0.40,0.50,"push"),
      ("photo03","fill",0.42,0.50,0.70,"push"),
      ("photo02","fill",0.30,0.45,0.52,"drift_l"),
      ("photo02","fill",0.46,0.62,0.46,"push"),
      ("photo03","fill",0.85,0.45,0.55,"push")]
KISS=[("photo05","fill",0.50,0.40,0.52,"push_fast"),
      ("photo05","fill",0.50,0.42,0.60,"kiss_slow")]
DAN= [("photo05","fill",0.50,0.40,0.50,"hot"),
      ("photo05","fill",0.30,0.45,0.60,"hot2"),
      ("photo01","fill",0.50,0.40,0.60,"hot"),
      ("photo05","blur",0,0,0,"push_fast"),
      ("photo05","fill",0.50,0.43,0.58,"hot2"),
      ("photo01","fill",0.40,0.46,0.66,"hot2"),
      ("photo01","blur",0,0,0,"push_fast")]
CEL= [("photo01","fill",0.50,0.45,0.72,"push_fast"),
      ("photo04","fill",0.50,0.40,0.60,"push"),
      ("photo01","fill",0.40,0.45,0.60,"hot2"),
      ("photo04","fill",0.60,0.55,0.55,"hot"),
      ("photo01","fill",0.60,0.42,0.62,"hot2"),
      ("photo04","blur",0,0,0,"push_fast"),
      ("photo01","blur",0,0,0,"push_fast"),
      ("photo05","fill",0.50,0.42,0.55,"push")]
FRZ= [("photo02","fill",0.44,0.43,0.56,"freeze")]

# section = (tag, end_time, step_pattern_beats, flash_first, pool)
SECTIONS = [
 ("GR",    9.48, [3,3,3,3,2,2,2], False, GR),
 ("CER",  25.00, [2,2,2,2,1,1],   True,  CER),
 ("KISS", 27.10, [1,3],           True,  KISS),
 ("DAN",  42.00, [2,1,1],         True,  DAN),
 ("CEL",  53.40, [2,1,1,1],       True,  CEL),
 ("FRZ",  57.60, [999],           True,  FRZ),
]

# ---------- timeline (cuts snapped to detected beats) ----------
segments = []
cur_idx, cur_t = 0, 0.0
for tag, end_t, steps, flash_first, pool in SECTIONS:
    end_idx = beat_at(end_t); si = 0; first = True
    while cur_idx < end_idx:
        nxt = min(cur_idx + steps[si % len(steps)], end_idx)
        segments.append(dict(tag=tag, shot=pool[si % len(pool)],
                             start=cur_t, dur=beats[nxt]-cur_t,
                             flash=(first and flash_first)))
        cur_idx, cur_t = nxt, beats[nxt]; si += 1; first = False

# ---------- render one segment ----------
def render(i, s):
    photo, mode, cx, cy, hf, mname = s["shot"]
    N = max(2, round(s["dur"]*FPS))
    z0,z1,ease,dx,dy,sh = M[mname]
    zp = (f"zoompan=z='{zexpr(z0,z1,ease,N)}':x='{xexpr(dx,sh,N)}':y='{yexpr(dy,sh,N)}':"
          f"s={SS[0]}x{SS[1]}:d={N}:fps={FPS}")
    if mode == "fill":
        fc = f"[0:v]{L.crop_ar(cx,cy,hf,RATIO)},scale={SS[0]}:{SS[1]}:flags=lanczos,setsar=1,{zp}"
    else:
        fc = ("[0:v]split=2[bg][fg];"
              f"[bg]scale={SS[0]}:{SS[1]}:force_original_aspect_ratio=increase,"
              f"crop={SS[0]}:{SS[1]},boxblur=26:2,eq=brightness=-0.06:saturation=0.95[bgb];"
              f"[fg]scale={SS[0]}:-1:flags=lanczos[fgs];"
              f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1,{zp}")
    fc += f",scale={OUT[0]}:{OUT[1]}"
    if s["flash"]: fc += ",fade=t=in:st=0:d=0.12:color=white"
    fc += ",format=yuv420p[v]"
    out = f"{SEG}/seg_{i:03d}.mp4"
    cmd = ["ffmpeg","-y","-loop","1","-i",f"{A}/{photo}.jpg","-filter_complex",fc,
           "-map","[v]","-frames:v",str(N),"-r",str(FPS),"-an",
           "-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p",
           "-x264-params","keyint=15:min-keyint=15:scenecut=0",out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(f"SEG {i} ERR\n", r.stderr[-1200:])

print(f"{len(segments)} segments | total video {cur_t:.2f}s")
with ThreadPoolExecutor(max_workers=4) as ex:
    list(ex.map(lambda p: render(*p), list(enumerate(segments))))

# ---------- concat ----------
listfile = f"{SEG}/list.txt"
open(listfile,"w").write("".join(f"file 'seg_{i:03d}.mp4'\n" for i in range(len(segments))))
allmp4 = cfg['segall']
r = subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",listfile,"-c","copy",allmp4],
                   capture_output=True, text=True)
if r.returncode:
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",listfile,
                    "-c:v","libx264","-crf","18","-pix_fmt","yuv420p",allmp4],
                   capture_output=True, text=True)
T = float(subprocess.run(["ffprobe","-v","0","-show_entries","format=duration",
        "-of","default=noprint_wrappers=1:nokey=1",allmp4],capture_output=True,text=True).stdout.strip())
print(f"concat done, T={T:.2f}s")

# ---------- grade + text + audio ----------
vf = "[0:v]" + L.GRADE + "," + L.text_chain(cfg, T) + ",format=yuv420p[v]"
af = L.audio_chain(T)
cmd = ["ffmpeg","-y","-i",allmp4,"-i",L.WAV,"-filter_complex",vf+";"+af,
       "-map","[v]","-map","[a]","-t",f"{T:.3f}","-r",str(FPS),
       "-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p",
       "-c:a","aac","-b:a","256k","-movflags","+faststart",cfg['final']]
r = subprocess.run(cmd, capture_output=True, text=True)
print("FINAL OK -> "+cfg['final'] if r.returncode==0 else "FINAL ERR\n"+r.stderr[-2500:])

# ---------- cut sheet ----------
with open(cfg['cutsheet'],"w") as f:
    f.write(f"Jason & Sherry reel [{cfg['aspect']}] | {len(segments)} cuts | {T:.2f}s | {OUT[0]}x{OUT[1]} | {FPS}fps\n")
    for i,s in enumerate(segments):
        p,m,cx,cy,hf,mn = s["shot"]
        f.write(f"{i:02d} {s['tag']:4} {p} {m:4} mot={mn:9} "
                f"start={s['start']:6.2f} dur={s['dur']:4.2f}{'  *FLASH' if s['flash'] else ''}\n")
print(open(cfg['cutsheet']).read()[:400])
