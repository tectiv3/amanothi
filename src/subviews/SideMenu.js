import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AlertIOS
} from 'react-native';

export default class SideMenu extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.container}>

        <TouchableOpacity onPress={ this.onShowArchivePress.bind(this) }>
          <Text style={styles.button}>Archieve</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={ this.onShowSettingsPress.bind(this) }>
          <Text style={styles.button}>Settings</Text>
        </TouchableOpacity>

    </View>
    );
  }
  onShowArchivePress() {
    this._toggleDrawer();
    // push/pop navigator actions affect the navigation stack of the current screen only.
    // since side menu actions are normally directed at sibling tabs, push/pop will
    // not help us. the recommended alternative is to use deep links for this purpose
    this.props.navigator.handleDeepLink({
      link: "ArchiveScreen"
    });
  }

  onShowSettingsPress() {
    this._toggleDrawer();
    this.props.navigator.showModal({
      screen: "AccountScreen"
    });
  }

  _toggleDrawer() {
    this.props.navigator.toggleDrawer({
      to: 'closed',
      side: 'left',
      animated: true
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    width: 300
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
    marginTop:10,
    fontWeight: '500'
  },
  button: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
    marginTop:10,
    color: 'blue'
  }
});
