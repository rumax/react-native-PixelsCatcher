const { spawn } = require('child_process');
const exec = require('./exec');
const delay = require('./delay');
const log = require('./log');

const TAG = 'EAGLE_EYE::UTIL_EMULATOR';

const EMULATOR_CMD = `${process.env.HOME}/Library/Android/sdk/emulator/emulator`;

const getDevices = () => {
  const cmd = 'emulator -avd -list-avds';
  const devices = exec(cmd).split('\n')
    .filter(line => Boolean(line));
  return devices;
};

const isDeviceAvailable = name => getDevices().indexOf(name) >= 0;

const getActiveDevice = () => {
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
};

const stop = async () => {
  log.v(TAG, 'Stopping active device');
  try {
    exec(`adb -s ${getActiveDevice()} emu kill;`);
  } catch (err) {
    log.e(err.messsage);
  }
  await delay(5000);
  log.v(TAG, 'Active device stopped');
};

const start = async (name, params) => {
  if (!isDeviceAvailable(name)) {
    log.e(TAG, `Invalid name provided [${name}], check that the name is \
correct and device is available. Available devices:
${getDevices().map(device => `  - ${device}`).join('\n')}`);
    process.exit(-1);
  }

  if (getActiveDevice()) {
    log.e(TAG, 'Other emulator already started, stopping it');
    await stop();
  }

  log.d(TAG, `Starting emulator [${name}]`);
  const result = spawn(EMULATOR_CMD, [
    '-avd', name,
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
    log.e(TAG, 'Failed to load emulator in 30 seconds. Check your emulator.');
    process.exit(-1);
  }
};

const isPackageInstalled = async (packageName) => {
  const cmd = 'adb shell pm list packages';

  log.v(TAG, `Checking if [${packageName}] is installed`);

  const allPackages = exec(cmd);
  log.v(TAG, `Result [${allPackages}]`);

  const isInstalled = allPackages.indexOf(packageName) >= 0;

  log.v(TAG, `Package [${packageName}] is ${isInstalled ? 'Installed' : 'Not installed'}`);

  return isInstalled;
};

const uninstallApk = async (pakageName) => {
  log.v(TAG, `Uninstalling old apk for package [${pakageName}]`);
  if (await isPackageInstalled(pakageName)) {
    const cmd = `adb uninstall ${pakageName}`;
    exec(cmd);
  }
  log.v(TAG, 'Uninstall old apk OK');
};

const installApk = async (packageName, apkFile) => {
  let tryCnt = 3;

  log.v(TAG, `Installing apk [${apkFile}]`);

  await uninstallApk(packageName);

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
};

const startApp = async (packageName, activityName) => {
  log.v(TAG, `Starting application [${packageName}]`);

  const cmd = `adb shell am start -n ${packageName}/${packageName}.${activityName}`;
  const result = exec(cmd);

  if (result.indexOf('does not exist') >= 0 || result.indexOf('Error') >= 0) {
    log.e(TAG, `Cannot start [${packageName}] with activity [${activityName}]`);
    process.exit(-1);
  }

  log.v(TAG, 'Application started');
};

module.exports = {
  start,
  stop,
  getDevices,
  installApk,
  startApp,
};
