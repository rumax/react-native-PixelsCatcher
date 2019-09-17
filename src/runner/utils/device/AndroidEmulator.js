/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
import type { DeviceInterface } from './DeviceInterface';

const { spawn } = require('child_process');

const exec = require('../exec');
const delay = require('../delay');
const log = require('../log');

const TAG = 'PIXELS_CATCHER::UTIL_EMULATOR';
const EMULATOR_CMD =
   process.env.ANDROID_EMULATOR
   || (
     exec('uname -s').trim() === 'Darwin'
       ? `${process.env.HOME || ''}/Library/Android/sdk/emulator/emulator`
       : 'emulator');

class AndroidEmulator implements DeviceInterface {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }


  _getDevices(): Array<string> {
    const cmd = 'emulator -avd -list-avds';
    const devices = exec(cmd).split('\n')
      .filter((line: string): boolean => Boolean(line));

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


  _getActiveDevice(): any {
    log.v(TAG, 'Get active device');
    const device = exec('adb devices').split('\n')
      .filter((line: string): boolean => line.indexOf('emulator') === 0)[0];

    if (!device) {
      log.v(TAG, 'No active devices');
      return undefined;
    }
    const name = device.split('\t')[0];

    log.v(TAG, 'Active device', name);
    return name;
  }


  async start(params: any = []) {
    if (!this._isDeviceAvailable(this._name)) {
      log.e(TAG, `Invalid name provided [${this._name}], check that the name is \
  correct and device is available. Available devices:
  ${this._getDevices().map((device: any): any => `  - ${device}`).join('\n')}`);
      throw new Error(`Invalid emulator ${this._name}`);
    }

    if (this._getActiveDevice()) {
      log.e(TAG, 'Other emulator already started, stopping it');
      await this.stop();
    }

    log.d(TAG, `Starting emulator [${this._name}]`);
    const result = spawn(EMULATOR_CMD, [
      '-avd', this._name,
      ...params,
    ].filter((value: any): any => Boolean(value)));

    let deviceBooted = false;

    result.stdout.on('data', (data: any): any => {
      log.d(TAG, `stdout: ${data}`);
      if (data.indexOf('boot completed') >= 0) {
        deviceBooted = true;
      }
    });

    result.stderr.on('data', (data: any): any => {
      // Some data appears in stderr when running the emulator first time
      const stringRepresentation = data.toString();
      if (stringRepresentation.indexOf('.avd/snapshots/default_boot/ram.img') !== -1) {
        return;
      }
      log.e(TAG, `Failed to load emulator, stderr: ${data}`);
      process.exit(-1);
    });

    result.on('close', (code: any): any => {
      log.v(TAG, `on close: child process exited with code ${code}`);
    });

    let tryCnt = 30;

    while (--tryCnt >= 0 && !deviceBooted) {
      log.v(TAG, 'awaiting when device is booted');
      await delay(1000);
    }

    if (!deviceBooted) {
      log.e(TAG, 'Failed to load emulator in 30 seconds. Check your emulator. Or try to run it with "-no-snapshot"');
      throw new Error('Device is not loaded in 30 seconds');
    }
  }


  async stop() {
    log.v(TAG, 'Stopping active device');
    try {
      exec(`adb -s ${this._getActiveDevice()} emu kill;`);
    } catch (err) {
      log.e(err.messsage);
    }
    await delay(5000);
    log.v(TAG, 'Active device stopped');
  }


  isAppInstalled(packageName: string): boolean {
    const cmd = 'adb shell pm list packages';

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
      const cmd = `adb uninstall ${name}`;
      exec(cmd);
    }
    log.v(TAG, 'Uninstalling completed');
  }


  async installApp(name: string, apkFile: string) {
    let tryCnt = 3;

    log.v(TAG, `Installing apk [${apkFile}]`);

    await this.uninstallApp(name);

    while (tryCnt-- >= 0) {
      const cmd = `adb install -r ${apkFile}`;
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
    }
  }


  startApp(packageName: string, activityName: string) {
    log.v(TAG, `Starting application [${packageName}]`);

    const cmd = `adb shell am start -n ${packageName}/${packageName}.${activityName}`;
    const result = exec(cmd);

    if (result.indexOf('does not exist') >= 0 || result.indexOf('Error') >= 0) {
      log.e(TAG, `Cannot start [${packageName}] with activity [${activityName}]`);
      process.exit(-1);
    }

    log.v(TAG, 'Application started');
  }
}

module.exports = AndroidEmulator;
