import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableHighlight, Keyboard, AppState, Navigator } from 'react-native';

import { NativeModules } from 'react-native';
const NativeTouchID = NativeModules.TouchID;

import Header from './subviews/Header';
import NoteItem from './subviews/NoteItem';
import NoteScene from './Note';
import AccountScene from './Account';
import Storage from './Storage';
import styles from './Styles';

export default class Main extends Component {

    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            appState: AppState.currentState,
            previousAppStates: [],
            memoryWarnings: 0,
        };
        this.pressRow = this.pressRow.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.getNotesList = this.getNotesList.bind(this);
        this.sortList = this.sortList.bind(this);
        this.onChange = () => {
            var notes = this.getNotesList('On change event');
            this.setState({notes});
            console.log("Storage change callback");
            this.sortList(notes);
        };
    }

    checkTouchIDSupported() {
        return new Promise((resolve, reject) => {
            NativeTouchID.isSupported(error => {
                if (error) {
                    return reject(error.message);
                }
                resolve(true);
            });
        });
    }

    componentWillMount() {
        Storage.addChangeListener(this.onChange);
        this.checkTouchIDSupported().then(() => {
            if (Storage.getAccount().settings && Storage.getAccount().settings.TouchID_enabled) {
                return new Promise( (resolve, reject) => {
                    NativeTouchID.authenticate("Unlock", error => {
                        return error ? reject(error.message) : resolve(true);
                    });
                }).then(() => this.enableInterface("TouchID success")).catch(() => this.disableInterface());
            } else {
                this.enableInterface("TouchID not enabled");
            }
        }).catch(() => this.enableInterface("No TouchID"));
    }

    enableInterface(debug) {
        this.getNotesList(debug);
        this.props.navigationController && this.props.navigationController.setLeftBarButton({
            barItemType: 'icon',
            onPress: () => {
                this.props.goForward({
                    component: AccountScene,
                    sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
                    backButtonTitle: 'Close',
                    hideNavigationBar: true
                });
            },
            barItemImage: require('../img/navicon_password.png')
        });

        this.props.navigationController && this.props.navigationController.setRightBarButton({
            barItemType: 'icon',
            onPress: () => this.props.goForward({
                title: 'New note',
                component: NoteScene,
            }),
            barItemImage: require('../img/navicon_new.png')
        });
        // this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    disableInterface() {
        //buttons unclickable and notes aren't loaded
        console.log();
    }

    componentDidMount() {
        this.refs.list.scrollTo({x:0, y:48, animated: false});
        AppState.addEventListener('change', this._handleAppStateChange);
        AppState.addEventListener('memoryWarning', this._handleMemoryWarning);
    }

    componentWillUnmount() {
        Storage.removeChangeListener(this.onChange);
        AppState.removeEventListener('change', this._handleAppStateChange);
        AppState.removeEventListener('memoryWarning', this._handleMemoryWarning);
    }

    _handleMemoryWarning = () => {
        this.setState({memoryWarnings: this.state.memoryWarnings + 1});
    };

    _handleAppStateChange = (appState) => {
        var previousAppStates = this.state.previousAppStates.slice();
        previousAppStates.push(this.state.appState);
        if (appState == "active") {
            this.forceUpdate();
        }
        this.setState({
            appState,
            previousAppStates,
        });
    };

    willFocus() {
        console.log("On focus main");
        this.forceUpdate();
    }

    sortList(notes) {
        console.log('Sorting...')
        //hide deleted here todo:unless in trash bin then the opposite
        notes = notes.filter(note => !note.deleted);
        notes.sort(function(a, b) {
            var dateA = new Date(a.updated), dateB = new Date(b.updated);
            return dateB - dateA;
        });
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(notes)
        });
        return notes;
    }

    getNotesList(caller) {
        console.log('Ask storage for notes', caller);
        return Storage.getAll();
    }

    pressRow(id) {
        var note = this.state.notes.find((n) => n.uuid == id);
        this.props.goForward({
            title: (note.title ? note.title : 'Note'),
            component: NoteScene,
            passProps: {note}
        });
    }

    handleSearchChange(text) {
        console.log("Searching...", text);
        var search = text.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
        if (search == '') {
            notes = this.state.notes;
        } else {
            notes = this.state.notes.filter((note) => {
                if (note.deleted) return false;
                var regex = new RegExp(search, "gi");
                return regex.test(note.text);
            });
            console.log(notes);
            notes.sort(function(a, b) {
                var dateA = new Date(a.updated), dateB = new Date(b.updated);
                return dateB - dateA;
            });
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(notes)
        });

    }

    render() {
        return(
            <View style={styles.page}>
                <ListView
                    ref="list"
                    dataSource={this.state.dataSource}
                    renderHeader={() => <Header onChange={this.handleSearchChange} />}
                    renderRow={ (rowData, sectionID, rowID) => <NoteItem onPress={this.pressRow} note={rowData} /> }
                    enableEmptySections={true}
                />
            </View>
        );
    }
}
