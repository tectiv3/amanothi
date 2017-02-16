import React, { Component } from 'react';
import { TextInput, View, ScrollView, StyleSheet, DeviceEventEmitter, LayoutAnimation, Dimensions, Keyboard, InteractionManager } from 'react-native';

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
        //autofocused keyboard slowdowns animation, this is a workaround
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
    }

    keyboardDidHide (e) {
        this.setState({
            height: Dimensions.get('window').height
        });
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
