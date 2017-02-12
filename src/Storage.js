import { AsyncStorage, NativeModules } from 'react-native';
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Aes = NativeModules.Aes;

var _notes = null;

function loadAsyncStore() {
    return AsyncStorage.getItem('notes').then(str => {
        if (!str) _notes = {};
        else _notes = JSON.parse(str);
        Storage.emitChange();
    });
}

function loadAsyncEncrypted() {
    return AsyncStorage.getItem('enotes').then(str => {
        var encrypted = [];
        _notes = {};
        encrypted = JSON.parse(str);
        var promises = [];
        encrypted.forEach(function (note) {
            promises.push(decryptNote(note, "Arnold"));
        });
        return Promise.all(promises).then(function(results) {
            results.forEach(function(item) {
                var note = JSON.parse(item.substring(4));
                _notes[note.id] = note;
            });
            Storage.emitChange();
        });
    });
}

function updateAsyncStore() {
    if (!_notes) return;
    var encrypted = [];
    var promises = [];
    for (var id in _notes) {
        promises.push(encryptNote(_notes[id], "Arnold"));
    }
    return Promise.all(promises).then(function(results) {
        results.forEach(function(item) {
            encrypted.push(item);
        });
        return AsyncStorage.setItem('enotes', JSON.stringify(encrypted)).catch(err => { console.log("couldn't store note: " + err) });
    }).catch(function(err) {
        console.log("Failed:", err);
    });
}

function generateRandomKey() {
    return Math.random().toString(36).substring(2);
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

async function decryptItem(cipher, key) {
    var result = null;
    try {
        result = await Aes.decrypt(cipher, key);
    } catch (e) {
        //doesn't catch reject
        console.error(e);
    }
    return result;
}

function decryptNote(note, key) {
    return new Promise(function(resolve, reject) {
        Aes.decrypt(note.key, key).then((note_key) => Aes.decrypt(note.content, note_key).then((result) =>  resolve(result)).catch((err) => console.log("Decrypt error:", err))).catch((err)  => console.log("Decrypt error:", err));
    });
}

async function encryptNote(note, key) {
    if (!note.uuid) {
        note.uuid = generateUUID();
    }
    var note_key = '';
    if (note.key) {
        note_key = await Aes.decrypt(note.key, key);
    } else {
        note_key = generateRandomKey();
        note.key = await Aes.encrypt(note_key, key);
    }
    var p = new Promise(function(resolve, reject) {
        Aes.encrypt("e001" + JSON.stringify(note), note_key).then(cipher => {
            var copy = {};
            copy.uuid = note.uuid;
            copy.content = cipher;
            copy.key  = note.key;
            copy.updated = note.updated;
            Aes.hmac(copy.content, note_key).then(hash => {
                copy.hash = hash;
                resolve(copy);
            });
        });
    });
    return p;
}

var Storage = assign({}, EventEmitter.prototype, {

    getAll: function() {
        if (!_notes) {
            console.log("Load from storage");
            loadAsyncEncrypted();//.then(fetchFromServer).then(updateAsyncStore);
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
