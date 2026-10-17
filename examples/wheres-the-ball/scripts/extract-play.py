"""Pick a short play from Metrica Sports open tracking data and write it as compact JSON.

Run: uv run --with pandas --with numpy python scripts/extract-play.py <Sample_Game_dir> [--out src/data/play.json]

Looks for a window where the ball is far from the player mass early on and nearly still
(< 2 m/s) at the end, then writes 22 players + ball at 10 Hz, in metres (105 x 68 pitch).
Metrica Sports sample data: https://github.com/metrica-sports/sample-data (credit on screen).
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
import pandas as pd

W, H = 105.0, 68.0
SRC_HZ, OUT_HZ = 25, 10
WIN = 14.0  # seconds


def load(path: Path):
    raw = pd.read_csv(path, skiprows=2)
    cols = list(raw.columns)
    players = {}
    for i, c in enumerate(cols):
        if c.startswith("Player"):
            players[c] = raw.iloc[:, [i, i + 1]].to_numpy(float)
    bi = cols.index("Ball")
    ball = raw.iloc[:, [bi, bi + 1]].to_numpy(float)
    return raw["Period"].to_numpy(), players, ball


def to_m(xy):
    return np.stack([xy[..., 0] * W, xy[..., 1] * H], -1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("game_dir")
    ap.add_argument("--out", default="src/data/play.json")
    ap.add_argument("--start", type=float, default=None, help="force the window start (seconds)")
    a = ap.parse_args()
    d = Path(a.game_dir)
    period, home, ball = load(next(d.glob("*Home_Team.csv")))
    _, away, _ = load(next(d.glob("*Away_Team.csv")))
    ball = to_m(ball)
    teams = {"home": {k: to_m(v) for k, v in home.items()}, "away": {k: to_m(v) for k, v in away.items()}}

    n = len(ball)
    step = SRC_HZ // 5
    winf = int(WIN * SRC_HZ)
    vel = np.vstack([np.zeros((1, 2)), np.diff(ball, axis=0)]) * SRC_HZ
    speed = pd.Series(np.linalg.norm(vel, axis=1)).rolling(5, center=True, min_periods=1).median().to_numpy()

    best = None
    starts = [int(a.start * SRC_HZ)] if a.start is not None else range(0, n - winf, step)
    for s in starts:
        e = s + winf
        if period[s] != period[e - 1] or np.isnan(ball[s:e]).any():
            continue
        on = {t: [k for k, v in teams[t].items() if not np.isnan(v[s:e]).any()] for t in teams}
        if len(on["home"]) != 11 or len(on["away"]) != 11:
            continue
        allp = np.stack([teams[t][k][s:e] for t in teams for k in on[t]], 1)  # (T, 22, 2)
        cen = allp.mean(1)
        dist = np.linalg.norm(ball[s:e] - cen, axis=1)
        early = dist[: 5 * SRC_HZ].max()
        tail = speed[e - 3 * SRC_HZ : e]
        if tail.max() >= 2.0:
            continue
        travel = np.linalg.norm(ball[s + 5 * SRC_HZ] - ball[s])
        fast = speed[s : s + 5 * SRC_HZ].max()
        # A real long ball early (in flight, far from the mass), not a dead ball throughout.
        if travel < 25 or fast < 12 or early < 18:
            continue
        # Players still moving at the end, so the arrows have something to show.
        score = early + travel
        if best is None or score > best[0]:
            best = (score, s, on, early, travel)
    if best is None:
        sys.exit("no window found")
    score, s, on, early, travel = best
    e = s + winf
    idx = np.arange(s, e, SRC_HZ // OUT_HZ if SRC_HZ % OUT_HZ == 0 else 1)
    idx = np.round(np.arange(s, e, SRC_HZ / OUT_HZ)).astype(int)
    r = lambda v: [round(float(x), 1) for x in v.reshape(-1)]
    out = {
        "source": f"Metrica Sports sample data, {d.name}, period {int(period[s])}, t={s / SRC_HZ:.1f}-{e / SRC_HZ:.1f} s",
        "hz": OUT_HZ,
        "pitch": [W, H],
        "home": [r(np.stack([teams['home'][k][i] for k in on["home"]])) for i in idx],
        "away": [r(np.stack([teams['away'][k][i] for k in on["away"]])) for i in idx],
        "ball": [r(ball[i]) for i in idx],
        "ballSpeed": [round(float(speed[i]), 1) for i in idx],
    }
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(out, separators=(",", ":")))
    print(out["source"], f"early max dist {early:.1f} m, travel 5 s {travel:.1f} m, frames {len(idx)}")
    print("ball speed by second:", [round(float(speed[i]), 1) for i in idx[::OUT_HZ]])


if __name__ == "__main__":
    main()
