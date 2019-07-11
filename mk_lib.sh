#!/bin/bash
OUTPUT="./lib"
SRC="./src/"
CMD="./node_modules/.bin/flow-remove-types"

rm -rf $OUTPUT
mkdir $OUTPUT

function pathFromFile {
  echo "${1%/*}"
}

function copy {
  toPath="$OUTPUT/$(pathFromFile $2)"
  mkdir -p $toPath
  cp "$1" "$OUTPUT/$2"
}

function removeTypes {
  toPath="$OUTPUT/$(pathFromFile $2)"
  mkdir -p $toPath
  $CMD "$1" --pretty --out-file "$OUTPUT/$2"
}

# Runner
copy "src/runner/server/dummy.png" "runner/server/dummy.png"
files=`find ./src/runner -name '*.js'`

while read -r sourceFile; do
  outputFile=`echo "$sourceFile" | sed 's/\.\/src\///'`
  if [[ ( ${outputFile} != *"__tests__"* ) && ( ${outputFile} != *"Interface.js" ) ]]
  then
    removeTypes $sourceFile $outputFile
  fi
done <<< "$files"

# Client
files=`find ./src/client -name '*.js'`

while read -r sourceFile; do
  outputFile=`echo "$sourceFile" | sed 's/\.\/src\///'`
  if [[ ${outputFile} != *"__tests__"* ]];then
    copy $sourceFile $outputFile
  fi
done <<< "$files"
