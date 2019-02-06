#!/bin/bash

cd android
rm -rf build .gradle/ app/build
./gradlew assembleRelease -DentryFile="indexSnapshot.js"
cd ..
./node_modules/.bin/pixels-catcher android release
