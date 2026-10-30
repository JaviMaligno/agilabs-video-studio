"""Add avatar cameos + avatar outro to a video project made from an older copy of the template.

Usage: python3 scripts/migrate/apply_avatar.py <video_dir> <avatar_dir>
<avatar_dir> holds the author's cut-outs (avatar-<pose>.png and avatar-profile.png), for example
another video's public/avatar.
Idempotent: skips any step already applied. Fails loudly if an anchor is missing.
"""
import os, re, shutil, sys

TEMPLATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "template", "src")

if len(sys.argv) != 3:
    sys.exit(__doc__)
d, AVATARS = sys.argv[1], sys.argv[2]
src = os.path.join(d, "src")


def patch(path, old, new, done_marker):
    s = open(path).read()
    if done_marker in s:
        return
    if old not in s:
        sys.exit(f"anchor not found in {path}: {old[:60]!r}")
    open(path, "w").write(s.replace(old, new, 1))


# Files that are identical in every copy.
shutil.copy(os.path.join(TEMPLATE, "components", "Cameo.tsx"), os.path.join(src, "components", "Cameo.tsx"))
if not os.path.exists(os.path.join(src, "marks.ts")):
    shutil.copy(os.path.join(TEMPLATE, "marks.ts"), os.path.join(src, "marks.ts"))
os.makedirs(os.path.join(d, "public", "avatar"), exist_ok=True)
for f in os.listdir(AVATARS):
    shutil.copy(os.path.join(AVATARS, f), os.path.join(d, "public", "avatar", f))

# Video.tsx: imports, the Cameos component, and its use inside anim scenes.
v = os.path.join(src, "Video.tsx")
patch(v, "import { AUDIO } from './audio.generated.ts';",
      "import { AUDIO, WORDS } from './audio.generated.ts';\nimport { resolveMark } from './marks.ts';", "resolveMark")
patch(v, "import { Captions } from './components/Captions.tsx';",
      "import { Captions } from './components/Captions.tsx';\nimport { Cameo, type CameoSpec } from './components/Cameo.tsx';", "Cameo, type CameoSpec")
cameos_comp = '''/** The avatar cameos of an anim scene (`cameos` in its props), each landing on its mark. */
const Cameos: React.FC<{ scene: Scene; vertical: boolean }> = ({ scene, vertical }) => {
  const cameos = (scene.anim?.props as { cameos?: CameoSpec[] } | undefined)?.cameos;
  if (!cameos?.length) return null;
  const lang = scene.lines[0]?.voice ?? 'en';
  return (
    <>
      {cameos.map((c, i) => (
        <Cameo
          key={i}
          pose={c.pose}
          at={typeof c.at === 'number' ? c.at : resolveMark(scene.lines, c.at, WORDS[lang], lang)}
          dur={c.dur}
          side={c.side}
          vertical={vertical}
        />
      ))}
    </>
  );
};

const SceneView: React.FC'''
patch(v, "const SceneView: React.FC", cameos_comp, "const Cameos: React.FC")
s = open(v).read()
if "<Cameos scene={scene}" not in s:
    m = re.search(r"(\n(\s*)<Badge size=\{p\.vertical \? 1\.1 : 0\.9\} />\n\s*</div>\n)", s)
    if not m:
        sys.exit("badge anchor not found in Video.tsx")
    indent = m.group(2)[:-2]
    s = s[: m.end()] + f"{indent}{{!p.noSubs && <Cameos scene={{scene}} vertical={{p.vertical}} />}}\n" + s[m.end():]
    open(v, "w").write(s)

# Cards.tsx: avatar above the badge on the outro, when SETTINGS.avatar is set.
c = os.path.join(src, "components", "Cards.tsx")
patch(c, "import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';",
      "import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';", "staticFile")
s = open(c).read()
if "SETTINGS.avatar" not in s:
    m = re.search(r"(\n(\s*)<div style=\{item\(0\)\}>\n\s*<Badge size=\{vertical \? 2\.4 : 2\} />\n\s*</div>\n)", s)
    if not m:
        sys.exit("outro badge anchor not found in Cards.tsx")
    ind = m.group(2)
    new = (f"\n{ind}{{SETTINGS.avatar && (\n"
           f"{ind}  <div style={{{{ ...item(0), width: vertical ? 300 : 220, height: vertical ? 300 : 220, borderRadius: '50%', padding: 8, background: GRADIENT }}}}>\n"
           f"{ind}    <Img src={{staticFile(SETTINGS.avatar)}} style={{{{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}}} />\n"
           f"{ind}  </div>\n"
           f"{ind})}}\n"
           f"{ind}<div style={{item(SETTINGS.avatar ? 4 : 0)}}>\n"
           f"{ind}  <Badge size={{SETTINGS.avatar ? (vertical ? 2 : 1.7) : vertical ? 2.4 : 2}} />\n"
           f"{ind}</div>\n")
    s = s[: m.start()] + new + s[m.end():]
    open(c, "w").write(s)

# settings.ts: the avatar field and its value.
st = os.path.join(src, "settings.ts")
s = open(st).read()
if "avatar?:" not in s:
    s = s.replace("  articleTitle: Label;\n", "  articleTitle: Label;\n  /** Optional author avatar (round, under public/), shown on the outro card. null = none. */\n  avatar?: null | string;\n", 1)
if "avatar: 'avatar/" not in s:
    s = re.sub(r"\n};\s*$", "\n  avatar: 'avatar/avatar-profile.png',\n};\n", s)
open(st, "w").write(s)
print("ok", d)
