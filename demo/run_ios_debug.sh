#!/bin/bash
set -x
set -e

export FORCE_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

cd ios

BUILD_PATH="./build"
rm -rf $BUILD_PATH

xcrun xcodebuild \
  -scheme testApp \
  -project testApp.xcodeproj/ \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 8 Plus,OS=12.1' \
  -derivedDataPath $BUILD_PATH \
  ENTRY_FILE="indexSnapshot" \
  build

cd ..

./node_modules/.bin/pixels-catcher ios debug
