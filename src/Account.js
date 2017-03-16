import React, { Component } from 'react';
import { AppRegistry, View, Text, TextInput, ActivityIndicator, TouchableHighlight, Switch, } from 'react-native';
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
            server: account.server != undefined ? account.server : "",
            email: account.email != undefined ? account.email : "",
            password: account.password,
            showProgress: false,
            TouchID_enabled: account.settings && account.settings.TouchID_enabled
        }
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleSwitchTouchid = this.handleSwitchTouchid.bind(this);
    }

    onNavigatorEvent(event) {
        if (event.id == 'close') {
            this.props.navigator.dismissModal();
            Storage.saveAccount({
                password: this.state.password,
                email: this.state.email,
                server: this.state.server
            });
        }
    }

    async onLoginPressed() {
        this.setState({
            showProgress: true
        })
        console.log("Login pressed")
        Storage.loginUser(this.state).then(() => {
            this.setState({
                showProgress: false
            });
            this.props.navigator.dismissModal();
            return Storage.getAll();
        }).catch((error) => {
            this.setState({
                showProgress: false,
                error: error.message
            });
            console.log('login failed', error.message)
        })
    }

    async onRegisterPressed() {
        this.setState({
            showProgress: true
        })
        console.log("register pressed")
        Storage.registerUser(this.state).then(() => {
            this.setState({
                showProgress: false
            });
            this.props.navigator.dismissModal();
            return Storage.getAll();
        }).catch((error) => {
            this.setState({
                showProgress: false,
                error: error.message
            });
            console.log('registration failed', error.message)
        })
    }

    async onRegister2Pressed() {
        this.setState({
            showProgress: true
        })
        try {
            Storage.registerUser(this.state).catch((error) => {
                this.setState({
                    showProgress: false
                });
                console.log('registration failed', error.message)
            })
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
            this.setState({
                showProgress: false
            });
            this.props.navigator.dismissModal();
        //   this.props.navigator.popToRoot();
        //   } else {
        //       //Handle error
        //       let error = res;
        //       throw error;
        //   }
        } catch (error) {
            console.log("register error ", error);
            this.setState({
                showProgress: false
            });
        }
    }

    handleSwitchTouchid(value) {
        console.log("Touch ID switch", value);
        Storage.saveSetting('TouchID_enabled', value);
        this.setState({
            TouchID_enabled: value
        });
    }

    render() {
        return (
            <View style={ styles.accountContainer }>
                <Text style={ styles.accountHeaderText }>Settings</Text>
                <View style={ {height: 44} }>
                    <View style={ styles.switchContainer }>
                        <Text style={ styles.switchTitle }>Use Touch ID</Text>
                        <Switch onValueChange={ this.handleSwitchTouchid } style={ styles.switchStyle } onTintColor={ "#75c38d" } value={ this.state.TouchID_enabled } />
                    </View>
                </View>
                <View style={ styles.sectionWrapper }>
                    <Text style={ styles.accountTitle }>Account</Text>
                    <TextInput onChangeText={ (text)=> this.setState({password: text}) } style={ styles.accountInput } autoCorrect={ false } autoCapitalize="none" placeholderTextColor={ 'rgba(249,247,247,0.3)' }
                        placeholder={ "Password" } returnKeyType="next" secureTextEntry={ true } editable={ true } value={ this.state.password }>
                    </TextInput>
                    <TextInput onChangeText={ (text)=> this.setState({email: text}) } style={ styles.accountInput } autoCorrect={ false } autoCapitalize="none" placeholderTextColor={ 'rgba(249,247,247,0.3)' }
                        keyboardType="email-address" placeholder="E-mail (optional)" returnKeyType="next" value={ this.state.email }>
                    </TextInput>
                    <TextInput onChangeText={ (text)=> this.setState({server: text}) } style={ styles.accountInput } autoCorrect={ false } autoCapitalize="none" placeholderTextColor={ 'rgba(249,247,247,0.3)' }
                        keyboardType="url" placeholder="Server URL (optional)" value={ this.state.server }>
                    </TextInput>
                    <Text style={ styles.accountError }>
                        { this.state.error }
                    </Text>
                    <View style={ styles.flexRow }>
                        <TouchableHighlight onPress={ this.onLoginPressed.bind(this) } style={ styles.accountButton }>
                            <Text style={ styles.accountButtonText }>Login</Text>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={ this.onRegisterPressed.bind(this) } style={ styles.accountButton }>
                            <Text style={ styles.accountButtonText }>Register</Text>
                        </TouchableHighlight>
                    </View>
                </View>
                <ActivityIndicator animating={ this.state.showProgress } size="large" style={ styles.accountLoader } />
            </View>
            );
    }
}
