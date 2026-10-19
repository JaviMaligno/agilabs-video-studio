// Remotion CLI settings for this template.
import { Config } from '@remotion/cli/config';

// Loading the bundle plus the Inter font can take more than the 30 s default on a slower laptop.
Config.setDelayRenderTimeoutInMilliseconds(120000);
// Other videos render in parallel on this machine and Remotion's default port (3000) can resolve
// to another project's bundle server through IPv6 localhost: give this one its own port.
Config.setRendererPort(3791);
