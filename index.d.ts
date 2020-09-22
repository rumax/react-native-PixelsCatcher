type SnapshotPropsType = {
  onReady: Function;
};

interface ISnapshot {
  snapshotName: string;
  renderContent(): JSX.Element | React.FC | React.Component;
}

type ConfigType = {
  baseUrl?: string;
  /**
   * Callback for react-native-navigation
   * @param snapshot
   */
  rnnSetup?: (snapshot: React.ComponentType<any>) => void;
};

export function registerSnapshot(component: ISnapshot): void;
export class Snapshot extends React.Component<SnapshotPropsType> {}
export function runSnapshots(appName: string, config: ConfigType = {}): void;
