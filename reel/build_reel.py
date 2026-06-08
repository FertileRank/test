#!/usr/bin/env python3
"""Build a 9:16 beat-synced wedding recap reel for Jason & Sherry (05.29.2026)
from 5 stills + the supplied celebration-mix track."""
import json, os, subprocess, math
from concurrent.futures import ThreadPoolExecutor

ROOT = "/home/user/test/reel"
A    = f"{ROOT}/assets"
SEG  = f"{ROOT}/segments"
WAV  = "/root/.claude/uploads/b76df3bb-439f-50b8-91f0-5a2b69caed69/b04cb369-All_In_Toast_Wedding_Recap_Celebration_Mix.wav"
PF   = f"{ROOT}/fonts/PlayfairDisplay.ttf"
MO   = f"{ROOT}/fonts/Montserrat.ttf"
DJ   = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FINAL= f"{ROOT}/Jason_and_Sherry_Wedding_Reel.mp4"
SS   = (1620, 2880)        # supersample canvas (9:16) fed to zoompan
FPS  = 30
os.makedirs(SEG, exist_ok=True)

beats = json.load(open(f"{ROOT}/audio_analysis.json"))["beat_times"]
def beat_at(t):
    return min(range(len(beats)), key=lambda i: abs(beats[i]-t))

# ---------- crop: 9:16 window from 1250x833 centered at (cx,cy), height frac ----------
def crop9(cx, cy, hf, W=1250, H=833):
    h9 = round(hf*H); w9 = round(h9*9/16)
    x0 = min(max(round(cx*W - w9/2), 0), W-w9)
    y0 = min(max(round(cy*H - h9/2), 0), H-h9)
    return f"crop={w9}:{h9}:{x0}:{y0}"

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
 "push_slow": (1.00,1.06,"out",0,0,0),
 "push":      (1.00,1.10,"lin",0,0,0),
 "push_fast": (1.03,1.20,"in",0,0,7),
 "drift_up":  (1.10,1.13,"lin",0,-120,0),
 "drift_l":   (1.10,1.12,"lin",-130,0,0),
 "drift_r":   (1.10,1.12,"lin",130,0,0),
 "hot":       (1.05,1.17,"in",0,0,15),
 "hot2":      (1.06,1.18,"in",60,0,13),
 "kiss_slow": (1.00,1.055,"out",0,0,0),
 "freeze":    (1.00,1.015,"out",0,0,0),
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
KISS=[("photo05","fill",0.50,0.40,0.52,"push_fast"),     # sharp impact on the flash
      ("photo05","fill",0.50,0.42,0.60,"kiss_slow")]     # slow-mo hold
DAN= [("photo05","fill",0.50,0.40,0.50,"hot"),    # the kiss, tight
      ("photo05","fill",0.30,0.45,0.60,"hot2"),   # saxophonist
      ("photo01","fill",0.50,0.40,0.60,"hot"),    # fun guest face
      ("photo05","blur",0,0,0,"push_fast"),       # whole dance floor
      ("photo05","fill",0.50,0.43,0.58,"hot2"),   # kiss, slightly wider
      ("photo01","fill",0.40,0.46,0.66,"hot2"),   # guest + beer
      ("photo01","blur",0,0,0,"push_fast")]       # party room
CEL= [("photo01","fill",0.50,0.45,0.72,"push_fast"), # cheers w/ both drinks
      ("photo04","fill",0.50,0.40,0.60,"push"),      # father toast, profile
      ("photo01","fill",0.40,0.45,0.60,"hot2"),      # guest + beer up
      ("photo04","fill",0.60,0.55,0.55,"hot"),       # toast, raised hand
      ("photo01","fill",0.60,0.42,0.62,"hot2"),      # guest + OJ up
      ("photo04","blur",0,0,0,"push_fast"),          # toast, wide room
      ("photo01","blur",0,0,0,"push_fast"),          # party, wide
      ("photo05","fill",0.50,0.42,0.55,"push")]      # kiss callback
FRZ= [("photo02","fill",0.44,0.43,0.56,"freeze")]

