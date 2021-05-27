/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import exec from '../exec';
import isCommand from '../isCommand';

export default process.env.ANDROID_EMULATOR
  || (isCommand('emulator') ? 'emulator' : undefined)
  || (
    exec('uname -s').trim() === 'Darwin'
      ? `${process.env.HOME || ''}/Library/Android/sdk/emulator/emulator`
      : 'emulator');
