import React, { Component } from 'react';
import { View, Text, Platform, StyleSheet, TextInput } from 'react-native';

import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';

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
        console.log(this.state.note)
    }

    render() {
        return (
            <Editor title={this.state.note.title}
                    text={this.state.note.text}
                    time={this.state.note.time}
            />
        );
    }
}


Note.propTypes = {
    note:    React.PropTypes.object
}
