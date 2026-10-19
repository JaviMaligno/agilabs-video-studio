"""Vortex threads for the VortexCore scenes.

Reuses the leading-order (Burgers-type) field and the RK2 integrator of the article's figure
script (personal-website/scripts/figures/navier-stokes-vortex-3d.py):

    u_r = -a r,   u_z = 2 a z,   u_th = (G / r) (1 - exp(-a r^2 / 2 nu))

and writes the trajectories, downsampled, to src/data/threads.json as [x, y, z] in units of the
outer radius. The component only rescales them with tau (radius ~ tau^1/2, height ~ tau^(1/2-h),
h exaggerated). Usage: python3 scripts/extract-threads.py
"""
import json
import math
from pathlib import Path

A, G, NU = 1.0, 1.0, 0.02


def vel(r, z):
    ur = -A * r
    uz = 2.0 * A * z
    uth = (G / max(r, 1e-3)) * (1.0 - math.exp(-A * r * r / (2.0 * NU)))
    return ur, uth, uz


def trajectory(r0, th0, z0, steps=2600, dt=0.0016, zcap=2.6):
    r, th, z = r0, th0, z0
    out = [(r * math.cos(th), r * math.sin(th), z)]
    for _ in range(steps):
        if r < 0.012 or abs(z) > zcap:
            break
        ur, uth, uz = vel(r, z)
        rm, zm = r + 0.5 * dt * ur, z + 0.5 * dt * uz
        ur2, uth2, uz2 = vel(max(rm, 1e-3), zm)
        r += dt * ur2
        th += dt * uth2 / max(rm, 1e-3)
        z += dt * uz2
        out.append((r * math.cos(th), r * math.sin(th), z))
    return out


def resample(pts, n):
    """n points evenly spaced along the arc length."""
    if len(pts) < 2:
        return pts
    acc = [0.0]
    for a, b in zip(pts, pts[1:]):
        acc.append(acc[-1] + math.dist(a, b))
    total = acc[-1]
    out, j = [], 0
    for k in range(n):
        s = total * k / (n - 1)
        while j < len(acc) - 2 and acc[j + 1] < s:
            j += 1
        span = acc[j + 1] - acc[j] or 1.0
        f = (s - acc[j]) / span
        a, b = pts[j], pts[j + 1]
        out.append(tuple(round(a[i] + (b[i] - a[i]) * f, 4) for i in range(3)))
    return out


def main():
    swirl, axial = [], []
    for k in range(24):
        th0 = 2 * math.pi * k / 24
        z0 = 0.10 * math.cos(2 * math.pi * k / 24 * 2.0)
        swirl.append(resample(trajectory(1.0, th0, z0, steps=2300, zcap=0.9), 140))
    for k in range(8):
        th0 = 2 * math.pi * k / 8 + 0.19
        for z0 in (0.20, -0.20):
            axial.append(resample(trajectory(0.80, th0, z0), 110))
    out = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'threads.json'
    out.write_text(json.dumps({'source': 'Burgers-type leading-order field, a=1, G=1, nu=0.02 (article figure script)',
                               'swirl': swirl, 'axial': axial}, separators=(',', ':')))
    print('wrote', out, len(swirl), 'swirl', len(axial), 'axial')


if __name__ == '__main__':
    main()
