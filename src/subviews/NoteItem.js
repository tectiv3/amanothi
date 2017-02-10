import React, { Component } from 'react';
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import moment from 'moment';

export default class NoteItem extends Component {

    constructor(props) {
        super(props);
        this.handlePress = this.handlePress.bind(this);
    }

    handlePress() {
        return this.props.onPress(this.props.note.id);
    }

    render() {
        return (
            <TouchableHighlight onPress={this.handlePress}>
                <View style={styles.listItem}>
                    <Text numberOfLines={1} style={styles.titleLabel}>{this.props.note.title ? this.props.note.title : this.props.note.text}</Text>
                    <View style={styles.infoContainer}>
                        <Text style={styles.timeLabel}>{moment((this.props.note.updated)).fromNow()}</Text>
                        <Text numberOfLines={1} style={styles.previewLabel}>
                            {this.props.note.text.split(/\r\n|\n|\r/).slice(1,2).toString() || 'No additional content'}
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}

NoteItem.propTypes = {
    note:    React.PropTypes.object.isRequired,
    onPress: React.PropTypes.func
}

var styles = StyleSheet.create({
    listItem: {
      backgroundColor: '#f9f9f7',
      borderBottomWidth: 0.5,
      borderColor: '#D0DBE4',
      padding: 10,
      paddingRight: 20,
      paddingLeft: 25,
      height: 61
    },
    titleLabel: {
      fontSize: 16,
      fontWeight: '400',
      fontFamily: 'System',
      color: '#232527',
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
    },
    previewLabel: {
      fontSize: 15,
      paddingRight: 50,
      fontWeight: '400',
      color: 'rgba(0,0,0,0.5)',
      marginLeft: 10
    },
});
