import React, { Component } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';

// import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';
import NoteToolbar from './subviews/NoteToolbar';

import Storage from './Storage';

import styles from './Styles';

export default class Note extends Component {

    static navigatorButtons = {
        rightButtons: [{
            title: 'Done',
            id: 'done'
        }]
    }

    static navigatorStyle = {
        navBarBackgroundColor: 'rgba(40,53,74,0.8)',
        navBarTranslucent: true,
        navBarTextColor: '#75c38d',
        navBarSubtitleTextColor: '#75c38d',
        navBarButtonColor: '#75c38d',
        statusBarTextColorSchemeSingleScreen: 'light',
        navBarNoBorder: true,
        drawUnderNavBar: false,
    }

    static defaultProps = {
        note: {
            title: "",
            text:  "",
            updated: 0
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            note: props.note
        };
        this.onChange = this.onChange.bind(this);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                Keyboard.dismiss();
            }
        }
    }

    onChange(text) {
        if (this.state.note.text == text.trim()) return;
        var note = Object.assign({}, this.state.note);
        note.text = text.trim();
        this.setState({note});
        if (this.props.note.uuid) {
            console.log("Updating note.");
            Storage.updateNote(this.state.note);
        } else {
            console.log("Creating new note.");
            Storage.createNote(this.state.note);
        }
    }

    render() {
        return (
            <View style={styles.page}>
                <Editor title={this.props.note.title}
                        text={this.props.note.text}
                        time={this.props.note.time}
                        onChange={this.onChange}
                        navigator={this.props.navigator}
                />
                <NoteToolbar navigator={this.props.navigator} note={this.props.note} />
            </View>
        );
    }
}

Note.propTypes = {
    note:    React.PropTypes.object
}
