import React, { Component } from 'react';
import { AppRegistry,
        NavigatorIOS,
        View,
        StyleSheet,
        Text,
        ActivityIndicator,
        Keyboard,
        } from 'react-native';

import MainScene from './src/Main';
import AccountScene from './src/Account';
import NoteScene from './src/Note';

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
            passProps: {
                routes: 'sdsd'
            }
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

        this.state = { loaded: true}
    }

    renderScene(route, navigator) {
        //unused
        console.log(route);
        var route = this.routes.find((r, route) => { return r.index == route;});
        console.log(route);
        var Component = route.component;
        return <Component {...route.passProps} route={route} navigator={navigator} />;
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

AppRegistry.registerComponent('t3notes', () => NavigatorIOSApp);
