import React, { Component } from 'react';
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import moment from 'moment';
import styles from '../Styles';

export default class NoteItem extends Component {

    constructor(props) {
        super(props);
        this.handlePress = this.handlePress.bind(this);
    }

    handlePress() {
        return this.props.onPress(this.props.note.uuid);
    }

    render() {
        return (
            <TouchableHighlight onPress={ this.handlePress }>
                <View style={ styles.listItem }>
                    <Text numberOfLines={ 1 } style={ styles.titleLabel }>
                        { this.props.note.title ? this.props.note.title : this.props.note.text }
                    </Text>
                    <View style={ styles.infoContainer }>
                        <Text style={ styles.timeLabel }>
                            { moment((this.props.note.updated_at)).fromNow() }
                        </Text>
                        <Text numberOfLines={ 1 } style={ styles.previewLabel }>
                            { this.props.note.text.split(/\r\n|\n|\r/).slice(1,2).toString() || 'No additional content' }
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
            );
    }
}
// <Text style={{color:"red", fontSize:9, position:"absolute", top:2,right:5}}>{this.props.note.uuid}</Text>

NoteItem.propTypes = {
    note: React.PropTypes.object.isRequired,
    onPress: React.PropTypes.func
}
