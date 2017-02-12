import React, { Component } from 'react';
import { AppRegistry,
        View,
        Text,
        TextInput,
        ActivityIndicator,
        TouchableHighlight,
        } from 'react-native';

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
        this.state = {
            email: "",
            password: "",
            error: "",
            showProgress: false,
        }
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if (event.id == 'close') {
            this.props.navigator.dismissModal();
        }
    }

    async onLoginPressed() {
        this.setState({showProgress: true})
        try {
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

    render() {
        return (
            <View style={styles.accountContainer}>
                <Text style={styles.accountLabelText}>
                    Encryption password
                </Text>
                <TextInput
                    onChangeText={ (text)=> this.setState({password: text}) }
                    style={styles.accountInput}
                    placeholder="Password"
                    value="Arnold">
                </TextInput>
                <TouchableHighlight onPress={this.onLoginPressed.bind(this)} style={styles.accountButton}>
                    <Text style={styles.accountButtonText}>
                        Save
                    </Text>
                </TouchableHighlight>
                <Text style={styles.accountError}>
                    {this.state.error}
                </Text>
                <ActivityIndicator animating={this.state.showProgress} size="large" style={styles.accountLoader} />
            </View>
        );
    }
}
