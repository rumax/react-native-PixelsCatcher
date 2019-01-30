
# pixels-catcher

[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/rumax/react-native-PixelsCatcher)
[![npm version](https://badge.fury.io/js/pixels-catcher.svg)](https://badge.fury.io/js/pixels-catcher)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![CircleCI](https://circleci.com/gh/rumax/react-native-PixelsCatcher.svg?style=shield)](https://circleci.com/gh/rumax/react-native-PixelsCatcher)
[![codecov](https://codecov.io/gh/rumax/react-native-PixelsCatcher/branch/master/graph/badge.svg)](https://codecov.io/gh/rumax/react-native-PixelsCatcher)

Library for testing React Native UI components and screens

## Getting started

### Install and link

    $ npm install pixels-catcher --save

The library depend on [react-native-save-view](https://www.npmjs.com/package/react-native-save-view) which is used to convert `View` to base64 data and has native implementation. Therefore the linking is required and this can be easily done with the following step:

    $ react-native link react-native-save-view

If for some reasons it doesn't work, check [official react native documentation](https://facebook.github.io/react-native/docs/linking-libraries-ios).

### Create test

Create new entry file, for example, `indexSnapshot` or check the [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) project. You will need to import `registerSnapshot`, `runSnapshots` and `Snapshot` from `pixels-catcher`:

```
import {
  registerSnapshot,
  runSnapshots,
  Snapshot,
} from 'pixels-catcher';
```

After that create the snapshot component, which should extend `Snapshot` and implement `static snapshotName` and `renderContent` method. Be sure that your component can accept `collapsable` property, otherwise React can does optimization and drop the view. The implementation can be:

```
class AppSnapshot extends Snapshot {
  static snapshotName = 'AppSnapshot';

  renderContent() {
    return (<App />);
  }
}
```

after that register it:

```
registerSnapshot(AppSnapshot);
```

and run snapshots:

```
runSnapshots(PUT_YOUR_APP_NAME_HERE);
```

Snapshots testing will be started as soon as the application is started.

### Configuration

In `package.json` add the following the `PixelsCatcher` sections according to
the following format:

```
PixelsCatcher: {
  PLATFORM: {
    ...SHARED_CONFIGURATION,
    CONFIGURATION: {
      ...CONFIGURATION_SPECIFIC
    }
  }
}
```

where

  - `PLATFORM` can be `android` or `ios`
  - `CONFIGURATION` is a configuration with the following properties:
    - `activityName` - Activity name, example: MainActivity.
    - `apkFile` - [Optional] Path to apk file, example: ./app/build/outputs/apk/debug/app-debug.apk
    - `emulatorName` - Emulator name, example: test
    - `emulatorParams` - [Optional] Array of emulator params like -no-audio, -no-snapshot, -no-window, etc.
    - `packageName` - Android package name, example: com.rumax.pixelscatcher.testapp
    - `snapshotsPath` - Path to snapshots, example: ./snapshotsImages
  - `SHARED_CONFIGURATION`. In case more that one configurations exists, shared
    parameters can be moved here.

Example (or check [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) project):

```
"PixelsCatcher": {
  "android": {
    "activityName": "MainActivity",
    "emulatorName": "test",
    "packageName": "com.rumax.pixelscatcher.testapp",
    "snapshotsPath": "./snapshotsImages",
    "debug": {
      "emulatorParams": ["-no-audio", "-no-snapshot"],
      "apkFile": "./android/app/build/outputs/apk/debug/app-debug.apk"
    },
    "release": {
      "emulatorParams": ["-no-audio", "-no-snapshot", "-no-window"],
      "apkFile": "./android/app/build/outputs/apk/debug/app-debug.apk"
    }
  },
  "ios": { ... }
}
```

### Run android

There are two options to run UI snapshots:

  1) Using the generated apk file, provided via the `apkFile`. In this case
     pixels-catcher will open android emulator, install `apk` file, execute all
     the tests and will provide a report at the end. This scenario can be used
     to integrate the screenshot testing with CI.

  2) In cases `apkFile` is not defined, the development mode will be used. This
     means that only the server will be started and the application should be
     started manually. This scenario can be used to debug snapshots, create
     new reference images, etc.

To run tests execute the following command:

```
$ ./node_modules/.bin/pixels-catcher android debug
```

#### Generating APK file

By default the `index.android.js` file is used which refer to your application.
To fix it, in `android/app/build.gradle` add the following config:

```
project.ext.react = [
    entryFile: System.getProperty("entryFile") ?: "index.js",
    bundleInDebug: System.getProperty("bundleInDebug") ? System.getProperty("bundleInDebug").toBoolean() : false
]
```

And generate the `apk`:

```
cd android && ./gradlew assembleDebug -DentryFile="indexSnapshot.js"
```

### Run iOS

iOS i not supported yet.

## Demo
Check the [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) which includes an example how the snapshots can be done and also has some useful scripts that can be used to integrate with CI.

## License

[MIT](https://opensource.org/licenses/MIT)

## Author

  - [rumax](https://github.com/rumax)

### Other information

  - If you think that something is missing or would like to propose new feature, please, discuss it with the author
  - Please, ⭐️ the project. This gives the confidence that you like it and a great job was done by publishing and supporting it 🤩
