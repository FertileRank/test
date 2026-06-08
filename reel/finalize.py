#!/usr/bin/env python3
"""Grade + timed text + audio pass over an already-concatenated seg_all*.mp4.
Aspect via REEL_ASPECT (9:16 default / 4:3). Fast to re-run while tuning look."""
import subprocess
import reel_lib as L

cfg = L.config()
allmp4 = cfg['segall']
T = float(subprocess.run(["ffprobe","-v","0","-show_entries","format=duration",
    "-of","default=noprint_wrappers=1:nokey=1",allmp4],capture_output=True,text=True).stdout.strip())
print(f"ASPECT={cfg['aspect']}  T={T:.2f}s")

vf = "[0:v]" + L.GRADE + "," + L.text_chain(cfg, T) + ",format=yuv420p[v]"
af = L.audio_chain(T)
cmd = ["ffmpeg","-y","-i",allmp4,"-i",L.WAV,"-filter_complex",vf+";"+af,
       "-map","[v]","-map","[a]","-t",f"{T:.3f}","-r","30",
       "-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p",
       "-c:a","aac","-b:a","256k","-movflags","+faststart",cfg['final']]
r = subprocess.run(cmd, capture_output=True, text=True)
print("FINAL OK -> "+cfg['final'] if r.returncode==0 else "ERR\n"+r.stderr[-2500:])
