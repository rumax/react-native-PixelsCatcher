/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import { spawn } from 'child_process';

import exec from '../exec';
import delay from '../delay';
import log from '../log';
import emulatorCmd from './AndroidEmulatorCmd';

import type { DeviceInterface } from './DeviceInterface';

const TAG = 'PIXELS_CATCHER::UTIL_EMULATOR';

const startupErrorsDataToIgnore = [
  // Some data appears in stderr when running the emulator first time
  '.avd/snapshots/default_boot/ram.img',
  'qemu: unsupported keyboard',
  'WARNING',
];

const canIgnoreErrorData = (data: string): boolean => {
  for (let i = 0; i < startupErrorsDataToIgnore.length; ++i) {
    if (data.indexOf(startupErrorsDataToIgnore[i]) !== -1) {
      return true;
    }
  }

  return false;
};

class AndroidEmulator implements DeviceInterface {
  _name: string;

  _canStopDevice: boolean;

  constructor(name: string, canStopDevice?: boolean) {
    this._name = name;
    this._canStopDevice = Boolean(canStopDevice);
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

  async start(params: any = []): Promise<void> {
    if (!this._isDeviceAvailable(this._name)) {
      log.e(TAG, `Invalid name provided [${this._name}], check that the name is \
  correct and device is available. Available devices:
  ${this._getDevices().map((device: any): any => `  - ${device}`).join('\n')}`);
      throw new Error(`Invalid emulator ${this._name}`);
    }

    if (this._getActiveDevice()) {
      log.e(TAG, 'Other emulator already started');
      if (this._canStopDevice) {
        log.e(TAG, 'Stopping emulator');
        await this.stop();
      } else {
        log.d(TAG, 'Using active emulator');
        return;
      }
    }

    log.d(TAG, `Starting emulator [${this._name}]`);
    log.v(TAG, `cmd: ${emulatorCmd}`);
    log.v(TAG, `params: ${[
      '-avd', this._name,
      ...params,
    ].filter((value: any): any => Boolean(value))}`);
    const result = spawn(emulatorCmd, [
      '-avd', this._name,
      ...params,
    ].filter((value: any): any => Boolean(value)));

    let deviceBooted = false;

    result.stdout.on('data', (data: any): any => {
      log.d(TAG, `stdout: ${data}`);
      if (data.toString().toLowerCase().includes('boot completed')) {
        deviceBooted = true;
      }
    });

    result.stderr.on('data', (data: any): any => {
      // Some data appears in stderr when running the emulator first time
      const stringRepresentation = data.toString();
      if (canIgnoreErrorData(stringRepresentation)) {
        log.w(TAG, `Ignore: ${stringRepresentation}`);
        return;
      }
      log.e(TAG, `Failed to load emulator, stderr: ${data}`);
      process.exit(-1);
    });

    result.on('close', (code: any): any => {
      log.v(TAG, `on close: child process exited with code ${code}`);
    });

    let tryCnt = (60 * 2) / 5; // 2 minutes with 5000 delay

    while (--tryCnt >= 0 && !deviceBooted) {
      log.v(TAG, 'awaiting when device is booted');
      await delay(5000);
    }

    if (!deviceBooted) {
      log.e(TAG, 'Failed to load emulator in 30 seconds. Check your emulator. Or try to run it with "-no-snapshot"');
      throw new Error('Device is not loaded in 30 seconds');
    }
  }

  async stop(): Promise<void> {
    if (!this._canStopDevice) {
      log.v(TAG, 'Stopping device is restricted in config');
      return;
    }
    log.v(TAG, 'Stopping active device');
    try {
      exec(`adb -s ${this._getActiveDevice()} emu kill;`);
    } catch (err) {
      log.e(err instanceof Error ? err.message : 'Unknown error');
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

  async uninstallApp(name: string): Promise<void> {
    log.v(TAG, `Uninstalling ${name}`);
    const isInstalled = await this.isAppInstalled(name);
    if (isInstalled) {
      const cmd = `adb uninstall ${name}`;
      exec(cmd);
    }
    log.v(TAG, 'Uninstalling completed');
  }

  async installApp(name: string, apkFile: string): Promise<void> {
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

  startApp(packageName: string, activityName: string): void {
    log.v(TAG, `Starting application [${packageName}]`);

    const cmd = `adb shell am start -n ${packageName}/${activityName}`;
    const result = exec(cmd);

    if (result.indexOf('does not exist') >= 0 || result.indexOf('Error') >= 0) {
      log.e(TAG, `Cannot start [${packageName}] with activity [${activityName}]`);
      process.exit(-1);
    }

    log.v(TAG, 'Application started');
  }
}

export default AndroidEmulator;
