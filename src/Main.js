import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableHighlight, StyleSheet, Keyboard } from 'react-native';

import Header from './subviews/Header';
import NoteItem from './subviews/NoteItem';
import NoteScene from './Note';

export default class Main extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
        };
        this._pressData = {};
        this._notes = [];
        this.pressRow = this.pressRow.bind(this);
    }

    componentWillMount() {
        this.getNotesList();
    }

    componentDidMount () {
        this.refs.list.scrollTo(45);
    }

    getNotesList() {
        // fetch()
        var notes = [
            {
                id: 1,
                title: "First note",
                text: "Lorem ipsum dolor sit amet",
                time: "16:20",
            },{
                id: 2,
                title: "Another note",
                text: "Eu paulo sapientem vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud modus, putant invidunt reprehendunt ne qui",
                time: "Yesterday",
            },{
                id: 3,
                title: "And another one",
                text: "se ludus inciderint, te mea facilisi adipiscing. Sea id integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo ",
                time: "06/02/2017",
            },
        ];
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(notes),
            notes: notes
        });
    }

    pressRow(noteID) {
        var note = this.state.notes.find((n) => {return n.id == noteID;});
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
        backgroundColor: '#ffffff'
    }
});
