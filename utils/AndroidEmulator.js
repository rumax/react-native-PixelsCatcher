const { spawn } = require('child_process');
const exec = require('./exec');
const delay = require('./delay');
const log = require('./log');

const TAG = 'EAGLE_EYE::UTIL_EMULATOR';
const EMULATOR_CMD = `${process.env.HOME}/Library/Android/sdk/emulator/emulator`;

class AndroidEmulator {
  constructor(emulatorName) {
    this._name = emulatorName;
  }


  _getDevices() {
    const cmd = 'emulator -avd -list-avds';
    const devices = exec(cmd).split('\n')
      .filter(line => Boolean(line));

    return devices;
  }


  _isDeviceAvailable() {
    const devices = this._getDevices();
    let isAvailable = false;

    for (let ind = devices.length - 1; ind >= 0; --ind) {
      if (devices[ind].indexOf(this._name) >= 0) {
        isAvailable = true;
        break;
      }
    }

    return isAvailable;
  }


  _getActiveDevice() {
    log.v(TAG, 'Get active device');
    const device = exec('adb devices').split('\n')
      .filter(line => line.indexOf('emulator') === 0)[0];

    if (!device) {
      log.v(TAG, 'No active devices');
      return undefined;
    }
    const name = device.split('\t')[0];

    log.v(TAG, 'Active device', name);
    return name;
  }


  async start(params = []) {
    if (!this._isDeviceAvailable(this._name)) {
      log.e(TAG, `Invalid name provided [${this._name}], check that the name is \
  correct and device is available. Available devices:
  ${this._getDevices().map(device => `  - ${device}`).join('\n')}`);
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
    ].filter(value => Boolean(value)));

    let deviceBooted = false;

    result.stdout.on('data', (data) => {
      log.d(TAG, `stdout: ${data}`);
      if (data.indexOf('boot completed') >= 0) {
        deviceBooted = true;
      }
    });

    result.stderr.on('data', (data) => {
      log.e(TAG, `Failed to load emulator, stderr: ${data}`);
      process.exit(-1);
    });

    result.on('close', (code) => {
      log.v(TAG, `on close: child process exited with code ${code}`);
    });

    let tryCnt = 30;

    while (--tryCnt >= 0 && !deviceBooted) {
      log.v(TAG, 'availting when device is booted');
      await delay(1000);
    }

    if (!deviceBooted) {
      log.e(TAG, 'Failed to load emulator in 30 seconds. Check your emulator. Or try to tun it with "-no-snapshot"');
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


  isPackageInstalled(packageName) {
    const cmd = 'adb shell pm list packages';

    log.v(TAG, `Checking if [${packageName}] is installed`);

    const allPackages = exec(cmd);
    const isInstalled = allPackages.indexOf(packageName) >= 0;

    log.v(TAG, `Package [${packageName}] is ${isInstalled ? 'Installed' : 'Not installed'}`);

    return isInstalled;
  }


  async uninstallApk(pakageName) {
    log.v(TAG, `Uninstalling ${pakageName}`);
    const isInstalled = await this.isPackageInstalled(pakageName);
    if (isInstalled) {
      const cmd = `adb uninstall ${pakageName}`;
      exec(cmd);
    }
    log.v(TAG, 'Uninstalling completed');
  }


  async installApk(packageName, apkFile) {
    let tryCnt = 3;

    log.v(TAG, `Installing apk [${apkFile}]`);

    await this.uninstallApk(packageName);

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


  startApp(packageName, activityName) {
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
