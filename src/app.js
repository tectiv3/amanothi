import React, { Component } from 'react';
import RMSNavigator, { NavigationController } from 'react-native-simple-navi';

import Storage from './Storage';
import MainScene from './Main';

export default class App extends Component {
    render() {
        return (
                <NavigationController
                    initialRoute={{title: '', component: MainScene}}
                    navbarStyle={{backgroundColor: 'rgba(40,53,74,0.8)'}}
                    titleStyle={{color: '#75c38d'}}
                    buttonStyle={{tintColor: '#75c38d'}}
                    textStyle={{color: '#75c38d'}}
                />
        );
    }
}
