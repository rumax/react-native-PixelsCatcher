#!/usr/bin/env bash

DEVICE="Nexus 5X"
DEVICE_NAME="Nexus_5X"
SDK="system-images;android-27;default;x86_64"

# Install AVD files
echo "y" | $ANDROID_HOME/tools/bin/sdkmanager \
  --install $SDK

# Create emulator
echo "no" | $ANDROID_HOME/tools/bin/avdmanager \
  create avd \
  -n "$DEVICE_NAME" \
  --device "$DEVICE" \
  -k $SDK \
  --force

$ANDROID_HOME/emulator/emulator -list-avds

echo "Starting emulator"

# Start emulator in background
nohup $ANDROID_HOME/emulator/emulator \
  -avd $DEVICE_NAME \
  -no-snapshot > /dev/null 2>&1 &
$ANDROID_HOME/platform-tools/adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed | tr -d '\r') ]]; do sleep 1; done; input keyevent 82'

$ANDROID_HOME/platform-tools/adb devices

echo "Emulator started"
