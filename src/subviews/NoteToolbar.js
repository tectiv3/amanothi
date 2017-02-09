import React, { Component } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

import Storage from '../Storage';

export default class NoteToolbar extends Component {

    constructor(props) {
        super(props);
    }

    handleDeletePress() {
        console.log("Delete press", this.props.note);
        Storage.deleteNote(this.props.note.id);
        this.props.navigator.pop();
    }

    handleNewPress() {
        console.log("New[toolbar] press");
        this.props.navigator.push({
            screen: 'NoteScreen',
            title:  "New note"
        });
    }

    render() {
        return (
            <View style={[styles.wrapper]}>
                <View style={styles.columnWrap}>
                    <TouchableOpacity
                        style={[styles.buttonDefaults]}
                        onPress={() => this.handleDeletePress()}
                    >
                        <Image
                            source={require('../../img/navicon_trash.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonDefaults]}
                        onPress={() => this.handleNewPress()}
                    >
                        <Image
                            source={require('../../img/navicon_new.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

NoteToolbar.propTypes = {
    note:    React.PropTypes.object
}

var styles = StyleSheet.create({
    wrapper: {
        backgroundColor: 'rgba(249,247,247,0.3)',
        flexDirection: 'row',
        bottom: 0,
        left: 0,
        right: 0,
        height: 43,
    },
    columnWrap: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: '#75c38d',
    },
    text: {
        fontSize: 17,
        color: '#007AFF',
    },
    buttonDefaults: {
        paddingHorizontal: 15,
    }
});
