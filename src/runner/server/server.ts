/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import * as formidable from 'formidable';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

import compareImages from './compareImages';
import log from '../utils/log';

import type Reporter from '../utils/Reporter';

const DEFAULT_PORT = 3000;
const TAG = 'PIXELS_CATCHER::SERVER';
const RESPONSE_OK = JSON.stringify({ result: 'OK' });

let server: any;
let sockets: any = {};
let nextSocketId = 0;

const mkDir = (dirName: string) => {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
};

const postHandlers: any = {
  '/base64': ({ res, fields, snapshotsPath }: any) => {
    const { base64, fileName } = fields;
    log.i(TAG, `Processing base64 data for file [${fileName}]`);
    const snapshotsPathAbs = path.isAbsolute(snapshotsPath)
      ? snapshotsPath : path.join(process.cwd(), snapshotsPath);
    const snapshotPath = path.join(snapshotsPathAbs, 'uploads');
    const refImagesPath = path.join(snapshotsPathAbs, 'refImages');
    const diffPath = path.join(snapshotsPathAbs, 'diffs');
    const snapshotFile = path.join(snapshotPath, fileName);
    const diffFile = path.join(diffPath, fileName);
    let expectedFile = path.join(refImagesPath, fileName);

    mkDir(snapshotsPathAbs);
    mkDir(snapshotPath);
    mkDir(refImagesPath);
    mkDir(diffPath);

    if (!fs.existsSync(expectedFile)) {
      log.w(TAG, `File [${expectedFile}] does not exists, using dummy file`);
      expectedFile = path.join(__dirname, 'dummy.png');
    }

    log.v(TAG, `Writing file to ${snapshotFile}`);
    log.v(TAG, `and comparing to ${expectedFile}`);

    fs.writeFile(snapshotFile, base64, { encoding: 'base64' }, (writeError: any) => {
      if (!writeError) {
        log.v(TAG, 'File created');
        let differentPixelsCount = -1;

        try {
          differentPixelsCount = compareImages(
            snapshotFile,
            expectedFile,
            diffFile,
          );
          if (differentPixelsCount === 0) {
            log.v(TAG, 'All ok');
            res.write(RESPONSE_OK);
          } else {
            log.v(TAG, 'Different', differentPixelsCount);
            res.write(JSON.stringify({
              result: 'ERROR',
              info: `Files mismatch with ${differentPixelsCount} pixels`,
            }));
          }
        } catch (err) {
          log.e(TAG, `Failed to compare images: [${err.message}]`, err);
          res.write(JSON.stringify({
            result: 'ERROR',
            info: err.message,
          }));
        }
      } else {
        log.v(TAG, 'File created, error:', writeError);
        res.write(JSON.stringify({
          result: 'ERROR',
          info: writeError,
        }));
      }

      res.end();
    });
  },
  '/endOfTests': ({
    res, onTestsCompleted,
  }: any) => {
    res.write(RESPONSE_OK);
    res.end();
    setTimeout(onTestsCompleted, 300);
  },
  '/registerTest': ({ res }: any) => {
    res.write(RESPONSE_OK);
    res.end();
  },
  '/reportTest': ({ res, fields, reporter }: any) => {
    reporter.reportTest({
      name: fields.name,
      failure: fields.failure,
      time: fields.time,
      renderTime: fields.renderTime,
      isSkipped: fields.isSkipped,
    });
    res.write(RESPONSE_OK);
    res.end();
  },
  '/log': ({ res, fields }: any) => {
    const { tag, args, logLevel } = fields;
    log[logLevel || 'v'](tag, ...args);
    res.write(RESPONSE_OK);
    res.end();
  },
};

const startServer = (
  reporter: Reporter,
  onTestsCompleted: Function,
  snapshotsPath: string,
  onAppActivity: Function,
  port: number = DEFAULT_PORT,
) => {
  if (server) {
    throw new Error('Server already started');
  }
  server = http.createServer((req: any, res: any) => {
    log.v(TAG, `Processsing ${req.method} method to [${req.url}]`);
    if (req.method.toLowerCase() === 'post') {
      const handler = postHandlers[req.url];

      if (!handler) {
        log.e(TAG, `No handler for [${req.url}]`);
        res.write(JSON.stringify({
          result: 'ERROR',
          info: { error: 'Invalid url' },
        }));
        res.end();
        return;
      }

      const form = new formidable.IncomingForm();
      form.parse(req, (err: any, fields: any, files: any) => {
        handler({
          req,
          res,
          err,
          fields,
          files,
          onTestsCompleted,
          snapshotsPath,
          reporter,
        });
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<form action="base64" method="post" enctype="multipart/form-data">');
      res.write('<input type="file" name="filetoupload"><br>');
      res.write('<input type="hidden" name="refImage" value="expected.png" />');
      res.write('<input type="hidden" name="base64" value="some base 64 string" />');
      res.write('<input type="hidden" name="fileName" value="file.png" />');
      res.write('<input type="submit">');
      res.write('</form>');
      res.end();
    }
    onAppActivity();
  }).listen(port, () => {
    log.d(TAG, `server is listening on port [${port}]`);
  });

  server.on('connection', (socket: any) => {
    // Add a newly connected socket
    const socketId = nextSocketId++;
    sockets[socketId] = socket;

    // Remove the socket when it closes
    socket.on('close', () => {
      delete sockets[socketId];
    });

    // Extend socket lifetime for demo purposes
    socket.setTimeout(4000);
  });
};


const stopServer = () => {
  if (!server) {
    log.d(TAG, 'Server is not started');
    return;
  }
  server.close(() => { log.i(TAG, 'Server closed!'); });
  // Destroy all open sockets
  Object.entries(sockets).forEach(([socketId, socket]: any) => {
    log.v(TAG, 'socket', socketId, 'destroyed');
    socket.destroy();
  });

  server = undefined;
  sockets = {};
  nextSocketId = 0;
};

export default {
  start: startServer,
  stop: stopServer,
};
