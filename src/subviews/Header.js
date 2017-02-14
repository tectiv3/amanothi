import React from 'react';
import { View, TextInput } from 'react-native';

import styles from '../Styles';

export default Header = (props) => (
    <View style = {styles.headerContainer}>
        <TextInput
            style = {styles.searchInput}
            placeholder = "Search"
            onChangeText = {(text) => props.onChange(text)}
        />
    </View>
);
