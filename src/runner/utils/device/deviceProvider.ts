/**
* Copyright (c) Maksym Rusynyk 2019 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import type { DeviceInterface } from './DeviceInterface';

import log from '../log';
import AndroidEmulator from './AndroidEmulator';
import AndroidDevice from './AndroidDevice';
import IosSimulator from './IosSimulator';

const TAG = 'PIXELS_CATCHER::DEVICE_PROVIDER';

export default (
  name: string,
  platform: string,
  isPhysicalDevice?: boolean,
  canStopDevice: boolean = true,
): DeviceInterface => {
  if (platform === 'android') {
    return isPhysicalDevice
      ? new AndroidDevice(name)
      : new AndroidEmulator(name, canStopDevice);
  }

  if (!isPhysicalDevice) {
    return new IosSimulator(name, canStopDevice);
  }

  log.e(TAG, 'iOS devices are not supported yet');
  throw new Error('iOS devices are not supported yet');
};
