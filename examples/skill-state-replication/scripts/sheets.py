# Tiles out/stills/*.png into contact sheets of four (out/sheets). Usage: python3 scripts/sheets.py
import glob, os, subprocess, sys
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out')
os.makedirs(D + '/sheets', exist_ok=True)
for f in glob.glob(D + '/sheets/*.png'):
    os.remove(f)
files = sorted(glob.glob(D + '/stills/f*.png'))
for k in range(0, len(files), 4):
    subprocess.run(['magick', *files[k:k + 4], '-bordercolor', '#555', '-border', '3', '+append', D + f'/sheets/s{k:02d}.png'], check=True)
print(len(files), 'stills ->', (len(files) + 3) // 4, 'sheets')
