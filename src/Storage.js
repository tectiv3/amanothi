import { AsyncStorage, NativeModules, InteractionManager } from 'react-native';
var assign = require('object-assign');
const fetchWithRetries = require('fbjs/lib/fetchWithRetries');
var EventEmitter = require('events').EventEmitter;
var Aes = NativeModules.Aes;

var _notes = null;
var _encrypted = [];
var _account = null;
var _online = true;
var _sync_token = "";
// getReactNativeHost().getReactInstanceManager().getDevSupportManager().handleReloadJS(); //force reload

loadAccountFromStorage();

function loadAccountFromStorage() {
    return AsyncStorage.getItem('account').then(str => {
        _account = !str ? {} : JSON.parse(str);
        console.log("Load account:", _account);
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
    console.log('Request failed', error)
    if (error.response == undefined)
        throw new Error(error.message)
    if (error.response.headers.get('Content-Type') == 'application/json') {
        return error.response.json().then((json) => {
            throw new Error(json.errors)
        });
    }
    return error.response.text().then((text) => {
        throw new Error(text)
    });
}

function getAuthParams(server, email) {
    var init = {
        body: '',
        method: 'GET'
    };

    return fetchWithRetries(server + "/auth/params?email=" + email, init)
        .then(fetchStatus)
        .then((response) => response.json())
        .catch(fetchError)
}

function findNoteIndex(uuid) {
    for (var j = 0; j < _notes.length; j++) {
        if (_notes[j].uuid == uuid) {
            return j;
        }
    }
    return -1;
}

async function syncWithServer() {
    console.log("syncWithServer", _account.server)
    if (_account.server == "" || _account.server == undefined) {
        console.log("no server address")
        return Promise.resolve()
    }

    if (_account.token == "" || _account.token == undefined) {
        console.log("not authorized")
        return Promise.resolve()
    }

    if (!_online) {
        console.log("not online")
        return Promise.resolve()
    }

    var data = {
        items: [],
        sync_token: _account.sync_token
    }
    if (_encrypted.length == 0) {
        _encrypted = await encryptNotes();
    }
    data.items = _encrypted.filter(note => note.dirty);
    console.log("sync, dirty:", data.items.length);

    var init = {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + _account.token
        },
    };
    return fetchWithRetries(_account.server + "/items/sync", init)
        .then(fetchStatus).then((response) => response.json()).catch(fetchError)
        .then((responseData) => {
            // it's time to switch to some kind of a DB
            if (responseData.saved_items.length > 0) {
                responseData.saved_items.forEach((remote) => {
                    let index = findNoteIndex(remote.uuid);
                    if (index >= 0) {
                        console.log("Updating existing:", remote.uuid);
                        _notes[index].dirty = false;
                        _notes[index].deleted = remote.deleted;
                    }
                });
                Storage.emitChange()
            }
            var dirty = _notes.filter(note => note.dirty);
            console.log("after sync, dirty:", dirty.length);
            _account.sync_token = responseData.sync_token;

            responseData.retrieved_items.forEach(function(remote) {
                if (remote.deleted) {
                    let index = findNoteIndex(remote.uuid);
                    if (index >= 0) {
                        console.log("Deleting existing:", remote.uuid);
                        _notes[index].dirty = false;
                        _notes[index].deleted = remote.deleted;
                        Storage.emitChange();
                    }
                }
            });
            return decryptNotes(responseData.retrieved_items).then((retrieved_items) => {
                console.log("retrieved_items:", retrieved_items);
                retrieved_items.forEach((item) => {
                    let remote = JSON.parse(item);
                    let exists = _notes.filter(local => local.uuid == remote.uuid);
                    if (exists.length == 0) {
                        console.log("Adding new one:", remote.uuid);
                        remote.dirty = false;
                        _notes.push(remote);
                    } else {
                        console.log("Updating existing:", remote.uuid);
                        let index = findNoteIndex(remote.uuid);
                        if (index >= 0) {
                            _notes[index].dirty = false;
                            _notes[index].text = remote.text;
                            _notes[index].title = remote.title;
                            _notes[index].updated_at = remote.updated_at;
                        } else {
                            console.log("Existing note not found", remote);
                        }
                    }
                })
                if (retrieved_items.length > 0) {
                    Storage.emitChange()
                }
            }).then(() => Storage.saveAccount(_account)).then();
        })
        .catch((error) => {
            console.log(error)
        })
}

function loadNotesFromStorage() {
    console.log("loadNotesFromStorage")
    return AsyncStorage.getItem('enotes').then((str) => {
        _notes = [];
        let _encrypted = JSON.parse(str);
        let unique = [...new Set(_encrypted.map(item => item.uuid))];
        console.log("set:", unique)
        return Storage.decryptNotes(_encrypted).catch(error => console.log(error));
    });
}

async function decryptNotes(encrypted) {
    if (!encrypted) return Promise.resolve()
    console.log("Encrypted:", encrypted.length)
    var promises = [];
    encrypted.forEach(function(note) {
        if (!note.deleted && note.content_type == "Note") {
            promises.push(decryptNote(note, _account.mk));
        }
    })
    return Promise.all(promises).catch(err => console.log("Mass encrypt failed:", err));
}

async function encryptNotes() {
    console.log("encryptNotes")
    var promises = _notes.map((note) => encryptNote(note, _account.mk));
    return Promise.all(promises).catch(err => console.log("Mass encrypt failed:", err));
}

async function updateNotesStorage() {
    console.log("updateNotesStorage")
    if (!_notes) return AsyncStorage.setItem('enotes', "");
    if (_account.mk == undefined || _account.mk == "") {
        await generateDefaultMK();
    }
    if (_encrypted.length == 0) {
        _encrypted = await encryptNotes();
    }
    return AsyncStorage.setItem('enotes', JSON.stringify(_encrypted)).catch(error => console.log(error));
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

async function generateDefaultMK() {
    try {
        pw_salt = await Aes.sha1(generateRandomKey());
    } catch (e) {
        throw new Error(e.message)
    }
    var hash = await Aes.pbkdf2(generateRandomKey(), pw_salt);
    console.log("pw hash:", hash)
    return Storage.saveAccount({
        password: hash.substring(0, 64),
        mk: hash.substring(64),
    })
}

async function createAuthParams(data) {
    var params = {
        pw_func: "pbkdf2",
        pw_alg: "sha256",
        pw_key_size: 512,
        pw_cost: 5000,
        pw_nonce: generateRandomKey(),
        pw_salt: "",
        password: "",
        mk: ""
    };
    try {
        params.pw_salt = await Aes.sha1(data.email + "SN" + params.pw_nonce);
        var hash = await Aes.pbkdf2(data.password, params.pw_salt);
        console.log("pw hash:", hash)
        params.password = hash.substring(0, 64);
        params.mk = hash.substring(64);
    } catch (e) {
        return Promise.reject(e.message)
    }
    return Promise.resolve(params)
}

async function decryptNote(note, mk) {
    return new Promise(function(resolve, reject) {
        let components = note.enc_item_key.split(":");
        var enc_version = components[0];
        var enc_item_key = components[1];
        var iv = components[2];
        Aes.decrypt(enc_item_key, mk, iv).then(async(note_key) => {
            try {
                let hash = await Aes.hmac256(note.content, mk);
                if (hash !== note.auth_hash) {
                    reject("Hmac doesn't match");
                }
                return Aes.decrypt(note.content, note_key, iv)
                    .then((result) => resolve(result))
                    .catch(err => console.log("Decrypt error:", err));
            } catch (e) {
                reject("Hash error", e);
            }
        }).catch(err => console.log("Key decrypt error:", err));
    });
}

async function encryptNote(note, mk) {
    //if key is still to be set, throw an alert
    if (!note.uuid) {
        note.uuid = generateUUID();
    }
    try {
        var note_key = await Aes.sha256(generateRandomKey());
        var iv = await Aes.sha256(generateRandomKey());
        var enc_item_key = await Aes.encrypt(note_key, mk, iv);
    } catch (e) {
        console.log("key encrypt error:", e)
        return Promise.reject(e)
    }
    return new Promise(function(resolve, reject) {
        Aes.encrypt(JSON.stringify(note), note_key, iv).then((cipher) => {
            var copy = {};
            copy.uuid = note.uuid;
            copy.created_at = note.created_at;
            copy.updated_at = note.updated_at;
            copy.content = cipher;
            copy.content_type = "Note";
            copy.enc_item_key = "001:" + enc_item_key + ":" + iv;
            copy.deleted = note.deleted;
            copy.dirty = note.dirty != undefined && note.dirty;
            Aes.hmac256(copy.content, mk).then((hash) => {
                copy.auth_hash = hash;
                resolve(copy);
            });
        });
    })
}

function toHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}

var Storage = assign({}, EventEmitter.prototype, {

    getAll: function() {
        if (!_notes) {
            console.log("Get notes call.");
            loadNotesFromStorage().then(() => this.sync("getAll"));
            setInterval(function() {
                InteractionManager.runAfterInteractions(() => {
                    Storage.sync("Timer");
                });
            }, 30000);
            return [];
        }
        return _notes;
    },

    getAccount: function() {
        return _account;
    },

    saveAccount: function(data) {
        //TODO: total rewrite! account manager for keys generation, parameters and account and settings storage
        // if (data.password != _account.password && data.password != "") {
        //     console.log("password changed", data)
        //     return Aes.pbkdf2(data.password, data.params.pw_salt).then((hash) => {
        //         console.log("pw hash:", hash)
        //         data.password = hash.substring(0, 64);
        //         data.mk = hash.substring(64);
        //         data.settings = _account.settings;
        //         data.params = _account.params;
        //         _account = data;
        //         console.log('account:', _account);
        //     }).then(updateAccountStorage).then(() => {
        //         console.log('Re-encrypting notes');
        //         updateNotesStorage(data.password);
        //     }).catch(err => {
        //         console.log("couldn't store account: ", err)
        //     });
        // } else {
        data.settings = _account.settings;
        data.params = data.params != undefined ? data.params : _account.params;
        _account = data;
        return updateAccountStorage().catch(err => {
            console.log("account save error: ", err)
        })
    // }
    },

    registerUser: function(data) {
        return createAuthParams(data).then((params) => {
            console.log("created:", params);
            Storage.saveAccount({
                password: params.password,
                mk: params.mk,
                email: data.email,
                server: data.server,
                params: params
            }).then(() => {
                var init = {
                    body: JSON.stringify({
                        email: _account.email,
                        password: _account.password,
                        pw_alg: params.pw_alg,
                        pw_cost: params.pw_cost,
                        pw_func: params.pw_func,
                        pw_key_size: params.pw_key_size,
                        pw_nonce: params.pw_nonce
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
                        _account.token = responseData.token
                        return Storage.saveAccount(_account).then(syncWithServer).then(updateNotesStorage).then(() => this.emitChange());
                    }).catch(fetchError)
            })
        })
    },

    loginUser: function(data) {
        return getAuthParams(data.server, data.email).then(async(params) => {
            var hash = await Aes.pbkdf2(data.password, params.pw_salt);
            console.log("pw hash:", hash)
            return Storage.saveAccount({
                password: hash.substring(0, 64),
                mk: hash.substring(64),
                email: data.email,
                server: data.server,
                params: params
            })
        }).then(() => {
            var init = {
                body: JSON.stringify({
                    email: _account.email,
                    password: _account.password
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
                    _account.token = responseData.token
                    return Storage.saveAccount(_account).then(syncWithServer).then(updateNotesStorage).then(() => this.emitChange());
                }).catch(fetchError)
        })
    },

    logoutUser: function() {
        return Storage.saveAccount({
            password: "",
            email: "",
            server: _account.server,
            params: []
        }).then(() => {
            _notes = [];
            updateNotesStorage().then(() => this.emitChange()).catch(fetchError)
        });
    },

    saveSetting: function(item, value) {
        _account.settings[item] = value;
        return updateAccountStorage();
    },

    createNote: function(note) {
        note.created_at = new Date().toISOString();
        note.updated_at = note.created_at;
        note.uuid = generateUUID();
        note.deleted = false;
        note.dirty = true;
        _notes.push(note);
        this.emitChange();
        return this.sync("create");
    },

    updateNote: function(note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                note.updated_at = new Date().toISOString();
                note.dirty = true;
                _notes[i] = note;
                break;
            }
        }
        this.emitChange();
        return this.sync("update");
    },

    deleteNote: function(note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                note.deleted = true;
                note.dirty = true;
                _notes[i] = note;
            }
        }
        this.emitChange();
        return this.sync("delete");
    },

    decryptNotes: function(encrypted) {
        return decryptNotes(encrypted).then((results) => {
            results.forEach((item) => {
                let note = JSON.parse(item)
                if (typeof note === 'object') {
                    _notes.push(note);
                }
            })
            Storage.emitChange()
        })
    },

    sync: function(caller) {
        console.log("Storage.sync!", caller);
        return syncWithServer().then(updateNotesStorage);
    },

    emitChange: function() {
        console.log("Change fire!");
        _encrypted = [];
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
