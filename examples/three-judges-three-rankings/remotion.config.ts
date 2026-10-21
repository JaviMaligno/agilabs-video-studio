// Remotion CLI settings for this template.
import { Config } from '@remotion/cli/config';

// Loading the bundle plus the Inter font can take more than the 30 s default on a slower laptop.
Config.setDelayRenderTimeoutInMilliseconds(120000);
// Other renders share this machine: allow a slow root load.
Config.setDelayRenderTimeoutInMilliseconds(400000);
