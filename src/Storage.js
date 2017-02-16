import { AsyncStorage, NativeModules } from 'react-native';
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Aes = NativeModules.Aes;

var _notes   = null;
var _account = null;
// getReactNativeHost().getReactInstanceManager().getDevSupportManager().handleReloadJS(); //force reload

loadAccountFromStorage();

function loadAccountFromStorage() {
    return AsyncStorage.getItem('account').then(str => {
        if (!str) _account = {};
        else _account = JSON.parse(str);
        if (!_account.settings) {
            _account.settings = {};
        }
    });
}

function loadNotesFromStorage() {
    return AsyncStorage.getItem('enotes').then(str => {
        var encrypted = [];
        _notes = [];
        encrypted = JSON.parse(str);
        var promises = [];
        account = Storage.getAccount();
        if (!encrypted) return [];
        encrypted.forEach(function (note) {
            promises.push(decryptNote(note, account.password));
        });
        return Promise.all(promises).then(function(results) {
            results.forEach(function(item) {
                var note = JSON.parse(item.substring(4));
                _notes.push(note);
            });
            Storage.emitChange();
        }).catch(error => console.log(error));
    });
}

function updateNotesStorage() {
    var password = _account.password;
    if (!_notes) return;
    var promises = _notes.map((note) => encryptNote(note, password));
    return Promise.all(promises).then(function(encrypted) {
        return AsyncStorage.setItem('enotes', JSON.stringify(encrypted)).catch(err => { console.log("couldn't store note: " + err) });
    }).catch(function(err) {
        console.log("Failed:", err);
    });
}

function updateAccountStorage() {
    console.log('Saving account to storage', _account);
    return AsyncStorage.setItem('account', JSON.stringify(_account)).catch(function(err) {
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
        console.log(e);
    }
    return result;
}

function decryptNote(note, key) {
    return new Promise(function(resolve, reject) {
        Aes.decrypt(note.key, key).then(async (note_key) => {
            try {
                let hash = await Aes.hmac(note.content, key);
                if (hash !== note.hash) {
                    console.log("Hmac doesn't match.")
                    reject("Hmac doesn't match");
                }
                await Aes.decrypt(note.content, note_key).then((result) =>  resolve(result)).catch((err) => console.log("Decrypt error:", err));
            } catch (e) {
                reject("Hash error");
            }
        }).catch((err)  => console.log("Decrypt error:", err));
    });
}

async function encryptNote(note, key) {
    if (!note.uuid) {
        note.uuid = generateUUID();
    }
    var note_key = generateRandomKey();
    note.key = await Aes.encrypt(note_key, key);

    var p = new Promise(function(resolve, reject) {
        Aes.encrypt("e001" + JSON.stringify(note), note_key).then(cipher => {
            var copy = {};
            copy.uuid = note.uuid;
            copy.content = cipher;
            copy.key  = note.key;
            copy.updated = note.updated;
            Aes.hmac(copy.content, key).then(hash => {
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
            console.log("Get notes call.");
            loadNotesFromStorage();//.then(fetchFromServer).then(updateNotesStorage);
            return [];
        } else {
            return _notes;
        }
    },

    getAccount: function() {
        return _account;
    },

    saveAccount: function(data) {
        //on password change expire all other devices sessions
        if (data.password == _account.password) return;
        return Aes.sha256(data.password).then((hash) => {
            data.password = hash;
            data.settings = _account.settings;
            _account = data;
            console.log('pw hash:', hash, _account);
        }).then(() => {
            updateAccountStorage();
        }).then(() => {
            console.log('Re-encrypting notes');
            updateNotesStorage(data.password);
        }).catch(err => { console.log("couldn't store account: " + err) });
    },

    saveSetting: function(item, value) {
        _account.settings[item] = value;
        return updateAccountStorage();
    },

    createNote: function(note) {
        note.created = new Date().toISOString();
        note.updated = note.created;
        note.uuid    = generateUUID();
        note.deleted = false;
        _notes.push(note);
        this.emitChange();
        return updateNotesStorage();
    },

    updateNote: function (note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                note.updated = new Date().toISOString();
                _notes[i] = note;
                break;
            }
        }
        this.emitChange();
        return updateNotesStorage();
    },

    deleteNote: function (note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                _notes[i] = note;
                break;
            }
        }
        this.emitChange();
        return updateNotesStorage();
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
