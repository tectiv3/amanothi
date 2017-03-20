import React, { Component } from 'react';
import { View, StyleSheet, Keyboard, InteractionManager } from 'react-native';

// import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';
import NoteToolbar from './subviews/NoteToolbar';

import Storage from './Storage';

import styles from './Styles';

export default class Note extends Component {

    static navigatorButtons = {
        rightButtons: []
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
            text: "",
            updated_at: 0
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            note: props.note
        };
        this.onChange = this.onChange.bind(this);
        this.handleDeletePress = this.handleDeletePress.bind(this);
        this.handleNewPress = this.handleNewPress.bind(this);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        console.log('Note event', event);
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                Keyboard.dismiss();
                this.props.navigator.setButtons({
                    leftButtons: [],
                    rightButtons: [],
                    animated: false
                });
            }
        }
    }

    onChange(text) {
        if (this.state.note.text == text.trim()) return;
        var note = Object.assign({}, this.state.note);
        note.text = text.trim();
        this.setState({
            note
        });
        if (this.props.note.uuid) {
            console.log("Updating note.");
            Storage.updateNote(note);
        } else {
            console.log("Creating new note.");
            Storage.createNote(note);
        }
    }

    handleDeletePress() {
        console.log("Delete press", this.props.note);
        if (this.props.note.uuid) {
            var note = Object.assign({}, this.props.note);
            note.deleted = new Date().toISOString();
            Storage.deleteNote(note);
        }
        this.props.navigator.popToRoot();
    }

    handleNewPress() {
        console.log("New[toolbar] press");
        this.props.navigator.push({
            screen: 'NoteScreen',
            title: "New note",
            backButtonTitle: "Notes"
        });
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
    }

    keyboardDidShow(e) {
        this.props.navigator.setButtons({
            leftButtons: [],
            rightButtons: [{
                title: 'Done',
                id: 'done'
            }],
            animated: false
        });
    }

    render() {
        return (
            <View style={ styles.page }>
                <Editor title={ this.props.note.title } text={ this.props.note.text } time={ this.props.note.time } onChange={ this.onChange } />
                <NoteToolbar onLeftAction={ this.handleDeletePress } onRightAction={ this.handleNewPress } />
            </View>
            );
    }
}

Note.propTypes = {
    note: React.PropTypes.object
}
