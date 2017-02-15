import {Navigation} from 'react-native-navigation';

import Main from './Main';
import Account from './Account';
import Note from './Note';
// import SideMenu from './subviews/SideMenu';
import Storage from './Storage';

Navigation.registerComponent('MainScreen', () => Main);
Navigation.registerComponent('NoteScreen', () => Note);
Navigation.registerComponent('AccountScreen', () => Account);
// Navigation.registerComponent('SideMenu', () => SideMenu);
Navigation.startSingleScreenApp({
    screen: {
        screen: 'MainScreen',
            title: 'Notes',
            navigatorStyle: {
                navBarBackgroundColor: 'rgba(40,53,74,0.8)',
                navBarTranslucent: true,
                navBarTextColor: 'rgba(0,0,0,0)',
                navBarSubtitleTextColor: '#75c38d',
                navBarButtonColor: '#75c38d',
                statusBarTextColorSchemeSingleScreen: 'light',
                navBarNoBorder: true,
                drawUnderNavBar: false,
            }
    },
    // drawer: {
    //     left: {
    //         screen: 'SideMenu'
    //     }
    // }
});
/*
import React, { Component } from 'react';
import { AppRegistry,
        NavigatorIOS,
        View,
        StyleSheet,
        Text,
        ActivityIndicator,
        Keyboard,
        } from 'react-native';


export default class NavigatorIOSApp extends Component {

    constructor(props) {
        super(props);
        this.routes = {
            "main" : {
                title: 'Notes',
                index: 0,
                component: MainScene,
                leftButtonSystemIcon: 'organize',
                onLeftButtonPress: ()  => this.refs.nav.push(this.routes["account"]),
                rightButtonSystemIcon: 'compose',
                onRightButtonPress: () => this.refs.nav.push(this.routes["create"]),
                titleTextColor: 'rgba(0,0,0,0)'
            },
            "account": {
                title: 'Account',
                index: 1,
                component: AccountScene,
            },
            "create": {
                title: 'New note',
                index: 2,
                component: NoteScene,
                rightButtonSystemIcon: 'done',
                onRightButtonPress: () => Keyboard.dismiss(),
            },
            "update": {
                title: 'Edit note',
                index: 3,
                component: NoteScene,
                rightButtonSystemIcon: 'done',
                onRightButtonPress: () => Keyboard.dismiss(),
            },
        };

        this.state = { loaded: true }
    }

    componentWillMount() {
        // Storage.addChangeListener(this.onChange);
    }

    componentWillUnmount() {
        // Storage.removeChangeListener(this.onChange);
    }

    renderLoadingView() {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={!this.state.loaded}
                    style={[styles.activityIndicator]}
                    size="large"
                />
            </View>
        );
    }

    renderListView() {
        return (
            <NavigatorIOS
                ref='nav'
                initialRoute={this.routes["main"]}
                style={styles.page}
                barTintColor='#28354a'
                titleTextColor='#75c38d'
                tintColor='#75c38d'
                routes={this.routes}
            />
        );
    }

    render() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }
        return this.renderListView();
    }
}


var styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {},
});
*/
// AppRegistry.registerComponent('amanothi', () => NavigatorIOSApp);
