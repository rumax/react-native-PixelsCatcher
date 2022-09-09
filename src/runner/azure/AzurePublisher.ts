import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import log from '../utils/log';
import type { TestcaseType } from '../utils/Reporter';

const TAG = 'PIXELS_CATCHER::AZURE_PUBLISHER';

const processEnv: any = process.env;
const {
  BUILD_BUILDURI,
  SYSTEM_ACCESSTOKEN,
  SYSTEM_TEAMFOUNDATIONCOLLECTIONURI,
  SYSTEM_TEAMPROJECT,
} = processEnv;

const DEFAULT_OPTIONS = {
  hostname: 'dev.azure.com',
  port: 443,
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-TFS-FedAuthRedirect': 'Suppress',
  Accept: 'application/json',
  Authorization: `Basic ${Buffer.from(`:${SYSTEM_ACCESSTOKEN}`).toString('base64')}`,
};

type ImageType = 'refImages' | 'uploads' | 'diffs';

const uploadImageSuffix = {
  diffs: 'Diff',
  refImages: 'Reference',
  uploads: 'Actual',
};

const imageTypes = Object.keys(uploadImageSuffix);

function base64Encode(file: string): string {
  if (!fs.existsSync(file)) {
    return '';
  }
  return Buffer.from(fs.readFileSync(file)).toString('base64');
}

class AzurePublisher {
  _workingDir: string;

  _testRunName: string;

  _urlBasePath: string;

  constructor(workingDir: string, testRunName: string) {
    this._workingDir = workingDir;
    this._testRunName = testRunName;
    const organization = SYSTEM_TEAMFOUNDATIONCOLLECTIONURI
      .split('/')
      .filter((str: string) => Boolean(str))
      .reduce((acc: string, curr: string) => curr);
    this._urlBasePath = `/${organization}/${SYSTEM_TEAMPROJECT}/_apis/test`;
  }

  async publish(): Promise<void> {
    try {
      const buildRunId = await this._getBuildRunId(BUILD_BUILDURI);
      log.i(TAG, `buildRunId [${buildRunId}]`);
      const failedTests = await this._getTestFailures(buildRunId);
      log.i(TAG, `failedTests count [${failedTests.length}]`);
      failedTests.forEach(async (test: any) => {
        log.v(TAG, `Uploading results for test [${test.testCaseTitle}] from [${test.automatedTestStorage}]`);
        let type: any;
        for (let ind = 0; ind < imageTypes.length; ++ind) {
          type = imageTypes[ind];
          await this._uploadScreenshot(
            buildRunId,
            test.id,
            test.testCaseTitle,
            test.automatedTestStorage,
            type,
          );
        }
      });
    } catch (err) {
      log.e(TAG, `Failed to upload results: ${err instanceof Error ? err.message : 'Unknown error'}`);
      process.exit(-1);
    }
  }

  async _getBuildRunId(_buildUri: string): Promise<string> {
    const data: any = await this._httpsRequest({
      method: 'GET',
      path: `${this._urlBasePath}/runs?api-version=5.1&buildUri=${_buildUri}`,
    });
    if (!data || !data.value || data.value.length === 0) {
      throw new Error('Failed to get build run, no data');
    }
    let id;
    log.v(TAG, `Runs count: ${data.value.length}, searching for [${this._testRunName}]`);
    for (let ind = data.value.length - 1; ind >= 0; --ind) {
      log.v(TAG, `Name: [${data.value[ind].name}], id: ${data.value[ind].id}`);
      if (data.value[ind].name === this._testRunName) {
        log.v(TAG, `Id ${data.value[ind].id} found`);
        id = data.value[ind].id;
        break;
      }
    }

    if (id === undefined) {
      throw new Error(`Failed to get build run id for ${this._testRunName}`);
    }

    return id;
  }

  async _getTestFailures(runId: string): Promise<Array<TestcaseType>> {
    const data: any = await this._httpsRequest({
      method: 'GET',
      path: `${this._urlBasePath}/Runs/${runId}/results?outcomes=3&api-version=5.1&outcomes=3`,
    });

    return data.value;
  }

  async _upload(
    buildRunId: string,
    id: string,
    fileToUpload: string,
    fileNameToShow: string,
  ): Promise<string> {
    const postData = {
      stream: base64Encode(fileToUpload),
      fileName: fileNameToShow,
      comment: 'Diff uploaded by REST from pipeline',
      attachmentType: 'GeneralAttachment',
    };

    const data: any = await this._httpsRequest({
      method: 'POST',
      path: `${this._urlBasePath}/Runs/${buildRunId}/Results/${id}/attachments?api-version=5.1-preview.1`,
    }, postData);

    return data.value;
  }

  async _uploadScreenshot(
    buildRunId: string,
    id: string,
    testCaseTitle: string,
    className: string,
    type: ImageType,
  ): Promise<void> {
    const suffix = uploadImageSuffix[type];
    log.v(TAG, `Uploading ${suffix}`);
    await this._upload(
      buildRunId,
      id,
      path.join(this._workingDir, className, type, `${testCaseTitle}.png`),
      `${testCaseTitle}${suffix}.png`,
    );
    log.v(TAG, `${suffix} uploaded`);
  }

  async _httpsRequest(options: any, postData: any = undefined): Promise<void> {
    let _options = {
      ...DEFAULT_OPTIONS,
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.headers ? options.headers : {}),
      },
    };
    const _postData = postData ? JSON.stringify(postData) : undefined;

    return new Promise((resolve: Function, reject: Function) => {
      if (_postData) {
        _options = {
          ..._options,
          'Content-Length': Buffer.byteLength(_postData),
        };
      }
      const req = https.request(_options, (resp: any) => {
        if (resp.statusCode >= 300) {
          log.e(TAG, `Failed to ${_options.method} [${_options.path}]`);
          reject(new Error(`Status code: ${resp.statusCode}, statusMessage: ${resp.statusMessage}`));
          return;
        }

        let data = '';

        resp.on('data', (chunk: string) => {
          data += chunk;
        });

        resp.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on('error', (err: Error) => {
        reject(new Error(`Error: ${err.message}`));
      });

      if (_postData) {
        req.write(_postData);
      }

      req.end();
    });
  }
}

export default AzurePublisher;
