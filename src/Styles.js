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
    toolbarButtonDefaults: {
        paddingHorizontal: 15,
    },
    accountContainer: {
        flex: 1,
        backgroundColor: '#28354a',
        padding: 10,
        paddingTop: 10
    },
    accountHeaderText: {
        fontSize: 24,
        alignSelf: "center",
        color: "white",
        marginBottom: 10
    },
    accountInput: {
        height: 50,
        marginTop: 10,
        padding: 4,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#75c38d',
        // backgroundColor: 'rgba(249,247,247,0.3)',
        color: 'white'
    },
    accountButton: {
        flex: 1,
        // paddingTop: 10,
        height: 50,
        backgroundColor: '#75c38d',
        // marginTop: 10,
        justifyContent: 'center',
        borderWidth: 1,
        alignItems: 'flex-start'
    },
    accountButtonText: {
        fontSize: 22,
        color: '#FFF',
        alignSelf: 'center'
    },
    accountError: {
        color: 'red',
        paddingTop: 10
    },
    accountLoader: {
        marginTop: -40
    },
    accountLabelText: {
        color: 'white',
        fontSize: 18
    },
    accountTitle: {
        marginLeft: 0,
        alignSelf: 'center',
        color: 'white',
        fontSize: 18
    },
    sectionWrapper: {
        backgroundColor: '#28354a',
    //   borderBottomWidth: StyleSheet.hairlineWidth,
    //   borderBottomColor: '#75c38d',
    //   borderTopWidth: StyleSheet.hairlineWidth,
    //   borderTopColor: '#75c38d'
    },
    switchContainer: {
        flexDirection: 'row',
        flex: 1,
        height: 44
    },
    switchTitle: {
        flex: 1,
        marginLeft: 0,
        alignSelf: 'center',
        color: 'white',
        fontSize: 18
    },
    switchStyle: {
        marginRight: 0,
        alignSelf: 'center',
    },
    flexRow: {
        flex: 1,
        flexDirection: 'row'
    }
});
