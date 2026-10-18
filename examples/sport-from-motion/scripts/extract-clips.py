"""Pick one real tracking clip per sport (plus the hook clip) and write them as compact JSON.

Run (from this folder):
  uv run --no-project --with numpy --with h5py python scripts/extract-clips.py [--out src/data/clips.json]

Sources (the same public data the sport-from-motion experiment uses; not redistributed beyond
these few seconds of positions, credited on screen):
  - basketball: NBA SportVU 2015-16 JSON (wheres-the-ball/data/sportvu)
  - american football: NFL Big Data Bowl 2023 (sport-from-motion/data/raw/nfl2023/week1.csv)
  - handball: EIGD-H (sport-from-motion/data/raw/eigd_h/*.h5)
  - soccer: Metrica Sports sample data (wheres-the-ball/data/sample-data)

Every clip: 10 players (5 per team) + the ball, 10 Hz, CLIP_S seconds, metres in the field's
own frame (origin at a corner, x along the length). The video draws the field from `field`.
"""
import argparse, csv, json, math
from pathlib import Path

import h5py
import numpy as np

REPOS = Path(__file__).resolve().parents[4]
WTB = REPOS / "wheres-the-ball" / "data"
RAW = WTB / "sport-from-motion" / "data" / "raw"
HZ = 10
CLIP_S = 10.0
N = int(CLIP_S * HZ)
FT, YD = 0.3048, 0.9144
NFL_N = 65  # 6.5 s at 10 Hz


def resample(xy: np.ndarray, src_hz: float) -> np.ndarray:
    """[F, ...] at src_hz -> [N, ...] at HZ, from the window start (linear interpolation)."""
    t_src = np.arange(xy.shape[0]) / src_hz
    t_out = np.arange(N) / HZ
    flat = xy.reshape(xy.shape[0], -1)
    out = np.stack([np.interp(t_out, t_src, flat[:, k]) for k in range(flat.shape[1])], 1)
    return out.reshape((N,) + xy.shape[1:])


def speed(xy: np.ndarray, hz: float) -> float:
    v = np.diff(xy, axis=0) * hz
    return float(np.nanmean(np.hypot(v[..., 0], v[..., 1])))


def linearity(pts: np.ndarray) -> float:
    """Minor / major spread of a point cloud: 0 = a perfect line."""
    c = pts - pts.mean(0)
    ev = np.linalg.eigvalsh(np.cov(c.T))
    return float(math.sqrt(max(ev[0], 1e-9) / max(ev[1], 1e-9)))


def pack(sport, field, players, team, ball, note):
    players = np.round(players.astype(float), 2)
    ball = np.round(ball.astype(float), 2)
    return {
        "sport": sport,
        "field": list(field),
        "hz": HZ,
        "team": [int(t) for t in team],
        "frames": [[float(v) for v in fr.reshape(-1)] for fr in players],
        "ball": [[float(b[0]), float(b[1])] if np.isfinite(b).all() else None for b in ball],
        "note": note,
    }


# ------------------------------------------------------------------ basketball (SportVU)
def sportvu_streams():
    for g in sorted((WTB / "sportvu").glob("*/*.json")):
        d = json.loads(g.read_text())
        seen = set()
        for ev in d["events"]:
            ms = [m for m in ev["moments"] if m[1] not in seen]
            seen.update(m[1] for m in ev["moments"])
            rows = []
            for m in ms:
                ents = m[5]
                ball = [e for e in ents if e[0] == -1]
                pl = [e for e in ents if e[0] != -1]
                if len(pl) != 10 or not ball:
                    rows.append(None)
                    continue
                pl = sorted(pl, key=lambda e: (e[0], e[1]))
                rows.append((m[1], [(e[0], e[1], e[2] * FT, e[3] * FT) for e in pl], (ball[0][2] * FT, ball[0][3] * FT)))
            yield g.parent.name, ev.get("eventId"), rows


