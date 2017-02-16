import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';

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
