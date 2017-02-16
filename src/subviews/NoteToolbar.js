import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';

import NoteScene from '../Note';
import Storage from '../Storage';
import styles from '../Styles';

export default NoteToolbar = (props) => (
    <View style={[styles.toolbarWrapper]}>
        <View style={styles.columnWrap}>
            <TouchableOpacity
                style={[styles.toolbarButtonDefaults]}
                onPress={() => props.onLeftAction()}
            >
                <Image
                    source={require('../../img/navicon_trash.png')}
                    style={styles.toolbarIcon}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.toolbarButtonDefaults]}
                onPress={() => props.onRightAction()}
            >
                <Image
                    source={require('../../img/navicon_new.png')}
                    style={styles.toolbarIcon}
                />
            </TouchableOpacity>
        </View>
    </View>
);