def basketball(hook: bool, skip_game: str | None = None):
    best = None
    for game, eid, rows in sportvu_streams():
        if skip_game and game == skip_game:
            continue
        # continuous runs of valid moments with the same 10 players
        run = []
        for r in rows + [None]:
            ok = r is not None and (not run or (r[0] - run[-1][0] <= 60 and [p[1] for p in r[1]] == [p[1] for p in run[-1][1]]))
            if ok:
                run.append(r)
                continue
            if len(run) >= CLIP_S * 25 + 5:
                for s in range(0, len(run) - int(CLIP_S * 25), 25):
                    w = run[s : s + int(CLIP_S * 25)]
                    xy = np.array([[(p[2], p[3]) for p in r_[1]] for r_ in w])
                    bl = np.array([r_[2] for r_ in w])
                    xs = xy[..., 0]
                    half = (xs.max() < 14.3) or (xs.min() > 14.3)
                    if hook and not half:
                        continue
                    sp = speed(xy, 25)
                    if hook:
                        # the article's quiz: ten dots almost in a line, then the play unfolds
                        lin = linearity(xy[0])
                        if lin > 0.3:
                            continue
                        score = sp
                    else:
                        score = sp + (2 if half else 0)
                    if best is None or score > best[0]:
                        team = [1 if p[0] == w[0][1][0][0] else -1 for p in w[0][1]]
                        best = (score, game, eid, xy, bl, team)
            run = [r] if r is not None else []
    score, game, eid, xy, bl, team = best
    print(f"basketball{' hook' if hook else ''}: {game} event {eid} score {score:.2f} lin0 {linearity(xy[0]):.2f}")
    return pack("basketball", (28.65, 15.24), resample(xy, 25), team, resample(bl, 25), f"SportVU {game} event {eid}"), game


# ------------------------------------------------------------------ handball (EIGD-H)
def handball():
    best = None
    for f in sorted((RAW / "eigd_h").glob("*.h5"))[:10]:
        with h5py.File(f) as h:
            a, b, balls = h["team_a"][:], h["team_b"][:], h["balls"][:]
        src = 30
        win = int(CLIP_S * src)
        for s in range(0, a.shape[0] - win, src * 5):
            wa, wb, wball = a[s : s + win], b[s : s + win], balls[s : s + win, 0, :2]
            ia = [j for j in range(wa.shape[1]) if np.isfinite(wa[:, j]).all()]
            ib = [j for j in range(wb.shape[1]) if np.isfinite(wb[:, j]).all()]
            if len(ia) < 5 or len(ib) < 5 or np.isnan(wball).mean() > 0.2:
                continue
            # the five most active players of each side
            act = lambda w, ids: sorted(ids, key=lambda j: -speed(w[:, j : j + 1], src))[:5]
            xy = np.concatenate([wa[:, act(wa, ia)], wb[:, act(wb, ib)]], 1)
            sp = speed(xy, src)
            if best is None or sp > best[0]:
                best = (sp, f.name, s, xy, wball)
    sp, name, s, xy, wball = best
    # fill short ball gaps
    for k in range(2):
        col = wball[:, k]
        m = np.isfinite(col)
        wball[:, k] = np.interp(np.arange(len(col)), np.flatnonzero(m), col[m])
    print(f"handball: {name} frame {s} speed {sp:.2f}")
    return pack("handball", (40.0, 20.0), resample(xy, 30), [1] * 5 + [-1] * 5, resample(wball, 30), f"EIGD-H {name} frame {s}")


