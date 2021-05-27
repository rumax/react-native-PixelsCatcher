# pixels-catcher

[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/rumax/react-native-PixelsCatcher)
[![npm version](https://badge.fury.io/js/pixels-catcher.svg)](https://badge.fury.io/js/pixels-catcher)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Build Status](https://tfsprodweu6.visualstudio.com/A94b22b53-118f-4630-a94a-6d5bd33d6515/react-native-PixelsCatcher/_apis/build/status/rumax.react-native-PixelsCatcher?branchName=master)](https://tfsprodweu6.visualstudio.com/A94b22b53-118f-4630-a94a-6d5bd33d6515/react-native-PixelsCatcher/_build/latest?definitionId=1&branchName=master)

Library for testing React Native UI components and screens

## Getting started

### Install and link

    $ npm install pixels-catcher --save-dev

or

    $ yarn add pixels-catcher

The library depends on
[react-native-save-view](https://www.npmjs.com/package/react-native-save-view)
which is used to convert `View` to base64 data and has native implementation.
Starting from [RN 0.60](https://github.com/facebook/react-native/releases/tag/v0.60.0) there is no need to link - [Native Modules are now Autolinked](https://facebook.github.io/react-native/blog/2019/07/03/version-60), otherwise check
[official react native documentation](https://facebook.github.io/react-native/docs/linking-libraries-ios).

*Note: [react-native-save-view](https://www.npmjs.com/package/react-native-save-view) can be added to devDependencies of you project, otherwise auto-linking may not work. Check the version in [package.json](https://github.com/rumax/react-native-PixelsCatcher/blob/master/package.json#L31)*

### Create test

Create new entry file, for example, `indexSnapshot`, and import
`registerSnapshot`, `runSnapshots` and `Snapshot` from `pixels-catcher`:

```
import {
  registerSnapshot,
  runSnapshots,
  Snapshot,
} from 'pixels-catcher';
```

After that create the snapshot component, which should extend `Snapshot` and
implement `static snapshotName` and `renderContent` method. Be sure that your
component can accept `collapsable` property, otherwise React can make an
optimization and drop the view. The implementation can be:

```
class AppSnapshot extends Snapshot {
  static snapshotName = 'AppSnapshot';

  renderContent() {
    return (<App />);
  }
}
```

after that register `AppSnapshot` component:

```
registerSnapshot(AppSnapshot);
```

and trigger `runSnapshots` which will register the application component and
run all snapshots:

```
runSnapshots(PUT_YOUR_APP_NAME_HERE);
```

Snapshots testing will be started as soon as the application is started.

Each `Snapshot` gets `onReady` property that is triggered after all
interactions ([InteractionManager](https://reactnative.dev/docs/interactionmanager)) are completed. In case if it is not enough, which can be some network requests, etc., it is possible to do:

  * register animations by creating an interaction 'handle' and clearing it upon completion
  * override `componentDidMount` of the `Snapshot` and call `onReady` whenever you need it. `WebViewTest` in [demo](https://github.com/rumax/react-native-PixelsCatcher/blob/master/demo/indexSnapshot.js) project for more details

### React Native Navigation support

Register your component and `Navigation.setRoot` using `registerComponent`
property in `runSnapshots`:

```
runSnapshots(appName, {
  registerComponent: snapshot => {
    Navigation.registerComponent(appName, () => snapshot)

    Navigation.events().registerAppLaunchedListener(async () => {
      Navigation.setRoot({
        root: {
          stack: {
            children: [
              {
                component: {
                  name: appName,
                },
              },
            ],
          },
        },
      })
    })
  },
})
```

### Configuration

There are two options to define config:

  - Using `pixels-catcher.json` file in the root of the project
  - Using `package.json` file with new property `PixelsCatcher`

And both of these two options should describe the configuration according to the
following format:

```
PixelsCatcher: {
  PLATFORM: {
    ...SHARED_CONFIGURATION,
    CONFIGURATION: {
      ...CONFIGURATION_SPECIFIC
    }
  },
  logLevel: number,
  timeout: number,
  canStopDevice: boolean
}
```

where

  - `PLATFORM` can be `android` or `ios`
  - `CONFIGURATION` is a configuration with the following properties:
    * `activityName` - (*Android only*) Activity name, example: com.demo.MainActivity.
    * `appFile` - (*Optional*) Path to apk file on android or app folder on iOS,
      example: ./app/build/outputs/apk/debug/app-debug.apk
    * `deviceName` - Device name, for example emulator: Nexus_5X or iOS:
      iPhone 8 Plus
    * `deviceParams` - (*Optional*) Array of emulator params like -no-audio,
      -no-snapshot, -no-window, etc.
    * `physicalDevice` - (*Optional*) Boolean value that indicates if real device should be used (*iOS devices are not supported yet*)
    * `packageName` -
        **Android** package name, example: *com.demo**.
        **iOS** bundle identifier, example: *org.reactjs.native.example.demo*
    * `snapshotsPath` - Path to snapshots, example: ./snapshotsImages
    * `port` - Server port. Default value is `3000`
    * `locale` - Locale to be used, for example `uk-UA`, `nl-NL`, etc. At this moment supported only on iOS simulators. ([Pull request welcome](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) for android implementation)
  - `SHARED_CONFIGURATION`. In case more that one configurations exists, shared parameters can be moved here.
  - `logLevel` - log levels: `e`, `w`, `i`, `d`, `v`. This corresponds to ERROR, WARN, INFO, DEBUG, VERBOSE
  - `timeout` - tests timeout, with default value 2500ms. If timeout is reached, tests will fail automatically
  - `canStopDevice` [Optional] Boolean parameter that allows to stop device (used to restart simulator/emulator). If set to false, the runner will start a new simulator/emulator if none is started. If a simulator/emulator is already started, it will be used for tests. The runner will also stop the device after tests. **If set to "false" it is possible that wrong device will be used!**. Default value is `true`.

Example for `package.json` configuration (or check
[demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) project):

```
"PixelsCatcher": {
  "android": {
    "activityName": "MainActivity",
    "deviceName": "Nexus_5X",
    "packageName": "com.rumax.pixelscatcher.testapp",
    "snapshotsPath": "./snapshotsImages",
    "debug": {
      "deviceParams": ["-no-audio", "-no-snapshot"],
      "appFile": "./android/app/build/outputs/apk/debug/app-debug.apk"
    },
    "release": {
      "deviceParams": ["-no-audio", "-no-snapshot", "-no-window"],
      "appFile": "./android/app/build/outputs/apk/debug/app-debug.apk"
    }
  },
  "ios": {
    "deviceName": "iPhone 8 Plus",
    "packageName": "org.reactjs.native.example.testApp",
    "snapshotsPath": "./snapshotsImagesIOS",
    "dev": {},
    "debug": {
      "appFile": "./ios/build/Build/Products/Debug-iphonesimulator/testApp.app"
    }
  }
}
```

### Run android

*To run android emulator, [emulator command](https://developer.android.com/studio/run/emulator-commandline) is used. It has to be defined in the system PATH or an `ANDROID_EMULATOR` system variable can be used to specify it. If none is defined, it will try to fallback to `~/Library/Android/sdk/emulator/emulator` on mac*

There are two options to run UI snapshots:

  1) Using the generated `apk` file, provided via the `appFile`. In this case
     pixels-catcher will open android emulator, install `apk` file, execute all
     the tests and will provide a report at the end. This scenario can be used
     to integrate the screenshot testing with CI.

  2) In cases `appFile` is not defined, the development mode will be used. This
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

Same as android there are two options to run UI snapshots:

  1) Using the generated app, provided via the `appFile`. In this case
     pixels-catcher will open iOS simulator, install `app`, execute all
     the tests and will provide a report at the end. This scenario can be used
     to integrate the screenshot testing with CI.

  2) In cases `appFile` is not defined, the development mode will be used. This
     means that only the server will be started and the application should be
     started manually. This scenario can be used to debug snapshots, create new
     reference images, etc.

To run tests execute the following command:

```
$ ./node_modules/.bin/pixels-catcher ios debug
```

#### Generating iOS app

To make a valid app you will need to do the following actions:

  - Set the `FORCE_BUNDLING` environment variable, which is required to generate
    a bundle file
  - Set `RCT_NO_LAUNCH_PACKAGER` to ignore the packager
  - Use different entry file which includes only snapshots or some flag that
    will switch your app to "testing" mode

You can also check the `demo` project and check the required changes.

### Run device

While android emulator or iOS simulator is able to work with localhost with default values `http://10.0.2.2:3000` for android and `http://127.0.0.1:3000` for iOS, using the real device will require connecting to the server by real IP. To make it possible, `pixels-catcher` allows to define it using the `baseUrl` property that is passed to the `runSnapshots` method:

```
const baseUrl = 'http://127.0.0.1:3000';

// Snapshots implementation

runSnapshots(appName, { baseUrl });
```

### JUnit test report

Each run of tests produces a JUnit test report that is generated and available in `junit.xml` file. For integrating it with Azure DevOps, follow the [Azure DevOps and React Native UI testing](https://itnext.io/azure-devops-and-react-native-ui-testing-8144ba1a9eb) article that describes how to automate iOS testing or [Azure DevOps and React Native UI testing part 2 - Android](https://itnext.io/azure-devops-and-react-native-ui-testing-part-2-android-580c44d8c7ec) for Android.

JUnit test report does not specify attachments, but to upload attachments to test report use third parameter `azureAttachments`. This can be done with azure task:

```
script: ./node_modules/.bin/pixels-catcher ios debug azureAttachments
  condition: failed()
  env:
    SYSTEM_ACCESSTOKEN: $(System.AccessToken)
  workingDirectory: '$(Build.SourcesDirectory)/demo'
  displayName: 'Upload screenshots'
```

that has to be executed after `PublishTestResults@2` task. In this case the `pixels-catcher` will be started with the same parameters that were used for tests and will upload attachments for filed tests.

![Azure DevOps Test Results](https://raw.githubusercontent.com/rumax/react-native-PixelsCatcher/master/res/testResults.png)

## Demo
Check the [demo](https://github.com/rumax/PixelsCatcher/tree/master/demo) which
includes an example how the snapshots can be done and also has some useful
scripts that can be used to integrate with CI.

Log report:

```bash
==> All tests completed: <==
┌─────────┬──────────────────────────────┬──────────┬───────┬────────────┬────────────────────────────────────┐
│ (index) │             name             │  status  │ time  │ renderTime │              failure               │
├─────────┼──────────────────────────────┼──────────┼───────┼────────────┼────────────────────────────────────┤
│    0    │        'AppSnapshot'         │ 'PASSED' │ 0.909 │    0.13    │                 ''                 │
│    1    │ 'AppSnapshotWithWrongRefImg' │ 'FAILED' │ 1.116 │   0.054    │ 'Files mismatch with 5088 pixels'  │
│    2    │       'someComponent'        │ 'PASSED' │ 0.684 │   0.019    │                 ''                 │
│    3    │        'WebViewTest'         │ 'FAILED' │ 3.123 │   2.697    │ 'Files mismatch with 19930 pixels' │
│    4    │        'longContent'         │ 'PASSED' │ 0.793 │   0.017    │                 ''                 │
└─────────┴──────────────────────────────┴──────────┴───────┴────────────┴────────────────────────────────────┘

==> Summary: <==
┌─────────┬───────────────────┬────────────────────────┐
│ (index) │         0         │           1            │
├─────────┼───────────────────┼────────────────────────┤
│    0    │   'Total tests'   │           5            │
│    1    │  'Passed tests'   │           3            │
│    2    │  'Skipped tests'  │           0            │
│    3    │  'Failed tests'   │           2            │
│    4    │ 'Min render time' │  '17ms (longContent)'  │
│    5    │ 'Max render time' │ '2697ms (WebViewTest)' │
└─────────┴───────────────────┴────────────────────────┘
==> Failed tests: <==
┌─────────┬──────────────────────────────┐
│ (index) │            Values            │
├─────────┼──────────────────────────────┤
│    0    │ 'AppSnapshotWithWrongRefImg' │
│    1    │        'WebViewTest'         │
└─────────┴──────────────────────────────┘
```

junit report:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="UI tests for ios/iPhone 8 Plus" tests="4" skipped="0" errors="0" failures="0" time="4261" >
  <testsuite name="UI tests for ios/iPhone 8 Plus" tests="4" skipped="0" errors="0" failures="0" time="4261" >
    <testcase classname="AppSnapshot" name="AppSnapshot" time="989">
    </testcase>
    <testcase classname="someComponent" name="someComponent" time="738">
    </testcase>
    <testcase classname="WebViewTest" name="WebViewTest" time="1678">
    </testcase>
    <testcase classname="longContent" name="longContent" time="856">
    </testcase>
  </testsuites>
</testsuites>
```

Azure Devops integration result

![Azure Devops](https://raw.githubusercontent.com/rumax/react-native-PixelsCatcher/master/res/azureDevops.png)

## License

[MIT](https://opensource.org/licenses/MIT)

## Author

  - [rumax](https://github.com/rumax)

### Other information

  - If you think that something is missing or would like to propose new feature,
  please, discuss it with the author
  - Please, ⭐️ the project. This gives the confidence that you like it and a
  great job was done by publishing and supporting it 🤩
