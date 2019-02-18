#!/bin/bash
OUTPUT="./lib"
SRC="./src/"
CMD="./node_modules/.bin/flow-remove-types"

rm -rf $OUTPUT
mkdir $OUTPUT

function removeTypes {
  $CMD "$SRC/$1" --pretty --out-file "$OUTPUT/$1"
}

function copy {
  cp "$SRC/$1" "$OUTPUT/$1"
}

# Runner
mkdir "$OUTPUT/runner"
mkdir "$OUTPUT/runner/utils"
mkdir "$OUTPUT/runner/utils/device"
mkdir "$OUTPUT/runner/server"

removeTypes "runner/cli.js"
chmod +x "$OUTPUT/runner/cli.js"

removeTypes "runner/utils/device/AndroidEmulator.js"
removeTypes "runner/utils/device/IOSSimulator.js"
removeTypes "runner/utils/delay.js"
removeTypes "runner/utils/exec.js"
removeTypes "runner/utils/log.js"
removeTypes "runner/utils/readConfig.js"
removeTypes "runner/utils/timeToSec.js"

removeTypes "runner/server/compareImages.js"
removeTypes "runner/server/server.js"
copy "runner/server/dummy.png"

# Client
mkdir "$OUTPUT/client"
mkdir "$OUTPUT/client/utils"

copy "client/Snapshot.js"
copy "client/SnapshotsContainer.js"
copy "client/index.js"
copy "client/snapshotsManager.js"

copy "client/utils/endOfTest.js"
copy "client/utils/network.js"
copy "client/utils/compareToReference.js"
copy "client/utils/log.js"
copy "client/utils/reporter.js"
