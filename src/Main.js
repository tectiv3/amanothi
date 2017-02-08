import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableHighlight, StyleSheet, Keyboard } from 'react-native';

import Header from './subviews/Header';
import NoteItem from './subviews/NoteItem';
import NoteScene from './Note';
import Storage from './Storage';

export default class Main extends Component {
    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        var notes = this.getNotesList();
        this.state = {
            dataSource: ds.cloneWithRows([]),
            notes
        };
        this.pressRow = this.pressRow.bind(this);
        this.getNotesList = this.getNotesList.bind(this);
        this.sortList = this.sortList.bind(this);
        this.onChange = () => {
            var notes = this.getNotesList();
            this.setState({notes});
            console.log("On change:", notes);
            this.sortList(notes);
        };
    }

    componentWillMount() {
        Storage.addChangeListener(this.onChange);
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
        console.log('GET FROM STORAGE');
        return Storage.getAll();
    }

    pressRow(noteID) {
        var note = this.state.notes[noteID];//.find((n) => {return n.id == noteID;});[noteID];
        console.log("CLICK", noteID);
        const nextRoute = {
            component: NoteScene,
            title: note.title ? note.title : 'Note',
            passProps: { note },
            rightButtonSystemIcon: 'done',
            onRightButtonPress: () => Keyboard.dismiss(),
        };
        this.props.navigator.push(nextRoute);
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