# section = (tag, end_time, step_pattern_beats, flash_first, pool)
SECTIONS = [
 ("GR",    9.48, [3,3,3,3,2,2,2],   False, GR),
 ("CER",  25.00, [2,2,2,2,1,1],     True,  CER),
 ("KISS", 27.10, [1,3],             True,  KISS),
 ("DAN",  42.00, [2,1,1],           True,  DAN),
 ("CEL",  53.40, [2,1,1,1],         True,  CEL),
 ("FRZ",  57.60, [999],             True,  FRZ),
]

# ---------- build the segment timeline (cuts snapped to detected beats) ----------
segments = []
cur_idx, cur_t = 0, 0.0
for tag, end_t, steps, flash_first, pool in SECTIONS:
    end_idx = beat_at(end_t); si = 0; first = True
    while cur_idx < end_idx:
        nxt = min(cur_idx + steps[si % len(steps)], end_idx)
        start_t, stop_t = cur_t, beats[nxt]
        segments.append(dict(tag=tag, shot=pool[si % len(pool)],
                             start=start_t, dur=stop_t-start_t,
                             flash=(first and flash_first)))
        cur_idx, cur_t = nxt, stop_t; si += 1; first = False
T = cur_t   # total video duration

# ---------- render one segment ----------
def render(i, s):
    photo, mode, cx, cy, hf, mname = s["shot"]
    N = max(2, round(s["dur"]*FPS))
    z0,z1,ease,dx,dy,sh = M[mname]
    z,x,y = zexpr(z0,z1,ease,N), xexpr(dx,sh,N), yexpr(dy,sh,N)
    zp = f"zoompan=z='{z}':x='{x}':y='{y}':s={SS[0]}x{SS[1]}:d={N}:fps={FPS}"
    if mode == "fill":
        chain = f"{crop9(cx,cy,hf)},scale={SS[0]}:{SS[1]}:flags=lanczos,setsar=1,{zp}"
        fc = f"[0:v]{chain}"
    else:  # blur composite
        fc = ("[0:v]split=2[bg][fg];"
              f"[bg]scale={SS[0]}:{SS[1]}:force_original_aspect_ratio=increase,"
              f"crop={SS[0]}:{SS[1]},boxblur=26:2,eq=brightness=-0.06:saturation=0.95[bgb];"
              f"[fg]scale={SS[0]}:-1:flags=lanczos[fgs];"
              f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1,{zp}")
    fc += ",scale=1080:1920"
    if s["flash"]:
        fc += ",fade=t=in:st=0:d=0.12:color=white"
    fc += ",format=yuv420p[v]"
    out = f"{SEG}/seg_{i:03d}.mp4"
    cmd = ["ffmpeg","-y","-loop","1","-i",f"{A}/{photo}.jpg","-filter_complex",fc,
           "-map","[v]","-frames:v",str(N),"-r",str(FPS),"-an",
           "-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p",
           "-x264-params","keyint=15:min-keyint=15:scenecut=0",out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(f"SEG {i} ERR\n", r.stderr[-1200:])
    return out

print(f"{len(segments)} segments | total video {T:.2f}s")
with ThreadPoolExecutor(max_workers=4) as ex:
    list(ex.map(lambda p: render(*p), list(enumerate(segments))))

# ---------- concat ----------
listfile = f"{SEG}/list.txt"
with open(listfile,"w") as f:
    for i in range(len(segments)): f.write(f"file 'seg_{i:03d}.mp4'\n")
allmp4 = f"{ROOT}/seg_all.mp4"
r = subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",listfile,"-c","copy",allmp4],
                   capture_output=True, text=True)
if r.returncode:  # fallback: re-encode concat
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",listfile,
                    "-c:v","libx264","-crf","18","-pix_fmt","yuv420p",allmp4],
                   capture_output=True, text=True)
T = float(subprocess.run(["ffprobe","-v","0","-show_entries","format=duration",
        "-of","default=noprint_wrappers=1:nokey=1",allmp4],capture_output=True,text=True).stdout.strip())
