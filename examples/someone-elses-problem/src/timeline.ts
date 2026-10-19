// It Used to Be Someone Else's Problem — explainer video (EN). Narration from the approved script
// v1.1 (script.md). The frame is one laptop seen from above: agent sessions are lanes of light,
// the shared floor (memory, CPU, disk, ports, repo) sits below, and every collision on it throws a
// spark that ends up stamped with the job it used to belong to (AgentLanes).
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the hook line is drawn by the scene itself over the crashing lane (no caption).
    anim(
      'hook',
      'AgentLanes',
      { mode: 'crash', titleLine: true },
      [say(0.1, 'My laptop kept running out of memory.', ''), say(0, 'I blamed the laptop.', '')],
    ),
    anim('culprit', 'AgentLanes', { mode: 'lanes', blend: true }, [say(0.15, 'The culprit: test runners, in three agent sessions at once.', '')]),
    anim('workers', 'AgentLanes', { mode: 'workers', blend: true }, [say(0.1, 'Each one sizes itself as if it owned the machine.', '')]),
    anim(
      'overflow',
      'AgentLanes',
      { mode: 'overflow', blend: true },
      [say(0.15, 'Six workers is fine.', ''), say(0, 'Forty-five is not.', '')],
      { min: 4.6 },
    ),
    anim('floor', 'AgentLanes', { mode: 'floor', blend: true }, [
      say(0.1, 'One person with four sessions open runs a small distributed system on a laptop.', ''),
    ]),
    anim('zombie', 'AgentLanes', { mode: 'zombie', blend: true }, [
      say(0.15, "Agents start things and don't close windows.", ''),
      // One sentence voiced as two lines (same words) so each caption cue stays under 17 chars/s.
      say(0, "What's left often belongs to a session", ''),
      say(0, 'that ended three days ago.', ''),
    ]),
    anim('race', 'AgentLanes', { mode: 'race', blend: true }, [say(0.15, 'Two agents, one repo: one edits a file while the other reformats it.', '')]),
    anim('retry', 'AgentLanes', { mode: 'retry', blend: true }, [say(0.15, 'A job sends an email, crashes, gets retried: two emails.', '')]),
    anim('injection', 'AgentLanes', { mode: 'injection', blend: true }, [say(0.15, 'And text an agent reads can give it orders.', '')]),
    anim('stamps', 'AgentLanes', { mode: 'stamps', blend: true }, [say(0.15, "All of this used to be someone else's problem.", '')], { min: 4.2 }),
    anim('desk', 'AgentLanes', { mode: 'desk', blend: true }, [
      say(0.1, "I don't need to become an SRE.", '', { en: "I don't need to become an S R E." }),
      say(0, 'I need to know the box is there.', ''),
    ]),
    // The closing quote is drawn by the scene (no caption for it).
    anim('hurt', 'AgentLanes', { mode: 'hurt', titleLine: true, blend: true }, [say(0.15, 'You learn it because it starts to hurt.', '')], { min: 3.4 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
