#!/usr/bin/env node
/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import type { DeviceInterface } from './utils/device/DeviceInterface';

import log from './utils/log';
import readConfig from './utils/readConfig';
import getDevice from './utils/device/deviceProvider';
import AzurePublisher from './azure/AzurePublisher';
import TestsRunner from './TestsRunner';

const TAG = 'PIXELS_CATCHER';
const AZURE_PUBLISH_ACTION = 'azureAttachments';
const [,, platform, configuration, action] = process.argv;

if (!platform || !(platform === 'ios' || platform === 'android')) {
  log.e(TAG, `Valid platform is required, specify "ios" or "android". Example:

  $ pixels-catcher android debug

  or

  $ pixels-catcher ios debug
  `);
  process.exit(-1);
}

if (!configuration) {
  log.e(TAG, `Configuration is required. Example:

  $ pixels-catcher android debug

  or

  $ pixels-catcher ios debug
`);
  process.exit(-1);
}

if (action !== undefined && action !== AZURE_PUBLISH_ACTION) {
  log.e(TAG, `Only "${AZURE_PUBLISH_ACTION}" is available. Example:

  $ pixels-catcher android debug ${AZURE_PUBLISH_ACTION}

  or

  $ pixels-catcher ios debug ${AZURE_PUBLISH_ACTION}
  `);
  process.exit(-1);
}


const fullConfig = readConfig();
const config = fullConfig[platform];

if (!config) {
  log.e(TAG, `Cannot find configuration for plarform [${platform}] in `
    + `config:\n ${JSON.stringify(fullConfig, null, 2)}`);
  process.exit(-1);
}

log.setLevel(fullConfig.logLevelel);
log.i(TAG, `Starting with [${configuration}] configuration for [${platform}]`);
log.v(TAG, `Config\n${JSON.stringify(config, null, 2)}`);

const getParamFromConfig = (paramName: string) => {
  const value = (config[configuration] || {})[paramName];
  return value !== undefined ? value : config[paramName];
};

const activityName = getParamFromConfig('activityName') || 'MainActivity';
const appFile = getParamFromConfig('appFile');
const canStopDevice = getParamFromConfig('canStopDevice');
const deviceName = getParamFromConfig('deviceName');
const deviceParams = getParamFromConfig('deviceParams');
const isPhysicalDevice = getParamFromConfig('physicalDevice');
const packageName = getParamFromConfig('packageName');
const snapshotsPath = getParamFromConfig('snapshotsPath');
const port = getParamFromConfig('port');
const locale = getParamFromConfig('locale');
const timeout = fullConfig.timeout || 25 * 1000; // 25 sec is default

if (!deviceName) {
  log.e(TAG, 'Valid device name is required, check "PixelsCatcher.deviceName" '
    + 'property in package.json');
  process.exit(-1);
}

const device: DeviceInterface = getDevice(
  deviceName,
  platform,
  isPhysicalDevice,
  canStopDevice,
);

log.i(TAG, `Starting with:
  - activityName: [${activityName}]
  - appFile: [${appFile}]
  - deviceName: [${deviceName}]
  - deviceParams: [${deviceParams}]
  - packageName: [${packageName}]
  - snapshotsPath: [${snapshotsPath}]
  - canStopDevice: [${canStopDevice}]
  - port: [${port}]
  - locale: [${locale}]`);

if (!packageName) {
  log.e(TAG, 'Package name is required');
  process.exit(-1);
}

const testRunName = `UI tests for ${platform}/${deviceName}`;

if (action === AZURE_PUBLISH_ACTION) {
  const azurePublisher = new AzurePublisher(process.cwd(), testRunName);
  azurePublisher.publish();
} else {
  const isDevMode = !appFile;
  log.i(TAG, `Starting in ${isDevMode ? 'development' : 'ci'} mode`);
  const testsRunner = new TestsRunner({
    testRunName,
    isDevMode,
    timeout,
    device,
    appFile,
    port,
    platform,
    deviceName,
    snapshotsPath,
    deviceParams,
    packageName,
    locale,
    activityName,
  });
  testsRunner.start();
}
