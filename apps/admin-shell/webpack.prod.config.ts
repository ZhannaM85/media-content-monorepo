import { withModuleFederation } from '@nx/module-federation/angular';
import type { Configuration } from 'webpack';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
const baseConfig = withModuleFederation(
  {
    ...config,
    /*
     * Remote overrides for production.
     * Each entry is a pair of a unique name and the URL where it is deployed.
     *
     * e.g.
     * remotes: [
     *   ['app1', 'https://app1.example.com'],
     *   ['app2', 'https://app2.example.com'],
     * ]
     */
  },
  { dts: false },
) as Configuration;

export default {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    scriptType: 'module' as const,
  },
};
