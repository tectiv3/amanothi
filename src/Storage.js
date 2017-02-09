import { AsyncStorage } from 'react-native';
import rncrypto from 'react-native-rncrypto';
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var _notes = null;

function loadAsyncStore() {
    return AsyncStorage.getItem('notes').then(str => {
        if (!str) _notes = {};
        else _notes = JSON.parse(str);
        Storage.emitChange();
    });
}

function updateAsyncStore() {
    if (!_notes) return;
    return AsyncStorage.setItem('notes', JSON.stringify(_notes)).catch(err => {
        console.log("couldn't store note: " + err);
    });
}

var Storage = assign({}, EventEmitter.prototype, {

    getAll: function() {
        if (!_notes) {
            console.log("Load from storage")
            loadAsyncStore();//.then(fetchFromServer).then(updateAsyncStore);
            return {};
        } else {
            return _notes;
        }
    },

    createNote: function(note) {
        note.created = new Date().toISOString();
        note.updated = note.created;
        note.id = Math.floor(Math.random() * 9999) + 1;
        _notes[note.id] = note;
        this.emitChange();
        return updateAsyncStore();
    },

    updateNote: function (note) {
        note.updated = new Date().toISOString();
        _notes[note.id] = note;
        this.emitChange();
        return updateAsyncStore();
    },

    deleteNote: function (noteID) {
        delete _notes[noteID];
        this.emitChange();
        return updateAsyncStore();
    },

    emitChange: function() {
        console.log("Change fire!");
        this.emit('change');
    },

    addChangeListener: function(callback) {
        this.on('change', callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

export default Storage;