print(f"concat done, measured T={T:.2f}s")

# ---------- grade + text + audio ----------
GRADE = ("colortemperature=temperature=4900:mix=0.85,"
         "eq=contrast=1.10:saturation=1.07:gamma=0.98:brightness=0.01,"
         "curves=master='0/0.02 0.25/0.21 0.5/0.5 0.8/0.83 1/0.97',"
         "unsharp=5:5:0.5:5:5:0.0,vignette=PI/4.5,fade=t=in:st=0:d=0.5")

def alpha(t0,t1,fd):
    return (f"if(lt(t,{t0}),0,if(lt(t,{t0+fd}),(t-{t0})/{fd},"
            f"if(lt(t,{t1-fd}),1,if(lt(t,{t1}),({t1}-t)/{fd},0))))")
def dt(text, font, size, x, y, t0, t1, fd, color="white", box=False, slide=0):
    yexp = f"{y}" if not slide else f"({y})+({slide})*(1-clip((t-{t0})/{fd},0,1))"
    s = (f"drawtext=fontfile={font}:text='{text}':fontcolor={color}:fontsize={size}:"
         f"x='{x}':y='{yexp}':alpha='{alpha(t0,t1,fd)}':"
         f"shadowcolor=black@0.55:shadowx=4:shadowy=5:enable='between(t,{t0},{t1})'")
    if box: s += ":box=1:boxcolor=black@0.30:boxborderw=22"
    return s

C = "(w-text_w)/2"
ff = T - 3.7   # final line start
texts = [
 dt("One Perfect Day", PF, 96, C, "(h-text_h)/2-30", 0.6, 3.8, 0.45, slide=-22),
 dt("· T H E   W E D D I N G   O F ·", MO, 30, C, "h*0.40", 4.8, 8.8, 0.5, box=True),
 dt("Jason & Sherry", PF, 118, C, "(h-text_h)/2-20", 5.1, 8.8, 0.5, slide=18),
 dt("0 5 . 2 9 . 2 0 2 6", MO, 44, C, "h*0.575", 5.5, 8.8, 0.5, box=True),
 dt("One Incredible", PF, 84, C, "(h/2)-100", 15.5, 19.8, 0.5),
 dt("Celebration",    PF, 84, C, "(h/2)+18",  15.5, 19.8, 0.5),
 dt("Forever Starts Here", PF, 90, C, "(h-text_h)/2-40", ff, T, 0.55, slide=-18),
 dt("♥", DJ, 64, C, "h/2+95", ff+0.25, T, 0.55, color="0xE0566A"),
]
vf = "[0:v]" + GRADE + "," + ",".join(texts) + ",format=yuv420p[v]"
af = (f"[1:a]atrim=0:{T:.3f},asetpts=PTS-STARTPTS,"
      f"afade=t=in:st=0:d=0.3,afade=t=out:st={T-1.4:.3f}:d=1.4[a]")
cmd = ["ffmpeg","-y","-i",allmp4,"-i",WAV,"-filter_complex",vf+";"+af,
       "-map","[v]","-map","[a]","-t",f"{T:.3f}","-r",str(FPS),
       "-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p",
       "-c:a","aac","-b:a","256k","-movflags","+faststart",FINAL]
r = subprocess.run(cmd, capture_output=True, text=True)
if r.returncode: print("FINAL ERR\n", r.stderr[-2500:])
else: print("FINAL OK ->", FINAL)

# ---------- cut sheet ----------
with open(f"{ROOT}/cutsheet.txt","w") as f:
    f.write(f"Jason & Sherry reel  |  {len(segments)} cuts  |  {T:.2f}s  |  9:16  |  {FPS}fps\n")
    for i,s in enumerate(segments):
        p,m,cx,cy,hf,mn = s["shot"]
        f.write(f"{i:02d} {s['tag']:4} {p} {m:4} mot={mn:9} "
                f"start={s['start']:6.2f} dur={s['dur']:4.2f}{'  *FLASH' if s['flash'] else ''}\n")
print(open(f"{ROOT}/cutsheet.txt").read())
