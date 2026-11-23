// Remotion CLI settings for this template.
import { Config } from '@remotion/cli/config';

// Loading the bundle plus the Inter font can take more than the 30 s default on a slower laptop.
Config.setDelayRenderTimeoutInMilliseconds(120000);
// A machine with its own Chrome (no download of Remotion's headless shell): point REMOTION_BROWSER
// at the binary. Full Chrome needs the chrome-for-testing mode.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
  Config.setChromeMode('chrome-for-testing');
}
