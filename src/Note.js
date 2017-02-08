import React, { Component } from 'react';
import { View, Text, Platform, StyleSheet, TextInput } from 'react-native';

import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';

import Storage from './Storage';

export default class Note extends Component {

    static defaultProps = {
        note: {
            title: "",
            text: "",
            time: 0
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            note: props.note
        };
        this.onChange = this.onChange.bind(this);
    }

    onChange(text) {
        this.state.note.text = text;
        this.setState({note: this.state.note});
        if (this.state.note.id) {
            Storage.updateNote(this.state.note);
        } else {
            Storage.createNote(this.state.note);
        }
    }

    render() {
        return (
            <Editor title={this.state.note.title}
                    text={this.state.note.text}
                    time={this.state.note.time}
                    onChange={this.onChange}
            />
        );
    }
}


Note.propTypes = {
    note:    React.PropTypes.object
}
