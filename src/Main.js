import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableHighlight, StyleSheet, Keyboard } from 'react-native';

import Header from './subviews/Header';
import NoteScene from './Note';

export default class Main extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows(this._genRows({})),
        };
        this._pressData = {};
        this._notes = [];
    }

    componentDidMount () {
        this.refs.list.scrollTo(45);
    }

    _handleBackPress() {
        this.props.navigator.pop();
    }

    _handleNextPress(nextRoute) {
        this.props.navigator.push(nextRoute);
    }

    _renderRow(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        var rowHash = Math.abs(hashCode(rowData));
        return (
            <TouchableHighlight onPress={this._pressRow.bind(this, rowID)} >
                <View style={styles.listItem}>
                    <Text numberOfLines={1} style={styles.titleLabel}>{rowData + ' - ' + LOREM_IPSUM.substr(0, rowHash % 301 + 10)}</Text>
                    <View style={styles.infoContainer}>
                        <Text style={styles.timeLabel}>16:20</Text>
                        <Text numberOfLines={1} style={styles.previewLabel}>{LOREM_IPSUM.substr(100, rowHash % 301 + 10)}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

    _genRows(pressData: {[key: number]: boolean}): Array<string> {
      var dataBlob = [];
      for (var ii = 0; ii < 100; ii++) {
        var pressedText = pressData[ii] ? ' (pressed)' : '';
        dataBlob.push('Row ' + ii + pressedText);
      }
      return dataBlob;
    }

    _pressRow(rowID: number) {
        this._pressData[rowID] = !this._pressData[rowID];
        // this.setState({dataSource: this.state.dataSource.cloneWithRows(
        //     this._genRows(this._pressData)
        // )});
        const nextRoute = {
            component: NoteScene,
            title: 'Note',
            passProps: { note: this.state.dataSource[rowID] },
            rightButtonSystemIcon: 'done',
            onRightButtonPress: () => Keyboard.dismiss(),
        };
        this._handleNextPress(nextRoute);
    }

    _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
      return (
        <View
          key={`${sectionID}-${rowID}`}
          style={{
            height: 0,
            backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
          }}
        />
      );
    }

    render() {
        return(
        <View style={styles.container}>
            <View style={styles.listContainer}>
            <ListView ref="list"
                dataSource={this.state.dataSource}
                renderRow={this._renderRow.bind(this)}

                renderHeader={() => <Header />}
            />
            </View>
        </View>
        );
    }
}
// renderSeparator={this._renderSeparator}

var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare, an vix civibus corrumpit referrentur. Te nam case ludus inciderint, te mea facilisi adipiscing. Sea id integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo sapientem vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud modus, putant invidunt reprehendunt ne qui.';

var hashCode = function(str) {
  var hash = 15;
  for (var ii = str.length - 1; ii >= 0; ii--) {
    hash = ((hash << 5) - hash) + str.charCodeAt(ii);
  }
  return hash;
};

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#ffffff'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#F6F6F6',
    },
    text: {
        flex: 1,
    },
    backTextWhite: {
        color: '#FFF'
    },
    rowBack: {
        alignItems: 'stretch',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingLeft: 15,
    },
    backRightBtn: {
        paddingRight: 15,
        width: 75,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0
    },
    listContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
    },
    listItem: {
      backgroundColor: '#f9f9f7',
      borderBottomWidth: 0.5,
      borderColor: '#D0DBE4',
      padding: 10,
      paddingRight: 20,
      paddingLeft: 25
    },
    titleLabel: {
      fontSize: 16,
      fontWeight: '400',
      fontFamily: 'System',
      color: '#232527',
    //   lineHeight: 19
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 3
    },
    timeLabel: {
      fontSize: 15,
      fontWeight: '400',
      color: 'rgba(0,0,0,0.6)',
    //   width: 80,
    },
    previewLabel: {
      fontSize: 15,
      paddingRight: 50,
      fontWeight: '400',
      color: 'rgba(0,0,0,0.5)',
      marginLeft: 10
    },

});
