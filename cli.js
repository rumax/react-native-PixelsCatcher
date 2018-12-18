#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const server = require('./server/server');
const emulator = require('./utils/emulator');
const log = require('./utils/log');

const [,, mode] = process.argv;

const TAG = 'EAGLE_EYE';

log.i(TAG, 'Starting snapshots');

if (mode === 'dev') {
  log.v(TAG, 'Running in development mode');
} else if (mode) {
  log.e(TAG, `Only "dev" mode is allowed. Remove all arguments to \
run in release, or provide "dev":
  - pixels-catcher     // Run releases
  - pixels-catcher dev // Run for development`);
  process.exit(-1);
}

const DEV_MODE = mode === 'dev';
const projectPackageFile = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(projectPackageFile)) {
  log.e(TAG, `Cannot find package.jon file [${projectPackageFile}]. Check that \
you started the script from the root of your application`);
  process.exit(-1);
}

const projectPackage = JSON.parse(fs.readFileSync(projectPackageFile, 'utf8'));
const config = projectPackage.PixelsCatcher;

if (!config) {
  log.e(TAG, 'Cannot find "PixelsCatcher" property in package.json');
  process.exit(-1);
}

const {
  activityName = 'MainActivity',
  apkFile,
  emulatorName,
  packageName,
  snapshotsPath,
} = config;

log.i(TAG, `Using config:
  - activityName: [${activityName}]
  - apkFile: [${apkFile}]
  - emulatorName: [${emulatorName}]
  - packageName: [${packageName}]
  - snapshotsPath: [${snapshotsPath}]`);

if (!packageName) {
  log.e(TAG, 'Package name is required');
  process.exit(-1);
}

if (!emulatorName) {
  log.e(TAG, `emulator name is required. Check PixelsCatcher config in \
package.json. Available emulators:
${emulator.getDevices().map(device => `  - ${device}`).join('\n')}`);
  process.exit(-1);
}

if (!apkFile) {
  log.e(TAG, 'Valid apk file is required, check config');
  process.exit(-1);
}

const apkFileFullPath = path.isAbsolute(apkFile)
  ? apkFile : path.join(process.cwd(), apkFile);

if (!apkFileFullPath) {
  log.e(TAG, `Valid apk file is required, cannot find [${apkFile}] file`);
  process.exit(-1);
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
  await emulator.start(emulatorName);
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
