import React, { Component } from 'react';
import { AppRegistry,
        NavigatorIOS,
        View,
        StyleSheet,
        Text,
        ActivityIndicator,
        } from 'react-native';

import MainScene from './src/Main';
import AccountScene from './src/Account';
import NoteScene from './src/Note';

export default class NavigatorIOSApp extends Component {

    constructor(props) {
        super(props);
        this.state = { loaded: true}
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

    _handleRightNavigationRequest() {
        this.refs.nav.push({
            component: NoteScene,
            title: 'New Note',
            passProps: { myProp: 'genius' },
        });
    }

    _handleLeftNavigationRequest() {
        this.refs.nav.push({
            component: AccountScene,
            title: 'Account',
            passProps: { myProp: 'genius' },
        });
    }

    renderListView() {
        return (
            <NavigatorIOS
                ref='nav'
                initialRoute = {{
                    component: MainScene,
                    title: '',
                    name: "Home",
                    rightButtonSystemIcon: 'compose',
                    onRightButtonPress: () => this._handleRightNavigationRequest(),
                    leftButtonSystemIcon: 'organize',
                    onLeftButtonPress: () => this._handleLeftNavigationRequest(),
                    // barTintColor: '#48BBEC'
                }}
                style={{flex: 1}}
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
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {},
});

AppRegistry.registerComponent('t3notes', () => NavigatorIOSApp);
