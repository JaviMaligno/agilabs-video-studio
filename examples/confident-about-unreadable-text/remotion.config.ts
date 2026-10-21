// Remotion CLI settings for this template.
import { Config } from '@remotion/cli/config';

// The machine is shared with parallel renders: allow 8 min. Loading the bundle plus the Inter font can take more than the 30 s default on a slower laptop.
Config.setDelayRenderTimeoutInMilliseconds(480000);
