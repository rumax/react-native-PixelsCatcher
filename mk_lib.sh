#!/bin/bash
OUTPUT="lib"
CMD="./node_modules/.bin/flow-remove-types"

rm -rf $OUTPUT
mkdir $OUTPUT

function removeTypes {
  $CMD $1 --pretty --out-file $OUTPUT/$1
}

function copy {
  cp $1 $OUTPUT/$1
}

removeTypes "cli.js"

mkdir $OUTPUT/utils
removeTypes "utils/AndroidEmulator.js"
removeTypes "utils/delay.js"
removeTypes "utils/exec.js"
removeTypes "utils/log.js"

mkdir $OUTPUT/server
removeTypes "server/compareImages.js"
removeTypes "server/server.js"
copy "server/dummy.png"
