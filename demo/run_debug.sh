#!/bin/bash

cd android
rm -rf build .gradle/ app/build
./gradlew assembleDebug -DentryFile="indexSnapshot.js" -DbundleInDebug=true
cd ..
./node_modules/.bin/pixels-catcher android debug
