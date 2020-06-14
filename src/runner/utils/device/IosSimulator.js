/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
import type { DeviceInterface, StartParamsType } from './DeviceInterface';

const exec = require('../exec');
const log = require('../log');
const delay = require('../delay');

const TAG = 'PIXELS_CATCHER::UTIL_SIMULATOR';

type DeviceType = {
  availability: string,
  state: string,
  isAvailable: boolean,
  name: string,
  udid: string,
  availabilityError: string,
};

class IOSSimulator implements DeviceInterface {
  _name: string;

  _canStopDevice: boolean;

  constructor(name: string, canStopDevice?: boolean) {
    this._name = name;
    this._canStopDevice = Boolean(canStopDevice);
  }


  _getAvailableDevices(): Array<DeviceType> {
    const cmd = 'xcrun simctl list --json';
    const response = JSON.parse(exec(cmd));
    const { devices } = response;
    const availableDevices = [];

    Object.keys(devices).forEach((name: string) => {
      devices[name].forEach((device: DeviceType) => {
        if (device.isAvailable) {
          availableDevices.push(device);
        }
      });
    });

    return availableDevices;
  }


  _getDeviceByName(name: string): DeviceType | void {
    const devices = this._getAvailableDevices();
    let device;

    for (let ind = devices.length - 1; ind >= 0; --ind) {
      if (devices[ind].name === name) {
        device = devices[ind];
        break;
      }
    }

    return device;
  }


  _getDeviceByUid(uid: string): DeviceType | void {
    const devices = this._getAvailableDevices();
    let device;

    for (let ind = devices.length - 1; ind >= 0; --ind) {
      if (devices[ind].udid === uid) {
        device = devices[ind];
        break;
      }
    }

    return device;
  }


  _getDeviceWithStatus(status: string): DeviceType | void {
    const devices = this._getAvailableDevices();
    let device;

    for (let ind = devices.length - 1; ind >= 0; --ind) {
      if (devices[ind].state === status) {
        device = devices[ind];
        break;
      }
    }

    return device;
  }


  _getUid(name: string): string | void {
    const device = this._getDeviceByName(name);
    log.v(TAG, `Device ${name} is:`, device);
    return device ? device.udid : undefined;
  }


  async _boot(uid: string) {
    const device = this._getDeviceByUid(uid);
    if (!device) {
      throw new Error(`Invalid device uid [${uid}], cannot find it`);
    }
    if (device.state === 'Booted') {
      log.i(TAG, `Device [${device.name}] already booted`);
      return;
    }
    const response = exec(`xcrun simctl boot ${uid}`);
    if (response) {
      log.v(TAG, 'boot response:', response);
    }
  }


  async _open(uid: string) {
    const activeXcode = exec('xcode-select -p').trim();
    log.v(TAG, `Active Xcode: ${activeXcode}`);
    const simulatorApp = `${activeXcode}/Applications/Simulator.app`;
    log.v(TAG, `starting ${simulatorApp}`);
    exec(`open -a ${simulatorApp} --args -CurrentDeviceUDID ${uid}`);
    log.v(TAG, 'started');
  }


  async start(params: StartParamsType) {
    log.v(TAG, 'Starting device with params:', params);

    this.stop();

    const uid = this._getUid(this._name);
    log.i(TAG, `Uid of the devive is [${uid || '-'}]`);

    if (!uid) {
      throw new Error(`Invalid simulator [${this._name}], cannot find uid`);
    }

    await this._boot(uid);
    await this._open(uid);

    log.v(TAG, 'Device started', this._getDeviceByUid(uid));
  }


  isAppInstalled(appName: string) {
    log.v(`isAppInstalled: appName [${appName}]`);
    return false;
  }


  async installApp(appName: string, appFile: string) {
    this.uninstallApp(appName);
    log.v(TAG, `Installing application [${appName}], appFile [${appFile}]`);
    exec(`xcrun simctl install booted ${appFile}`);
  }


  startApp(appName: string, activityName: string, locale?: string) {
    const withLocale = locale ? `-AppleLanguages "(${locale})"` : '';
    log.v(TAG, `startApp: appName [${appName}], activityName [${activityName}], locale [${locale || '-'}]`);
    exec(`xcrun simctl launch booted ${appName} ${withLocale}`);
  }


  async uninstallApp(appName: string) {
    log.v(TAG, `Uninstalling application [${appName}]`);
    exec(`xcrun simctl uninstall booted ${appName}`);
  }


  async stop() {
    if (!this._canStopDevice) {
      log.v(TAG, 'Stopping device is restricted in config');
      return;
    }

    log.v(TAG, 'Stopping all devices');

    exec('osascript -e \'tell application "iOS Simulator" to quit\'');
    exec('osascript -e \'tell application "Simulator" to quit\'');

    let device = this._getDeviceWithStatus('Shutting Down');

    while (device) {
      log.v(TAG, `Awaiting for shutdown completed (Device ${device.name} has ` +
        `state ${device.state})`);
      await delay(1000);
      device = this._getDeviceWithStatus('Shutting Down');
    }

    log.v(TAG, 'Devices stopped');
  }
}

module.exports = IOSSimulator;
