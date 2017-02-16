import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

import styles from '../Styles';

export default ModalHeader = (props) => (
    <View style={styles.modalHeader}>
        <TouchableOpacity
            onPress={() => props.goBack()}
            underlayColor="transparent"
        >
            <Text style={styles.modalText}>
                Close
            </Text>
        </TouchableOpacity>
    </View>
);
