import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableHighlight, StyleSheet } from 'react-native';
const FlatList = require('FlatList');
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
                <View style={styles.row}>
                    <Text style={styles.text}>
                        {rowData + ' - ' + LOREM_IPSUM.substr(0, rowHash % 301 + 10)}
                    </Text>
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
        this.setState({dataSource: this.state.dataSource.cloneWithRows(
            this._genRows(this._pressData)
        )});
        const nextRoute = {
            component: NoteScene,
            title: this._notes[rowID].title,
            passProps: { note: this.notes[rowID] },
            barTintColor: 'skyblue'
        };
        this._handleNextPress(nextRoute);
    }

    _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
      return (
        <View
          key={`${sectionID}-${rowID}`}
          style={{
            height: adjacentRowHighlighted ? 4 : 1,
            backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
          }}
        />
      );
    }

    render() {
        return(
            <View>
            <ListView
                dataSource={this.state.dataSource}
                renderRow={this._renderRow.bind(this)}
                renderSeparator={this._renderSeparator}
                renderHeader={() => <Header />}
            />
            </View>
        );
    }
}

var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare, an vix civibus corrumpit referrentur. Te nam case ludus inciderint, te mea facilisi adipiscing. Sea id integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo sapientem vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud modus, putant invidunt reprehendunt ne qui.';

var hashCode = function(str) {
  var hash = 15;
  for (var ii = str.length - 1; ii >= 0; ii--) {
    hash = ((hash << 5) - hash) + str.charCodeAt(ii);
  }
  return hash;
};

var styles = StyleSheet.create({
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

});
