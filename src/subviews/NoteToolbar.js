import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';

import Storage from '../Storage';
import styles from '../Styles';
import NoteScene from '../Note';

export default class NoteToolbar extends Component {

    constructor(props) {
        super(props);
    }

    handleDeletePress() {
        console.log("Delete press", this.props.note);
        var note = Object.assign({}, this.props.note);
        note.deleted = new Date().toISOString();
        Storage.deleteNote(note);
        this.props.navigator.pop();
    }

    handleNewPress() {
        console.log("New[toolbar] press");
        this.props.navigator.push({
            component: NoteScene,
            props: {
                title:  "New note"
            }
        });
    }

    render() {
        return (
            <View style={[styles.toolbarWrapper]}>
                <View style={styles.columnWrap}>
                    <TouchableOpacity
                        style={[styles.toolbarButtonDefaults]}
                        onPress={() => this.handleDeletePress()}
                    >
                        <Image
                            source={require('../../img/navicon_trash.png')}
                            style={styles.toolbarIcon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toolbarButtonDefaults]}
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
