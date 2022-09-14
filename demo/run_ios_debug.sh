#!/bin/bash
set -x
set -e

export FORCE_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

cd ios

BUILD_PATH="./build"
rm -rf $BUILD_PATH

xcrun xcodebuild \
  -scheme demo \
  -workspace demo.xcworkspace \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 14,OS=16.0' \
  -derivedDataPath $BUILD_PATH \
  ENTRY_FILE="indexSnapshot.js" \
  build

cd ..

./node_modules/.bin/pixels-catcher ios debug
