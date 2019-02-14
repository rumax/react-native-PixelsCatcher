#!/bin/bash
set -x
set -e

cd android
rm -rf build .gradle/ app/build
./gradlew assembleDebug -DentryFile="indexSnapshot.js" -DbundleInDebug=true
cd ..

../node_modules/.bin/flow-node ../src/runner/cli.js ios debug
