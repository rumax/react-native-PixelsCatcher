#!/bin/bash

cd android
rm -rf build .gradle/ app/build
./gradlew assembleRelease -DentryFile="indexSnapshot.js"
adb install -r ./app/build/outputs/apk/release/app-release.apk
cd ..
./node_modules/.bin/pixels-catcher
