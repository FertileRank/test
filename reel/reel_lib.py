#!/usr/bin/env python3
"""Shared geometry / grade / text / audio helpers for the wedding reel,
parameterized by aspect ratio so 9:16 and 4:3 cuts stay in sync.
Set REEL_ASPECT=9:16 (default) or REEL_ASPECT=4:3."""
import os
ROOT = "/home/user/test/reel"
PF   = f"{ROOT}/fonts/PlayfairDisplay.ttf"
MO   = f"{ROOT}/fonts/Montserrat.ttf"
DJ   = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
WAV  = "/root/.claude/uploads/b76df3bb-439f-50b8-91f0-5a2b69caed69/b04cb369-All_In_Toast_Wedding_Recap_Celebration_Mix.wav"

def config(aspect=None):
    aspect = aspect or os.environ.get("REEL_ASPECT", "9:16")
    if aspect == "4:3":
        OUT, SS, suffix = (1440, 1080), (2160, 1620), "_4x3"
        ypos = dict(title="(h-text_h)/2-20", eyebrow="h/2-155", names="(h-text_h)/2-10",
                    date="h/2+82", mid1="(h/2)-130", mid2="(h/2)+8",
                    forever="(h-text_h)/2-30", heart="h/2+78")
    else:
        aspect = "9:16"
        OUT, SS, suffix = (1080, 1920), (1620, 2880), ""
        ypos = dict(title="(h-text_h)/2-30", eyebrow="h*0.40", names="(h-text_h)/2-20",
                    date="h*0.575", mid1="(h/2)-100", mid2="(h/2)+18",
                    forever="(h-text_h)/2-40", heart="h/2+95")
    S = OUT[0] / 1080.0
    base = dict(title=96, eyebrow=30, names=118, date=44, mid=84, forever=90, heart=64)
    sizes = {k: round(v*S) for k, v in base.items()}
    slides = dict(title=round(-22*S), names=round(18*S), forever=round(-18*S))
    return dict(aspect=aspect, OUT=OUT, SS=SS, ratio=OUT[0]/OUT[1], S=S, suffix=suffix,
                sizes=sizes, ypos=ypos, slides=slides,
                shx=max(2, round(4*S)), shy=max(2, round(5*S)), bbw=round(22*S),
                final=f"{ROOT}/Jason_and_Sherry_Wedding_Reel{suffix}.mp4",
                segall=f"{ROOT}/seg_all{suffix}.mp4",
                segdir=f"{ROOT}/segments{suffix}",
                cutsheet=f"{ROOT}/cutsheet{suffix}.txt")

def crop_ar(cx, cy, hf, ratio, W=1250, H=833):
    """A `ratio`-aspect window from the source, centered on (cx,cy), height=hf*H."""
    h = round(hf*H); w = round(h*ratio)
    w = min(w, W); h = min(h, H)
    x = min(max(round(cx*W - w/2), 0), W-w)
    y = min(max(round(cy*H - h/2), 0), H-h)
    return f"crop={w}:{h}:{x}:{y}"

GRADE = ("colortemperature=temperature=4900:mix=0.85,"
         "eq=contrast=1.10:saturation=1.07:gamma=0.98:brightness=0.01,"
         "curves=master='0/0.02 0.25/0.21 0.5/0.5 0.8/0.83 1/0.97',"
         "unsharp=5:5:0.5:5:5:0.0,vignette=PI/4.5,fade=t=in:st=0:d=0.5")

def _alpha(t0, t1, fd):
    return (f"if(lt(t,{t0}),0,if(lt(t,{t0+fd}),(t-{t0})/{fd},"
            f"if(lt(t,{t1-fd}),1,if(lt(t,{t1}),({t1}-t)/{fd},0))))")

def _dt(cfg, text, font, size, y, t0, t1, fd, color="white", box=False, slide=0):
    yexp = f"{y}" if not slide else f"({y})+({slide})*(1-clip((t-{t0})/{fd},0,1))"
    s = (f"drawtext=fontfile={font}:text='{text}':fontcolor={color}:fontsize={size}:"
         f"x='(w-text_w)/2':y='{yexp}':alpha='{_alpha(t0,t1,fd)}':"
         f"shadowcolor=black@0.55:shadowx={cfg['shx']}:shadowy={cfg['shy']}:"
         f"enable='between(t,{t0},{t1})'")
    if box: s += f":box=1:boxcolor=black@0.30:boxborderw={cfg['bbw']}"
    return s

def text_chain(cfg, T):
    z, y, sl, ff = cfg['sizes'], cfg['ypos'], cfg['slides'], T-3.7
    parts = [
        _dt(cfg, "One Perfect Day", PF, z['title'], y['title'], 0.6, 3.8, 0.45, slide=sl['title']),
        _dt(cfg, "· T H E   W E D D I N G   O F ·", MO, z['eyebrow'], y['eyebrow'], 4.8, 8.8, 0.5, box=True),
        _dt(cfg, "Jason & Sherry", PF, z['names'], y['names'], 5.1, 8.8, 0.5, slide=sl['names']),
        _dt(cfg, "0 5 . 2 9 . 2 0 2 6", MO, z['date'], y['date'], 5.5, 8.8, 0.5, box=True),
        _dt(cfg, "One Incredible", PF, z['mid'], y['mid1'], 15.5, 19.8, 0.5),
        _dt(cfg, "Celebration", PF, z['mid'], y['mid2'], 15.5, 19.8, 0.5),
        _dt(cfg, "Forever Starts Here", PF, z['forever'], y['forever'], ff, T, 0.55, slide=sl['forever']),
        _dt(cfg, "♥", DJ, z['heart'], y['heart'], ff+0.25, T, 0.55, color="0xE0566A"),
    ]
    return ",".join(parts)

def audio_chain(T):
    return (f"[1:a]atrim=0:{T:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:st=0:d=0.3,afade=t=out:st={T-1.4:.3f}:d=1.4[a]")
