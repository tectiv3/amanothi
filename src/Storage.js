import { AsyncStorage, NativeModules, InteractionManager } from 'react-native';
import Store from 'react-native-store';
var assign = require('object-assign');
const fetchWithRetries = require('fbjs/lib/fetchWithRetries');
var EventEmitter = require('events').EventEmitter;
var Aes = NativeModules.Aes;

var _notes = null;
var _interval = null;
var _account = null;
var _online = true;
var _sync_token = "";
// getReactNativeHost().getReactInstanceManager().getDevSupportManager().handleReloadJS(); //force reload

loadAccountFromStorage();

const DB = {
    'account': Store.model('account'),
    'note': Store.model('note')
}

function loadAccountFromStorage() {
    return AsyncStorage.getItem('account').then(str => {
        _account = !str ? {} : JSON.parse(str);
        console.log("Load account:", _account);
        // DB.account.add(_account)
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

async function syncWithServer() {
    console.log("syncWithServer", _account.server)
    if (_account.server == "" || _account.server == undefined) {
        return Promise.reject("no server address")
    }
    if (_account.token == "" || _account.token == undefined) {
        return Promise.reject("not authorized")
    }
    if (!_online) {
        return Promise.reject("not online")
    }

    let data = {
        items: [],
        sync_token: _account.sync_token
    }
    data.items = await DB.note.find({
        where: {
            dirty: true
        }
    }).then(result => encryptNotes(result));
    console.log("sync, dirty:", data.items.length);

    const init = {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + _account.token
        },
    };
    return fetchWithRetries(_account.server + "/items/sync", init)
        .then(fetchStatus).then(response => response.json()).catch(fetchError)
        .then(responseData => {
            let promises = [];
            if (responseData.saved_items.length > 0) {
                promises.push(new Promise(async(resolve) => {
                    let count = 0;
                    for (var i = 0; i < responseData.saved_items.length; i++) {
                        await updateMeta(responseData.saved_items[i]);
                        count++;
                    }
                    return resolve(count)
                }))
            }
            if (responseData.retrieved_items.length > 0) {
                promises.push(new Promise(async(resolve) => {
                    let count = 0;
                    for (var i = 0; i < responseData.retrieved_items.length; i++) {
                        if (responseData.retrieved_items[i].deleted) {
                            await updateMeta(responseData.retrieved_items[i])
                            count++;
                        }
                    }
                    return resolve(count)
                }));
                promises.push(decryptNotes(responseData.retrieved_items).then(async(results) => {
                    let count = 0;
                    for (var i = 0; i < results.length; i++) {
                        let item = results[i];
                        let remote = JSON.parse(item)
                        if (typeof remote === 'object') {
                            await updateOrCreateNote(remote);
                            count++;
                        }
                    }
                    return Promise.resolve(count)
                }))
            }
            _account.sync_token = responseData.sync_token;
            return Promise.all(promises).then(results => {
                console.log("Sync results", results);
                if (results != undefined && results.length > 0) {
                    return Storage.reloadNotes().then(() => Storage.emitChange("Sync end"))
                }
                return Promise.resolve();
            }).then(() => Storage.saveAccount(_account));
        })
        .catch(err => console.log(err))
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
    return Promise.all(promises).catch(err => console.log("Mass decrypt failed:", err));
}

async function encryptNotes(notes) {
    if (!notes) {
        return [];
    }
    console.log("Encrypt notes", notes.length)
    var promises = notes.map((note) => encryptNote(note, _account.mk));
    return Promise.all(promises).catch(err => console.log("Mass encrypt failed:", err));
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
    if (note._id)
        delete note._id;
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

async function updateMeta(item) {
    let note = await DB.note.get({
        where: {
            uuid: item.uuid
        }
    })
    if (note == null) return null;
    note = note[0];
    console.log("Updating meta:", note.uuid);
    if (note.uuid == undefined) {
        return await DB.note.remove({
                where: {
                    _id: note._id
                }
            });
    }
    note.dirty = false;
    note.deleted = item.deleted;
    note.updated_at = item.updated_at;
    return await DB.note.updateById(note, note._id);
}

async function updateOrCreateNote(remote) {
    let note = await DB.note.get({
        where: {
            uuid: remote.uuid
        }
    });
    if (note != null) {
        note = note[0];
        note.uuid = remote.uuid;
        console.log("Updating existing", note.uuid);
        note.updated_at = remote.updated_at;
        note.dirty = false;
        note.text = remote.text;
        note.title = remote.title;
        return await DB.note.updateById(note, note._id);
    }
    console.log("Adding new note", remote.uuid);
    remote.dirty = false;
    if (remote._id)
        delete remote._id;
    return await DB.note.add(remote);
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
        console.log("Get notes call.");
        if (!_notes) {
            this.reloadNotes().then(() => this.emitChange("getAll")).then(() => this.sync("Reload"));
            if (!_interval) {
                _interval = setInterval(function() {
                    InteractionManager.runAfterInteractions(() => {
                        Storage.sync("Timer");
                    });
                }, 30000);
            }
            return [];
        }
        return _notes;
    },

    reloadNotes: function() {
        _notes = [];
        return DB.note.find({
            where: {
                deleted: false
            }
        }
        ).then(result => _notes = result == null ? [] : result);
    },

    getAccount: function() {
        return _account;
    },

    saveAccount: function(data) {
        //TODO: total rewrite! account manager for keys generation, parameters and account and settings storage
        data.settings = _account.settings;
        data.params = data.params != undefined ? data.params : _account.params;
        _account = data;
        return updateAccountStorage().catch(err => {
            console.log("account save error: ", err)
        })
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
                        return Storage.saveAccount(_account).then(() => this.sync("Register"));
                    }).catch(fetchError)
            })
        })
    },

    loginUser: function(data) {
        return getAuthParams(data.server, data.email).then(async(params) => {
            let hash = await Aes.pbkdf2(data.password, params.pw_salt);
            console.log("pw hash:", hash)
            return Storage.saveAccount({
                password: hash.substring(0, 64),
                mk: hash.substring(64),
                email: data.email,
                server: data.server,
                params: params
            })
        }).then(() => {
            const init = {
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
                    return Storage.saveAccount(_account).then(() => this.sync("Login"));
                }).catch(fetchError);
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
            DB.note.remove().then(() => this.emitChange("Logout")).catch(fetchError)
        });
    },

    saveSetting: function(item, value) {
        _account.settings[item] = value;
        return updateAccountStorage();
    },

    createNote: async function(note) {
        note.created_at = new Date().toISOString();
        note.updated_at = note.created_at;
        note.uuid = generateUUID();
        note.deleted = false;
        note.dirty = true;
        let model = await DB.note.add(note);
        _notes.push(model);
        this.emitChange("Create");
        return this.sync("create");
    },

    updateNote: async function(note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                note.updated_at = new Date().toISOString();
                note.dirty = true;
                _notes[i] = note;
                return DB.note.updateById(note, note._id).then(() => this.emitChange("Update")).then(() => this.sync("update"));
            }
        }
    },

    deleteNote: async function(note) {
        note.deleted = true;
        return this.updateNote(note);
    },

    sync: async function(caller) {
        console.log("Storage.sync!", caller);
        return syncWithServer().catch(err => console.log(err));
    },

    emitChange: function(caller) {
        console.log("Change fire!", caller, _notes.length);
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
