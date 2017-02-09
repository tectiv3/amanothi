import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableHighlight, StyleSheet, Keyboard } from 'react-native';

import Header from './subviews/Header';
import NoteItem from './subviews/NoteItem';
import NoteScene from './Note';
import Storage from './Storage';

export default class Main extends Component {
    static navigatorButtons = {
        rightButtons: [{
            icon: require('../img/navicon_edit.png'),
            id: 'create'
        }]
    }
    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
        this.state = {
            dataSource: ds.cloneWithRows([])
        };
        this.pressRow = this.pressRow.bind(this);
        this.getNotesList = this.getNotesList.bind(this);
        this.sortList = this.sortList.bind(this);
        this.onChange = () => {
            var notes = this.getNotesList();
            this.setState({notes});
            console.log("On change!");
            this.sortList(notes);
        };
        console.log("Main constructor");
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        // this is the onPress handler for the two buttons together
        if (event.type == 'NavBarButtonPress') {
            // this is the event type for button presses
            if (event.id == 'create') {
                // this is the same id field from the static navigatorButtons definition
                this.props.navigator.push({
                    screen: 'NoteScreen',
                    title: "New note",
                    animated: true, // does the push have transition animation or does it happen immediately (optional)
                    backButtonHidden: false, // hide the back button altogether (optional)
                    navigatorStyle: {},
                });
            }
        }
    }

    componentWillMount() {
        console.log("Component will mount")
        Storage.addChangeListener(this.onChange);
        var notes = this.getNotesList();
    }

    componentDidMount() {
        this.refs.list.scrollTo({x:0, y:45, animated: false});
    }

    componentWillUnmount() {
        Storage.removeChangeListener(this.onChange);
    }

    sortList(notes) {
        console.log('Sorting...')
        var plain = [];
        for (var id in notes) {
            plain.push(notes[id]);
        }
        plain.filter(note => !!note);
        plain.sort(function(a, b) {
            var dateA = new Date(a.updated), dateB = new Date(b.updated);
            return dateB - dateA;
        });
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(plain)
        });
        return plain;
    }

    getNotesList() {
        console.log('Load from storage.');
        return Storage.getAll();
    }

    pressRow(noteID) {
        var note = this.state.notes[noteID];//.find((n) => {return n.id == noteID;});[noteID];
        console.log("Row click: ", noteID);
        this.props.navigator.push({
            screen: 'NoteScreen',
            title: note.title ? note.title : 'Note',
            passProps: { note },
        });
    }

    render() {
        return(
            <View style={styles.page}>
                <ListView
                    ref="list"
                    dataSource={this.state.dataSource}
                    renderHeader={() => <Header />}
                    renderRow={ (rowData, sectionID, rowID) => <NoteItem onPress={this.pressRow} note={rowData} /> }
                    enableEmptySections={true}
                />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#f9f9f7'
    }
});
