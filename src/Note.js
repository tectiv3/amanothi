import React, { Component } from 'react';
import { View, Text, Platform, StyleSheet, TextInput } from 'react-native';

import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';

export default class Note extends Component {

    render() {
        return (
            <Editor title={'Title!!'}
                    text={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
            />
        );
    }
}
