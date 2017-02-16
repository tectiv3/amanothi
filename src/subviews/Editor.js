import YANavigator from 'react-native-ya-navigator';
import React, { Component } from 'react';
import { TextInput, View, ScrollView, DeviceEventEmitter, LayoutAnimation, Dimensions, Keyboard, TouchableOpacity, Text, InteractionManager } from 'react-native';

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

    componentDidMount () {
        InteractionManager.runAfterInteractions(() => {
            if (!this.state.text) {
                this.refs['editor'].focus();
            }
        });
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
        });
        console.log("Keyboard show event")
        this.props.navigator._navBar.updateUI({
            rightPart: (
                <TouchableOpacity onPress={() => 'onDoneBtnPress'}>
                  <Text style={{color: '#75c38d', fontSize: 16, fontWeight: '400'}}>
                      Done
                  </Text>
                </TouchableOpacity>
            )
        });
        this.props.navigator._navBar.forceUpdate();
        // this.props.navigator.setButtons({leftButtons:[],rightButtons:[{ title: 'Done', id: 'done' }]});
    }

    keyboardDidHide (e) {
        this.setState({
            height: Dimensions.get('window').height
        });
        this.props.onChange(this.state.text);
        this.props.navigator._navBar.updateUI({
            rightPart: ''
        });
    }

    handleChange (text) {
        this.setState({text});
        this.props.onChange(text);
    }

    render() {
        return (
            <ScrollView keyboardDismissMode='interactive' style={styles.page, [{
                paddingTop: YANavigator.Scene.navBarHeight,
            }]}>
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
