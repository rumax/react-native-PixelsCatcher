import React from 'react';
import { Platform, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerSnapshot, runSnapshots, Snapshot } from 'pixels-catcher';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import App from './App';
import { HomeScreen } from './AppWithNavigation';
import { name as appName } from './app.json';

const baseUrl = Platform.select({
  // Put real IP of your server to run on real device
  android: 'http://10.0.2.2:3000',
  ios: 'http://127.0.0.1:3000',
});
const useFailedTest = false;

const appSnapshot = false;

if (appSnapshot) {
  registerSnapshot(
    class SnapshotClass extends Snapshot {
      static snapshotName = 'AppSnapshot';

      componentDidMount() {
        setTimeout(() => {
          // delay for rendering images
          this.props.onReady();
        }, 1000);
      }

      renderContent() {
        return <App />;
      }
    },
  );
}

registerSnapshot(
  class SnapshotClass extends Snapshot {
    static snapshotName = 'HomeScreen';

    renderContent() {
      return <HomeScreen />;
    }
  },
);

if (useFailedTest) {
  registerSnapshot(
    class SnapshotClass extends Snapshot {
      static snapshotName = 'AppSnapshotWithWrongRefImg';

      renderContent() {
        return <App />;
      }
    },
  );
}

registerSnapshot(
  class SnapshotClass extends Snapshot {
    static snapshotName = 'someComponent';

    renderContent() {
      return (
        <View style={{ backgroundColor: 'yellow' }}>
          <Text>Some component</Text>
        </View>
      );
    }
  },
);

const useWebView = false;

if (useWebView) {
  registerSnapshot(
    class SnapshotClass extends Snapshot {
      static snapshotName = 'WebViewTest';

      componentDidMount() {
        // override default componentDidMount from Snapshot to delay it
        // until WebView is loaded. onLoad from WebView is used
      }

      renderContent() {
        return (
          <WebView
            source={{
              uri: 'https://raw.githubusercontent.com/rumax/react-native-PixelsCatcher/master/CONTRIBUTING.md',
            }}
            style={{ flex: 1, marginTop: 20 }}
            onLoad={() => {
              setTimeout(() => {
                this.props.onReady();
              }, 50);
            }}
          />
        );
      }
    },
  );
}

registerSnapshot(
  class SnapshotClass extends Snapshot {
    static snapshotName = 'longContent';

    renderContent() {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ height: 200, backgroundColor: '#FFA07A' }} />
          <View style={{ height: 300, backgroundColor: '#E9967A' }} />
          <View style={{ height: 400, backgroundColor: '#FA8072' }} />
          <View style={{ height: 500, backgroundColor: '#F08080' }} />
          <View style={{ height: 600, backgroundColor: '#CD5C5C' }} />
        </View>
      );
    }
  },
);

const Stack = createStackNavigator();

function getRootElement(SnapshotsContainer) {
  const RootElement = ({ children }) => (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SnapshotsContainer"
          options={{
            headerShown: false,
            title: '',
          }}
          component={SnapshotsContainer}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
  return RootElement;
}

runSnapshots(appName, { baseUrl, getRootElement });
