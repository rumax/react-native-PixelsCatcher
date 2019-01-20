#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const server = require('./server/server');
const AndroidEmulator = require('./utils/AndroidEmulator');
const log = require('./utils/log');

const TAG = 'EAGLE_EYE';
const [,, platform, configuration] = process.argv;

if (!platform || !(platform === 'ios' || platform === 'android')) {
  log.e(TAG, `Valid platform is requred, specify "ios" or "android":

  $ pixels-catcher android debug

  or

  $ pixels-catcher ios debug
  `);
  process.exit(-1);
}
if (platform === 'ios') {
  log.e(TAG, 'iOS platform is not supported yet');
  process.exit(-1);
}

if (!configuration) {
  log.e(TAG, `Configuration is required. Example:

  $ pixels-catcher android debug
`);
  process.exit(-1);
}

log.i(TAG, `Starting snapshots with [${configuration}] configuration for [${platform}]`);

const projectPackageFile = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(projectPackageFile)) {
  log.e(TAG, `Cannot find package.jon file [${projectPackageFile}]. Check that \
you started the script from the root of your application`);
  process.exit(-1);
}

const projectPackage = JSON.parse(fs.readFileSync(projectPackageFile, 'utf8'));
const config = (projectPackage.PixelsCatcher || {})[platform];

if (!config) {
  log.e(TAG, `Cannot find "PixelsCatcher.${platform}" in package.json`);
  process.exit(-1);
}

const activityName = config[configuration].activityName || config.activityName || 'MainActivity';
const apkFile = config[configuration].apkFile || config.apkFile;
const emulatorName = config[configuration].emulatorName || config.emulatorName;
const emulatorParams = config[configuration].emulatorParams || config.emulatorParams;
const packageName = config[configuration].packageName || config.packageName;
const snapshotsPath = config[configuration].snapshotsPath || config.snapshotsPath;

const DEV_MODE = !apkFile;

log.i(TAG, 'Starting in development mode');

log.i(TAG, `Using config:
  - activityName: [${activityName}]
  - apkFile: [${apkFile}]
  - emulatorName: [${emulatorName}]
  - emulatorParams: [${emulatorParams}]
  - packageName: [${packageName}]
  - snapshotsPath: [${snapshotsPath}]`);

if (!packageName) {
  log.e(TAG, 'Package name is required');
  process.exit(-1);
}

if (!emulatorName) {
  log.e(TAG, 'Valid emulator name is required');
  process.exit(-1);
}

const emulator = new AndroidEmulator(emulatorName);

let apkFileFullPath;
if (!DEV_MODE) {
  if (!apkFile) {
    log.e(TAG, 'Valid apk file is required, check config');
    process.exit(-1);
  }

  apkFileFullPath = path.isAbsolute(apkFile)
    ? apkFile : path.join(process.cwd(), apkFile);

  if (!fs.existsSync(apkFileFullPath)) {
    log.e(TAG, `Valid apk file is required, cannot find [${apkFile}] file`);
    process.exit(-1);
  }
}

const timeToSec = (ms) => {
  const sec = ms / 1000;
  return Math.round(sec * 1000) / 1000;
};

let stopByTimeoutID;

const testingCompleted = async () => {
  if (stopByTimeoutID) {
    clearTimeout(stopByTimeoutID);
  }
  if (!DEV_MODE) {
    log.i(TAG, 'Stopping the server and emulator');
    await server.stop();
    await emulator.stop();
    log.i(TAG, 'Server and emulator are stopped');
  }
};

const stopByTimeout = () => {
  if (stopByTimeoutID) {
    clearTimeout(stopByTimeoutID);
  }
  stopByTimeoutID = setTimeout(testingCompleted, 25000);
};

const onAppActivity = () => {
  stopByTimeout();
};

const onTestsCompleted = async ({ message, results }) => {
  const totalTests = results.length;
  const passedTests = results
    .filter(result => result.status !== 'PASSED')
    .length;
  log.i(TAG, `Tests completed with result:

--------------------------------------------------------------------------------
${message}

${results.map(result => `
    Name: ${result.snapshotName}
    Time: ${timeToSec(result.executionTime)} sec
    Status: ${result.status}
    Message: ${result.message || '-'}
`).join('\n')}

Total tests: ${totalTests}
Passed tests: ${passedTests}
Failed tests: ${totalTests - passedTests}
--------------------------------------------------------------------------------
`);
  testingCompleted();
};

const start = async () => {
  log.d(TAG, 'Starting server');
  await server.start(onTestsCompleted, snapshotsPath, onAppActivity);
  log.d(TAG, 'Server started');

  if (DEV_MODE) {
    log.d(TAG, 'Only server is used in DEV mode. Waiting for tests');
    return;
  }

  log.d(TAG, `Start emulator [${emulatorName}]`);
  try {
    await emulator.start(emulatorParams);
  } catch (err) {
    process.exit(-1);
  }
  log.d(TAG, 'Emulator started');

  log.d(TAG, 'Installing APK');
  await emulator.installApk(packageName, apkFileFullPath);
  log.d(TAG, 'APK installed');

  log.d(TAG, 'Starting application');
  await emulator.startApp(packageName, activityName);
  log.d(TAG, 'Application started');

  stopByTimeout();
};

start();
