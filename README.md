
# pixels-catcher

[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/rumax/react-native-PixelsCatcher)
[![npm version](https://badge.fury.io/js/pixels-catcher.svg)](https://badge.fury.io/js/pixels-catcher)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![CircleCI](https://circleci.com/gh/rumax/react-native-PixelsCatcher.svg?style=shield)](https://circleci.com/gh/rumax/react-native-PixelsCatcher)

 Library for testing React Native UI components and screens

## Getting started

### Install and link

`$ npm install pixels-catcher --save`

For the application integration only [react-native-save-view](https://www.npmjs.com/package/react-native-save-view) is used which is required to convert `View` to base64 data and has native implementation. Therefore the linking is required and this can be easily done with the following steps:

  1) In `android/settings.gradle` file include the dependency:
```
include ':react-native-save-view'
project(':react-native-save-view').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-save-view/android')
```
  2) In `android/app/build.gradle` file add:
```
dependencies {
    compile project(':react-native-save-view') // <-- This
    ...
}
```
  3) And finally in `android/app/src/main/java/com/.../MainApplication.java` add it to packages list
```
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
      new MainReactPackage(),
      new SaveViewPackage() // <-- This
  );
}
```

### Create test

Create new entry file, for example, `indexSnapshot` or check the [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) project. You will need to import `registerSnapshot`, `runSnapshots` and `Snapshot` from `pixels-catcher`:

```
import {
  registerSnapshot,
  runSnapshots,
  Snapshot,
} from 'pixels-catcher';
```

After that create the snapshot component, which should extend `Snapshot` and implement `static snapshotName` and `renderContent` method. The implementation can be:

```
class AppSnapshot extends Snapshot<*, *> {
  static snapshotName = 'AppSnapshot';

  renderContent() {
    return (
      <App />
    );
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

In `package.json` add the following section (change the values according to your project, or check [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) project):

```json
"PixelsCatcher": {
  "activityName" : "ACTIVITY_NAME",
  "apkFile"      : "PATH_TO_APK_FILE",
  "emulatorName" : "EMULATOR_NAME",
  "packageName"  : "ANDROID_PACKAGE_NAME",
  "snapshotsPath": "PATH_TO_SNAPSHOTS_FILES"
}
```

### Run

There are two options to run UI snapshots:

  1) Using the generated api file, provided via `PixelsCatcher.packageName`. This case can be useful for CI, for example. To run the test all what you need is to execute the following command in the command line:

      `./node_modules/.bin/pixels-catcher`

  This command will open android emulator, install apk file and execute all tests, providing report at the end.

  By default the `index.android.js` file is used which refer to your application. To fix it, in the `android/app/build.gradle` add the following config

```
project.ext.react = [
    entryFile: System.getProperty("entryFile") ?: "index.js",
    bundleInDebug: System.getProperty("bundleInDebug") ?: true
]
```

  And generate the apk as following:

```
cd android && ./gradlew assembleDebug -DentryFile="indexSnapshot.js"
```

  2) Using development mode and react native development server. In this case you need to run the `PixelsCatcher` in development mode:

      `./node_modules/.bin/pixels-catcher dev`

  This will start only server and you can run the test as many times as you need, by reloading the app.

  Also verify that you use `indexSnapshot` instead of your default entry point.

## Demo
Check the [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) which includes an example how the snapshots can be done and also has some useful scripts that can be used to integrate with CI.

## License

[MIT](https://opensource.org/licenses/MIT)

## TODO:
  - iOS

## Author

  - [rumax](https://github.com/rumax)

### Other information

  - If you think that something is missing or would like to propose new feature, please, discuss it with the author
  - Please, ⭐️ the project. This gives the confidence that you like it and a great job was done by publishing and supporting it 🤩
