#!/bin/bash
set -x
set -e

export ENTRY_FILE="indexSnapshot.js"
export BUNDLE_IN_DEBUG="true"

cd android
rm -rf build .gradle/ app/build
./gradlew assembleDebug
cd ..

./node_modules/.bin/pixels-catcher android debug
