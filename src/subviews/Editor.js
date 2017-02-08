import React, { Component } from 'react';
import { AppRegistry, TextInput, View, ScrollView, StyleSheet, DeviceEventEmitter, LayoutAnimation, Dimensions, Keyboard } from 'react-native';

export default class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = { text: props.text };
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.props.onChange(this.state.text);
    }

    keyboardDidShow (e) {
        let newSize = Dimensions.get('window').height - e.endCoordinates.height - 80;
        this.setState({
            height: newSize,
        })
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    keyboardDidHide (e) {
        this.setState({
            height: Dimensions.get('window').height
        })
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.props.onChange(this.state.text);
    }

    handleChange (text) {
        this.setState({text});
        this.props.onChange(text);
    }

    render() {
        return (
            <View style={styles.page} onLayout={(ev) => {
                var fullHeight = ev.nativeEvent.layout.height - 60;
                this.setState({height: fullHeight, fullHeight: fullHeight});
            }}>
                <ScrollView keyboardDismissMode='interactive'>
                    <TextInput
                        style={[styles.input, {height:this.state.height}]}
                        allowFontScaling={true}
                        onChangeText={(text) => {
                            this.setState({text});
                        }}
                        value={this.state.text}
                        multiline={true}
                        autoFocus={!this.state.text}
                    />
                </ScrollView>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    page: {
        flex: 1,
        alignItems: 'stretch',
        marginTop: 10,
        backgroundColor: '#f9f9f7',
    },
    input: {
        padding: 10,
        paddingTop: 0,
        fontSize: 18,
        fontWeight: '200',
        fontFamily: 'System',
        alignItems: 'flex-end',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: '#f9f9f7',
    },
});
