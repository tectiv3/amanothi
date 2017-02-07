import React, { Component } from 'react';
import { AppRegistry, TextInput, View, ScrollView, StyleSheet } from 'react-native';

export default class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = { text: props.text };
    }

    render() {
        return (
            <View style={styles.page} onLayout={(ev) => {
                // 80 is for the navbar on top
                var fullHeight = ev.nativeEvent.layout.height - 60;
                this.setState({height: fullHeight, fullHeight: fullHeight});
            }}>
                <ScrollView keyboardDismissMode='interactive'>
                    <TextInput
                        style={[styles.input, {height:this.state.height}]}
                        onChangeText={(text) => this.setState({text})}
                        value={this.state.text}
                        multiline={true}
                        autoFocus={true}
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
    },
    input: {
        padding: 10,
        paddingTop: 10,
        fontSize: 18,
        fontFamily: 'System',
        alignItems: 'flex-end',
    },
});
