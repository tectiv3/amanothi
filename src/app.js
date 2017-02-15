import React from 'react';
import {
  AppRegistry
} from 'react-native';

import YANavigator from 'react-native-ya-navigator';
// import { BlurView } from 'react-native-blur';
import MainScene from './Main';

// import Account from './Account';
// import Note from './Note';
// import SideMenu from './subviews/SideMenu';
import Storage from './Storage';

export default class AmanothiApp extends React.Component {
    render() {
        return (
            <YANavigator
                initialRoute={{
                    component: MainScene,
                }}
                navBarStyle={{
                    backgroundColor: 'rgba(40,53,74,0.8)',
                }}
                navBarBackBtn={{
                    textStyle: {
                        color: '#75c38d',
                    },
                }}
                // navBarUnderlay={Platform.OS === 'ios' ? <BlurView blurType={'dark'}/> : null}
            />
        );
    }
}

AppRegistry.registerComponent('amanothi', () => AmanothiApp);
