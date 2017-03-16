import { AsyncStorage, NativeModules } from 'react-native';
var assign = require('object-assign');
var fetch = require('fetch');
const fetchWithRetries = require('fbjs/lib/fetchWithRetries');
var EventEmitter = require('events').EventEmitter;
var Aes = NativeModules.Aes;

var _notes = null;
var _account = null;
// getReactNativeHost().getReactInstanceManager().getDevSupportManager().handleReloadJS(); //force reload


loadAccountFromStorage();

function loadAccountFromStorage() {
    return AsyncStorage.getItem('account').then(str => {
        if (!str)
            _account = {};
        else
            _account = JSON.parse(str);
        if (!_account.settings) {
            _account.settings = {};
        }
    });
}

function fetchStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    }
    throw new Error(response.statusText)
}

function fetchError(error) {
    console.log('Request failed', error.response)
    if (error.response.headers.get('Content-Type') == 'application/json') {
        return error.response.json().then(function(json) {
            throw new Error(json.errors)
        });
    }
    return error.response.text().then(function(text) {
        throw new Error(text)
    });
}

function getParams() {
    var init = {
        body: '',
        method: 'GET'
    };
    return fetchWithRetries(_account.server + "/auth/params?email=" + _account.email, init)
        .then(fetchStatus).then((response) => response.json()).catch(fetchError).catch((error) => {
        console.log(error)
    });
}

function fetchFromServer() {
    console.log("fetchFromServer", _account.server)
    if (_account.server == "" || _account.server == undefined) {
        console.log("no server address")
        return Promise.resolve()
    }
    if (_account.token == "" || _account.token == undefined) {
        console.log("not authorized")
        return Promise.resolve()
    }
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + _account.token);
    var init = {
        body: '',
        method: 'POST',
        headers: myHeaders,
    };

    return fetchWithRetries(_account.server + "/items/sync", init)
        .then(fetchStatus).then((response) => response.json())
        .then((responseData) => {
            console.log('response object:', responseData)
        }).catch(fetchError).catch((error) => {
        console.log(error)
    })
}

function loadNotesFromStorage() {
    console.log("loadNotesFromStorage")
    return AsyncStorage.getItem('enotes').then(str => {
        var encrypted = [];
        _notes = [];
        encrypted = JSON.parse(str);
        var promises = [];
        account = Storage.getAccount();
        if (!encrypted) return [];
        encrypted.forEach(function(note) {
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
    console.log("updateNotesStorage")
    var password = _account.password;
    if (!_notes) return;
    var promises = _notes.map((note) => encryptNote(note, password));
    return Promise.all(promises).then(function(encrypted) {
        return AsyncStorage.setItem('enotes', JSON.stringify(encrypted))
            .catch(err => {
                console.log("couldn't store note: " + err)
            });
    }).catch(function(err) {
        console.log("Failed:", err);
    });
}

function updateAccountStorage() {
    console.log('Saving account to storage', _account);
    return AsyncStorage.setItem('account', JSON.stringify(_account)).catch(
        function(err) {
            console.log("Failed:", err);
        });
}

function generateRandomKey() {
    return Math.random().toString(36).substring(2);
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
        c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
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
        Aes.decrypt(note.key, key).then(async(note_key) => {
            try {
                let hash = await Aes.hmac(note.content, key);
                if (hash !== note.hash) {
                    console.log("Hmac doesn't match.")
                    reject("Hmac doesn't match");
                }
                await Aes.decrypt(note.content, note_key).then(
                    (result) => resolve(result)).catch((err) => console.log("Decrypt error:", err));
            } catch (e) {
                reject("Hash error");
            }
        }).catch((err) => console.log("Decrypt error:", err));
    });
}

async function encryptNote(note, key) {
    //if key is still to be set, throw an alert
    if (!note.uuid) {
        note.uuid = generateUUID();
    }
    var note_key = generateRandomKey();
    note.key = await Aes.encrypt(note_key, key);

    var p = new Promise(function(resolve, reject) {
        Aes.encrypt("e001" + JSON.stringify(note), note_key).then(
            cipher => {
                var copy = {};
                copy.uuid = note.uuid;
                copy.content = cipher;
                copy.key = note.key;
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
            loadNotesFromStorage().then(fetchFromServer).then(updateNotesStorage);
            return [];
        } else {
            return _notes;
        }
    },

    getAccount: function() {
        return _account;
    },

    saveAccount: function(data) {
        if (data.password != _account.password) {
            console.log("password changed")
            return Aes.sha256(data.password).then((hash) => {
                data.password = hash;
                data.settings = _account.settings;
                _account = data;
                console.log('pw hash:', hash, _account);
            }).then(updateAccountStorage).then(() => {
                console.log('Re-encrypting notes');
                updateNotesStorage(data.password);
            }).catch(err => {
                console.log("couldn't store account: ", err)
            });
        } else {
            data.settings = _account.settings;
            _account = data;
            return updateAccountStorage().catch(err => {
                console.log("account save error: ", err)
            })
        }
    },

    registerUser: function(data) {
        return Storage.saveAccount({
            password: data.password,
            email: data.email,
            server: data.server
        }).then(() => {
            var init = {
                body: JSON.stringify({
                    email: _account.email,
                    password: _account.password,
                    pw_alg: "sha256",
                    pw_cost: 5000,
                    pw_func: 'pbkdf2',
                    pw_key_size: 512,
                    pw_salt: _account.salt
                }),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            };
            return fetchWithRetries(_account.server + "/auth", init)
                .then(fetchStatus).then((response) => response.json())
                .then((responseData) => {
                    console.log('ResponseData:', responseData)
                }).catch(fetchError)
        })
    },

    loginUser: function(data) {
        return Storage.saveAccount({
            password: data.password,
            email: data.email,
            server: data.server
        }).then(getParams).then((params) => {
            console.log("Params:", params);

            var init = {
                body: JSON.stringify({
                    email: _account.email,
                    password: _account.password,
                    pw_alg: "sha256",
                    pw_cost: 5000,
                    pw_func: 'pbkdf2',
                    pw_key_size: 512,
                    pw_salt: _account.salt
                }),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            };
            return fetchWithRetries(_account.server + "/auth/sign_in", init)
                .then(fetchStatus).then((response) => response.json())
                .then((responseData) => {
                    console.log('ResponseData:', responseData)
                }).catch(fetchError)
        })
    },

    saveSetting: function(item, value) {
        _account.settings[item] = value;
        return updateAccountStorage();
    },

    createNote: function(note) {
        note.created = new Date().toISOString();
        note.updated = note.created;
        note.uuid = generateUUID();
        note.deleted = false;
        _notes.push(note);
        this.emitChange();
        return updateNotesStorage();
    },

    updateNote: function(note) {
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

    deleteNote: function(note) {
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
