import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';
import RNSNavigator, {NavigatorMixin} from 'react-native-simple-navi';

import NoteScene from '../Note';
import Storage from '../Storage';
import styles from '../Styles';

export default class NoteToolbar extends Component {

    constructor(props) {
        super(props);
    }

    handleDeletePress() {
        console.log("Delete press", this.props.note);
        var note = Object.assign({}, this.props.note);
        note.deleted = new Date().toISOString();
        Storage.deleteNote(note);
        this.props.navigator.popToTop();
    }

    handleNewPress() {
        console.log("New[toolbar] press");
        this.navigatorPush('New note', NoteScene);
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

Object.assign(NoteToolbar.prototype, NavigatorMixin);
