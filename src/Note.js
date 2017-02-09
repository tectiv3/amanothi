import React, { Component } from 'react';
import { View, Text, Platform, StyleSheet, TextInput, Keyboard, TouchableOpacity, Image } from 'react-native';

import RichEditor from './subviews/RichEditor';
import Editor from './subviews/Editor';

import Storage from './Storage';

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
            text: "",
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
        if (this.state.note.text == text) return;
        var note = Object.assign({}, this.state.note);
        note.text = text;
        this.setState({note});
        if (this.state.note.id) {
            console.log("Updating note.");
            Storage.updateNote(this.state.note);
        } else {
            console.log("Creating new note");
            Storage.createNote(this.state.note);
        }
    }

    handleDeletePress() {
        console.log("Delete press");
        Storage.deleteNote(this.state.note.id);
        this.props.navigator.pop();
    }

    handleNewPress() {
        console.log("New toolbar press");
        this.props.navigator.push({
            screen: 'NoteScreen',
            title: "New note",
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {},
        });
    }

    render() {
        return (
            <View style={styles.page}>
                <Editor title={this.state.note.title}
                        text={this.state.note.text}
                        time={this.state.note.time}
                        onChange={this.onChange}
                />
                <View style={[styles.wrapper]}>
                    <View style={styles.columnWrap}>
                        <TouchableOpacity
                            style={[styles.buttonDefaults]}
                            onPress={() => this.handleDeletePress()}
                        >
                            <Image
                                source={require('../img/navicon_trash.png')}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.buttonDefaults]}
                            onPress={() => this.handleNewPress()}
                        >
                            <Image
                                source={require('../img/navicon_new.png')}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

Note.propTypes = {
    note:    React.PropTypes.object
}

var styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: 'rgba(249,249,247,1)',
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: '#75c38d',
    },
    wrapper: {
        backgroundColor: 'rgba(249,247,247,0.3)',
        flexDirection: 'row',
        bottom: 0,
        left: 0,
        right: 0,
        height: 43,
        // borderTopWidth: StyleSheet.hairlineWidth,
        // borderTopColor: 'grey',
    },
    columnWrap: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
        fontSize: 17,
        color: '#007AFF',
    },
    buttonDefaults: {
        paddingHorizontal: 15,
    }
});
