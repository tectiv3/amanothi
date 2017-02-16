import React, { Component } from 'react';
import { AppRegistry,
        View,
        Text,
        TextInput,
        ActivityIndicator,
        TouchableHighlight,
        Switch,
        } from 'react-native';
import Storage from './Storage';
import styles from './Styles';

export default class Account extends Component {

    static navigatorStyle = {
        navBarBackgroundColor: 'rgba(40,53,74,0.8)',
        navBarTranslucent: true,
        navBarTextColor: '#75c38d',
        navBarSubtitleTextColor: '#75c38d',
        navBarButtonColor: '#75c38d',
        statusBarTextColorSchemeSingleScreen: 'light',
        navBarNoBorder: true,
        drawUnderNavBar: false,
    }

    static navigatorButtons = {
        leftButtons: [{
            title: 'Close',
            id: 'close'
        }]
    };

    constructor(props) {
        super(props);
        var account = Storage.getAccount();
        this.state = {
            email: account.password,
            password: account.password,
            error: "",
            showProgress: false,
            TouchID_enabled: account.settings && account.settings.TouchID_enabled
        }
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleSwitchTouchid = this.handleSwitchTouchid.bind(this);
    }

    onNavigatorEvent(event) {
        if (event.id == 'close') {
            this.props.navigator.dismissModal();
        }
    }

    async onLoginPressed() {
        this.setState({showProgress: true})
        try {
            Storage.saveAccount({password: this.state.password, email: this.state.email});
    //   let response = await fetch('/api/login', {
    //                           method: 'POST',
    //                           headers: {
    //                             'Accept': 'application/json',
    //                             'Content-Type': 'application/json',
    //                           },
    //                           body: JSON.stringify({
    //                             session:{
    //                               email: this.state.email,
    //                               password: this.state.password,
    //                             }
    //                           })
    //                         });
    //   let res = await response.text();
    //   if (response.status >= 200 && response.status < 300) {
    //       //Handle success
    //       let accessToken = res;
    //       console.log(accessToken);
    //       //On success we will store the access_token in the AsyncStorage
        //   this.storeToken("{valid: true}");
            this.setState({showProgress: false});
            this.props.navigator.dismissModal();
        //   this.props.navigator.popToRoot();
    //   } else {
    //       //Handle error
    //       let error = res;
    //       throw error;
    //   }
        } catch(error) {
            this.setState({error: error});
            console.log("error " + error);
            this.setState({showProgress: false});
        }
    }

    handleSwitchTouchid(value) {
        console.log("Touch ID switch", value);
        Storage.saveSetting('TouchID_enabled', value);
        this.setState({TouchID_enabled: value});
    }

    render() {
        return (
            <View style={styles.accountContainer}>
                <Text style={styles.accountHeaderText}>
                    Settings
                </Text>
                <View style={[styles.sectionWrapper, {height: 44}]}>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchTitle}>
                            Use Touch ID
                        </Text>
                        <Switch
                            onValueChange={this.handleSwitchTouchid}
                            style={styles.switchStyle}
                            onTintColor={"#75c38d"}
                            value={this.state.TouchID_enabled} />
                    </View>
                </View>
                <View style={styles.sectionWrapper}>
                    <TextInput
                        onChangeText={ (text)=> this.setState({password: text}) }
                        style={styles.accountInput}
                        autoCorrect={false}
                        placeholderTextColor={'#75c38d'}
                        placeholder="Encryption password"
                        value={this.state.password}>
                    </TextInput>
                    <TouchableHighlight onPress={this.onLoginPressed.bind(this)} style={styles.accountButton}>
                        <Text style={styles.accountButtonText}>
                            Save
                        </Text>
                    </TouchableHighlight>
                </View>
                <Text style={styles.accountError}>
                    {this.state.error}
                </Text>
                <ActivityIndicator animating={this.state.showProgress} size="large" style={styles.accountLoader} />
            </View>
        );
    }
}
