import YANavigator from 'react-native-ya-navigator';
import React, { Component } from 'react';
import { View, StyleSheet, Keyboard, StatusBar, TouchableOpacity, Text } from 'react-native';

// import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';
import NoteToolbar from './subviews/NoteToolbar';

import Storage from './Storage';

import styles from './Styles';

export default class Note extends Component {

    static defaultProps = {
        note: {
            title: "",
            text:  "",
            updated: 0
        }
    }

    onDoneBtnPress() {
        console.log('On done press');
        this.props.navigator._navBar.updateUI({
            rightPart: ''
        });
        Keyboard.dismiss();
    }

    onNavBarLeftPartPress() {
        this.props.navigator.immediatelyResetRouteStack([{
            component: MainScene,
        }]);
    }

    static navigationDelegate = {
        id: 'note',
        renderTitle(props) {
            return (
                <View>
                    <Text style={{color: '#75c38d', fontSize: 16, fontWeight: '600'}}>
                        {props.title}
                    </Text>
                </View>
            );
        },
        renderNavBarRightPart() {
            return ;
        },
        backBtnText: 'Notes',
    }

    constructor(props) {
        super(props);
        this.state = {
            note: props.note
        };
        this.onChange = this.onChange.bind(this);
    }

    onChange(text) {
        if (this.state.note.text == text.trim()) return;
        var note = Object.assign({}, this.state.note);
        note.text = text.trim();
        this.setState({note});
        if (this.props.note.uuid) {
            console.log("Updating note.");
            Storage.updateNote(note);
        } else if (note.text != '') {
            console.log("Creating new note.");
            Storage.createNote(note);
        }
    }

    render() {
        return (
            <YANavigator.Scene
                paddingTop={false}
                delegate={this}
                style={[styles.page]}
            >
                <Editor title={this.props.note.title}
                        text={this.props.note.text}
                        time={this.props.note.time}
                        onChange={this.onChange}
                        navigator={this.props.navigator}
                />
                <NoteToolbar navigator={this.props.navigator} note={this.props.note} />
            </YANavigator.Scene>
        );
    }
}

Note.propTypes = {
    note:    React.PropTypes.object
}
