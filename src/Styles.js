import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#f9f9f7'
    },
    headerContainer: {
        flex: 1,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28354a',
    },
    searchInput: {
        height: 30,
        flex: 1,
        paddingHorizontal: 8,
        fontSize: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    input: {
        padding: 10,
        paddingTop: 0,
        fontSize: 18,
        fontWeight: '200',
        fontFamily: 'System',
        alignItems: 'stretch',
        flexDirection: 'column',
        backgroundColor: '#f9f9f7',
    },
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
    toolbarWrapper: {
        backgroundColor: 'rgba(249,247,247,0.3)',
        flexDirection: 'row',
        bottom: 0,
        left: 0,
        right: 0,
        height: 43,
    },
    columnWrap: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toolbarIcon: {
        width: 25,
        height: 25,
        tintColor: '#75c38d',
    },
    buttonDefaults: {
        paddingHorizontal: 15,
    },
});
