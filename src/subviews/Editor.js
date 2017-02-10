import React, { Component } from 'react';
import { AppRegistry, TextInput, View, ScrollView, StyleSheet, DeviceEventEmitter, LayoutAnimation, Dimensions, Keyboard } from 'react-native';

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

    keyboardDidShow (e) {
        let newSize = Dimensions.get('window').height - e.endCoordinates.height - 65;
        this.setState({
            height: newSize,
        })
    }

    keyboardDidHide (e) {
        this.setState({
            height: Dimensions.get('window').height
        })
        this.props.onChange(this.state.text);
    }

    handleChange (text) {
        this.setState({text});
        this.props.onChange(text);
    }

    render() {
        return (
            <ScrollView keyboardDismissMode='interactive' style={styles.page}>
                    <TextInput
                        style={[styles.input, {height: this.state.height}]}
                        onChangeText={(text) => {
                            this.setState({text});
                        }}
                        value={this.state.text}
                        multiline={true}
                        autoFocus={!this.state.text}
                    />
            </ScrollView>
        );
    }
}

var styles = StyleSheet.create({
    page: {
    },
    input: {
        padding: 10,
        paddingTop: 0,
        fontSize: 18,
        fontWeight: '200',
        fontFamily: 'System',
        alignItems: 'stretch',
        flexDirection: 'column',
        backgroundColor: '#f9f9f7',
    },
});
