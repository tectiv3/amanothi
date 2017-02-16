import React, { Component } from 'react';
import RMSNavigator, {
    NavigationController,
    NavigatorMixin,
    NavigationButton
} from 'react-native-simple-navi';

import Storage from './Storage';
import MainScene from './Main';
import Account from './Account';
import Note from './Note';
// import SideMenu from './subviews/SideMenu';
//{title: 'Home', component:HomePage, hideNavigationBar: true}
export default class App extends Component {
    render() {
        return (
                <NavigationController
                    initialRoute={{title: 'Notes', component: MainScene}}
                    navbarStyle={{backgroundColor: 'rgba(40,53,74,0.8)'}}
                    titleStyle={{color: '#75c38d'}}
                    buttonStyle={{tintColor: '#75c38d'}}
                />
        );
    }
}
