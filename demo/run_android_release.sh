#!/bin/bash
set -x
set -e

export ENTRY_FILE="indexSnapshot.js"

cd android
rm -rf build .gradle/ app/build
./gradlew assembleRelease
cd ..

./node_modules/.bin/pixels-catcher android release
