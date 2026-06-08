#!/usr/bin/env python3
"""Grade + timed text + audio pass over the already-concatenated seg_all.mp4.
Fast to re-run while iterating on look/typography."""
import subprocess
ROOT="/home/user/test/reel"
PF=f"{ROOT}/fonts/PlayfairDisplay.ttf"; MO=f"{ROOT}/fonts/Montserrat.ttf"
DJ="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
WAV="/root/.claude/uploads/b76df3bb-439f-50b8-91f0-5a2b69caed69/b04cb369-All_In_Toast_Wedding_Recap_Celebration_Mix.wav"
allmp4=f"{ROOT}/seg_all.mp4"; FINAL=f"{ROOT}/Jason_and_Sherry_Wedding_Reel.mp4"

T=float(subprocess.run(["ffprobe","-v","0","-show_entries","format=duration",
    "-of","default=noprint_wrappers=1:nokey=1",allmp4],capture_output=True,text=True).stdout.strip())
print(f"T={T:.2f}s")

GRADE=("colortemperature=temperature=4900:mix=0.85,"
       "eq=contrast=1.10:saturation=1.07:gamma=0.98:brightness=0.01,"
       "curves=master='0/0.02 0.25/0.21 0.5/0.5 0.8/0.83 1/0.97',"
       "unsharp=5:5:0.5:5:5:0.0,vignette=PI/4.5,fade=t=in:st=0:d=0.5")

def alpha(t0,t1,fd):
    return (f"if(lt(t,{t0}),0,if(lt(t,{t0+fd}),(t-{t0})/{fd},"
            f"if(lt(t,{t1-fd}),1,if(lt(t,{t1}),({t1}-t)/{fd},0))))")
def dt(text,font,size,x,y,t0,t1,fd,color="white",box=False,slide=0):
    yexp=f"{y}" if not slide else f"({y})+({slide})*(1-clip((t-{t0})/{fd},0,1))"
    s=(f"drawtext=fontfile={font}:text='{text}':fontcolor={color}:fontsize={size}:"
       f"x='{x}':y='{yexp}':alpha='{alpha(t0,t1,fd)}':"
       f"shadowcolor=black@0.55:shadowx=4:shadowy=5:enable='between(t,{t0},{t1})'")
    if box: s+=":box=1:boxcolor=black@0.30:boxborderw=22"
    return s

C="(w-text_w)/2"; ff=T-3.7
texts=[
 dt("One Perfect Day",PF,96,C,"(h-text_h)/2-30",0.6,3.8,0.45,slide=-22),
 dt("· T H E   W E D D I N G   O F ·",MO,30,C,"h*0.40",4.8,8.8,0.5,box=True),
 dt("Jason & Sherry",PF,118,C,"(h-text_h)/2-20",5.1,8.8,0.5,slide=18),
 dt("0 5 . 2 9 . 2 0 2 6",MO,44,C,"h*0.575",5.5,8.8,0.5,box=True),
 dt("One Incredible",PF,84,C,"(h/2)-100",15.5,19.8,0.5),
 dt("Celebration",PF,84,C,"(h/2)+18",15.5,19.8,0.5),
 dt("Forever Starts Here",PF,90,C,"(h-text_h)/2-40",ff,T,0.55,slide=-18),
 dt("♥",DJ,64,C,"h/2+95",ff+0.25,T,0.55,color="0xE0566A"),
]
vf="[0:v]"+GRADE+","+",".join(texts)+",format=yuv420p[v]"
af=(f"[1:a]atrim=0:{T:.3f},asetpts=PTS-STARTPTS,"
    f"afade=t=in:st=0:d=0.3,afade=t=out:st={T-1.4:.3f}:d=1.4[a]")
cmd=["ffmpeg","-y","-i",allmp4,"-i",WAV,"-filter_complex",vf+";"+af,
     "-map","[v]","-map","[a]","-t",f"{T:.3f}","-r","30",
     "-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p",
     "-c:a","aac","-b:a","256k","-movflags","+faststart",FINAL]
r=subprocess.run(cmd,capture_output=True,text=True)
print("FINAL OK -> "+FINAL if r.returncode==0 else "ERR\n"+r.stderr[-2500:])
