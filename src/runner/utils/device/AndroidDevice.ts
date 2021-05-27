/**
* Copyright (c) Maksym Rusynyk 2019 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import type { DeviceInterface } from './DeviceInterface';

import exec from '../exec';
import delay from '../delay';
import log from '../log';

const TAG = 'PIXELS_CATCHER::ANDROID_DEVICE';

class AndroidDevice implements DeviceInterface {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }


  _getDevices() {
    const cmd = 'adb devices';
    const devices = exec(cmd).split('\n').slice(1)
      .filter((line: string): boolean => Boolean(line))
      .map((line: string): string => line.split('\t')[0]);

    return devices;
  }


  _isDeviceAvailable(name: string): boolean {
    const devices = this._getDevices();
    let isAvailable = false;

    for (let ind = devices.length - 1; ind >= 0; --ind) {
      if (devices[ind].indexOf(name) >= 0) {
        isAvailable = true;
        break;
      }
    }

    return isAvailable;
  }


  async start(params: any = []) {
    if (params.length !== 0) {
      log.e(TAG, 'There are currently no supported device parameters for physical devices, yet you tried to pass some im');
      process.exit(-1);
    }
    if (!this._isDeviceAvailable(this._name)) {
      log.e(TAG, `Invalid name provided [${this._name}], check that the name is \
  correct and device is available. Available devices:
      ${this._getDevices().map((device: any): any => `  - ${device}`).join('\n')}`);
      throw new Error(`Invalid emulator ${this._name}`);
    }
  }


  async stop() {
    log.v(TAG, 'Not stopping anything as it is assumed to be a physical device. Your responsibility!');
  }


  isAppInstalled(packageName: string): boolean {
    const cmd = `adb -s ${this._name} shell pm list packages`;

    log.v(TAG, `Checking if [${packageName}] is installed`);

    const allPackages = exec(cmd);
    const isInstalled = allPackages.indexOf(packageName) >= 0;

    log.v(TAG, `Package [${packageName}] is ${isInstalled ? 'Installed' : 'Not installed'}`);

    return isInstalled;
  }


  async uninstallApp(name: string) {
    log.v(TAG, `Uninstalling ${name}`);
    const isInstalled = await this.isAppInstalled(name);
    if (isInstalled) {
      const cmd = `adb -s ${this._name} uninstall ${name}`;
      exec(cmd);
    }
    log.v(TAG, 'Uninstalling completed');
  }


  async installApp(name: string, apkFile: string) {
    log.v(TAG, `Installing apk [${apkFile}]`);

    await this.uninstallApp(name);

    let tryCnt = 3;

    while (tryCnt >= 0) {
      const cmd = `adb -s ${this._name} install -r ${apkFile}`;
      const res = exec(cmd);
      log.v(TAG, 'Installed', res);
      const isOffline = res.indexOf('device offline') >= 0;
      if (isOffline) {
        await delay(1000);
      } else {
        const isSuccess = res.indexOf('Success') >= 0;
        if (isSuccess) {
          break;
        } else {
          log.e(TAG, `ERROR: Failed install apk [${apkFile}]`);
          process.exit(-1);
        }
      }
      tryCnt--;
    }
  }


  startApp(packageName: string, activityName: string) {
    log.v(TAG, `Starting application [${packageName}]`);

    const cmd = `adb -s ${this._name} shell am start -n ${packageName}/${activityName}`;
    const result = exec(cmd);

    if (result.indexOf('does not exist') >= 0 || result.indexOf('Error') >= 0) {
      log.e(TAG, `Cannot start [${packageName}] with activity [${activityName}]`);
      process.exit(-1);
    }

    log.v(TAG, 'Application started');
  }
}

export default AndroidDevice;
