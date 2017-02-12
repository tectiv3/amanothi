import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';

import Storage from '../Storage';
import styles from '../Styles';

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
            <View style={[styles.toolbarWrapper]}>
                <View style={styles.columnWrap}>
                    <TouchableOpacity
                        style={[styles.buttonDefaults]}
                        onPress={() => this.handleDeletePress()}
                    >
                        <Image
                            source={require('../../img/navicon_trash.png')}
                            style={styles.toolbarIcon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonDefaults]}
                        onPress={() => this.handleNewPress()}
                    >
                        <Image
                            source={require('../../img/navicon_new.png')}
                            style={styles.toolbarIcon}
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