# ------------------------------------------------------------------ soccer (Metrica)
def soccer():
    gdir = WTB / "sample-data" / "data" / "Sample_Game_1"
    sides, ball = [], None
    for side in ("Home", "Away"):
        rows = list(csv.reader((gdir / f"Sample_Game_1_RawTrackingData_{side}_Team.csv").open()))
        arr = np.array([[float(c) if c not in ("", "NaN") else np.nan for c in r[3:]] for r in rows[3:]])
        ball = arr[:, -2:] * [105, 68]
        sides.append(arr[:, :-2].reshape(len(arr), -1, 2) * [105, 68])
    src = 25
    win = int(CLIP_S * src)
    best = None
    for s in range(src * 60, min(len(ball), src * 2400) - win, src * 10):
        wb = ball[s : s + win]
        if not np.isfinite(wb).all():
            continue
        picks = []
        for sd in sides:
            w = sd[s : s + win]
            ids = [j for j in range(w.shape[1]) if np.isfinite(w[:, j]).all()]
            # the five outfield players nearest the ball at the window start
            ids = sorted(ids, key=lambda j: np.hypot(*(w[0, j] - wb[0])))[:5]
            picks.append(w[:, ids])
        xy = np.concatenate(picks, 1)
        sp = speed(xy, src) + 0.05 * speed(wb[:, None], src)
        if best is None or sp > best[0]:
            best = (sp, s, xy, wb)
    sp, s, xy, wb = best
    print(f"soccer: Metrica game 1 frame {s} score {sp:.2f}")
    return pack("soccer", (105.0, 68.0), resample(xy, src), [1] * 5 + [-1] * 5, resample(wb, src), f"Metrica Sample_Game_1 frame {s}")


# ------------------------------------------------------------------ American football (NFL BDB 2023)
def football():
    plays: dict = {}
    with open(RAW / "nfl2023" / "week1.csv", newline="") as fh:
        for r in csv.DictReader(fh):
            key = (r["gameId"], r["playId"])
            if key not in plays and len(plays) >= 300:
                break
            fr = plays.setdefault(key, {}).setdefault(int(r["frameId"]), {"p": {}, "ball": None, "snap": False})
            x, y = float(r["x"]) * YD, float(r["y"]) * YD
            if r["team"] == "football":
                fr["ball"] = (x, y)
            else:
                fr["p"][(r["team"], r["nflId"])] = (x, y)
            if r["event"] in ("ball_snap", "autoevent_ballsnap"):
                fr["snap"] = True
    best = None
    for key, frames in list(plays.items())[:-1]:
        order = sorted(frames)
        snaps = [k for k in order if frames[k]["snap"]]
        if not snaps:
            continue
        # NFL BDB 2023 plays stop at the pass, so the clip is shorter (NFL_S) and starts just
        # before the snap: the still line, then everyone at once. The video loops it.
        start = snaps[0] - 5
        sel = [k for k in order if k >= start][:NFL_N]
        if len(sel) < NFL_N or any(frames[k]["ball"] is None for k in sel):
            continue
        ids = sorted(frames[sel[0]]["p"])
        if any(set(frames[k]["p"]) != set(ids) for k in sel):
            continue
        b0 = np.array(frames[sel[0]]["ball"])
        teams = sorted({t for t, _ in ids})
        pick = []
        for t in teams:
            mine = [i for i in ids if i[0] == t]
            # the five most active players of each side (receivers and defensive backs)
            run = lambda i: sum(np.hypot(*(np.array(frames[a]["p"][i]) - frames[b]["p"][i])) for a, b in zip(sel, sel[1:]))
            pick += sorted(mine, key=lambda i: -run(i))[:5]
        xy = np.array([[frames[k]["p"][i] for i in pick] for k in sel])
        bl = np.array([frames[k]["ball"] for k in sel])
        sp = speed(xy, 10) + 0.1 * speed(bl[:, None], 10)
        if best is None or sp > best[0]:
            best = (sp, key, xy, bl)
    sp, key, xy, bl = best
    print(f"american_football: game {key[0]} play {key[1]} score {sp:.2f}")
    return pack("american_football", (109.7, 48.8), xy, [1] * 5 + [-1] * 5, bl, f"NFL BDB 2023 game {key[0]} play {key[1]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="src/data/clips.json")
    a = ap.parse_args()
    hook, hook_game = basketball(hook=True)
    bball, _ = basketball(hook=False, skip_game=hook_game)
    out = {"hook": hook, "grid": [football(), bball, handball(), soccer()]}
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(out, separators=(",", ":")))
    print(f"wrote {a.out} ({Path(a.out).stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
