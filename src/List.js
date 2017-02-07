const React = require('react');
const ReactNative = require('react-native');
const {
  Image,
  Platform,
  TouchableHighlight,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} = ReactNative;

import Header from './subviews/Header';
import NoteScene from './Note';

const FlatList = require('FlatList');

const infoLog = require('infoLog');

class ItemComponent extends React.PureComponent {
  props: {
    fixedHeight?: ?boolean,
    horizontal?: ?boolean,
    item: Item,
    onPress: (key: number) => void,
  };
  _onPress = () => {
    this.props.onPress(this.props.item.key);
  };
  render() {
    const {fixedHeight, horizontal, item} = this.props;
    const itemHash = Math.abs(hashCode(item.title));
    return (
      <TouchableHighlight
        onPress={this._onPress}
        style={styles.item}>
        <View style={[styles.row, horizontal && {width: HORIZ_WIDTH}]}>
          <Text style={styles.text} numberOfLines={3}>
            {item.title} - {item.text}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

class SeparatorComponent extends React.PureComponent {
  render() {
    return <View style={styles.separator} />;
  }
}

type Item = {title: string, text: string, key: number, pressed: boolean};

function genItemData(count: number): Array<Item> {
  const dataBlob = [];
  for (let ii = 0; ii < count; ii++) {
    const itemHash = Math.abs(hashCode('Item ' + ii));
    dataBlob.push({
      title: 'Item ' + ii,
      text: LOREM_IPSUM.substr(0, itemHash % 301 + 20),
      key: ii,
      pressed: false,
    });
  }
  return dataBlob;
}

export default class FlatListExample extends React.PureComponent {
  static title = '<FlatList>';
  static description = 'Performant, scrollable list of data.';

  state = {
    data: genItemData(1000),
    horizontal: false,
    filterText: '',
    fixedHeight: true,
    logViewable: false,
    virtualized: true,
  };
  _onChangeFilterText = (filterText) => {
    this.setState({filterText});
  };
  _onChangeScrollToIndex = (text) => {
    this._listRef.scrollToIndex({viewPosition: 0.5, index: Number(text)});
  };
  render() {
    const filterRegex = new RegExp(String(this.state.filterText), 'i');
    const filter = (item) => (filterRegex.test(item.text) || filterRegex.test(item.title));
    const filteredData = this.state.data.filter(filter);
    return (
      <View>
          <TextInput
            onChangeText={this._onChangeFilterText}
            placeholder="Searc1h..."
            value={this.state.filterText}
          />

          <PlainInput
            onChangeText={this._onChangeScrollToIndex}
            placeholder="scrollToIndex..."
            style={styles.searchTextInput}
          />
        <FlatList
        //   HeaderComponent={Header}
          ItemComponent={this._renderItemComponent}
          SeparatorComponent={SeparatorComponent}
          getItemLayout={this.state.fixedHeight ? this._getItemLayout : undefined}
          data={filteredData}
          key={(this.state.horizontal ? 'h' : 'v') + (this.state.fixedHeight ? 'f' : 'd')}
          legacyImplementation={false}
          onRefresh={() => alert('onRefresh: nothing to refresh :P')}
          refreshing={false}
          onViewableItemsChanged={this._onViewableItemsChanged}
          ref={this._captureRef}
          shouldItemUpdate={this._shouldItemUpdate}
        />
      </View>
    );
  }
  _captureRef = (ref) => { this._listRef = ref; };
  _getItemLayout = (data: any, index: number) => {
    return getItemLayout(data, index, this.state.horizontal);
  };
  _renderItemComponent = ({item}) => {
    return (
      <ItemComponent
        item={item}
        horizontal={this.state.horizontal}
        fixedHeight={this.state.fixedHeight}
        onPress={this._pressItem}
      />
    );
  };
  _shouldItemUpdate(prev, next) {
    /**
     * Note that this does not check state.horizontal or state.fixedheight because we blow away the
     * whole list by changing the key in those cases. Make sure that you do the same in your code,
     * or incorporate all relevant data into the item data, or skip this optimization entirely.
     */
    return prev.item !== next.item;
  }
  // This is called when items change viewability by scrolling into or out of the viewable area.
  _onViewableItemsChanged = (info: {
      changed: Array<{
        key: string, isViewable: boolean, item: any, index: ?number, section?: any
      }>
    }
  ) => {
    // Impressions can be logged here
    if (this.state.logViewable) {
      infoLog('onViewableItemsChanged: ', info.changed.map((v) => ({...v, item: '...'})));
    }
  };
  _pressItem = (key: number) => {
    pressItem(this, key);
  };
  _listRef: FlatList;
}


const HEADER = {height: 30, width: 80};
const HORIZ_WIDTH = 200;

const SEPARATOR_HEIGHT = StyleSheet.hairlineWidth;

const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare, an vix \
civibus corrumpit referrentur. Te nam case ludus inciderint, te mea facilisi adipiscing. Sea id \
integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo sapientem \
vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud \
modus, putant invidunt reprehendunt ne qui.';

/* eslint no-bitwise: 0 */
function hashCode(str: string): number {
  let hash = 15;
  for (let ii = str.length - 1; ii >= 0; ii--) {
    hash = ((hash << 5) - hash) + str.charCodeAt(ii);
  }
  return hash;
}

function getItemLayout(data: any, index: number, horizontal?: boolean) {
  const [length, separator, header] = horizontal ?
    [HORIZ_WIDTH, 0, HEADER.width] : [84, SEPARATOR_HEIGHT, HEADER.height];
  return {length, offset: (length + separator) * index + header, index};
}

function pressItem(context: Object, key: number) {
  const pressed = !context.state.data[key].pressed;
  context.setState((state) => {
    const newData = [...state.data];
    newData[key] = {
      ...state.data[key],
      pressed,
      title: 'Item ' + key + (pressed ? ' (pressed)' : ''),
    };
    const nextRoute = {
        component: NoteScene,
        title: 'Note',
        passProps: { note: {} },
        barTintColor: '#28354a',
        titleTextColor: '#75c38d',
        tintColor: '#75c38d',
    };
    context.props.navigator.push(nextRoute);
    return {data: newData};
  });
}

function PlainInput({placeholder, value, onChangeText}: Object) {
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="always"
      onChangeText={onChangeText}
      placeholder={placeholder}
      underlineColorAndroid="transparent"
      style={styles.searchTextInput}
      value={value}
    />
  );
}


const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchRow: {
    backgroundColor: '#eeeeee',
    padding: 10,
  },
  headerFooter: {
    ...HEADER,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizItem: {
    alignSelf: 'flex-start', // Necessary for touch highlight
  },
  item: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    padding: 8,
    paddingRight: 0,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  searchTextInput: {
    backgroundColor: 'black',
    borderColor: '#cccccc',
    borderRadius: 3,
    borderWidth: 1,
    paddingLeft: 8,
    paddingVertical: 0,
    height: 26,
    fontSize: 14,
  },
  separator: {
    height: SEPARATOR_HEIGHT,
    backgroundColor: 'gray',
  },
  smallSwitch: {
      top: 4,
      margin: -10,
      transform: [{scale: 0.5}],
  },
  thumb: {
    width: 64,
    height: 64,
  },
  text: {
    flex: 1,
  },
});
