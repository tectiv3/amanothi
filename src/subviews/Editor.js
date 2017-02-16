import React, { Component } from 'react';
import { AppRegistry, TextInput, View, ScrollView, StyleSheet, DeviceEventEmitter, LayoutAnimation, Dimensions, Keyboard, InteractionManager } from 'react-native';
import RNSNavigator, {NavigationButton } from 'react-native-simple-navi';

import styles from '../Styles';

export default class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = { text: props.text };
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));

        this.setState({
            height: Dimensions.get('window').height - 65
        })
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.props.onChange(this.state.text);
    }

    componentDidMount () {
        InteractionManager.runAfterInteractions(() => {
            if (!this.state.text) {
                this.refs['editor'].focus();
            }
        });
    }

    keyboardDidShow (e) {
        let newSize = Dimensions.get('window').height - e.endCoordinates.height - 65;
        this.setState({
            height: newSize,
        });
        this.props.navigationController && this.props.navigationController.setRightBarItem(NavigationButton);
this.props.setRightProps && this.props.setRightProps({barItemType: 'text', onPress: ()=>Keyboard.dismiss(), barItemTitle: 'Done'});
    }

    keyboardDidHide (e) {
        this.setState({
            height: Dimensions.get('window').height
        });
        this.props.onChange(this.state.text);
        this.props.navigationController && this.props.navigationController.setRightBarItem(NavigationButton);
        this.props.setRightProps && this.props.setRightProps({barItemType: 'empty'});
    }

    handleChange (text) {
        this.setState({text});
        this.props.onChange(text);
    }

    render() {
        return (
            <ScrollView keyboardDismissMode='interactive' style={styles.page}>
                    <TextInput
                        ref="editor"
                        style={[styles.input, {height: this.state.height}]}
                        onChangeText={(text) => {
                            this.setState({text});
                        }}
                        value={this.state.text}
                        multiline={true}
                    />
            </ScrollView>
        );
    }
}
