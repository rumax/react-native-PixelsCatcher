/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
const exec = require('../exec');
const isCommand = require('../isCommand');

module.exports =
  process.env.ANDROID_EMULATOR
  || (isCommand('emulator') ? 'emulator' : undefined)
  || (
    exec('uname -s').trim() === 'Darwin'
      ? `${process.env.HOME || ''}/Library/Android/sdk/emulator/emulator`
      : 'emulator');
