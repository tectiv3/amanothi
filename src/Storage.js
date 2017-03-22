import { AsyncStorage, NativeModules } from 'react-native';
var assign = require('object-assign');
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

function syncWithServer() {
    console.log("syncWithServer", _account.server)
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
        .then(fetchStatus).then((response) => response.json()).catch(fetchError)
        .then((responseData) => {
            // console.log('response object:', responseData)
            return Storage.decryptNotes(responseData.retrieved_items).then(() => {
                _account.sync_token = responseData.sync_token
                return Storage.saveAccount(_account)
            })
        })
        .catch((error) => {
            console.log(error)
        })
}

function loadNotesFromStorage() {
    console.log("loadNotesFromStorage")
    return AsyncStorage.getItem('enotes').then(str => {
        var encrypted = [];
        _notes = [];
        encrypted = JSON.parse(str);
        return Storage.decryptNotes(encrypted).catch(error => console.log(error));
    });
}

async function updateNotesStorage() {
    console.log("updateNotesStorage")
    if (!_notes) return AsyncStorage.setItem('enotes', "");
    if (_account.mk == undefined || _account.mk == "") {
        await generateDefaultMK();
    }
    var promises = _notes.map((note) => encryptNote(note, _account.mk));
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

function decryptNote(note, mk) {
    return new Promise(function(resolve, reject) {
        let components = note.enc_item_key.split(":");
        var enc_version = components[0];
        var enc_item_key = components[1];
        var iv = components[2];

        Aes.decrypt(enc_item_key, mk, iv).then(async(note_key) => {
            console.log("Decrypted note key:", note_key)
            console.log("note:", note);
            try {
                let hash = await Aes.hmac256(note.content, mk);
                if (hash !== note.auth_hash) {
                    reject("Hmac doesn't match");
                }
                return Aes.decrypt(note.content, note_key, iv)
                    .then((result) => resolve(result))
                    .catch((err) => console.log("Decrypt error:", err));
            } catch (e) {
                reject("Hash error", e);
            }
        }).catch((err) => console.log("Decrypt error:", err));
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
        console.log("Note keys and iv:", note_key, enc_item_key, iv);
    } catch (e) {
        console.log("key encrypt error:", e)
        return Promise.reject(e)
    }
    return new Promise(function(resolve, reject) {
        console.log("Encrypting:", note)
        Aes.encrypt(JSON.stringify(note), note_key, iv).then((cipher) => {
            var copy = {};
            copy.uuid = note.uuid;
            copy.created_at = note.created_at;
            copy.updated_at = note.updated_at;
            copy.content = cipher;
            copy.content_type = "Note";
            copy.enc_item_key = "001:" + enc_item_key + ":" + iv;
            copy.deleted = note.deleted;
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
            loadNotesFromStorage().then(syncWithServer).then(updateNotesStorage);
            return [];
        } else {
            return _notes;
        }
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
        _notes.push(note);
        this.emitChange();
        return updateNotesStorage();
    },

    updateNote: function(note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                note.updated_at = new Date().toISOString();
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

    decryptNotes: function(encrypted) {
        var promises = []
        if (!encrypted) return Promise.resolve()
        encrypted.forEach(function(note) {
            if (!note.deleted && note.content_type == "Note") {
                promises.push(decryptNote(note, _account.mk));
            }
        })
        return Promise.all(promises).then((results) => {
            results.forEach(function(item) {
                _notes.push(JSON.parse(item));
            })
            Storage.emitChange()
        })
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
