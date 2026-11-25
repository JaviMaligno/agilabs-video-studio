import subprocess, sys, numpy as np
src, start, dur = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
W,H=160,90
p = subprocess.Popen(['ffmpeg','-v','error','-ss',str(start),'-t',str(dur),'-i',src,'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','gray','-'],stdout=subprocess.PIPE)
frames=[]
while True:
    b=p.stdout.read(W*H)
    if len(b)<W*H: break
    frames.append(np.frombuffer(b,np.uint8).astype(np.int16))
F=np.array(frames); fps=30
d=np.abs(np.diff(F,axis=0)).mean(axis=1)
# flicker: frame i differs from both neighbours, but i-1 ~ i+1
hits=[]
for i in range(1,len(F)-1):
    a=np.abs(F[i]-F[i-1]).mean(); b=np.abs(F[i+1]-F[i]).mean(); c=np.abs(F[i+1]-F[i-1]).mean()
    if a>1.5 and b>1.5 and c<0.5*min(a,b): hits.append((start+i/fps,round(a,2),round(b,2),round(c,2)))
print(len(F),'frames; flicker frames:',len(hits))
for h in hits[:80]: 
    t=h[0]; print(f'{int(t//60)}:{t%60:05.2f}',h[1:])
