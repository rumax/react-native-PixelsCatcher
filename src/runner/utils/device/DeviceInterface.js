/* @flow */

export type StartParamsType = Array<string>;

export interface DeviceInterface {
  constructor(deviceName: string): void,

  start(params: StartParamsType): Promise<void>,

  isAppInstalled(appName: string): boolean,

  installApp(appName: string, appFile: string): Promise<void>,

  startApp(appName: string, activityName: string): void,

  uninstallApp(name: string): Promise<void>,

  stop(): Promise<void>,
}
